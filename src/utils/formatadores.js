const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatoData = new Intl.DateTimeFormat('pt-BR')

export function formatarMoeda(valor) {
  return formatoMoeda.format(valor)
}

export function formatarCompacto(valor) {
  if (Math.abs(valor) >= 1_000_000) {
    return `${(valor / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  }

  if (Math.abs(valor) >= 1000) {
    return `${(valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  }

  return valor.toLocaleString('pt-BR')
}

export function formatarData(data) {
  if (!data) return ''

  if (typeof data === 'string') {
    const [ano, mes, dia] = data.split('-').map(Number)
    return formatoData.format(new Date(ano, mes - 1, dia))
  }

  return formatoData.format(data)
}
