export function gerarInsights(resumo) {
  if (!resumo) return []

  const {
    variacaoDespesas,
    variacaoReceitas,
    lucro,
    margemLucro,
    maiorCategoriaDespesa,
    totalFolha,
    despesas,
  } = resumo

  const alertas = []
  const positivos = []
  const neutros = []

  if (variacaoDespesas != null && variacaoDespesas > 10) {
    alertas.push({
      tipo: 'alerta',
      texto: `Suas despesas aumentaram ${variacaoDespesas.toFixed(1)}% em relação ao mês anterior.`,
    })
  }

  if (variacaoReceitas != null && variacaoReceitas < -10) {
    alertas.push({
      tipo: 'alerta',
      texto: `Suas receitas caíram ${Math.abs(variacaoReceitas).toFixed(1)}% em relação ao mês anterior.`,
    })
  }

  if (lucro != null && lucro < 0) {
    alertas.push({ tipo: 'alerta', texto: 'Seu resultado no período foi negativo.' })
  }

  if (variacaoReceitas != null && variacaoReceitas > 10) {
    positivos.push({
      tipo: 'positivo',
      texto: `Suas receitas cresceram ${variacaoReceitas.toFixed(1)}% em relação ao mês anterior.`,
    })
  }

  if (margemLucro != null && margemLucro > 25) {
    positivos.push({
      tipo: 'positivo',
      texto: `Sua margem de lucro está em ${margemLucro.toFixed(1)}%.`,
    })
  }

  if (maiorCategoriaDespesa != null && despesas > 0) {
    const percentual = (maiorCategoriaDespesa.valor / despesas) * 100
    neutros.push({
      tipo: 'neutro',
      texto: `${maiorCategoriaDespesa.nome} é sua maior despesa do período, representando ${percentual.toFixed(1)}% do total.`,
    })
  }

  if (totalFolha != null && despesas > 0) {
    const percentual = (totalFolha / despesas) * 100
    neutros.push({
      tipo: 'neutro',
      texto: `A folha de pagamento representa ${percentual.toFixed(1)}% das suas despesas.`,
    })
  }

  return [...alertas, ...positivos, ...neutros].slice(0, 3)
}
