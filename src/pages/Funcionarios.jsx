import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, UserMinus } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'
import TabelaEsqueleto from '../components/TabelaEsqueleto'
import { useToast } from '../contexts/ToastContext'

const formInicial = {
  nome: '',
  cargo: '',
  salario: '',
  dataAdmissao: '',
  dataDemissao: '',
  ativo: true,
}

const inputClasses =
  'w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
const labelClasses = 'block text-sm font-medium text-stone-700 mb-1'

export default function Funcionarios() {
  const { mostrarToast } = useToast()
  const [funcionarios, setFuncionarios] = useState([])
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [funcionarioEditando, setFuncionarioEditando] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  const [modalDemissaoAberto, setModalDemissaoAberto] = useState(false)
  const [funcionarioDemitindo, setFuncionarioDemitindo] = useState(null)
  const [dataDemissaoForm, setDataDemissaoForm] = useState('')
  const [processandoDemissao, setProcessandoDemissao] = useState(false)
  const [erroDemissao, setErroDemissao] = useState('')

  async function carregarFuncionarios() {
    setCarregando(true)
    setErro('')
    try {
      const response = await api.get('/api/funcionarios', { params: { page: pagina } })
      setFuncionarios(response.data.content)
      setTotalPaginas(response.data.totalPages ?? 1)
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao carregar funcionários')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarFuncionarios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina])

  function abrirCriacao() {
    setFuncionarioEditando(null)
    setForm(formInicial)
    setErroForm('')
    setModalAberto(true)
  }

  function abrirEdicao(funcionario) {
    setFuncionarioEditando(funcionario)
    setForm({
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      salario: funcionario.salario,
      dataAdmissao: funcionario.dataAdmissao || '',
      dataDemissao: funcionario.dataDemissao || '',
      ativo: funcionario.ativo,
    })
    setErroForm('')
    setModalAberto(true)
  }

  async function salvarFuncionario(e) {
    e.preventDefault()
    setSalvando(true)
    setErroForm('')
    try {
      if (funcionarioEditando) {
        await api.put(`/api/funcionarios/${funcionarioEditando.id}`, form)
      } else {
        await api.post('/api/funcionarios', form)
      }
      setModalAberto(false)
      await carregarFuncionarios()
      mostrarToast(funcionarioEditando ? 'Funcionário atualizado' : 'Funcionário criado com sucesso')
    } catch (error) {
      setErroForm(error.response?.data?.message || 'Erro ao salvar funcionário')
    } finally {
      setSalvando(false)
    }
  }

  async function excluirFuncionario(funcionario) {
    const confirmado = window.confirm(`Excluir o funcionário "${funcionario.nome}"?`)
    if (!confirmado) return

    try {
      await api.delete(`/api/funcionarios/${funcionario.id}`)
      await carregarFuncionarios()
      mostrarToast('Funcionário excluído')
    } catch (error) {
      window.alert(error.response?.data?.message || 'Erro ao excluir funcionário')
    }
  }

  function abrirDemissao(funcionario) {
    setFuncionarioDemitindo(funcionario)
    setDataDemissaoForm('')
    setErroDemissao('')
    setModalDemissaoAberto(true)
  }

  async function confirmarDemissao(e) {
    e.preventDefault()
    setProcessandoDemissao(true)
    setErroDemissao('')
    try {
      await api.patch(`/api/funcionarios/${funcionarioDemitindo.id}/demitir`, {
        dataDemissao: dataDemissaoForm,
      })
      setModalDemissaoAberto(false)
      await carregarFuncionarios()
      mostrarToast('Funcionário demitido')
    } catch (error) {
      setErroDemissao(error.response?.data?.message || 'Erro ao demitir funcionário')
    } finally {
      setProcessandoDemissao(false)
    }
  }

  const colunas = [
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'cargo', titulo: 'Cargo' },
    { chave: 'salario', titulo: 'Salário' },
    { chave: 'dataAdmissao', titulo: 'Admissão' },
    { chave: 'dataDemissao', titulo: 'Demissão' },
    {
      chave: 'ativo',
      titulo: 'Ativo',
      render: (funcionario) => (funcionario.ativo ? 'Sim' : 'Não'),
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (funcionario) => (
        <div className="flex gap-2">
          <button
            onClick={() => abrirEdicao(funcionario)}
            title="Editar"
            className="text-stone-600 hover:text-stone-900"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => excluirFuncionario(funcionario)}
            title="Excluir"
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
          {funcionario.ativo && (
            <button
              onClick={() => abrirDemissao(funcionario)}
              title="Demitir"
              className="text-amber-700 hover:text-amber-900"
            >
              <UserMinus size={16} />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (carregando) return <TabelaEsqueleto colunas={colunas} />
  if (erro) return <p className="text-sm text-red-600">{erro}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Funcionários</h1>
        <button
          onClick={abrirCriacao}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          <Plus size={16} />
          Novo funcionário
        </button>
      </div>

      <TabelaPaginada
        colunas={colunas}
        dados={funcionarios}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
      />

      <Modal
        aberto={modalAberto}
        titulo={funcionarioEditando ? 'Editar funcionário' : 'Novo funcionário'}
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvarFuncionario}>
          <div className="mb-4">
            <label className={labelClasses}>Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              maxLength={255}
              required
              className={inputClasses}
            />
          </div>

          <div className="mb-4">
            <label className={labelClasses}>Cargo</label>
            <input
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              maxLength={255}
              required
              className={inputClasses}
            />
          </div>

          <div className="mb-4">
            <label className={labelClasses}>Salário</label>
            <input
              type="number"
              step="0.01"
              value={form.salario}
              onChange={(e) => setForm({ ...form, salario: e.target.value })}
              required
              className={inputClasses}
            />
          </div>

          <div className="mb-4">
            <label className={labelClasses}>Data de admissão</label>
            <input
              type="date"
              value={form.dataAdmissao}
              onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })}
              required
              className={inputClasses}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => {
                  const ativo = e.target.checked
                  setForm({ ...form, ativo, dataDemissao: ativo ? '' : form.dataDemissao })
                }}
                className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
              />
              Ativo
            </label>
          </div>

          {!form.ativo && (
            <div className="mb-4">
              <label className={labelClasses}>Data de demissão</label>
              <input
                type="date"
                value={form.dataDemissao}
                onChange={(e) => setForm({ ...form, dataDemissao: e.target.value })}
                className={inputClasses}
              />
            </div>
          )}

          {erroForm && <p className="text-sm text-red-600 mb-2">{erroForm}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-amber-700 text-white rounded px-4 py-2 text-sm font-medium hover:bg-amber-800 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Modal>

      <Modal
        aberto={modalDemissaoAberto}
        titulo={`Demitir ${funcionarioDemitindo?.nome ?? ''}`}
        onFechar={() => setModalDemissaoAberto(false)}
      >
        <form onSubmit={confirmarDemissao}>
          <div className="mb-4">
            <label className={labelClasses}>Data de demissão</label>
            <input
              type="date"
              value={dataDemissaoForm}
              onChange={(e) => setDataDemissaoForm(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          {erroDemissao && <p className="text-sm text-red-600 mb-2">{erroDemissao}</p>}

          <button
            type="submit"
            disabled={processandoDemissao}
            className="w-full bg-amber-700 text-white rounded px-4 py-2 text-sm font-medium hover:bg-amber-800 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {processandoDemissao ? 'Processando...' : 'Confirmar demissão'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
