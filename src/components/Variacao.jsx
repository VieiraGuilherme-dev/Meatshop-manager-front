import { TrendingDown, TrendingUp } from 'lucide-react'

export default function Variacao({ valor, subirEBom }) {
  if (valor === null || valor === undefined) return null

  const subiu = valor >= 0
  const favoravel = subiu === subirEBom
  const Icone = subiu ? TrendingUp : TrendingDown

  return (
    <p className={`flex items-center gap-1 text-xs ${favoravel ? 'text-green-600' : 'text-red-600'}`}>
      <Icone size={14} />
      {Math.abs(valor).toFixed(1)}% vs. mês anterior
    </p>
  )
}
