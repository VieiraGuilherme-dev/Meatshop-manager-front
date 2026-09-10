import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Beef, Check, Mail, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const recursos = ['Receitas e despesas', 'Gestão de funcionários', 'Relatórios em PDF e Excel']

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      await login(email, senha)
      navigate('/dashboard')
    } catch {
      setErro('Email ou senha inválidos')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 text-center bg-linear-to-br from-amber-700 to-amber-900">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <Beef size={48} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">MeatShop Manager</h1>
        <p className="text-amber-100 mb-8">Controle financeiro completo para o seu açougue</p>

        <ul className="flex flex-col gap-3">
          {recursos.map((recurso) => (
            <li key={recurso} className="flex items-center gap-2 text-amber-50">
              <Check size={16} className="text-amber-200 shrink-0" />
              <span className="text-sm">{recurso}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-stone-900 mb-1">Entrar</h2>
          <p className="text-sm text-stone-500 mb-6">Acesse sua conta para continuar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-stone-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full border border-stone-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-brand-500 text-white rounded px-4 py-2 text-sm font-medium hover:bg-brand-600 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
