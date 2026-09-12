import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

export default function MenuAcoes({ itens }) {
  const [aberto, setAberto] = useState(false)
  const [posicao, setPosicao] = useState({ top: 0, right: 0 })
  const botaoRef = useRef(null)
  const menuRef = useRef(null)

  function abrirMenu() {
    const rect = botaoRef.current.getBoundingClientRect()
    setPosicao({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setAberto(true)
  }

  useEffect(() => {
    if (!aberto) return

    function aoClicarFora(evento) {
      if (
        menuRef.current &&
        !menuRef.current.contains(evento.target) &&
        !botaoRef.current.contains(evento.target)
      ) {
        setAberto(false)
      }
    }

    function fechar() {
      setAberto(false)
    }

    document.addEventListener('mousedown', aoClicarFora)
    window.addEventListener('scroll', fechar, true)

    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      window.removeEventListener('scroll', fechar, true)
    }
  }, [aberto])

  return (
    <>
      <button
        ref={botaoRef}
        onClick={() => (aberto ? setAberto(false) : abrirMenu())}
        title="Ações"
        className="text-stone-400 hover:text-stone-600"
      >
        <MoreVertical size={16} />
      </button>

      {aberto &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: posicao.top, right: posicao.right }}
            className="z-50 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-lg py-1"
          >
            {itens.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setAberto(false)
                  item.onClick()
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  item.destrutivo
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}
