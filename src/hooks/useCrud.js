import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'

function extrairMensagemErro(error, mensagemPadrao) {
  return error.response?.data?.message || mensagemPadrao
}

export function useCrud(endpoint, mensagemErroCarregar = 'Erro ao carregar dados') {
  const [dados, setDados] = useState([])
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(
    async (paginaAlvo = pagina) => {
      setCarregando(true)
      setErro('')
      try {
        const response = await api.get(endpoint, { params: { page: paginaAlvo } })
        setDados(response.data.content)
        setTotalPaginas(response.data.totalPages ?? 1)
      } catch (error) {
        setErro(extrairMensagemErro(error, mensagemErroCarregar))
      } finally {
        setCarregando(false)
      }
    },
    [endpoint, pagina, mensagemErroCarregar]
  )

  useEffect(() => {
    carregar(pagina)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina])

  async function criar(objeto, mensagemErro = 'Erro ao salvar') {
    try {
      await api.post(endpoint, objeto)
      await carregar()
    } catch (error) {
      throw new Error(extrairMensagemErro(error, mensagemErro))
    }
  }

  async function atualizar(id, objeto, mensagemErro = 'Erro ao salvar') {
    try {
      await api.put(`${endpoint}/${id}`, objeto)
      await carregar()
    } catch (error) {
      throw new Error(extrairMensagemErro(error, mensagemErro))
    }
  }

  async function excluir(id, mensagemErro = 'Erro ao excluir') {
    try {
      await api.delete(`${endpoint}/${id}`)
      await carregar()
    } catch (error) {
      throw new Error(extrairMensagemErro(error, mensagemErro))
    }
  }

  return {
    dados,
    pagina,
    setPagina,
    totalPaginas,
    carregando,
    erro,
    carregar,
    criar,
    atualizar,
    excluir,
  }
}
