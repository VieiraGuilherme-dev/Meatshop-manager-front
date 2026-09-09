import { Inbox } from 'lucide-react'

export default function TabelaPaginada({
  colunas,
  dados,
  pagina,
  totalPaginas,
  onMudarPagina,
  mensagemVazia = 'Nenhum registro encontrado',
  acaoVazia,
}) {
  return (
    <div>
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              {colunas.map((coluna) => (
                <th
                  key={coluna.chave}
                  className="text-left font-medium text-stone-600 px-4 py-3"
                >
                  {coluna.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 && (
              <tr>
                <td colSpan={colunas.length} className="py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Inbox size={40} className="text-stone-300" />
                    <p className="text-sm text-stone-500">{mensagemVazia}</p>
                    {acaoVazia && <div className="mt-2">{acaoVazia}</div>}
                  </div>
                </td>
              </tr>
            )}

            {dados.map((item) => (
              <tr
                key={item.id}
                className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors"
              >
                {colunas.map((coluna) => (
                  <td key={coluna.chave} className="px-4 py-3 text-stone-700">
                    {coluna.render ? coluna.render(item) : item[coluna.chave]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => onMudarPagina(pagina - 1)}
          disabled={pagina === 0}
          className="px-3 py-1.5 text-sm border border-stone-300 rounded text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        <span className="text-sm text-stone-500">
          Página {pagina + 1} de {totalPaginas}
        </span>

        <button
          onClick={() => onMudarPagina(pagina + 1)}
          disabled={pagina >= totalPaginas - 1}
          className="px-3 py-1.5 text-sm border border-stone-300 rounded text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}