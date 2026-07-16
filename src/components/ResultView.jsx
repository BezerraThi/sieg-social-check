import { useState } from 'react'
import { primaryButtonStyle, secondaryButtonStyle } from '../App'

const CLASSIFICACAO_COR = {
  Baixo: 'var(--erro)',
  Médio: 'var(--alerta)',
  Bom: 'var(--azul)',
  Ótimo: 'var(--ok)',
}

const cardStyle = {
  background: 'white',
  borderRadius: 'var(--card-radius)',
  padding: 24,
  boxShadow: 'var(--shadow-soft)',
  marginBottom: 20,
  textAlign: 'left',
}

export default function ResultView({ resultado, onNovaAnalise }) {
  const { ortografia, engajamento, textoAlternativo } = resultado
  const corNota = CLASSIFICACAO_COR[engajamento.classificacao] || 'var(--azul)'

  return (
    <div>
      <SecaoOrtografia ortografia={ortografia} />
      <SecaoEngajamento engajamento={engajamento} cor={corNota} />
      <SecaoTextoAlternativo textoAlternativo={textoAlternativo} />

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button type="button" style={secondaryButtonStyle} onClick={onNovaAnalise}>
          Analisar outro texto
        </button>
      </div>
    </div>
  )
}

function SecaoOrtografia({ ortografia }) {
  const semErros = !ortografia.temErros || ortografia.erros.length === 0

  return (
    <section style={cardStyle}>
      <h3 style={{ fontSize: 18, marginBottom: 12 }}>Ortografia e gramática</h3>
      {semErros ? (
        <p style={{ color: 'var(--ok)', fontWeight: 600 }}>Nenhum erro encontrado.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ortografia.erros.map((erro, i) => (
            <li key={i} style={{ fontSize: 14 }}>
              <span style={{ textDecoration: 'line-through', color: 'var(--erro)' }}>{erro.trecho}</span>
              {' → '}
              <span style={{ color: 'var(--ok)', fontWeight: 600 }}>{erro.sugestao}</span>
              <span style={{ color: 'var(--cinza-medio)' }}> ({erro.tipo})</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SecaoEngajamento({ engajamento, cor }) {
  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: `4px solid ${cor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {engajamento.nota}
        </div>
        <div>
          <h3 style={{ fontSize: 18 }}>Índice de engajamento</h3>
          <p style={{ color: cor, fontWeight: 600, fontSize: 14 }}>{engajamento.classificacao}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {engajamento.criterios.map((c, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{c.nome}</span>
              <span style={{ color: 'var(--cinza-medio)' }}>{c.nota}/100</span>
            </div>
            <div style={{ background: 'var(--off-white)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${c.nota}%`,
                  height: '100%',
                  background: 'var(--azul-medio)',
                  borderRadius: 999,
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: 'var(--cinza-medio)', marginTop: 4 }}>{c.comentario}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 14, background: 'var(--off-white)', borderRadius: 10, padding: 12 }}>
        {engajamento.resumo}
      </p>
    </section>
  )
}

function SecaoTextoAlternativo({ textoAlternativo }) {
  const [copiado, setCopiado] = useState(false)

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(textoAlternativo.sugestao)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // clipboard indisponível — usuário pode selecionar o texto manualmente
    }
  }

  return (
    <section style={cardStyle}>
      <h3 style={{ fontSize: 18, marginBottom: 12 }}>Sugestão de texto alternativo</h3>
      <p style={{ fontSize: 15, whiteSpace: 'pre-wrap', background: 'var(--off-white)', borderRadius: 10, padding: 14 }}>
        {textoAlternativo.sugestao}
      </p>
      <p style={{ fontSize: 13, color: 'var(--cinza-medio)', marginTop: 10 }}>{textoAlternativo.motivo}</p>
      <button type="button" style={{ ...primaryButtonStyle, marginTop: 14 }} onClick={handleCopiar}>
        {copiado ? 'Copiado!' : 'Copiar texto'}
      </button>
    </section>
  )
}
