// Função serverless da Vercel — roda só no servidor, nunca é enviada ao navegador.
// A URL real do webhook do n8n (e o segredo, se configurado) ficam só aqui.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    res.status(500).json({ error: 'N8N_WEBHOOK_URL não configurado nas variáveis de ambiente do servidor' })
    return
  }

  let n8nResponse
  try {
    n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_SECRET ? { 'X-Webhook-Secret': process.env.N8N_SECRET } : {}),
      },
      body: JSON.stringify(req.body),
    })
  } catch {
    res.status(502).json({ error: 'Não foi possível conectar ao serviço de análise' })
    return
  }

  const texto = await n8nResponse.text()
  res.status(n8nResponse.status)
  res.setHeader('Content-Type', 'application/json')
  res.send(texto)
}
