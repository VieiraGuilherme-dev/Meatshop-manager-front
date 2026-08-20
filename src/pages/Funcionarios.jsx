import { useEffect, useState } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'

const formInicial = {
  nome: '',
  cargo: '',
  salario: '',
  dataAdmissao: '',
  dataDemissao: '',
  ativo: true,
}

export default function Funcionarios() {
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
    } catch {
      setErro('Erro ao carregar funcionários')
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
    } catch {
      setErroForm('Erro ao salvar funcionário')
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
    } catch {
      window.alert('Erro ao excluir funcionário')
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
        <>
          <button onClick={() => abrirEdicao(funcionario)}>Editar</button>{' '}
          <button onClick={() => excluirFuncionario(funcionario)}>Excluir</button>{' '}
          {funcionario.ativo && (
            <button onClick={() => abrirDemissao(funcionario)}>Demitir</button>
          )}
        </>
      ),
    },
  ]

  if (carregando) return <p>Carregando...</p>
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>

  return (
    <div>
      <h2>Funcionários</h2>

      <button onClick={abrirCriacao}>Novo funcionário</button>

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
          <div>
            <label>Nome</label>
            <br />
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Cargo</label>
            <br />
            <input
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Salário</label>
            <br />
            <input
              type="number"
              step="0.01"
              value={form.salario}
              onChange={(e) => setForm({ ...form, salario: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Data de admissão</label>
            <br />
            <input
              type="date"
              value={form.dataAdmissao}
              onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })}
              required
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => {
                  const ativo = e.target.checked
                  setForm({ ...form, ativo, dataDemissao: ativo ? '' : form.dataDemissao })
                }}
              />{' '}
              Ativo
            </label>
          </div>

          {!form.ativo && (
            <div>
              <label>Data de demissão</label>
              <br />
              <input
                type="date"
                value={form.dataDemissao}
                onChange={(e) => setForm({ ...form, dataDemissao: e.target.value })}
              />
            </div>
          )}

          {erroForm && <p style={{ color: 'red' }}>{erroForm}</p>}

          <button type="submit" disabled={salvando} style={{ marginTop: '12px' }}>
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
          <div>
            <label>Data de demissão</label>
            <br />
            <input
              type="date"
              value={dataDemissaoForm}
              onChange={(e) => setDataDemissaoForm(e.target.value)}
              required
            />
          </div>

          {erroDemissao && <p style={{ color: 'red' }}>{erroDemissao}</p>}

          <button type="submit" disabled={processandoDemissao} style={{ marginTop: '12px' }}>
            {processandoDemissao ? 'Processando...' : 'Confirmar demissão'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
