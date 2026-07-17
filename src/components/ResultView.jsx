import { useState } from 'react'
import { CheckCircle, WarningCircle, Copy, Check, TextAa, Heart, Eye, DeviceMobile, ChartBar } from '@phosphor-icons/react'
import { secondaryButtonStyle } from '../App'

const ESCALA_CLASSIFICACAO = {
  Baixo: 'var(--tier-baixo)',
  Médio: 'var(--tier-medio)',
  Bom: 'var(--tier-bom)',
  Ótimo: 'var(--tier-otimo)',
}

function corPorNota(nota) {
  if (nota < 40) return 'var(--tier-baixo)'
  if (nota < 70) return 'var(--tier-medio)'
  if (nota < 90) return 'var(--tier-bom)'
  return 'var(--tier-otimo)'
}

function iconePorCriterio(nome) {
  const n = nome.toLowerCase()
  if (n.includes('emocional')) return Heart
  if (n.includes('legibilidade')) return Eye
  if (n.includes('formato') || n.includes('rede')) return DeviceMobile
  if (n.includes('palavra') || n.includes('balan')) return TextAa
  return ChartBar
}

const cardStyle = {
  background: 'white',
  borderRadius: 'var(--card-radius)',
  padding: 28,
  marginBottom: 20,
  textAlign: 'left',
}

export default function ResultView({ resultado, textoOriginalVazio, onNovaAnalise }) {
  const { ortografia, engajamento, textoAlternativo } = resultado
  const corNota = ESCALA_CLASSIFICACAO[engajamento.classificacao] || 'var(--azul)'

  return (
    <div>
      <SecaoOrtografia ortografia={ortografia} />
      <SecaoEngajamento engajamento={engajamento} cor={corNota} />
      <SecaoTextoAlternativo textoAlternativo={textoAlternativo} ehLegendaNova={textoOriginalVazio} />

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: semErros ? 4 : 16 }}>
        {semErros ? (
          <CheckCircle size={22} weight="fill" color="var(--azul)" />
        ) : (
          <WarningCircle size={22} weight="fill" color="var(--erro)" />
        )}
        <h3 style={{ fontSize: 17 }}>Ortografia e gramática</h3>
      </div>

      {semErros ? (
        <p style={{ color: 'var(--cinza-medio)', fontSize: 14, marginLeft: 32 }}>Nenhum erro encontrado.</p>
      ) : (
        <>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: ortografia.textoCorrigido ? 20 : 0 }}>
            {ortografia.erros.map((erro, i) => (
              <li key={i} style={{ fontSize: 14, background: 'var(--off-white)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--erro)', fontWeight: 600 }}>{erro.trecho}</span>
                {' → '}
                <span style={{ color: 'var(--carvao)', fontWeight: 700 }}>{erro.sugestao}</span>
                <span style={{ color: 'var(--cinza-medio)' }}> ({erro.tipo})</span>
              </li>
            ))}
          </ul>

          {ortografia.textoCorrigido && <TextoCorrigido texto={ortografia.textoCorrigido} />}
        </>
      )}
    </section>
  )
}

function TextoCorrigido({ texto }) {
  const [copiado, setCopiado] = useState(false)

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // clipboard indisponível — usuário pode selecionar o texto manualmente
    }
  }

  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--carvao)' }}>Seu texto já corrigido</p>
      <p style={{ fontSize: 15, whiteSpace: 'pre-wrap', background: 'var(--off-white)', borderRadius: 12, padding: 16, color: 'var(--carvao)' }}>
        {texto}
      </p>
      <button
        type="button"
        onClick={handleCopiar}
        style={{
          background: 'var(--carvao)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--pill-radius)',
          padding: '11px 22px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {copiado ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
        {copiado ? 'Copiado!' : 'Copiar texto corrigido'}
      </button>
    </div>
  )
}

function SecaoEngajamento({ engajamento, cor }) {
  return (
    <>
      <section
        style={{
          background: 'var(--azul)',
          borderRadius: 'var(--card-radius)',
          padding: 28,
          marginBottom: 12,
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span style={{ fontFamily: 'Figtree', fontWeight: 900, fontSize: 56, lineHeight: 1 }}>
            {engajamento.nota}
          </span>
          <div>
            <p style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Índice de engajamento
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 'var(--pill-radius)',
                background: cor,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {engajamento.classificacao}
            </span>
          </div>
        </div>

        <p style={{ fontSize: 14, background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: 14, marginTop: 20 }}>
          {engajamento.resumo}
        </p>
      </section>

      <section style={cardStyle}>
        <h3 style={{ fontSize: 15, marginBottom: 18, color: 'var(--cinza-medio)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Critérios avaliados
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {engajamento.criterios.map((c, i) => {
            const corCriterio = corPorNota(c.nota)
            const Icone = iconePorCriterio(c.nome)
            return (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: `color-mix(in srgb, ${corCriterio} 16%, white)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icone size={19} weight="bold" color={corCriterio} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{c.nome}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: corCriterio,
                        background: `color-mix(in srgb, ${corCriterio} 14%, white)`,
                        padding: '2px 10px',
                        borderRadius: 'var(--pill-radius)',
                      }}
                    >
                      {c.nota}/100
                    </span>
                  </div>
                  <div style={{ background: 'var(--off-white)', borderRadius: 'var(--pill-radius)', height: 7, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${c.nota}%`,
                        height: '100%',
                        background: corCriterio,
                        borderRadius: 'var(--pill-radius)',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--cinza-medio)', marginTop: 6 }}>{c.comentario}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

function SecaoTextoAlternativo({ textoAlternativo, ehLegendaNova }) {
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
      <h3 style={{ fontSize: 17, marginBottom: 14 }}>
        {ehLegendaNova ? 'Sugestão de legenda para a imagem' : 'Sugestão de texto alternativo'}
      </h3>
      <p style={{ fontSize: 15, whiteSpace: 'pre-wrap', background: 'var(--off-white)', borderRadius: 12, padding: 16, color: 'var(--carvao)' }}>
        {textoAlternativo.sugestao}
      </p>
      <p style={{ fontSize: 13, color: 'var(--cinza-medio)', marginTop: 10 }}>{textoAlternativo.motivo}</p>
      <button
        type="button"
        onClick={handleCopiar}
        style={{
          background: 'var(--azul)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--pill-radius)',
          padding: '13px 26px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {copiado ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
        {copiado ? 'Copiado!' : 'Copiar texto'}
      </button>
    </section>
  )
}
