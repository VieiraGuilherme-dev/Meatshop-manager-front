import { Inbox } from 'lucide-react'

export default function TabelaPaginada({
  colunas,
  dados,
  pagina,
  totalPaginas,
  onMudarPagina,
  tituloVazio = 'Nenhum registro encontrado',
  descricaoVazia,
  acaoVazia,
}) {
  return (
    <div>
      <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
              {colunas.map((coluna) => (
                <th
                  key={coluna.chave}
                  className="text-left font-medium text-stone-600 dark:text-stone-400 px-4 py-3"
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
                  <div className="flex flex-col items-center justify-center gap-1 text-center">
                    <Inbox size={48} className="text-stone-300 mb-2" />
                    <p className="text-base font-medium text-stone-700 dark:text-stone-300">{tituloVazio}</p>
                    {descricaoVazia && (
                      <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs">{descricaoVazia}</p>
                    )}
                    {acaoVazia && <div className="mt-4">{acaoVazia}</div>}
                  </div>
                </td>
              </tr>
            )}

            {dados.map((item) => (
              <tr
                key={item.id}
                className="border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                {colunas.map((coluna) => (
                  <td key={coluna.chave} className="px-4 py-3 text-stone-700 dark:text-stone-300">
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
          className="px-3 py-1.5 text-sm border border-stone-300 rounded text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        <span className="text-sm text-stone-500 dark:text-stone-400">
          Página {pagina + 1} de {totalPaginas}
        </span>

        <button
          onClick={() => onMudarPagina(pagina + 1)}
          disabled={pagina >= totalPaginas - 1}
          className="px-3 py-1.5 text-sm border border-stone-300 rounded text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}