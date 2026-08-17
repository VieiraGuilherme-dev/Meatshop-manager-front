import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const response = await api.get('/api/categorias')
        setCategorias(response.data.content)
      } catch {
        setErro('Erro ao carregar categorias')
      } finally {
        setCarregando(false)
      }
    }

    carregarCategorias()
  }, [])

  if (carregando) return <p>Carregando...</p>
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>

  return (
    <div>
      <h2>Categorias</h2>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td>{categoria.nome}</td>
              <td>{categoria.tipo}</td>
              <td>{categoria.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}