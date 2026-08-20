export default function TabelaPaginada({ colunas, dados, pagina, totalPaginas, onMudarPagina }) {
  return (
    <div>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave}>{coluna.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.id}>
              {colunas.map((coluna) => (
                <td key={coluna.chave}>
                  {coluna.render ? coluna.render(item) : item[coluna.chave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => onMudarPagina(pagina - 1)}
          disabled={pagina === 0}
        >
          Anterior
        </button>

        <span>Página {pagina + 1} de {totalPaginas}</span>

        <button
          onClick={() => onMudarPagina(pagina + 1)}
          disabled={pagina >= totalPaginas - 1}
        >
          Próxima
        </button>
      </div>
    </div>
  )
}