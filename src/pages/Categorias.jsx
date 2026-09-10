import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'
import Skeleton from '../components/Skeleton'
import ConfirmarExclusao from '../components/ConfirmarExclusao'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { useCrud } from '../hooks/useCrud'

const TIPOS = ['DESPESA', 'RECEITA']

const formInicial = { nome: '', tipo: 'DESPESA', descricao: '' }

const inputClasses =
  'w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClasses = 'block text-sm font-medium text-stone-700 mb-1'

export default function Categorias() {
  const { mostrarToast } = useToast()
  const { role } = useAuth()
  const podeGerenciar = role === 'ADMIN'

  const {
    dados: categorias,
    pagina,
    setPagina,
    totalPaginas,
    carregando,
    erro,
    criar,
    atualizar,
    excluir,
  } = useCrud('/api/categorias', 'Erro ao carregar categorias')

  const [modalAberto, setModalAberto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  const [categoriaExcluindo, setCategoriaExcluindo] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

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
        await atualizar(categoriaEditando.id, form, 'Erro ao salvar categoria')
      } else {
        await criar(form, 'Erro ao salvar categoria')
      }
      setModalAberto(false)
      mostrarToast(categoriaEditando ? 'Categoria atualizada' : 'Categoria criada com sucesso')
    } catch (error) {
      setErroForm(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true)
    try {
      await excluir(categoriaExcluindo.id, 'Erro ao excluir categoria')
      mostrarToast('Categoria excluída')
      setCategoriaExcluindo(null)
    } catch (error) {
      window.alert(error.message)
    } finally {
      setExcluindo(false)
    }
  }

  const colunas = [
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'tipo', titulo: 'Tipo' },
    { chave: 'descricao', titulo: 'Descrição' },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (categoria) =>
        podeGerenciar && (
          <div className="flex gap-2">
            <button
              onClick={() => abrirEdicao(categoria)}
              title="Editar"
              className="text-stone-600 hover:text-stone-900"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setCategoriaExcluindo(categoria)}
              title="Excluir"
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={16} />
            </button>
          </div>
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
        <h1 className="text-2xl font-bold text-stone-900">Categorias</h1>
        {podeGerenciar && (
          <button
            onClick={abrirCriacao}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            <Plus size={16} />
            Nova categoria
          </button>
        )}
      </div>

      <TabelaPaginada
        colunas={colunas}
        dados={categorias}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
        mensagemVazia="Nenhuma categoria cadastrada"
        acaoVazia={
          podeGerenciar && (
            <button
              onClick={abrirCriacao}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              <Plus size={16} />
              Criar primeira categoria
            </button>
          )
        }
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
            className="w-full bg-brand-500 text-white rounded px-4 py-2 text-sm font-medium hover:bg-brand-600 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Modal>

      <ConfirmarExclusao
        aberto={Boolean(categoriaExcluindo)}
        titulo="Excluir categoria"
        mensagem={`Tem certeza que deseja excluir a categoria ${categoriaExcluindo?.nome}? Esta ação não pode ser desfeita.`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setCategoriaExcluindo(null)}
        carregando={excluindo}
      />
    </div>
  )
}
