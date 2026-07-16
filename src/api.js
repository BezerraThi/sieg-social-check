const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL

export class AnaliseError extends Error {}

export async function analisarTexto({ texto, rede, incluirEmojis, incluirHashtags }) {
  if (!WEBHOOK_URL) {
    throw new AnaliseError(
      'Webhook do n8n não configurado. Defina VITE_N8N_WEBHOOK_URL no .env.'
    )
  }

  let response
  try {
    response = await fetch(WEBHOOK_URL, {
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
