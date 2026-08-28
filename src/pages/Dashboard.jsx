import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/axios'

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const MESES_ABREVIADOS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

export default function Dashboard() {
  const [lucro, setLucro] = useState(null)
  const [despesasPorMes, setDespesasPorMes] = useState([])
  const [despesasPorCategoria, setDespesasPorCategoria] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function buscarDados() {
      try {
        const [lucroResponse, porMesResponse, porCategoriaResponse] = await Promise.all([
          api.get('/api/dashboard/lucro'),
          api.get('/api/dashboard/by-month'),
          api.get('/api/dashboard/by-category'),
        ])

        setLucro(lucroResponse.data)

        setDespesasPorMes(
          porMesResponse.data.map((item) => ({
            ...item,
            mes: MESES_ABREVIADOS[item.month - 1],
          }))
        )

        setDespesasPorCategoria(porCategoriaResponse.data)
      } catch (error) {
        setErro(error.response?.data?.message || 'Não foi possível carregar o dashboard')
      } finally {
        setCarregando(false)
      }
    }

    buscarDados()
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

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', flex: 1 }}>
          <p>Despesas por mês</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={despesasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(valor) => formatoMoeda.format(valor)} />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', flex: 1 }}>
          <p>Despesas por categoria</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={despesasPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoriaNome" />
              <YAxis />
              <Tooltip formatter={(valor) => formatoMoeda.format(valor)} />
              <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}