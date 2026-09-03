import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'
import TabelaEsqueleto from '../components/TabelaEsqueleto'
import { useToast } from '../contexts/ToastContext'

const TIPOS = ['DESPESA', 'RECEITA']

const formInicial = { nome: '', tipo: 'DESPESA', descricao: '' }

const inputClasses =
  'w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
const labelClasses = 'block text-sm font-medium text-stone-700 mb-1'

export default function Categorias() {
  const { mostrarToast } = useToast()
  const [categorias, setCategorias] = useState([])
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  async function carregarCategorias() {
    setCarregando(true)
    setErro('')
    try {
      const response = await api.get('/api/categorias', { params: { page: pagina } })
      setCategorias(response.data.content)
      setTotalPaginas(response.data.totalPages ?? 1)
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao carregar categorias')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarCategorias()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina])

  function abrirCriacao() {
    setCategoriaEditando(null)
    setForm(formInicial)
    setErroForm('')
    setModalAberto(true)
  }

  function abrirEdicao(categoria) {
    setCategoriaEditando(categoria)
    setForm({ nome: categoria.nome, tipo: categoria.tipo, descricao: categoria.descricao || '' })
    setErroForm('')
    setModalAberto(true)
  }

  async function salvarCategoria(e) {
    e.preventDefault()
    setSalvando(true)
    setErroForm('')
    try {
      if (categoriaEditando) {
        await api.put(`/api/categorias/${categoriaEditando.id}`, form)
      } else {
        await api.post('/api/categorias', form)
      }
      setModalAberto(false)
      await carregarCategorias()
      mostrarToast(categoriaEditando ? 'Categoria atualizada' : 'Categoria criada com sucesso')
    } catch (error) {
      setErroForm(error.response?.data?.message || 'Erro ao salvar categoria')
    } finally {
      setSalvando(false)
    }
  }

  async function excluirCategoria(categoria) {
    const confirmado = window.confirm(`Excluir a categoria "${categoria.nome}"?`)
    if (!confirmado) return

    try {
      await api.delete(`/api/categorias/${categoria.id}`)
      await carregarCategorias()
      mostrarToast('Categoria excluída')
    } catch (error) {
      window.alert(error.response?.data?.message || 'Erro ao excluir categoria')
    }
  }

  const colunas = [
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'tipo', titulo: 'Tipo' },
    { chave: 'descricao', titulo: 'Descrição' },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (categoria) => (
        <div className="flex gap-2">
          <button
            onClick={() => abrirEdicao(categoria)}
            title="Editar"
            className="text-stone-600 hover:text-stone-900"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => excluirCategoria(categoria)}
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
        <h1 className="text-2xl font-bold text-stone-900">Categorias</h1>
        <button
          onClick={abrirCriacao}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          <Plus size={16} />
          Nova categoria
        </button>
      </div>

      <TabelaPaginada
        colunas={colunas}
        dados={categorias}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
      />

      <Modal
        aberto={modalAberto}
        titulo={categoriaEditando ? 'Editar categoria' : 'Nova categoria'}
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvarCategoria}>
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
            <label className={labelClasses}>Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className={inputClasses}
            >
              {TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className={labelClasses}>Descrição</label>
            <input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              maxLength={255}
              className={inputClasses}
            />
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
