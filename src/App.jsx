import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Categorias from './pages/Categorias.jsx'
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
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        <Route path="/categorias" element={<Categorias />} />
      </Route>
    </Routes>
  )
}

export default App