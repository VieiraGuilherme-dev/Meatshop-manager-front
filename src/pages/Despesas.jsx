import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'
import TabelaEsqueleto from '../components/TabelaEsqueleto'
import { useToast } from '../contexts/ToastContext'

const formInicial = { description: '', categoriaId: '', funcionarioId: '', amount: '', expenseDate: '' }

const inputClasses =
  'w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
const labelClasses = 'block text-sm font-medium text-stone-700 mb-1'

export default function Despesas() {
  const { mostrarToast } = useToast()
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
      mostrarToast(despesaEditando ? 'Despesa atualizada' : 'Despesa criada com sucesso')
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
      mostrarToast('Despesa excluída')
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
        <div className="flex gap-2">
          <button
            onClick={() => abrirEdicao(despesa)}
            title="Editar"
            className="text-stone-600 hover:text-stone-900"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => excluirDespesa(despesa)}
            title="Excluir"
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (carregando) return <TabelaEsqueleto colunas={colunas} />
  if (erro) return <p className="text-sm text-red-600">{erro}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Despesas</h1>
        <button
          onClick={abrirCriacao}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          <Plus size={16} />
          Nova despesa
        </button>
      </div>

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
          <div className="mb-4">
            <label className={labelClasses}>Descrição</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={255}
              required
              className={inputClasses}
            />
          </div>

          <div className="mb-4">
            <label className={labelClasses}>Valor</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              className={inputClasses}
            />
          </div>

          <div className="mb-4">
            <label className={labelClasses}>Data</label>
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
              required
              className={inputClasses}
            />
          </div>

          <div className="mb-4">
            <label className={labelClasses}>Categoria</label>
            <select
              value={form.categoriaId}
              onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
              required
              className={inputClasses}
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

          <div className="mb-4">
            <label className={labelClasses}>Funcionário</label>
            <select
              value={form.funcionarioId}
              onChange={(e) => setForm({ ...form, funcionarioId: e.target.value })}
              className={inputClasses}
            >
              <option value="">Nenhum</option>
              {funcionarios.map((funcionario) => (
                <option key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome}
                </option>
              ))}
            </select>
          </div>

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
    </div>
  )
}
