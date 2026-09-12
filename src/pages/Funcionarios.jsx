import { useState } from 'react'
import { Plus, Pencil, Trash2, UserMinus } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'
import Skeleton from '../components/Skeleton'
import ConfirmarExclusao from '../components/ConfirmarExclusao'
import MenuAcoes from '../components/MenuAcoes'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { useCrud } from '../hooks/useCrud'
import { formatarMoeda, formatarData } from '../utils/formatadores'

const formInicial = {
  nome: '',
  cargo: '',
  salario: '',
  dataAdmissao: '',
  dataDemissao: '',
  ativo: true,
}

const inputClasses =
  'w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClasses = 'block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1'

export default function Funcionarios() {
  const { mostrarToast } = useToast()
  const { role } = useAuth()
  const podeGerenciar = role === 'ADMIN'

  const {
    dados: funcionarios,
    pagina,
    setPagina,
    totalPaginas,
    carregando,
    erro,
    carregar,
    criar,
    atualizar,
    excluir,
  } = useCrud('/api/funcionarios', 'Erro ao carregar funcionários')

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

  const [funcionarioExcluindo, setFuncionarioExcluindo] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

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
        await atualizar(funcionarioEditando.id, form, 'Erro ao salvar funcionário')
      } else {
        await criar(form, 'Erro ao salvar funcionário')
      }
      setModalAberto(false)
      mostrarToast(funcionarioEditando ? 'Funcionário atualizado' : 'Funcionário criado com sucesso')
    } catch (error) {
      setErroForm(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true)
    try {
      await excluir(funcionarioExcluindo.id, 'Erro ao excluir funcionário')
      mostrarToast('Funcionário excluído')
      setFuncionarioExcluindo(null)
    } catch (error) {
      window.alert(error.message)
    } finally {
      setExcluindo(false)
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
      await carregar()
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
    {
      chave: 'salario',
      titulo: 'Salário',
      render: (funcionario) => formatarMoeda(funcionario.salario),
    },
    {
      chave: 'dataAdmissao',
      titulo: 'Admissão',
      render: (funcionario) => formatarData(funcionario.dataAdmissao),
    },
    {
      chave: 'dataDemissao',
      titulo: 'Demissão',
      render: (funcionario) => formatarData(funcionario.dataDemissao),
    },
    {
      chave: 'ativo',
      titulo: 'Ativo',
      render: (funcionario) =>
        funcionario.ativo ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            Desligado
          </span>
        ),
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (funcionario) =>
        podeGerenciar && (
          <MenuAcoes
            itens={[
              { label: 'Editar', icon: Pencil, onClick: () => abrirEdicao(funcionario) },
              {
                label: 'Excluir',
                icon: Trash2,
                onClick: () => setFuncionarioExcluindo(funcionario),
                destrutivo: true,
              },
              ...(funcionario.ativo
                ? [{ label: 'Demitir', icon: UserMinus, onClick: () => abrirDemissao(funcionario) }]
                : []),
            ]}
          />
        ),
    },
  ]

  if (carregando) {
    const colunasEsqueleto = colunas.map((coluna) => ({
      chave: coluna.chave,
      titulo: coluna.titulo,
      render: () => <Skeleton className="h-4 w-3/4" />,
    }))
    const linhasEsqueleto = Array.from({ length: 5 }, (_, indice) => ({ id: `esqueleto-${indice}` }))

    return (
      <TabelaPaginada
        colunas={colunasEsqueleto}
        dados={linhasEsqueleto}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
      />
    )
  }

  if (erro) return <p className="text-sm text-red-600">{erro}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Funcionários</h1>
        {podeGerenciar && (
          <button
            onClick={abrirCriacao}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            <Plus size={16} />
            Novo funcionário
          </button>
        )}
      </div>

      <TabelaPaginada
        colunas={colunas}
        dados={funcionarios}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
        tituloVazio="Nenhum funcionário ainda"
        descricaoVazia="Adicione funcionários para gerenciar a equipe do seu açougue."
        acaoVazia={
          podeGerenciar && (
            <button
              onClick={abrirCriacao}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              <Plus size={16} />
              Criar primeiro funcionário
            </button>
          )
        }
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
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => {
                  const ativo = e.target.checked
                  setForm({ ...form, ativo, dataDemissao: ativo ? '' : form.dataDemissao })
                }}
                className="rounded border-stone-300 text-brand-700 focus:ring-brand-500"
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
            className="w-full bg-brand-500 text-white rounded px-4 py-2 text-sm font-medium hover:bg-brand-600 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors mt-2"
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
            className="w-full bg-brand-500 text-white rounded px-4 py-2 text-sm font-medium hover:bg-brand-600 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {processandoDemissao ? 'Processando...' : 'Confirmar demissão'}
          </button>
        </form>
      </Modal>

      <ConfirmarExclusao
        aberto={Boolean(funcionarioExcluindo)}
        titulo="Excluir funcionário"
        mensagem={`Tem certeza que deseja excluir o funcionário ${funcionarioExcluindo?.nome}? Esta ação não pode ser desfeita.`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setFuncionarioExcluindo(null)}
        carregando={excluindo}
      />
    </div>
  )
}
