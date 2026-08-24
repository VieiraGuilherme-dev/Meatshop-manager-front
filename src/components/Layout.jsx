import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/categorias">Categorias</Link>
        <Link to="/funcionarios">Funcionários</Link>
        <Link to="/receitas">Receitas</Link>
        <Link to="/despesas">Despesas</Link>
        <Link to="/relatorios">Relatórios</Link>
        <button onClick={logout}>Sair</button>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}