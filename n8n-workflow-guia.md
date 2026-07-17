# Guia: montar o workflow no n8n

> **Atualização de arquitetura:** o navegador não chama mais o n8n direto — ele chama uma função serverless da Vercel (`api/analisar.js`), que repassa a chamada pro n8n. Isso significa que **não precisa mais configurar CORS** no node Webhook (a chamada agora é servidor-a-servidor, fora do alcance da política de CORS do navegador). Se você já tinha configurado `Access-Control-Allow-Origin` antes, pode deixar como está (não atrapalha) ou remover.

## Estrutura do workflow

O site agora permite enviar **só texto, só imagem, ou os dois juntos** — então o workflow precisa decidir, pra cada requisição, qual caminho seguir:

```
                              ┌─ (tem imagem) ──→ [Preparar imagem (Code)] → [Convert to File] → [Analyze Image] ─┐
[Webhook (POST)] → [IF: tem imagem?]                                                                              ├─→ [Code: parsing] → [Respond to Webhook]
                              └─ (só texto) ────→ [Message a Model] ──────────────────────────────────────────────┘
```

As duas pontas do IF caem no **mesmo** node de parsing (Code) e no **mesmo** "Respond to Webhook" — é só conectar as duas saídas na entrada dele.

### 1. Node "Webhook"
- Método: `POST`
- Path: livre (ex: `sieg-social-check`)
- Ativar **"Respond"** = `Using 'Respond to Webhook' node` (assim dá pra controlar o retorno depois do AI node)
- **Opcional, recomendado**: em **Authentication**, escolha `Header Auth` e crie uma credencial com um nome de header (ex: `X-Webhook-Secret`) e um valor secreto à sua escolha. Coloque esse mesmo valor na variável `N8N_SECRET` do projeto na Vercel — assim só a sua função serverless consegue chamar o webhook, mesmo que alguém descubra a URL.

### 2. Node "IF" (decide o caminho)
Logo depois do Webhook, adicione um node **"IF"** com uma condição:
- Value 1: `{{ $json.body.imagem }}`
- Condition: `is not empty` (ou "exists", dependendo da versão do n8n)

Saída **true** (tem imagem) → segue pro caminho de imagem (item 3b). Saída **false** (só texto) → segue pro node de texto que já existe (item 3a).

### 3a. Caminho SÓ TEXTO — node de IA (Google Gemini Chat Model / "Message a Model")

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

CONTEXTO DO NEGÓCIO (use isso pra avaliar relevância da mensagem e pra reescrever o texto alternativo na Tarefa 3)
A SIEG é uma software B2B de automação fiscal e contábil. Ela desenvolve ferramentas SaaS que automatizam processos manuais e repetitivos de escritórios de contabilidade e gestores fiscais, transformando a rotina burocrática do contador em trabalho estratégico e consultivo. Tagline: "Tornando você indispensável".

Público-alvo: o contador/escritório de contabilidade é o cliente principal (não o consumidor final). Público secundário: empresas que gerenciam suas próprias obrigações fiscais internamente.

Produtos principais:
- Docs Fiscais: captura automática de documentos fiscais eletrônicos (NF-e, CT-e, NFS-e etc.)
- Controle de Pendências: monitor automático de obrigações fiscais via e-CAC, com alertas antes dos vencimentos
- Emissão Fiscal: emissor de nota fiscal eletrônica 100% web
- Monitoramento IRPF: gestão contínua do Imposto de Renda Pessoa Física dos clientes do contador

Principais dores do público que a SIEG resolve (uma boa mensagem geralmente conecta com uma dessas):
1. Falta de tempo / sobrecarga operacional (muito trabalho manual, "apagar incêndio")
2. Risco de erros e multas (conformidade, prazos, insegurança)
3. Processos complexos e legislação que muda com frequência
4. Dificuldade de escalar a carteira de clientes sem contratar mais gente
5. Desejo de sair do operacional e virar um contador mais estratégico/consultivo

Ao avaliar o critério "Valor emocional" (Tarefa 2) e ao reescrever o texto (Tarefa 3), prefira mensagens que conectem com essas dores reais em vez de genéricas — isso conta a favor do texto. Evite: linguagem genérica de tecnologia que poderia ser de qualquer empresa, sem conexão com a rotina real do contador.

