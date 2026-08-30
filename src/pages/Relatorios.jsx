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
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Relatórios</h1>

      <div className="bg-white rounded-lg border border-stone-200 p-6 max-w-md">
        <p className="text-sm text-stone-500 mb-5">
          Selecione o período para exportar o relatório financeiro. Deixe em branco
          para incluir todo o histórico.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">Data início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-600 mb-1">Data fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <div className="flex gap-3 mt-2">
            <button
              onClick={exportarPdf}
              disabled={baixandoPdf}
              className="bg-amber-700 text-white rounded px-4 py-2 text-sm font-medium hover:bg-amber-800 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
            >
              {baixandoPdf ? 'Exportando...' : 'Exportar PDF'}
            </button>

            <button
              onClick={exportarExcel}
              disabled={baixandoExcel}
              className="border border-stone-300 text-stone-700 rounded px-4 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {baixandoExcel ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}