const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatoData = new Intl.DateTimeFormat('pt-BR')

export function formatarMoeda(valor) {
  return formatoMoeda.format(valor)
}

export function formatarData(data) {
  if (!data) return ''

  if (typeof data === 'string') {
    const [ano, mes, dia] = data.split('-').map(Number)
    return formatoData.format(new Date(ano, mes - 1, dia))
  }

  return formatoData.format(data)
}
