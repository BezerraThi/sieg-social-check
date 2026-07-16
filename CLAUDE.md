# SIEG Social Check

## O que é
Ferramenta interna (React) onde o time de social media cola o texto de um post, escolhe a rede social, e recebe da IA (via webhook n8n): erros ortográficos, um índice de engajamento (0-100) baseado em frameworks reais de mercado, e uma sugestão de texto alternativo.

## Tipo
Interno

## Escopo
- Frontend React (Vite) — formulário de texto + seletor de rede social + tela de resultado
- Integração com webhook n8n que roda a análise via IA e devolve JSON estruturado
- Índice de engajamento calculado combinando: CoSchedule Headline Analyzer (balanço de palavras), Emotional Marketing Value, legibilidade Flesch-Kincaid adaptada ao português, benchmarks de tamanho/hashtags por rede
- Redes suportadas: Instagram, LinkedIn, TikTok, Facebook, YouTube/Shorts, Blog

## Contexto
- Motivo do projeto: um post saiu com erro de ortografia — objetivo é ter uma checagem antes de publicar
- Sem prazo definido
- IA de análise roda fora do frontend, num workflow n8n (o Thiago já usa n8n)

## Arquivos importantes
- `webhook-contrato.md` — especificação do request/response esperado do webhook n8n
- (será preenchido conforme o projeto avança)

## Regras específicas
- Não commitar a URL real do webhook n8n em texto puro no repo — usar variável de ambiente (`.env`, ignorado no git)
