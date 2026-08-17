import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RotaProtegida({ children }) {
  const { autenticado } = useAuth()

  if (!autenticado) {
    return <Navigate to="/" replace />
  }

  return children
}