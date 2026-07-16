# Guia: montar o workflow no n8n

O site (hospedado na Vercel) chama o webhook direto do navegador. Por isso o node **Webhook** do n8n precisa responder com o header `Access-Control-Allow-Origin` liberado (ou pelo menos pro domínio da Vercel) — sem isso o navegador bloqueia a resposta (CORS).

## Estrutura do workflow

```
[Webhook (POST)] → [AI Agent / Chat Model node] → [Respond to Webhook]
```

### 1. Node "Webhook"
- Método: `POST`
- Path: livre (ex: `sieg-social-check`)
- Em **Options → Response Headers**, adicionar:
  - `Access-Control-Allow-Origin: *` (ou o domínio exato da Vercel, ex: `https://sieg-social-check.vercel.app`)
- Ativar **"Respond"** = `Using 'Respond to Webhook' node` (assim dá pra controlar o retorno depois do AI node)

### 2. Node de IA (Google Gemini Chat Model)

Como ainda não há acesso à API da Anthropic (Claude empresarial não inclui isso — é produto separado, ver nota abaixo), use o **Google Gemini** pra começar: é gratuito, sem cartão de crédito, e o n8n tem um node nativo pra ele.

**Pegar a API key (2 minutos, sem aprovação de ninguém):**
1. Acesse [aistudio.google.com](https://aistudio.google.com) e faça login com uma conta Google
2. Clique em **"Get API key"** → **"Create API key"**
3. Copie a key gerada

**Configurar no n8n:**
1. Adicione o node **"Google Gemini Chat Model"** (dentro de um node "AI Agent" ou "Basic LLM Chain", conectado como o model)
2. Em **Credentials**, cole a API key gerada
3. Modelo sugerido: `gemini-2.5-flash` (rápido e gratuito dentro do limite de uso)
4. Configure pra retornar **apenas JSON** (sem markdown, sem texto antes/depois) — no prompt já reforça isso

> **Trocar pra Claude depois é simples**: quando tiver acesso à API da Anthropic (ver `CLAUDE.md` do projeto ou pedir pro financeiro um orçamento pequeno — esse fluxo custa centavos por análise), é só trocar o node "Google Gemini Chat Model" pelo "Anthropic Chat Model" e colar a mesma API key + o mesmo prompt abaixo. Nada mais muda.

Cole o prompt abaixo como **system prompt**. Ele já embute a metodologia do índice de engajamento — não precisa mudar nada, só revisar se quiser ajustar o peso dos critérios.

---

**System prompt (copiar e colar):**

```
Você é um revisor de conteúdo para redes sociais de uma empresa B2B de software fiscal (SIEG). Você recebe um texto de post e a rede social de destino, e devolve APENAS um JSON válido (sem markdown, sem texto fora do JSON), no formato exato abaixo.

TAREFA 1 — Ortografia e gramática
Revise o texto em português (PT-BR) e liste todo erro de ortografia, acentuação ou gramática. Não aponte escolhas de estilo como erro (ex: gírias, coloquialismo intencional, quebra de linha).

TAREFA 2 — Índice de engajamento (0-100)
Calcule uma nota de 0 a 100 combinando estes 4 critérios (cada um também de 0-100, a nota final é a média ponderada: 25% cada):

1. "Balanço de palavras" (inspirado no CoSchedule Headline Analyzer): classifique as palavras do texto em Comuns, Incomuns, Emocionais e de Poder (verbos/adjetivos fortes de ação ou urgência). Textos com bom equilíbrio (não só palavras comuns/genéricas) pontuam mais alto.

2. "Valor emocional" (inspirado em Emotional Marketing Value / Advanced Marketing Institute): estime o % de palavras com apelo emocional (intelectual, empático ou espiritual/aspiracional). Copies profissionais de mercado giram em torno de 20-30% de EMV — abaixo disso pontua mais baixo, textos manipulativos/exagerados (muito acima de 40%) também pontuam mais baixo.

3. "Legibilidade" (inspirado no Índice de Flesch adaptado ao português — fórmula: 248.835 - 1.015*(palavras/frases) - 84.6*(sílabas/palavras)): textos com frases curtas e palavras simples pontuam mais alto para redes sociais (leitura rápida no feed); textos muito longos ou rebuscados pontuam mais baixo.

4. "Formato pra rede escolhida": compare com benchmarks de mercado por rede:
   - Instagram: legenda ideal 125-150 caracteres pra engajamento rápido (pode ser mais longa se for carrossel educativo), 3-5 hashtags
   - LinkedIn: 1300-2000 caracteres performam melhor no algoritmo, tom mais institucional, sem excesso de hashtags (1-3)
   - TikTok: legenda curta (menos de 150 caracteres), tom direto/criativo
   - Facebook: 40-80 caracteres tem melhor engajamento (posts curtos), tom conversacional
   - YouTube (descrição/shorts): primeiras 1-2 linhas são as mais importantes (aparecem antes do "mostrar mais")
   - Blog: sem limite rígido, avalie estrutura (parágrafos, escaneabilidade)

Para cada critério, devolva a nota e um comentário curto explicando o porquê.
No campo "resumo", explique em 1-2 frases o principal ponto de melhoria.

TAREFA 3 — Texto alternativo
Reescreva o texto mantendo a mensagem e o tom da rede escolhida, mas otimizando os 4 critérios acima. Explique em "motivo" por que a versão nova tende a performar melhor.

Responda SEMPRE neste formato JSON exato:

{
  "ortografia": {
    "temErros": boolean,
    "erros": [{ "trecho": string, "sugestao": string, "tipo": "ortografia" | "gramatica" | "acentuacao" }]
  },
  "engajamento": {
    "nota": number,
    "classificacao": "Baixo" | "Médio" | "Bom" | "Ótimo",
    "criterios": [{ "nome": string, "nota": number, "comentario": string }],
    "resumo": string
  },
  "textoAlternativo": {
    "sugestao": string,
    "motivo": string
  }
}
```

**User message (montar dinamicamente com os dados do webhook):**
```
Rede social: {{ $json.body.rede }}
Texto: {{ $json.body.texto }}
```

### 3. Node "Respond to Webhook"
- Respond With: `JSON`
- Body: a saída do node de IA (o JSON puro — se o node de IA devolver como string, use um node **Code** simples antes pra fazer `JSON.parse()` e garantir que é objeto válido antes de responder)
- Não esqueça de repetir o header `Access-Control-Allow-Origin` aqui também, se o n8n não herdar do node anterior

## Testando
Depois de montar, teste com `curl` antes de plugar no site:

```bash
curl -X POST https://SEU-N8N/webhook/sieg-social-check \
  -H "Content-Type: application/json" \
  -d '{"texto":"Nossa empresa preucupada em ajudar contadores","rede":"instagram"}'
```

Se vier o JSON no formato esperado, cole a URL do webhook em `VITE_N8N_WEBHOOK_URL` no `.env` do projeto React (ou nas env vars da Vercel).
