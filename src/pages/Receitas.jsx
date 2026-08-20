import { useEffect, useState } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'

const formInicial = { descricao: '', valor: '', data: '', categoriaId: '' }

export default function Receitas() {
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
    } catch {
      setErro('Erro ao carregar receitas')
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
    } catch {
      setErroForm('Erro ao salvar receita')
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
    } catch {
      window.alert('Erro ao excluir receita')
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
        <>
          <button onClick={() => abrirEdicao(receita)}>Editar</button>{' '}
          <button onClick={() => excluirReceita(receita)}>Excluir</button>
        </>
      ),
    },
  ]

  if (carregando) return <p>Carregando...</p>
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>

  return (
    <div>
      <h2>Receitas</h2>

      <button onClick={abrirCriacao}>Nova receita</button>

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
          <div>
            <label>Descrição</label>
            <br />
            <input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Valor</label>
            <br />
            <input
              type="number"
              step="0.01"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Data</label>
            <br />
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
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

          {erroForm && <p style={{ color: 'red' }}>{erroForm}</p>}

          <button type="submit" disabled={salvando} style={{ marginTop: '12px' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
