import { createContext, useContext, useEffect, useState } from 'react'

const TemaContext = createContext()

function obterTemaInicial() {
  const salvo = localStorage.getItem('tema')
  if (salvo === 'claro' || salvo === 'escuro') return salvo

  const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefereEscuro ? 'escuro' : 'claro'
}

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(obterTemaInicial())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'escuro')
    localStorage.setItem('tema', tema)
  }, [tema])

  function alternarTema() {
    setTema((atual) => (atual === 'escuro' ? 'claro' : 'escuro'))
  }

  return (
    <TemaContext.Provider value={{ tema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  )
}

export function useTema() {
  return useContext(TemaContext)
}
