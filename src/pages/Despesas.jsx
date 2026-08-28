import { useEffect, useState } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'

const formInicial = { description: '', categoriaId: '', funcionarioId: '', amount: '', expenseDate: '' }

export default function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [categorias, setCategorias] = useState([])
  const [funcionarios, setFuncionarios] = useState([])

  const [modalAberto, setModalAberto] = useState(false)
  const [despesaEditando, setDespesaEditando] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  async function carregarDespesas() {
    setCarregando(true)
    setErro('')
    try {
      const response = await api.get('/api/expenses', { params: { page: pagina } })
      setDespesas(response.data.content)
      setTotalPaginas(response.data.totalPages ?? 1)
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao carregar despesas')
    } finally {
      setCarregando(false)
    }
  }

  async function carregarCategorias() {
    try {
      const response = await api.get('/api/categorias')
      setCategorias(response.data.content.filter((categoria) => categoria.tipo === 'DESPESA'))
    } catch {
      setCategorias([])
    }
  }

  async function carregarFuncionarios() {
    try {
      const response = await api.get('/api/funcionarios')
      setFuncionarios(response.data.content)
    } catch {
      setFuncionarios([])
    }
  }

  useEffect(() => {
    carregarDespesas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina])

  useEffect(() => {
    carregarCategorias()
    carregarFuncionarios()
  }, [])

  function abrirCriacao() {
    setDespesaEditando(null)
    setForm(formInicial)
    setErroForm('')
    setModalAberto(true)
  }

  function abrirEdicao(despesa) {
    setDespesaEditando(despesa)
    setForm({
      description: despesa.description,
      categoriaId: despesa.categoriaId ?? despesa.categoria?.id ?? '',
      funcionarioId: despesa.funcionarioId ?? despesa.funcionario?.id ?? '',
      amount: despesa.amount,
      expenseDate: despesa.expenseDate || '',
    })
    setErroForm('')
    setModalAberto(true)
  }

  async function salvarDespesa(e) {
    e.preventDefault()
    setSalvando(true)
    setErroForm('')
    try {
      const payload = { ...form, funcionarioId: form.funcionarioId || null }
      if (despesaEditando) {
        await api.put(`/api/expenses/${despesaEditando.id}`, payload)
      } else {
        await api.post('/api/expenses', payload)
      }
      setModalAberto(false)
      await carregarDespesas()
    } catch (error) {
      setErroForm(error.response?.data?.message || 'Erro ao salvar despesa')
    } finally {
      setSalvando(false)
    }
  }

  async function excluirDespesa(despesa) {
    const confirmado = window.confirm(`Excluir a despesa "${despesa.description}"?`)
    if (!confirmado) return

    try {
      await api.delete(`/api/expenses/${despesa.id}`)
      await carregarDespesas()
    } catch (error) {
      window.alert(error.response?.data?.message || 'Erro ao excluir despesa')
    }
  }

  function nomeCategoria(despesa) {
    const categoriaId = despesa.categoriaId ?? despesa.categoria?.id
    return categorias.find((categoria) => categoria.id === categoriaId)?.nome ?? '-'
  }

  function nomeFuncionario(despesa) {
    const funcionarioId = despesa.funcionarioId ?? despesa.funcionario?.id
    if (!funcionarioId) return '-'
    return funcionarios.find((funcionario) => funcionario.id === funcionarioId)?.nome ?? '-'
  }

  const colunas = [
    { chave: 'description', titulo: 'Descrição' },
    { chave: 'amount', titulo: 'Valor' },
    { chave: 'expenseDate', titulo: 'Data' },
    { chave: 'categoria', titulo: 'Categoria', render: nomeCategoria },
    { chave: 'funcionario', titulo: 'Funcionário', render: nomeFuncionario },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (despesa) => (
        <>
          <button onClick={() => abrirEdicao(despesa)}>Editar</button>{' '}
          <button onClick={() => excluirDespesa(despesa)}>Excluir</button>
        </>
      ),
    },
  ]

  if (carregando) return <p>Carregando...</p>
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>

  return (
    <div>
      <h2>Despesas</h2>

      <button onClick={abrirCriacao}>Nova despesa</button>

      <TabelaPaginada
        colunas={colunas}
        dados={despesas}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
      />

      <Modal
        aberto={modalAberto}
        titulo={despesaEditando ? 'Editar despesa' : 'Nova despesa'}
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvarDespesa}>
          <div>
            <label>Descrição</label>
            <br />
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={255}
              required
            />
          </div>

          <div>
            <label>Valor</label>
            <br />
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Data</label>
            <br />
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Categoria</label>
            <br />
            <select
              value={form.categoriaId}
              onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
              required
            >
              <option value="" disabled>
                Selecione...
              </option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Funcionário</label>
            <br />
            <select
              value={form.funcionarioId}
              onChange={(e) => setForm({ ...form, funcionarioId: e.target.value })}
            >
              <option value="">Nenhum</option>
              {funcionarios.map((funcionario) => (
                <option key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome}
                </option>
              ))}
            </select>
          </div>

          {erroForm && <p style={{ color: 'red' }}>{erroForm}</p>}

          <button type="submit" disabled={salvando} style={{ marginTop: '12px' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
