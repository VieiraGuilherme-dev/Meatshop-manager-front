import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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

const formInicial = { descricao: '', valor: '', data: '', categoriaId: '' }

const inputClasses =
  'w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClasses = 'block text-sm font-medium text-stone-700 mb-1'

export default function Receitas() {
  const { mostrarToast } = useToast()
  const { role } = useAuth()
  const podeGerenciar = role === 'ADMIN'

  const {
    dados: receitas,
    pagina,
    setPagina,
    totalPaginas,
    carregando,
    erro,
    criar,
    atualizar,
    excluir,
  } = useCrud('/api/receitas', 'Erro ao carregar receitas')

  const [categorias, setCategorias] = useState([])

  const [modalAberto, setModalAberto] = useState(false)
  const [receitaEditando, setReceitaEditando] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  const [receitaExcluindo, setReceitaExcluindo] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  async function carregarCategorias() {
    try {
      const response = await api.get('/api/categorias')
      setCategorias(response.data.content.filter((categoria) => categoria.tipo === 'RECEITA'))
    } catch {
      setCategorias([])
    }
  }

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
        await atualizar(receitaEditando.id, form, 'Erro ao salvar receita')
      } else {
        await criar(form, 'Erro ao salvar receita')
      }
      setModalAberto(false)
      mostrarToast(receitaEditando ? 'Receita atualizada' : 'Receita criada com sucesso')
    } catch (error) {
      setErroForm(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true)
    try {
      await excluir(receitaExcluindo.id, 'Erro ao excluir receita')
      mostrarToast('Receita excluída')
      setReceitaExcluindo(null)
    } catch (error) {
      window.alert(error.message)
    } finally {
      setExcluindo(false)
    }
  }

  function nomeCategoria(receita) {
    const categoriaId = receita.categoriaId ?? receita.categoria?.id
    return categorias.find((categoria) => categoria.id === categoriaId)?.nome ?? '-'
  }

  const colunas = [
    { chave: 'descricao', titulo: 'Descrição' },
    {
      chave: 'valor',
      titulo: 'Valor',
      render: (receita) => (
        <div className="text-right text-sm font-semibold text-stone-900">
          {formatarMoeda(receita.valor)}
        </div>
      ),
    },
    {
      chave: 'data',
      titulo: 'Data',
      render: (receita) => formatarData(receita.data),
    },
    {
      chave: 'categoria',
      titulo: 'Categoria',
      render: (receita) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
          {nomeCategoria(receita)}
        </span>
      ),
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (receita) =>
        podeGerenciar && (
          <MenuAcoes
            itens={[
              { label: 'Editar', icon: Pencil, onClick: () => abrirEdicao(receita) },
              {
                label: 'Excluir',
                icon: Trash2,
                onClick: () => setReceitaExcluindo(receita),
                destrutivo: true,
              },
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
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Receitas</h1>
          <p className="text-sm text-stone-500 mt-1">
            Acompanhe as entradas financeiras do seu açougue.
          </p>
        </div>
        {podeGerenciar && (
          <button
            onClick={abrirCriacao}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nova receita
          </button>
        )}
      </div>

      <TabelaPaginada
        colunas={colunas}
        dados={receitas}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
        tituloVazio="Nenhuma receita ainda"
        descricaoVazia="Registre sua primeira receita para começar a acompanhar o faturamento."
        acaoVazia={
          podeGerenciar && (
            <button
              onClick={abrirCriacao}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Criar primeira receita
            </button>
          )
        }
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
            className="w-full bg-brand-500 text-white rounded px-4 py-2 text-sm font-medium hover:bg-brand-600 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Modal>

      <ConfirmarExclusao
        aberto={Boolean(receitaExcluindo)}
        titulo="Excluir receita"
        mensagem={`Tem certeza que deseja excluir a receita ${receitaExcluindo?.descricao}? Esta ação não pode ser desfeita.`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setReceitaExcluindo(null)}
        carregando={excluindo}
      />
    </div>
  )
}
