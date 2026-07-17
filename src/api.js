export class AnaliseError extends Error {}

export async function analisarTexto({ texto, rede, incluirEmojis, incluirHashtags }) {
  let response
  try {
    response = await fetch('/api/analisar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, rede, incluirEmojis, incluirHashtags }),
    })
  } catch {
    throw new AnaliseError('Não foi possível conectar ao serviço de análise. Tente novamente.')
  }

  if (!response.ok) {
    throw new AnaliseError(`O serviço de análise retornou um erro (${response.status}). Tente novamente.`)
  }

  let dados
  try {
    dados = await response.json()
  } catch {
    throw new AnaliseError('Resposta inválida do serviço de análise.')
  }

  if (!dados?.ortografia || !dados?.engajamento || !dados?.textoAlternativo) {
    throw new AnaliseError('Resposta do serviço de análise veio incompleta.')
  }

  return dados
}
