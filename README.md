# SIEG Social Check

Ferramenta interna para o time de social media revisar posts antes de publicar: verifica ortografia, estima um índice de engajamento e sugere um texto alternativo. A análise roda num workflow n8n (a IA fica lá, não neste app).

## Arquitetura

```
Navegador → /api/analisar (função serverless da Vercel) → webhook do n8n
```

O navegador **nunca** fala direto com o n8n. Ele chama `/api/analisar` (mesmo domínio do site), e essa função — que roda só no servidor — é quem conhece a URL real do webhook. Isso evita expor a URL do n8n no código do navegador e elimina problemas de CORS (a chamada do navegador é sempre same-origin).

## Rodando localmente

A função em `api/` só roda com o CLI da Vercel (o `vite` sozinho não serve rotas `/api`):

```bash
npm install -g vercel   # só na primeira vez
npm install
cp .env.example .env    # depois edite com a URL real do webhook do n8n
vercel dev
```

Se você rodar só `npm run dev` (Vite puro), o formulário carrega mas a chamada pra `/api/analisar` não tem pra onde ir — use `vercel dev` pra testar o fluxo completo localmente.

## Configurar o n8n

1. Leia [`n8n-workflow-guia.md`](./n8n-workflow-guia.md) — tem o passo a passo do workflow (Webhook → IA → Respond) e o prompt pronto pra colar no node de IA.
2. O formato exato do que o site envia e espera receber está em [`webhook-contrato.md`](./webhook-contrato.md).
3. Cole a URL do webhook em `N8N_WEBHOOK_URL` no `.env` (local) ou nas variáveis de ambiente do projeto na Vercel.

## Deploy (Vercel)

1. Importe este repositório na Vercel.
2. Framework preset: Vite (detecção automática) — a Vercel detecta a pasta `api/` sozinha e publica como função serverless.
3. Adicione a env var `N8N_WEBHOOK_URL` (e `N8N_SECRET`, se for usar) nas configurações do projeto — **sem** prefixo `VITE_`, pra garantir que fica só no servidor.
4. Deploy.

Como o navegador chama `/api/analisar` (mesmo domínio), **não precisa mais configurar CORS no n8n** — a chamada entre a função serverless e o n8n é servidor-a-servidor, fora do alcance da política de CORS do navegador.
