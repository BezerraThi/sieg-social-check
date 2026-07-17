export class AnaliseError extends Error {}

const MAX_TENTATIVAS = 3

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function chamarApi({ texto, rede, incluirEmojis, incluirHashtags }) {
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

// A Vercel tem uma falha intermitente conhecida na infraestrutura dela (não é bug nosso)
// que às vezes derruba a função sem nem chegar a chamar o n8n. Como costuma passar sozinha
// na tentativa seguinte, tentamos de novo automaticamente antes de mostrar erro pro usuário.
export async function analisarTexto(params) {
  let ultimoErro
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      return await chamarApi(params)
    } catch (err) {
      ultimoErro = err
      if (tentativa < MAX_TENTATIVAS) await esperar(800 * tentativa)
    }
  }
  throw ultimoErro
}
