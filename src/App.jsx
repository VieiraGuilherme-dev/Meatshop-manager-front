import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Categorias from './pages/Categorias.jsx'
import Funcionarios from './pages/Funcionarios.jsx'
import Receitas from './pages/Receitas.jsx'
import Layout from './components/Layout.jsx'
import RotaProtegida from './components/RotaProtegida.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/receitas" element={<Receitas />} />
      </Route>
    </Routes>
  )
}

export default App