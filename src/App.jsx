import { useState } from 'react'
import { analisarTexto, AnaliseError } from './api'
import PostForm from './components/PostForm'
import ResultView from './components/ResultView'

function App() {
  const [status, setStatus] = useState('form') // form | carregando | resultado | erro
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [ultimoEnvio, setUltimoEnvio] = useState(null)

  async function handleSubmit({ texto, rede }) {
    setStatus('carregando')
    setErro('')
    setUltimoEnvio({ texto, rede })
    try {
      const dados = await analisarTexto({ texto, rede })
      setResultado(dados)
      setStatus('resultado')
    } catch (err) {
      setErro(err instanceof AnaliseError ? err.message : 'Algo deu errado. Tente novamente.')
      setStatus('erro')
    }
  }

  function handleTentarNovamente() {
    if (ultimoEnvio) handleSubmit(ultimoEnvio)
  }

  function handleNovaAnalise() {
    setResultado(null)
    setErro('')
    setStatus('form')
  }

  return (
    <>
      <header style={{ marginBottom: 32, textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: 999,
            background: 'var(--azul)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          SIEG · Social Check
        </span>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Revisor de posts</h1>
        <p style={{ color: 'var(--cinza-medio)', fontSize: 15 }}>
          Cole o texto do post antes de publicar: a IA revisa ortografia, estima o engajamento e sugere uma versão alternativa.
        </p>
      </header>

      {status === 'form' && <PostForm onSubmit={handleSubmit} />}

      {status === 'carregando' && (
        <div style={cardStyle}>
          <p style={{ fontWeight: 600 }}>Analisando o texto...</p>
          <p style={{ color: 'var(--cinza-medio)', fontSize: 14, marginTop: 8 }}>
            Isso pode levar alguns segundos.
          </p>
        </div>
      )}

      {status === 'erro' && (
        <div style={{ ...cardStyle, borderLeft: '4px solid var(--erro)' }}>
          <p style={{ fontWeight: 600, color: 'var(--erro)' }}>Não foi possível analisar o texto</p>
          <p style={{ color: 'var(--cinza-medio)', fontSize: 14, marginTop: 8 }}>{erro}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="button" style={primaryButtonStyle} onClick={handleTentarNovamente}>
              Tentar de novo
            </button>
            <button type="button" style={secondaryButtonStyle} onClick={handleNovaAnalise}>
              Editar texto
            </button>
          </div>
        </div>
      )}

      {status === 'resultado' && resultado && (
        <ResultView resultado={resultado} onNovaAnalise={handleNovaAnalise} />
      )}
    </>
  )
}

const cardStyle = {
  background: 'white',
  borderRadius: 'var(--card-radius)',
  padding: 28,
  boxShadow: 'var(--shadow-soft)',
  textAlign: 'center',
}

export const primaryButtonStyle = {
  background: 'var(--azul)',
  color: 'white',
  border: 'none',
  borderRadius: 999,
  padding: '12px 24px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}

export const secondaryButtonStyle = {
  background: 'transparent',
  color: 'var(--carvao)',
  border: '1px solid var(--cinza-claro)',
  borderRadius: 999,
  padding: '12px 24px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}

export default App
