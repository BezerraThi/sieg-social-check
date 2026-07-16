# SIEG Social Check

Ferramenta interna para o time de social media revisar posts antes de publicar: verifica ortografia, estima um índice de engajamento e sugere um texto alternativo. A análise roda num workflow n8n (a IA fica lá, não neste app).

## Rodando localmente

```bash
npm install
cp .env.example .env   # depois edite com a URL real do webhook do n8n
npm run dev
```

## Configurar o n8n

1. Leia [`n8n-workflow-guia.md`](./n8n-workflow-guia.md) — tem o passo a passo do workflow (Webhook → IA → Respond) e o prompt pronto pra colar no node de IA.
2. O formato exato do que o site envia e espera receber está em [`webhook-contrato.md`](./webhook-contrato.md).
3. Cole a URL do webhook em `VITE_N8N_WEBHOOK_URL` no `.env` (local) ou nas variáveis de ambiente do projeto na Vercel.

## Deploy (Vercel)

É um app estático (Vite). Na Vercel:

1. Importe este diretório (`projetos/sieg-social-check`) como o *root directory* do projeto.
2. Framework preset: Vite (detecção automática).
3. Adicione a env var `VITE_N8N_WEBHOOK_URL` nas configurações do projeto.
4. Deploy.

Como o app chama o webhook direto do navegador, o node **Webhook** do n8n precisa liberar CORS pro domínio da Vercel (detalhes no guia do n8n).
