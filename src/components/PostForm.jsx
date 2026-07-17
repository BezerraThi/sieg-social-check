import { ArrowRight } from '@phosphor-icons/react'
import { REDES } from '../redes'
import { primaryButtonStyle } from '../App'

export default function PostForm({
  texto,
  setTexto,
  rede,
  setRede,
  incluirEmojis,
  setIncluirEmojis,
  incluirHashtags,
  setIncluirHashtags,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: 'white',
        borderRadius: 'var(--card-radius)',
        padding: 32,
      }}
    >
      <label style={{ display: 'block', textAlign: 'left', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--carvao)' }}>
        Rede social
      </label>
      <select
        value={rede}
        onChange={(e) => setRede(e.target.value)}
        style={{
          width: '100%',
          padding: '11px 14px',
          borderRadius: 12,
          border: '1px solid var(--cinza-claro)',
          fontSize: 15,
          marginBottom: 22,
          background: 'var(--off-white)',
          color: 'var(--carvao)',
        }}
      >
        {REDES.map((r) => (
          <option key={r.valor} value={r.valor}>
            {r.nome}
          </option>
        ))}
      </select>

      <label style={{ display: 'block', textAlign: 'left', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--carvao)' }}>
        Texto do post
      </label>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Cole aqui o texto que vai ser publicado..."
        rows={8}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 12,
          border: '1px solid var(--cinza-claro)',
          fontSize: 15,
          resize: 'vertical',
          marginBottom: 8,
          background: 'var(--off-white)',
          color: 'var(--carvao)',
        }}
      />
      <p style={{ textAlign: 'right', fontSize: 13, color: 'var(--cinza-medio)', marginBottom: 22 }}>
        {texto.length} caracteres
      </p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 22 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--carvao)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={incluirEmojis}
            onChange={(e) => setIncluirEmojis(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--azul)', cursor: 'pointer' }}
          />
          Incluir emojis
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--carvao)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={incluirHashtags}
            onChange={(e) => setIncluirHashtags(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--azul)', cursor: 'pointer' }}
          />
          Incluir hashtags
        </label>
      </div>

      <button type="submit" style={{ ...primaryButtonStyle, width: '100%' }} disabled={!texto.trim()}>
        Analisar texto
        <ArrowRight size={18} weight="bold" />
      </button>
    </form>
  )
}
