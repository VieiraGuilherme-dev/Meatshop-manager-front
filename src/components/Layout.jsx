import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const linkClasses =
  'px-3 py-2 text-sm text-stone-600 rounded hover:bg-stone-100 hover:text-stone-900 transition-colors'

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-stone-100">
      <nav className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-amber-800">MeatShop</span>

            <div className="flex gap-1">
              <Link to="/dashboard" className={linkClasses}>Dashboard</Link>
              <Link to="/categorias" className={linkClasses}>Categorias</Link>
              <Link to="/funcionarios" className={linkClasses}>Funcionários</Link>
              <Link to="/receitas" className={linkClasses}>Receitas</Link>
              <Link to="/despesas" className={linkClasses}>Despesas</Link>
              <Link to="/relatorios" className={linkClasses}>Relatórios</Link>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-sm text-stone-600 hover:text-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}