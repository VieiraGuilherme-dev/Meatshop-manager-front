import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Tags,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const linkBase = 'flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors'

function classesLink({ isActive }) {
  return isActive
    ? `${linkBase} bg-amber-50 text-amber-800 font-medium`
    : `${linkBase} text-stone-600 hover:bg-stone-100 hover:text-stone-900`
}

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/categorias', label: 'Categorias', icon: Tags },
  { to: '/funcionarios', label: 'Funcionários', icon: Users },
  { to: '/receitas', label: 'Receitas', icon: TrendingUp },
  { to: '/despesas', label: 'Despesas', icon: TrendingDown },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
]

export default function Layout() {
  const { logout } = useAuth()
  const [sidebarAberta, setSidebarAberta] = useState(false)

  return (
    <div className="min-h-screen bg-stone-100">
      {sidebarAberta && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-stone-200 flex flex-col transition-transform duration-200 md:translate-x-0 ${
          sidebarAberta ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-stone-200">
          <span className="font-bold text-amber-800">MeatShop</span>
          <button
            onClick={() => setSidebarAberta(false)}
            aria-label="Fechar menu"
            className="md:hidden text-stone-400 hover:text-stone-600 text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={classesLink}
              onClick={() => setSidebarAberta(false)}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-stone-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-left px-3 py-2 rounded text-sm text-stone-600 hover:bg-stone-100 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="md:ml-60">
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-stone-200 h-14 flex items-center gap-3 px-4">
          <button
            onClick={() => setSidebarAberta(true)}
            aria-label="Abrir menu"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-bold text-amber-800">MeatShop</span>
        </div>

        <main className="min-h-screen bg-stone-100 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
