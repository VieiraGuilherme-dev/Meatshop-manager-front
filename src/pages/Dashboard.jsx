import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Info,
  Lightbulb,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/axios'
import Skeleton from '../components/Skeleton'
import { useAuth } from '../contexts/AuthContext'
import { useTema } from '../contexts/TemaContext'
import { formatarCompacto, formatarMoeda } from '../utils/formatadores'
import { gerarInsights } from '../utils/insights'

const ICONE_INSIGHT = {
  alerta: { Icone: AlertTriangle, cor: 'text-amber-600' },
  positivo: { Icone: TrendingUp, cor: 'text-green-600' },
  neutro: { Icone: Info, cor: 'text-stone-400' },
}

const MESES_ABREVIADOS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

const MESES_COMPLETOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const CORES_CATEGORIA = [
  '#6B2D06', '#8B3F08', '#A94E09', '#C2621A', '#D4813F', '#E5A272', '#F0C3A4',
]

function obterSaudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function TooltipGrafico({ active, payload, label, formatarRotulo }) {
  if (!active || !payload?.length) return null

  const rotulo = formatarRotulo ? formatarRotulo(payload[0].payload) : label

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-lg p-3">
      <p className="text-xs text-stone-500 dark:text-stone-400">{rotulo}</p>
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
        {formatarMoeda(payload[0].value)}
      </p>
    </div>
  )
}

function TickCategoria({ x, y, payload, dados, corPrimaria, corSecundaria }) {
  const item = dados.find((entrada) => entrada.categoriaNome === payload.value)

  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={14} textAnchor="middle" fontSize={12} fill={corPrimaria}>
        {payload.value}
      </text>
      <text dy={30} textAnchor="middle" fontSize={11} fill={corSecundaria}>
        {item ? formatarCompacto(item.total) : ''}
      </text>
    </g>
  )
}

