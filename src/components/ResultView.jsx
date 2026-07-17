import { useState } from 'react'
import { CheckCircle, WarningCircle, Copy, Check, TextAa, Heart, Eye, DeviceMobile, ChartBar, Image as ImageIcon } from '@phosphor-icons/react'
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

export default function ResultView({ resultado, textoOriginalVazio, imagemEnviada, onNovaAnalise }) {
  const { ortografia, engajamento, textoAlternativo, analiseImagem } = resultado
  const corNota = ESCALA_CLASSIFICACAO[engajamento.classificacao] || 'var(--azul)'

  return (
    <div>
      {imagemEnviada && <SecaoImagemAnalisada imagem={imagemEnviada} analiseImagem={analiseImagem} />}
      <SecaoOrtografia ortografia={ortografia} rotulo={imagemEnviada ? 'Ortografia e gramática do texto do post' : 'Ortografia e gramática'} />
      <SecaoEngajamento engajamento={engajamento} cor={corNota} />
      <SecaoTextoAlternativo textoAlternativo={textoAlternativo} ehLegendaNova={textoOriginalVazio} imagemEnviada={!!imagemEnviada} />

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button type="button" style={secondaryButtonStyle} onClick={onNovaAnalise}>
          Analisar outro texto
        </button>
      </div>
    </div>
  )
}

function SecaoImagemAnalisada({ imagem, analiseImagem }) {
  const ortografiaImagem = analiseImagem?.ortografia
  const temErrosNaImagem = ortografiaImagem?.temErros && ortografiaImagem.erros?.length > 0

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <ImageIcon size={22} weight="fill" color="var(--azul)" />
        <h3 style={{ fontSize: 17 }}>Imagem analisada</h3>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: ortografiaImagem ? 20 : 0 }}>
        <img
          src={imagem}
          alt="Imagem enviada para análise"
          style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--cinza-claro)', flexShrink: 0 }}
        />
        <p style={{ fontSize: 14, color: 'var(--carvao)', margin: 0 }}>
          {analiseImagem?.resumo || 'A IA levou o conteúdo dessa imagem em conta na análise de engajamento e na sugestão acima.'}
        </p>
      </div>

      {ortografiaImagem && (
        <div style={{ borderTop: '1px solid var(--cinza-claro)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: temErrosNaImagem ? 12 : 4 }}>
            {temErrosNaImagem ? (
              <WarningCircle size={19} weight="fill" color="var(--erro)" />
            ) : (
              <CheckCircle size={19} weight="fill" color="var(--azul)" />
            )}
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--carvao)' }}>Ortografia do texto na imagem</h4>
          </div>

          {temErrosNaImagem ? (
            <>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: ortografiaImagem.sugestaoTexto ? 16 : 0 }}>
                {ortografiaImagem.erros.map((erro, i) => (
                  <li key={i} style={{ fontSize: 14, background: 'var(--off-white)', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ textDecoration: 'line-through', color: 'var(--erro)', fontWeight: 600 }}>{erro.trecho}</span>
                    {' → '}
                    <span style={{ color: 'var(--carvao)', fontWeight: 700 }}>{erro.sugestao}</span>
                    <span style={{ color: 'var(--cinza-medio)' }}> ({erro.tipo})</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 12.5, color: 'var(--cinza-medio)', marginBottom: ortografiaImagem.sugestaoTexto ? 12 : 0 }}>
                Esses erros estão na própria arte — corrija direto no arquivo de design, não dá pra editar por aqui.
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--cinza-medio)', fontSize: 14, marginLeft: 29 }}>Nenhum erro encontrado no texto da imagem.</p>
          )}

          {ortografiaImagem.sugestaoTexto && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--carvao)' }}>Sugestão de texto para a imagem</p>
              <p style={{ fontSize: 14, whiteSpace: 'pre-wrap', background: 'var(--off-white)', borderRadius: 12, padding: 14, color: 'var(--carvao)' }}>
                {ortografiaImagem.sugestaoTexto}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function SecaoOrtografia({ ortografia, rotulo }) {
  const semErros = !ortografia.temErros || ortografia.erros.length === 0

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: semErros ? 4 : 16 }}>
        {semErros ? (
          <CheckCircle size={22} weight="fill" color="var(--azul)" />
        ) : (
          <WarningCircle size={22} weight="fill" color="var(--erro)" />
        )}
        <h3 style={{ fontSize: 17 }}>{rotulo}</h3>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

function rotuloTextoAlternativo(ehLegendaNova, imagemEnviada) {
  if (ehLegendaNova) return 'Sugestão de legenda para a imagem'
  if (imagemEnviada) return 'Sugestão de legenda para o post'
  return 'Sugestão de texto alternativo'
}

function SecaoTextoAlternativo({ textoAlternativo, ehLegendaNova, imagemEnviada }) {
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
      <h3 style={{ fontSize: 17, marginBottom: 4 }}>{rotuloTextoAlternativo(ehLegendaNova, imagemEnviada)}</h3>
      {imagemEnviada && !ehLegendaNova && (
        <p style={{ fontSize: 12.5, color: 'var(--cinza-medio)', marginBottom: 10 }}>
          Isso é sobre o texto do post (a legenda) — não altera a imagem em si.
        </p>
      )}
      <p style={{ fontSize: 15, whiteSpace: 'pre-wrap', background: 'var(--off-white)', borderRadius: 12, padding: 16, color: 'var(--carvao)', marginTop: imagemEnviada && !ehLegendaNova ? 0 : 10 }}>
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