TOM DE VOZ DA SIEG (use isso no critério 4 da Tarefa 2 e na reescrita da Tarefa 3)
A marca é empática, estratégica, condutora, confiável, pragmática e otimista — formal o suficiente pra passar autoridade, mas acessível e amigável. Evite: formalidade excessiva, jargão sem explicação, tom robótico, sarcasmo ou negatividade (trate erros/problemas com foco em solução).

Tom por rede:
- Instagram: descontraído, amistoso, visualmente informativo
- TikTok: criativo, humorado, aproveita trends e o momento atual
- LinkedIn: autoridade profissional e educacional, tom mais sério e direto
- Blog: educacional, completo, sem pressa
- YouTube/Shorts: profissional, claro e dinâmico
- Facebook: conversacional, amistoso, inclusivo

Hashtags institucionais (use só se fizer sentido, não force): #SIEG #ContabilidadeEstratégica #GestãoContábil #ProfissionaisDaContabilidade #Contabilidade #SoluçãoContábil #Contadores #SoftwareContábil #SoluçõesEstratégicas

Emojis aprovados (use com moderação, só se combinar com o tom da rede): 😀😂😅😎😉💙💜 🫰👏🤞👀 ✅📊📈💡🔍📚💸🪙💰💲 👩🏽‍💻👨🏼‍💻💻🖱️⌨️

TAREFA 1 — Ortografia e gramática
Revise o texto em português (PT-BR) e liste todo erro de ortografia, acentuação ou gramática. Não aponte escolhas de estilo como erro (ex: gírias, coloquialismo intencional, quebra de linha).
Gere também "textoCorrigido": o texto original com APENAS essas correções aplicadas — mantenha a mesma mensagem, tom e estrutura, só sem os erros. Se não houver erro nenhum, "textoCorrigido" é idêntico ao texto original. Isso é diferente da Tarefa 3 (que reescreve o texto pra melhorar engajamento) — aqui é só a versão corrigida, sem otimizações.

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
Reescreva o texto mantendo a mensagem, mas otimizando os 4 critérios acima e seguindo o tom de voz da SIEG e o tom específico da rede escolhida (definidos no início deste prompt). Explique em "motivo" por que a versão nova tende a performar melhor.

Preferências do usuário sobre emojis e hashtags: são DUAS decisões INDEPENDENTES uma da outra. NUNCA use uma como pista pra decidir a outra — "hashtags: sim" não significa "emojis: sim", e vice-versa.
- Emojis — "Incluir emojis: sim": pode usar emojis da lista aprovada quando fizer sentido. "Incluir emojis: não": ZERO emojis no textoAlternativo, mesmo que hashtags estejam marcadas como "sim".
- Hashtags — "Incluir hashtags: sim": inclua 2-5 hashtags relevantes (institucionais quando fizer sentido) no final do texto. "Incluir hashtags: não": ZERO hashtags no textoAlternativo, mesmo que emojis estejam marcados como "sim".

Responda SEMPRE neste formato JSON exato:

