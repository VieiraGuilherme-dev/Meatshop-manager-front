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
import Skeleton from '../components/Skeleton'

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

  if (carregando) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-stone-200 p-5">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-5">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-5">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-75 w-full" />
          <Skeleton className="h-75 w-full" />
        </div>
      </div>
    )
  }

  if (erro) return <p className="text-sm text-red-600">{erro}</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-stone-200 p-5">
          <p className="text-sm text-stone-500 mb-1">Total de Receitas</p>
          <p className="text-2xl font-bold text-green-600">
            {formatoMoeda.format(lucro.totalReceitas)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-5">
          <p className="text-sm text-stone-500 mb-1">Total de Despesas</p>
          <p className="text-2xl font-bold text-red-600">
            {formatoMoeda.format(lucro.totalDespesas)}
          </p>
        </div>

        <div className="bg-amber-50 rounded-lg border border-amber-200 p-5">
          <p className="text-sm text-amber-800 mb-1">Lucro Real</p>
          <p className="text-2xl font-bold text-amber-900">
            {formatoMoeda.format(lucro.lucro)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-stone-200 p-5">
          <p className="text-sm font-medium text-stone-700 mb-4">Despesas por mês</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={despesasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(valor) => formatoMoeda.format(valor)}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="total" fill="#b45309" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-5">
          <p className="text-sm font-medium text-stone-700 mb-4">Despesas por categoria</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={despesasPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="categoriaNome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(valor) => formatoMoeda.format(valor)}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="total" fill="#78716c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}