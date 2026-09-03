import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const proximoId = useRef(0)

  const mostrarToast = useCallback((mensagem, tipo = 'sucesso') => {
    const id = proximoId.current++
    setToasts((atuais) => [...atuais, { id, mensagem, tipo }])
    setTimeout(() => {
      setToasts((atuais) => atuais.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2 bg-white border border-stone-200 shadow-lg rounded-lg px-4 py-3 text-sm text-stone-700 animate-[toast-in_0.2s_ease-out]"
          >
            {toast.tipo === 'erro' ? (
              <XCircle size={18} className="text-red-600 shrink-0" />
            ) : (
              <CheckCircle size={18} className="text-green-600 shrink-0" />
            )}
            {toast.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
