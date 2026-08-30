export default function Modal({ aberto, titulo, onFechar, children }) {
  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50"
      onClick={onFechar}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-stone-900">{titulo}</h2>
          <button
            onClick={onFechar}
            className="text-stone-400 hover:text-stone-600 text-xl leading-none transition-colors"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}