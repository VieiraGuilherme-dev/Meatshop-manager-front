import { Link } from 'react-router-dom'

export default function NaoEncontrado() {
  return (
    <div>
      <h1>404</h1>
      <p>A página que você tentou acessar não existe.</p>
      <Link to="/dashboard">Voltar ao dashboard</Link>
    </div>
  )
}
