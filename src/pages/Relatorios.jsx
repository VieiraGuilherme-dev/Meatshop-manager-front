import { useState } from 'react'
import api from '../api/axios'

export default function Relatorios() {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [baixandoPdf, setBaixandoPdf] = useState(false)
  const [baixandoExcel, setBaixandoExcel] = useState(false)
  const [erro, setErro] = useState('')

  function dispararDownload(blob, nomeArquivo) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function exportarPdf() {
    setBaixandoPdf(true)
    setErro('')
    try {
      const response = await api.get('/api/dashboard/export/pdf', {
        params: { dataInicio, dataFim },
        responseType: 'blob',
      })
      dispararDownload(response.data, 'relatorio.pdf')
    } catch {
      setErro('Erro ao exportar PDF')
    } finally {
      setBaixandoPdf(false)
    }
  }

  async function exportarExcel() {
    setBaixandoExcel(true)
    setErro('')
    try {
      const response = await api.get('/api/dashboard/export/excel', {
        params: { dataInicio, dataFim },
        responseType: 'blob',
      })
      dispararDownload(response.data, 'relatorio.xlsx')
    } catch {
      setErro('Erro ao exportar Excel')
    } finally {
      setBaixandoExcel(false)
    }
  }

  return (
    <div>
      <h2>Relatórios</h2>

      <div>
        <label>Data início</label>
        <br />
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />
      </div>

      <div>
        <label>Data fim</label>
        <br />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
      </div>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <div style={{ marginTop: '12px' }}>
        <button onClick={exportarPdf} disabled={baixandoPdf}>
          {baixandoPdf ? 'Exportando...' : 'Exportar PDF'}
        </button>{' '}
        <button onClick={exportarExcel} disabled={baixandoExcel}>
          {baixandoExcel ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>
    </div>
  )
}
