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

const formInicial = { description: '', categoriaId: '', funcionarioId: '', amount: '', expenseDate: '' }

const inputClasses =
  'w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClasses = 'block text-sm font-medium text-stone-700 mb-1'

export default function Despesas() {
  const { mostrarToast } = useToast()
  const { role } = useAuth()
  const podeGerenciar = role === 'ADMIN'

  const {
    dados: despesas,
    pagina,
    setPagina,
    totalPaginas,
    carregando,
    erro,
    criar,
    atualizar,
    excluir,
  } = useCrud('/api/expenses', 'Erro ao carregar despesas')

  const [categorias, setCategorias] = useState([])
  const [funcionarios, setFuncionarios] = useState([])

  const [modalAberto, setModalAberto] = useState(false)
  const [despesaEditando, setDespesaEditando] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  const [despesaExcluindo, setDespesaExcluindo] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

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
        await atualizar(despesaEditando.id, payload, 'Erro ao salvar despesa')
      } else {
        await criar(payload, 'Erro ao salvar despesa')
      }
      setModalAberto(false)
      mostrarToast(despesaEditando ? 'Despesa atualizada' : 'Despesa criada com sucesso')
    } catch (error) {
      setErroForm(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true)
    try {
      await excluir(despesaExcluindo.id, 'Erro ao excluir despesa')
      mostrarToast('Despesa excluída')
      setDespesaExcluindo(null)
    } catch (error) {
      window.alert(error.message)
    } finally {
      setExcluindo(false)
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
    {
      chave: 'amount',
      titulo: 'Valor',
      render: (despesa) => formatarMoeda(despesa.amount),
    },
    {
      chave: 'expenseDate',
      titulo: 'Data',
      render: (despesa) => formatarData(despesa.expenseDate),
    },
    { chave: 'categoria', titulo: 'Categoria', render: nomeCategoria },
    { chave: 'funcionario', titulo: 'Funcionário', render: nomeFuncionario },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (despesa) =>
        podeGerenciar && (
          <MenuAcoes
            itens={[
              { label: 'Editar', icon: Pencil, onClick: () => abrirEdicao(despesa) },
              {
                label: 'Excluir',
                icon: Trash2,
                onClick: () => setDespesaExcluindo(despesa),
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
        <h1 className="text-2xl font-bold text-stone-900">Despesas</h1>
        {podeGerenciar && (
          <button
            onClick={abrirCriacao}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            <Plus size={16} />
            Nova despesa
          </button>
        )}
      </div>

      <TabelaPaginada
        colunas={colunas}
        dados={despesas}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onMudarPagina={setPagina}
        tituloVazio="Nenhuma despesa ainda"
        descricaoVazia="Registre sua primeira despesa para acompanhar os custos do açougue."
        acaoVazia={
          podeGerenciar && (
            <button
              onClick={abrirCriacao}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              <Plus size={16} />
              Criar primeira despesa
            </button>
          )
        }
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
            className="w-full bg-brand-500 text-white rounded px-4 py-2 text-sm font-medium hover:bg-brand-600 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Modal>

      <ConfirmarExclusao
        aberto={Boolean(despesaExcluindo)}
        titulo="Excluir despesa"
        mensagem={`Tem certeza que deseja excluir a despesa ${despesaExcluindo?.description}? Esta ação não pode ser desfeita.`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setDespesaExcluindo(null)}
        carregando={excluindo}
      />
    </div>
  )
}