{
  "ortografia": {
    "temErros": boolean,
    "erros": [{ "trecho": string, "sugestao": string, "tipo": "ortografia" | "gramatica" | "acentuacao" }],
    "textoCorrigido": string
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
Incluir emojis: {{ $json.body.incluirEmojis ? "sim" : "não" }}
Incluir hashtags: {{ $json.body.incluirHashtags ? "sim" : "não" }}
```

### 3b. Caminho COM IMAGEM

O site envia a imagem como uma **data URL base64** (`data:image/jpeg;base64,...`) no campo `imagem` do corpo da requisição. O node "Analyze Image" do Google Gemini não aceita esse formato direto — ele espera ou uma URL pública, ou um **binário** (campo `binary` do item, não `json`). Por isso, esse caminho tem duas etapas de preparação antes de chegar na IA:

**Node "Preparar imagem" (Code)** — separa o tipo da imagem (`image/jpeg`, `image/png` etc.) do conteúdo base64 puro, que é o que o próximo node espera:
```js
const item = $input.first().json;
const imagemDataUrl = item.body?.imagem || '';

const match = imagemDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
if (!match) {
  throw new Error('Campo "imagem" não veio no formato esperado (data URL base64).');
}

return [{ json: { ...item, imagemMime: match[1], imagemBase64: match[2] } }];
```

**Node "Convert to File"** (node nativo do n8n, não é da IA):
- Operation: `Move Base64 String to File` (o nome exato pode variar um pouco de versão pra versão do n8n, procure por algo que converta "Base64 String" → "File")
- Base64 Input Field / Source Property: `{{ $json.imagemBase64 }}` (ou selecione o campo `imagemBase64`, dependendo de como essa versão do node pede a entrada)
- Put Output File in Field: `data` (nome do campo binário — vamos usar esse nome no próximo node)
- Se o node pedir o Mime Type, use `{{ $json.imagemMime }}`

**Node "Analyze Image"** (o mesmo que você já tinha usado pro teste manual, na tela que você mandou o print):
- Credential to connect with: sua credencial do Gemini (a mesma dos outros nodes)
- Resource: `Image`
- Operation: `Analyze Image`
- Model: `models/gemma-4-26b-a4b-it` (o mesmo que já está funcionando no fluxo de texto)
- **Input Type: troque de `Image URL(s)` pra `Binary File(s)`** — esse é o ajuste principal em relação ao que você tinha testado manualmente. Quando você seleciona "Binary File(s)", aparece um campo pra indicar qual propriedade binária usar — coloque `data` (o mesmo nome definido no "Convert to File")
- Text Input: cole o prompt abaixo (é o mesmo prompt do fluxo de texto, adaptado pra imagem — ver detalhes logo depois do bloco)
- Simplify Output: `ON` (like already was in your test)

**Text Input do node "Analyze Image" (copiar e colar):**
```
Você é um revisor de conteúdo para redes sociais de uma empresa B2B de software fiscal (SIEG). Você recebe uma imagem que vai ser publicada (com ou sem legenda de texto) e a rede social de destino, e devolve APENAS um JSON válido (sem markdown, sem texto fora do JSON), no formato exato abaixo.

CONTEXTO DO NEGÓCIO (use isso pra avaliar relevância da imagem/legenda e pra criar ou reescrever a legenda na Tarefa 3)
A SIEG é uma software B2B de automação fiscal e contábil. Ela desenvolve ferramentas SaaS que automatizam processos manuais e repetitivos de escritórios de contabilidade e gestores fiscais, transformando a rotina burocrática do contador em trabalho estratégico e consultivo. Tagline: "Tornando você indispensável".

Público-alvo: o contador/escritório de contabilidade é o cliente principal (não o consumidor final). Público secundário: empresas que gerenciam suas próprias obrigações fiscais internamente.

Produtos principais:
- Docs Fiscais: captura automática de documentos fiscais eletrônicos (NF-e, CT-e, NFS-e etc.)
- Controle de Pendências: monitor automático de obrigações fiscais via e-CAC, com alertas antes dos vencimentos
- Emissão Fiscal: emissor de nota fiscal eletrônica 100% web
- Monitoramento IRPF: gestão contínua do Imposto de Renda Pessoa Física dos clientes do contador

Principais dores do público que a SIEG resolve (uma boa imagem/legenda geralmente conecta com uma dessas):
1. Falta de tempo / sobrecarga operacional (muito trabalho manual, "apagar incêndio")
2. Risco de erros e multas (conformidade, prazos, insegurança)
3. Processos complexos e legislação que muda com frequência
4. Dificuldade de escalar a carteira de clientes sem contratar mais gente
5. Desejo de sair do operacional e virar um contador mais estratégico/consultivo

TOM DE VOZ DA SIEG
A marca é empática, estratégica, condutora, confiável, pragmática e otimista — formal o suficiente pra passar autoridade, mas acessível e amigável. Evite: formalidade excessiva, jargão sem explicação, tom robótico, sarcasmo ou negatividade.

Tom por rede:
- Instagram: descontraído, amistoso, visualmente informativo
- TikTok: criativo, humorado, aproveita trends e o momento atual
- LinkedIn: autoridade profissional e educacional, tom mais sério e direto
- Blog: educacional, completo, sem pressa
- YouTube/Shorts: profissional, claro e dinâmico
- Facebook: conversacional, amistoso, inclusivo

Hashtags institucionais (use só se fizer sentido, não force): #SIEG #ContabilidadeEstratégica #GestãoContábil #ProfissionaisDaContabilidade #Contabilidade #SoluçãoContábil #Contadores #SoftwareContábil #SoluçõesEstratégicas

Emojis aprovados (use com moderação, só se combinar com o tom da rede): 😀😂😅😎😉💙💜 🫰👏🤞👀 ✅📊📈💡🔍📚💸🪙💰💲 👩🏽‍💻👨🏼‍💻💻🖱️⌨️

TAREFA 1 — Ortografia e gramática
Se houver legenda de texto fornecida (campo "Legenda" no final deste prompt, não vazio), revise-a em português (PT-BR) e liste erros de ortografia, acentuação ou gramática. Além disso, se a própria imagem tiver algum texto visível nela (ex: card, print de tela, texto sobreposto, placa), transcreva mentalmente esse texto e revise erros nele também, tratando como parte do mesmo conteúdo.
Gere também "textoCorrigido": a legenda original com só essas correções aplicadas (mesma mensagem, tom e estrutura, só sem os erros). Se NÃO houver legenda nenhuma e nenhum texto visível na imagem, devolva "temErros": false, "erros": [] e "textoCorrigido": "" (string vazia).

TAREFA 2 — Índice de engajamento (0-100)
Se houver legenda de texto fornecida (não vazia): calcule a nota com estes 4 critérios de TEXTO (25% cada) — os mesmos usados pra posts só de texto:
1. "Balanço de palavras" (CoSchedule Headline Analyzer): equilíbrio entre palavras Comuns, Incomuns, Emocionais e de Poder.
2. "Valor emocional" (EMV): % de palavras com apelo emocional — ideal 20-30%.
3. "Legibilidade" (Flesch adaptado): frases curtas e palavras simples pontuam mais alto.
4. "Formato pra rede escolhida": tamanho/estilo da legenda de acordo com o benchmark da rede (Instagram 125-150 caracteres, LinkedIn 1300-2000, TikTok <150, Facebook 40-80, YouTube primeiras linhas, Blog estrutura).

Se NÃO houver legenda (é uma imagem pura, sem texto associado): calcule a nota com estes 4 critérios VISUAIS (25% cada), avaliando a IMAGEM em si:
1. "Relevância pro público": a imagem conecta com a rotina, as dores ou os interesses do contador/escritório de contabilidade descritos acima?
2. "Apelo visual e emocional": a composição, cores e elementos da imagem despertam atenção, curiosidade, identificação ou alguma emoção positiva?
3. "Clareza da mensagem": só olhando a imagem (sem legenda), dá pra entender o ponto principal que ela quer comunicar?
4. "Adequação ao formato da rede": o enquadramento e estilo visual combinam com o que costuma performar bem na rede escolhida (ex: Instagram valoriza imagens quadradas/verticais e visualmente limpas; LinkedIn valoriza imagens mais institucionais/informativas).

Para cada critério, devolva a nota e um comentário curto explicando o porquê. No campo "resumo", explique em 1-2 frases o principal ponto de melhoria.

TAREFA 3 — Texto alternativo / legenda sugerida
Se houver legenda de texto fornecida (não vazia): reescreva-a mantendo a mensagem, mas otimizando os critérios da Tarefa 2 e seguindo o tom de voz da SIEG e o tom da rede escolhida. Explique em "motivo" por que a versão nova tende a performar melhor.
Se NÃO houver legenda: crie do zero uma sugestão de legenda pra acompanhar essa imagem, baseada no que a imagem mostra, conectando com o contexto do negócio e o público-alvo descritos acima, seguindo o tom de voz da SIEG e o tom específico da rede escolhida. Em "motivo", explique por que essa legenda combina bem com a imagem e tende a performar bem.

Preferências do usuário sobre emojis e hashtags (valem tanto pra reescrita quanto pra legenda nova): são DUAS decisões INDEPENDENTES uma da outra. NUNCA use uma como pista pra decidir a outra.
- Emojis — "sim": pode usar emojis da lista aprovada quando fizer sentido. "não": ZERO emojis, mesmo que hashtags estejam "sim".
- Hashtags — "sim": inclua 2-5 hashtags relevantes (institucionais quando fizer sentido) no final. "não": ZERO hashtags, mesmo que emojis estejam "sim".

Responda SEMPRE neste formato JSON exato:

{
  "ortografia": {
    "temErros": boolean,
    "erros": [{ "trecho": string, "sugestao": string, "tipo": "ortografia" | "gramatica" | "acentuacao" }],
    "textoCorrigido": string
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

DADOS DESTA ANÁLISE:
Rede social: {{ $('Preparar imagem').item.json.body.rede }}
Legenda fornecida pelo usuário (pode estar vazia — nesse caso, é uma imagem sem legenda): {{ $('Preparar imagem').item.json.body.texto || "(nenhuma legenda fornecida)" }}
Incluir emojis na sugestão: {{ $('Preparar imagem').item.json.body.incluirEmojis ? "sim" : "não" }}
Incluir hashtags na sugestão: {{ $('Preparar imagem').item.json.body.incluirHashtags ? "sim" : "não" }}
```

> Por que `$('Preparar imagem').item.json...` em vez de `$json...`: depois do node "Convert to File", o `$json` do item pode não ter mais o `body` original (alguns nodes de conversão de arquivo simplificam a saída, mantendo só o binário). Referenciar direto o node "Preparar imagem" pelo nome garante acesso aos dados originais do webhook, não importa o que os nodes no meio façam com o `json`. **Se você renomear o node "Preparar imagem", troque o nome dentro de `$('...')` também.**

### 4. Node "Code" (entre os dois caminhos e o "Respond to Webhook")
A IA às vezes devolve o JSON com markdown ao redor (` ```json `), dentro de um array `[...]`, ou — se algo no prompt confundir o modelo — com algum texto solto antes/depois do JSON. Esse node limpa tudo isso antes de responder.

O node "Message a Model" (caminho de texto) e o node "Analyze Image" (caminho de imagem) podem devolver formatos ligeiramente diferentes — por isso a extração de texto abaixo tenta alguns formatos conhecidos. **Se o parsing falhar** depois de ligar o caminho de imagem, rode o node manualmente, veja o JSON bruto que o "Analyze Image" devolveu e me mostre — eu ajusto a função `extrairTexto` pro formato real.

```js
const item = $input.first().json;

function extrairTexto(item) {
  // Formato do node "Message a Model" (Chat Model)
  if (item.content?.parts) {
    const parts = item.content.parts;
    const resposta = parts.find((p) => !p.thought) || parts[parts.length - 1];
    return resposta.text;
  }
  // Formatos comuns do node "Analyze Image" com Simplify Output = ON
  if (typeof item.text === 'string') return item.text;
  if (typeof item.content === 'string') return item.content;
  if (item.candidates?.[0]?.content?.parts) {
    return item.candidates[0].content.parts.map((p) => p.text).join('');
  }
  throw new Error('Formato de resposta da IA não reconhecido: ' + JSON.stringify(item).slice(0, 500));
}

let texto = extrairTexto(item).replace(/```json\s*|```/g, '').trim();

// extrai só o JSON, ignorando qualquer texto solto antes/depois que a IA às vezes adiciona
const inicio = texto.search(/[[{]/);
const fimChave = texto.lastIndexOf('}');
const fimColchete = texto.lastIndexOf(']');
const fim = Math.max(fimChave, fimColchete);
if (inicio !== -1 && fim !== -1) {
  texto = texto.slice(inicio, fim + 1);
}

let dados = JSON.parse(texto);

// se vier dentro de um array, pega o primeiro item
if (Array.isArray(dados)) dados = dados[0];

return [{ json: dados }];
```

### 5. Node "Respond to Webhook"
- Respond With: `JSON`
- Body: `{{ $json }}` (em modo expressão) — a saída já limpa do node Code
- Não esqueça de repetir o header `Access-Control-Allow-Origin` aqui também, se o n8n não herdar do node anterior (opcional, ver nota de arquitetura no topo do arquivo)

## Testando
Depois de montar, teste os três casos com `curl` antes de plugar no site:

```bash
# Só texto
curl -X POST https://SEU-N8N/webhook/sieg-social-check \
  -H "Content-Type: application/json" \
  -d '{"texto":"Nossa empresa preucupada em ajudar contadores","rede":"instagram","incluirEmojis":true,"incluirHashtags":true,"imagem":null}'

# Só imagem (troque o base64 por um de verdade, curto, pra testar)
curl -X POST https://SEU-N8N/webhook/sieg-social-check \
  -H "Content-Type: application/json" \
  -d '{"texto":"","rede":"instagram","incluirEmojis":true,"incluirHashtags":true,"imagem":"data:image/png;base64,SEU_BASE64_AQUI"}'
```

Se vier o JSON no formato esperado nos dois casos (e no caso combinado, texto + imagem), o fluxo tá pronto — não precisa mudar nada no site, ele já manda os três formatos de requisição.
