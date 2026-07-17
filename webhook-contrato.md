# Contrato do Webhook (n8n)

O navegador faz um `POST` pra `/api/analisar` (função serverless da Vercel, ver `api/analisar.js`). Essa função repassa a chamada pro webhook do n8n configurado em `N8N_WEBHOOK_URL` (variável só de servidor, ver `.env.example`) — o navegador nunca vê a URL real do n8n.

## Request (o site envia)

```json
{
  "texto": "Texto do post que vai ser publicado",
  "rede": "instagram",
  "incluirEmojis": true,
  "incluirHashtags": true,
  "imagem": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

`rede` é sempre um destes valores: `instagram`, `linkedin`, `tiktok`, `facebook`, `youtube`, `blog`.

`incluirEmojis` e `incluirHashtags`: booleanos marcados pelo usuário no formulário — controlam se o `textoAlternativo` (Tarefa 3 do prompt) pode usar emojis/hashtags ou não, independente do que o tom da rede normalmente sugeriria.

`texto` e `imagem`: o usuário pode enviar **só texto, só imagem, ou os dois** — pelo menos um dos dois sempre vem preenchido (o site não deixa enviar os dois vazios). Quando não há imagem, o campo `imagem` vem `null`. Quando não há texto, `texto` vem como string vazia `""`.

`imagem`: quando presente, é sempre uma [data URL](https://developer.mozilla.org/en-US/docs/Web/URI/Schemes/data) base64 (`data:image/<tipo>;base64,<dados>`), gerada pelo `FileReader.readAsDataURL` do navegador. Limite de 3MB no arquivo original (validado no frontend, ~4MB depois de virar base64).

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
    ],
    "textoCorrigido": "Texto original com só as correções de ortografia/gramática aplicadas — mesma mensagem, mesmo tom, só sem os erros"
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
  },
  "analiseImagem": {
    "resumo": "Descrição curta do que a IA viu na imagem e como ela se conecta com a legenda",
    "ortografia": {
      "temErros": true,
      "erros": [
        {
          "trecho": "Sujestão",
          "sugestao": "Sugestão",
          "tipo": "ortografia"
        }
      ],
      "sugestaoTexto": "Versão sugerida do texto que aparece dentro da imagem, ou null se não fizer sentido reescrever"
    }
  }
}
```

### Regras de tipo
- `ortografia` (no nível raiz) é **sempre sobre o texto do post (a legenda)**, nunca sobre texto que apareça dentro da imagem — isso agora vive separado, dentro de `analiseImagem.ortografia` (ver abaixo).
- `ortografia.erros` pode ser um array vazio quando `temErros` é `false`.
- `ortografia.textoCorrigido`: sempre presente, mesmo quando `temErros` é `false` (nesse caso, é igual ao texto original) — é o texto pronto pra copiar, com a mensagem e o tom preservados, só sem erros. Quando a requisição é só imagem (sem `texto`), vem como string vazia `""` — o site não mostra essa seção nesse caso.
- `engajamento.nota` e cada `criterios[].nota`: inteiro de 0 a 100.
- `engajamento.classificacao`: um destes — `Baixo`, `Médio`, `Bom`, `Ótimo`.
- `analiseImagem`: **só existe quando a requisição incluiu uma imagem** (o caminho de texto puro não devolve esse campo — o site trata a ausência dele normalmente, mostrando uma frase genérica no lugar). É o jeito da IA mostrar pro usuário que ela realmente "olhou" pra imagem, não só pro texto.
- `analiseImagem.ortografia`: cobre **só o texto visível dentro da própria imagem** (card, print, texto sobreposto etc.), separado da `ortografia` raiz (que é só a legenda) — evita misturar as duas fontes num usuário confuso sobre onde corrigir o quê. Se não houver texto visível na imagem, vem `{ "temErros": false, "erros": [], "sugestaoTexto": null }`.
- `analiseImagem.ortografia.sugestaoTexto`: reescrita sugerida do texto que está na imagem (só quando fizer sentido sugerir uma versão melhor, ex: o texto tem erro ou é fraco) — pode vir `null`. Isso é só uma sugestão de texto pra quem for editar a arte, o site não altera a imagem.
- Todos os campos de texto em português.

### Comportamento por combinação de entrada

| Entrada | `ortografia` (legenda) | `analiseImagem.ortografia` | `engajamento.criterios` | `textoAlternativo` |
|---|---|---|---|---|
| Só texto | revisa o `texto` | não existe (sem `analiseImagem`) | 4 critérios de **texto** (balanço de palavras, EMV, legibilidade, formato pra rede) | reescreve o texto original |
| Texto + imagem | revisa só o `texto` (legenda) | revisa só o texto visível na imagem, se houver | os mesmos 4 critérios de texto, considerando a imagem como contexto | reescreve o texto original (legenda) |
| Só imagem | `temErros: false`, `textoCorrigido: ""` (não há legenda) | revisa só o texto visível na imagem, se houver | 4 critérios **visuais** (relevância pro público, apelo visual/emocional, clareza da mensagem, adequação ao formato da rede) | sugestão de legenda criada do zero pra acompanhar a imagem |

O site identifica "só imagem" (pra trocar o título da última seção pra "Sugestão de legenda para a imagem") checando se o `texto` enviado na requisição estava vazio — isso é controlado no frontend, não vem no JSON de resposta.

Se o n8n devolver um erro (timeout, falha da IA), o site mostra uma mensagem de erro e permite tentar de novo — não trava a tela.
