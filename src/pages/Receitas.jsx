import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'
import TabelaEsqueleto from '../components/TabelaEsqueleto'
import { useToast } from '../contexts/ToastContext'

const formInicial = { descricao: '', valor: '', data: '', categoriaId: '' }

const inputClasses =
  'w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
const labelClasses = 'block text-sm font-medium text-stone-700 mb-1'

export default function Receitas() {
  const { mostrarToast } = useToast()
  const [receitas, setReceitas] = useState([])
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [categorias, setCategorias] = useState([])

  const [modalAberto, setModalAberto] = useState(false)
  const [receitaEditando, setReceitaEditando] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  async function carregarReceitas() {
    setCarregando(true)
    setErro('')
    try {
      const response = await api.get('/api/receitas', { params: { page: pagina } })
      setReceitas(response.data.content)
      setTotalPaginas(response.data.totalPages ?? 1)
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao carregar receitas')
    } finally {
      setCarregando(false)
    }
  }

  async function carregarCategorias() {
    try {
      const response = await api.get('/api/categorias')
      setCategorias(response.data.content.filter((categoria) => categoria.tipo === 'RECEITA'))
    } catch {
      setCategorias([])
    }
  }

  useEffect(() => {
    carregarReceitas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina])

  useEffect(() => {
    carregarCategorias()
  }, [])

  function abrirCriacao() {
    setReceitaEditando(null)
    setForm(formInicial)
    setErroForm('')
    setModalAberto(true)
  }

  function abrirEdicao(receita) {
    setReceitaEditando(receita)
    setForm({
      descricao: receita.descricao,
      valor: receita.valor,
      data: receita.data || '',
      categoriaId: receita.categoriaId ?? receita.categoria?.id ?? '',
    })
    setErroForm('')
    setModalAberto(true)
  }

  async function salvarReceita(e) {
    e.preventDefault()
    setSalvando(true)
    setErroForm('')
    try {
      if (receitaEditando) {
        await api.put(`/api/receitas/${receitaEditando.id}`, form)
      } else {
        await api.post('/api/receitas', form)
      }
      setModalAberto(false)
      await carregarReceitas()
      mostrarToast(receitaEditando ? 'Receita atualizada' : 'Receita criada com sucesso')
    } catch (error) {
      setErroForm(error.response?.data?.message || 'Erro ao salvar receita')
    } finally {
      setSalvando(false)
    }
  }

  async function excluirReceita(receita) {
    const confirmado = window.confirm(`Excluir a receita "${receita.descricao}"?`)
    if (!confirmado) return

    try {
      await api.delete(`/api/receitas/${receita.id}`)
      await carregarReceitas()
      mostrarToast('Receita excluída')
    } catch (error) {
      window.alert(error.response?.data?.message || 'Erro ao excluir receita')
    }
  }

  function nomeCategoria(receita) {
    const categoriaId = receita.categoriaId ?? receita.categoria?.id
    return categorias.find((categoria) => categoria.id === categoriaId)?.nome ?? '-'
  }

  const colunas = [
    { chave: 'descricao', titulo: 'Descrição' },
    { chave: 'valor', titulo: 'Valor' },
    { chave: 'data', titulo: 'Data' },
    { chave: 'categoria', titulo: 'Categoria', render: nomeCategoria },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (receita) => (
        <div className="flex gap-2">
          <button
            onClick={() => abrirEdicao(receita)}
            title="Editar"
            className="text-stone-600 hover:text-stone-900"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => excluirReceita(receita)}
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
        <h1 className="text-2xl font-bold text-stone-900">Receitas</h1>
        <button
          onClick={abrirCriacao}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          <Plus size={16} />
          Nova receita
        </button>
      </div>

      <TabelaPaginada
        colunas={colunas}
        dados={receitas}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
      />

      <Modal
        aberto={modalAberto}
        titulo={receitaEditando ? 'Editar receita' : 'Nova receita'}
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvarReceita}>
          <div className="mb-4">
            <label className={labelClasses}>Descrição</label>
            <input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
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
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
              className={inputClasses}
            />
          </div>

          <div className="mb-4">
            <label className={labelClasses}>Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
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
