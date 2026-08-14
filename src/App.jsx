import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<h1>Dashboard (em construção)</h1>} />
    </Routes>
  )
}

export default App