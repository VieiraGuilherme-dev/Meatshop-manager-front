import Skeleton from './Skeleton'

export default function TabelaEsqueleto({ colunas, linhas = 5 }) {
  return (
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
          {Array.from({ length: linhas }).map((_, indice) => (
            <tr key={indice} className="border-b border-stone-100 last:border-0">
              {colunas.map((coluna) => (
                <td key={coluna.chave} className="px-4 py-3">
                  <Skeleton className="h-4 w-3/4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