function VariacaoInline({ valor, bomQuandoSobe }) {
  if (valor == null) return null

  const subiu = valor >= 0
  const favoravel = subiu === bomQuandoSobe
  const Icone = subiu ? TrendingUp : TrendingDown
  const percentual = Math.abs(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  return (
    <p className={`flex items-center gap-1 text-xs mt-2 ${favoravel ? 'text-green-600' : 'text-red-600'}`}>
      <Icone size={14} />
      {percentual}% vs. mês anterior
    </p>
  )
}

function SparklineDespesas({ dados }) {
  return (
    <div style={{ width: 110, height: 48 }} className="shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados}>
          <defs>
            <linearGradient id="gradienteSparklineDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="total"
            stroke="#dc2626"
            strokeWidth={1.5}
            fill="url(#gradienteSparklineDespesas)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function CardKpi({
  icone: Icone,
  corIcone,
  rotulo,
  valor,
  corValor,
  corFundo = 'bg-white dark:bg-stone-900',
  corBorda = 'border-stone-200 dark:border-stone-800',
  rodape,
  extra,
}) {
  return (
    <div className={`rounded-xl border ${corBorda} ${corFundo} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${corIcone}`}>
          <Icone size={18} className="text-white" />
        </span>
        <div>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">{rotulo}</p>
          <p className="text-[11px] text-stone-400">No período atual</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className={`text-[26px] font-bold leading-none ${corValor}`}>{valor}</p>
        {extra}
      </div>

      {rodape}
    </div>
  )
}

function BotaoNovaMovimentacao() {
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!aberto) return

    function aoClicarFora(evento) {
      if (containerRef.current && !containerRef.current.contains(evento.target)) {
        setAberto(false)
      }
    }

    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        onClick={() => setAberto((valor) => !valor)}
        className="flex items-center gap-2 bg-brand-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors"
      >
        <Plus size={16} />
        Nova movimentação
        <ChevronDown size={16} />
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-lg py-1 z-10">
          <button
            onClick={() => {
              setAberto(false)
              navigate('/receitas')
            }}
            className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Nova receita
          </button>
          <button
            onClick={() => {
              setAberto(false)
              navigate('/despesas')
            }}
            className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Nova despesa
          </button>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const { tema } = useTema()
  const escuro = tema === 'escuro'
  const corGradeGrafico = escuro ? '#292524' : '#f5f5f4'
  const tickEixo = { fontSize: 12, fill: escuro ? '#a8a29e' : '#78716c' }
  const tickCategoriaPrimario = escuro ? '#d6d3d1' : '#78716c'
  const tickCategoriaSecundario = escuro ? '#78716c' : '#a8a29e'
  const nomeUsuario = usuario?.split('@')[0] ?? ''
  const [resumo, setResumo] = useState(null)
  const [despesasPorMes, setDespesasPorMes] = useState([])
  const [despesasPorCategoria, setDespesasPorCategoria] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function buscarDados() {
      try {
        const [resumoResponse, porMesResponse, porCategoriaResponse] = await Promise.all([
          api.get('/api/dashboard/resumo'),
          api.get('/api/dashboard/by-month'),
          api.get('/api/dashboard/by-category'),
        ])

        setResumo(resumoResponse.data)

        setDespesasPorMes(
          porMesResponse.data.map((item) => ({
            ...item,
            mes: MESES_ABREVIADOS[item.month - 1],
            mesCompleto: `${MESES_COMPLETOS[item.month - 1]}/${item.year ?? new Date().getFullYear()}`,
          }))
        )

        setDespesasPorCategoria(
          [...porCategoriaResponse.data].sort((a, b) => b.total - a.total)
        )
      } catch (error) {
        setErro(error.response?.data?.message || 'Não foi possível carregar o dashboard')
      } finally {
        setCarregando(false)
      }
    }

    buscarDados()
  }, [])

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const cabecalho = (
    <div className="mb-8">
      <div className="flex justify-end items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-4">
        <Calendar size={16} />
        <span>{dataHoje}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-stone-900 dark:text-stone-100">Dashboard</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {obterSaudacao()}, {nomeUsuario}. Aqui está o resumo financeiro do seu açougue.
          </p>
        </div>

        <BotaoNovaMovimentacao />
      </div>
    </div>
  )

  if (carregando) {
    return (
      <div>
        {cabecalho}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((indice) => (
            <div key={indice} className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-7 w-28 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        <Skeleton className="h-16 w-full rounded-xl mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[360px] w-full" />
          <Skeleton className="h-[360px] w-full" />
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div>
        {cabecalho}
        <p className="text-sm text-red-600">{erro}</p>
      </div>
    )
  }

  const insights = gerarInsights(resumo)

  return (
    <div>
      {cabecalho}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CardKpi
          icone={Wallet}
          corIcone="bg-green-500"
          rotulo="Receitas"
          valor={formatarMoeda(resumo.receitas)}
          corValor="text-green-600"
          rodape={<VariacaoInline valor={resumo.variacaoReceitas} bomQuandoSobe />}
        />

        <CardKpi
          icone={Receipt}
          corIcone="bg-red-500"
          rotulo="Despesas"
          valor={formatarMoeda(resumo.despesas)}
          corValor="text-red-600"
          rodape={<VariacaoInline valor={resumo.variacaoDespesas} bomQuandoSobe={false} />}
          extra={<SparklineDespesas dados={despesasPorMes} />}
        />

        <CardKpi
          icone={TrendingUp}
          corIcone="bg-brand-600"
          rotulo="Lucro"
          valor={formatarMoeda(resumo.lucro)}
          corValor="text-brand-900"
          corFundo="bg-brand-50 dark:bg-brand-900/20"
          corBorda="border-brand-500/20"
          rodape={
            <p className="text-xs text-brand-700 mt-2">Margem: {resumo.margemLucro.toFixed(1)}%</p>
          }
        />

        <CardKpi
          icone={Users}
          corIcone="bg-indigo-400"
          rotulo="Funcionários"
          valor={`${resumo.funcionariosAtivos} ativos`}
          corValor="text-stone-900 dark:text-stone-100"
          rodape={
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Folha: {formatarMoeda(resumo.totalFolha)}</p>
          }
        />
      </div>

      {insights.length > 0 && (
        <div className="flex flex-col sm:flex-row bg-amber-50 border border-amber-200 rounded-xl mb-8 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 sm:border-r sm:border-amber-200">
            <Lightbulb size={18} className="text-amber-600 shrink-0" />
            <span className="font-semibold text-stone-800 whitespace-nowrap">Insights</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-200 flex-1">
            {insights.map((insight, indice) => {
              const { Icone, cor } = ICONE_INSIGHT[insight.tipo]
              return (
                <div key={indice} className="flex items-start gap-2 px-5 py-4 text-sm text-stone-700 dark:text-stone-300">
                  <Icone size={16} className={`shrink-0 mt-0.5 ${cor}`} />
                  <span>{insight.texto}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5">
          <p className="text-base font-semibold text-stone-700 dark:text-stone-300">Despesas por mês</p>
          <p className="text-xs text-stone-400 mb-4">Últimos meses</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={despesasPorMes}>
              <defs>
                <linearGradient id="gradienteDespesasMes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A94E09" />
                  <stop offset="100%" stopColor="#D4813F" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={corGradeGrafico} />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={tickEixo} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={tickEixo}
                tickFormatter={formatarCompacto}
              />
              <Tooltip
                content={<TooltipGrafico formatarRotulo={(item) => item.mesCompleto} />}
                cursor={{ fill: corGradeGrafico }}
              />
              <Bar
                dataKey="total"
                fill="url(#gradienteDespesasMes)"
                radius={[8, 8, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5">
          <p className="text-base font-semibold text-stone-700 dark:text-stone-300">Despesas por categoria</p>
          <p className="text-xs text-stone-400 mb-4">No período atual</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={despesasPorCategoria} margin={{ bottom: 8 }}>
              <CartesianGrid vertical={false} stroke={corGradeGrafico} />
              <XAxis
                dataKey="categoriaNome"
                interval={0}
                height={48}
                axisLine={false}
                tickLine={false}
                tick={
                  <TickCategoria
                    dados={despesasPorCategoria}
                    corPrimaria={tickCategoriaPrimario}
                    corSecundaria={tickCategoriaSecundario}
                  />
                }
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={tickEixo}
                tickFormatter={formatarCompacto}
              />
              <Tooltip content={<TooltipGrafico />} cursor={{ fill: corGradeGrafico }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {despesasPorCategoria.map((entrada, indice) => (
                  <Cell
                    key={entrada.categoriaNome}
                    fill={CORES_CATEGORIA[Math.min(indice, CORES_CATEGORIA.length - 1)]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
