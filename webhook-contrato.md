# Contrato do Webhook (n8n)

O frontend faz um `POST` pra URL do webhook configurada em `VITE_N8N_WEBHOOK_URL` (ver `.env.example`).

## Request (o site envia)

```json
{
  "texto": "Texto do post que vai ser publicado",
  "rede": "instagram"
}
```

`rede` é sempre um destes valores: `instagram`, `linkedin`, `tiktok`, `facebook`, `youtube`, `blog`.

## Response (o n8n devolve)

```json
{
  "ortografia": {
    "temErros": true,
    "erros": [
      {
        "trecho": "empresa preucupada",
        "sugestao": "empresa preocupada",
        "tipo": "ortografia"
      }
    ]
  },
  "engajamento": {
    "nota": 72,
    "classificacao": "Bom",
    "criterios": [
      {
        "nome": "Balanço de palavras",
        "nota": 65,
        "comentario": "Poucas palavras de poder/emocionais, texto muito informativo"
      },
      {
        "nome": "Valor emocional (EMV)",
        "nota": 58,
        "comentario": "12% de palavras com apelo emocional — abaixo da média de bons copies (20-30%)"
      },
      {
        "nome": "Legibilidade",
        "nota": 88,
        "comentario": "Frases curtas, fácil de ler rápido no feed"
      },
      {
        "nome": "Formato pra rede escolhida",
        "nota": 80,
        "comentario": "Tamanho dentro do ideal pro Instagram, mas sem hashtags"
      }
    ],
    "resumo": "Texto claro e correto, mas pouco emocional. Adicionar 1-2 palavras de apelo e uma pergunta no final tende a aumentar comentários."
  },
  "textoAlternativo": {
    "sugestao": "Versão reescrita do texto, mais direta e com mais apelo",
    "motivo": "Por que essa versão tende a performar melhor"
  }
}
```

### Regras de tipo
- `ortografia.erros` pode ser um array vazio quando `temErros` é `false`.
- `engajamento.nota` e cada `criterios[].nota`: inteiro de 0 a 100.
- `engajamento.classificacao`: um destes — `Baixo`, `Médio`, `Bom`, `Ótimo`.
- Todos os campos de texto em português.

Se o n8n devolver um erro (timeout, falha da IA), o site mostra uma mensagem de erro e permite tentar de novo — não trava a tela.
