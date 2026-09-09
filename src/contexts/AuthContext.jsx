import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

function decodificarToken(token) {
  if (!token) return { usuario: null, role: null }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { usuario: payload.sub ?? null, role: payload.role ?? null }
  } catch {
    return { usuario: null, role: null }
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const { usuario, role } = decodificarToken(token)

  async function login(email, senha) {
    const response = await api.post('/api/auth/login', { email, senha })
    const novoToken = response.data.token
    localStorage.setItem('token', novoToken)
    setToken(novoToken)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  const autenticado = Boolean(token)

  return (
    <AuthContext.Provider value={{ token, autenticado, usuario, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}