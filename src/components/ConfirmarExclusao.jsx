import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmarExclusao({
  aberto,
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
  carregando,
}) {
  return (
    <Modal aberto={aberto} titulo={titulo} onFechar={onCancelar}>
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <AlertTriangle size={32} className="text-red-600" />
        <p className="text-sm text-stone-600">{mensagem}</p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancelar}
          disabled={carregando}
          className="border border-stone-300 text-stone-700 dark:text-stone-300 rounded px-4 py-2 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          disabled={carregando}
          className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {carregando ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </Modal>
  )
}
