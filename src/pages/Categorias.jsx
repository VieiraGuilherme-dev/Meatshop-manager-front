import { useEffect, useState } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'
import TabelaPaginada from '../components/TabelaPaginada'

const TIPOS = ['DESPESA', 'RECEITA']

const formInicial = { nome: '', tipo: 'DESPESA', descricao: '' }

export default function Categorias() {
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
        <>
          <button onClick={() => abrirEdicao(categoria)}>Editar</button>{' '}
          <button onClick={() => excluirCategoria(categoria)}>Excluir</button>
        </>
      ),
    },
  ]

  if (carregando) return <p>Carregando...</p>
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>

  return (
    <div>
      <h2>Categorias</h2>

      <button onClick={abrirCriacao}>Nova categoria</button>

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
          <div>
            <label>Nome</label>
            <br />
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              maxLength={255}
              required
            />
          </div>

          <div>
            <label>Tipo</label>
            <br />
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Descrição</label>
            <br />
            <input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              maxLength={255}
            />
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
