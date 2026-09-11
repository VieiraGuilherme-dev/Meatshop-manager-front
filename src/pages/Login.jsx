import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Beef, Eye, EyeOff, FileText, Lock, Mail, Users, Wallet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const beneficios = [
  { icone: Wallet, texto: 'Controle de receitas e despesas' },
  { icone: Users, texto: 'Gestão de funcionários' },
  { icone: FileText, texto: 'Relatórios em PDF e Excel' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-brand-500 to-brand-700">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="12%" cy="18%" r="90" fill="white" fillOpacity="0.05" />
          <circle cx="92%" cy="8%" r="60" fill="white" fillOpacity="0.05" />
          <circle cx="82%" cy="88%" r="150" fill="white" fillOpacity="0.05" />
          <rect x="2%" y="68%" width="160" height="160" rx="28" fill="white" fillOpacity="0.05" transform="rotate(12 100 100)" />
          <rect x="72%" y="32%" width="110" height="110" rx="20" fill="white" fillOpacity="0.05" transform="rotate(-10 100 100)" />
        </svg>

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur mb-8">
            <Beef size={40} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">MeatShop Manager</h1>
          <p className="text-amber-100 mb-10">Gestão financeira inteligente para o seu açougue.</p>

          <div className="flex flex-col gap-4">
            {beneficios.map(({ icone: Icone, texto }) => (
              <div key={texto} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 shrink-0">
                  <Icone size={18} className="text-white" />
                </span>
                <span className="text-sm text-white">{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-stone-900 mb-1">Bem-vindo de volta</h2>
          <p className="text-sm text-stone-500 mb-6">Entre na sua conta para continuar</p>

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
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full border border-stone-300 rounded pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((valor) => !valor)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-brand-600 text-white rounded px-4 py-3 text-sm font-medium hover:bg-brand-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-xs text-stone-400 text-center mt-6">
            MeatShop Manager • Gestão financeira
          </p>
        </div>
      </div>
    </div>
  )
}
