import { useEffect, useState } from 'react'
import api from '../api/axios'

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function Dashboard() {
  const [lucro, setLucro] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function buscarLucro() {
      try {
        const response = await api.get('/api/dashboard/lucro')
        setLucro(response.data)
      } catch {
        setErro('Não foi possível carregar o dashboard')
      } finally {
        setCarregando(false)
      }
    }

    buscarLucro()
  }, [])

  if (carregando) return <p>Carregando...</p>
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <p>Total de Receitas</p>
          <h2>{formatoMoeda.format(lucro.totalReceitas)}</h2>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <p>Total de Despesas</p>
          <h2>{formatoMoeda.format(lucro.totalDespesas)}</h2>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <p>Lucro Real</p>
          <h2>{formatoMoeda.format(lucro.lucro)}</h2>
        </div>
      </div>
    </div>
  )
}