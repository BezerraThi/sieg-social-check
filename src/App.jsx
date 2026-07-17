import { useState } from 'react'
import { WarningCircle, CircleNotch } from '@phosphor-icons/react'
import { analisarTexto, AnaliseError } from './api'
import { REDES } from './redes'
import PostForm from './components/PostForm'
import ResultView from './components/ResultView'

function App() {
  const [status, setStatus] = useState('form') // form | carregando | resultado | erro
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')

  // Estado do formulário mora aqui (não dentro do PostForm) pra sobreviver
  // quando a tela muda pra "carregando"/"erro" e volta — o texto não se perde.
  const [texto, setTexto] = useState('')
  const [rede, setRede] = useState(REDES[0].valor)
  const [incluirEmojis, setIncluirEmojis] = useState(true)
  const [incluirHashtags, setIncluirHashtags] = useState(true)
  const [imagem, setImagem] = useState(null) // data URL (base64) da imagem escolhida, ou null
  const [erroImagem, setErroImagem] = useState('')

  async function handleSubmit(e) {
    e?.preventDefault()
    const textoLimpo = texto.trim()
    if (!textoLimpo && !imagem) return

    setStatus('carregando')
    setErro('')
    try {
      const dados = await analisarTexto({ texto: textoLimpo, rede, incluirEmojis, incluirHashtags, imagem })
      setResultado(dados)
      setStatus('resultado')
    } catch (err) {
      setErro(err instanceof AnaliseError ? err.message : 'Algo deu errado. Tente novamente.')
      setStatus('erro')
    }
  }

  // Botão "Editar texto" (tela de erro) — mantém o texto pra corrigir e tentar de novo.
  function handleEditarTexto() {
    setErro('')
    setStatus('form')
  }

  // Botão "Analisar outro texto" (tela de resultado) — começa do zero, de propósito.
  function handleNovaAnalise() {
    setResultado(null)
    setTexto('')
    setImagem(null)
    setErroImagem('')
    setStatus('form')
  }

  return (
    <>
      <div className="decor-circulo" />
      <span className="marca-agua">SIEG</span>

      <header style={{ marginBottom: 40, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '7px 18px',
            borderRadius: 'var(--pill-radius)',
            background: 'var(--azul)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          <strong style={{ fontWeight: 900 }}>SIEG</strong> · Social Check
        </span>
        <h1 style={{ fontSize: 34, marginBottom: 10 }}>Revisor de posts</h1>
        <p style={{ color: 'var(--cinza-medio)', fontSize: 15, maxWidth: 420, margin: '0 auto' }}>
          Envie o texto, a imagem do post, ou os dois: a IA revisa ortografia, estima o engajamento e sugere uma versão alternativa.
        </p>
      </header>

      <main style={{ position: 'relative', zIndex: 1 }}>
        {status === 'form' && (
          <PostForm
            texto={texto}
            setTexto={setTexto}
            rede={rede}
            setRede={setRede}
            incluirEmojis={incluirEmojis}
            setIncluirEmojis={setIncluirEmojis}
            incluirHashtags={incluirHashtags}
            setIncluirHashtags={setIncluirHashtags}
            imagem={imagem}
            setImagem={setImagem}
            erroImagem={erroImagem}
            setErroImagem={setErroImagem}
            onSubmit={handleSubmit}
          />
        )}

        {status === 'carregando' && (
          <div style={cardStyle}>
            <CircleNotch size={36} weight="bold" color="var(--azul)" className="spinner" style={{ marginBottom: 16 }} />
            <p style={{ fontWeight: 700 }}>Analisando seu texto e gerando seu índice de engajamento...</p>
            <p style={{ color: 'var(--cinza-medio)', fontSize: 14, marginTop: 8 }}>
              Isso pode levar alguns segundos.
            </p>
          </div>
        )}

        {status === 'erro' && (
          <div style={cardStyle}>
            <WarningCircle size={32} color="var(--erro)" weight="regular" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 700 }}>Não foi possível analisar o texto</p>
            <p style={{ color: 'var(--cinza-medio)', fontSize: 14, marginTop: 8 }}>Erro: {erro}</p>
            <p style={{ color: 'var(--cinza-medio)', fontSize: 13, marginTop: 12, background: 'var(--off-white)', borderRadius: 10, padding: '10px 14px' }}>
              Se o erro continuar acontecendo, chame o suporte e informe a mensagem acima.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
              <button type="button" style={primaryButtonStyle} onClick={handleSubmit}>
                Tentar de novo
              </button>
              <button type="button" style={secondaryButtonStyle} onClick={handleEditarTexto}>
                Editar texto
              </button>
            </div>
          </div>
        )}

        {status === 'resultado' && resultado && (
          <ResultView resultado={resultado} textoOriginalVazio={!texto.trim()} onNovaAnalise={handleNovaAnalise} />
        )}
      </main>

      <footer
        style={{
          marginTop: 56,
          paddingTop: 20,
          borderTop: '1px solid var(--cinza-claro)',
          fontSize: 12,
          color: 'var(--cinza-medio)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span>SIEG · Institucional</span>
      </footer>
    </>
  )
}

const cardStyle = {
  background: 'white',
  borderRadius: 'var(--card-radius)',
  padding: 32,
  textAlign: 'center',
}

export const primaryButtonStyle = {
  background: 'var(--azul)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--pill-radius)',
  padding: '13px 26px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

export const secondaryButtonStyle = {
  background: 'transparent',
  color: 'var(--carvao)',
  border: '1px solid var(--cinza-claro)',
  borderRadius: 'var(--pill-radius)',
  padding: '13px 26px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}

export default App
