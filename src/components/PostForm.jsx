import { useState } from 'react'
import { REDES } from '../redes'
import { primaryButtonStyle } from '../App'

export default function PostForm({ onSubmit }) {
  const [texto, setTexto] = useState('')
  const [rede, setRede] = useState(REDES[0].valor)

  function handleSubmit(e) {
    e.preventDefault()
    const textoLimpo = texto.trim()
    if (!textoLimpo) return
    onSubmit({ texto: textoLimpo, rede })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'white',
        borderRadius: 'var(--card-radius)',
        padding: 28,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <label style={{ display: 'block', textAlign: 'left', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        Rede social
      </label>
      <select
        value={rede}
        onChange={(e) => setRede(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid var(--cinza-claro)',
          fontSize: 15,
          marginBottom: 20,
          background: 'white',
        }}
      >
        {REDES.map((r) => (
          <option key={r.valor} value={r.valor}>
            {r.nome}
          </option>
        ))}
      </select>

      <label style={{ display: 'block', textAlign: 'left', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        Texto do post
      </label>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Cole aqui o texto que vai ser publicado..."
        rows={8}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 10,
          border: '1px solid var(--cinza-claro)',
          fontSize: 15,
          resize: 'vertical',
          marginBottom: 8,
        }}
      />
      <p style={{ textAlign: 'right', fontSize: 13, color: 'var(--cinza-medio)', marginBottom: 20 }}>
        {texto.length} caracteres
      </p>

      <button type="submit" style={{ ...primaryButtonStyle, width: '100%' }} disabled={!texto.trim()}>
        Analisar texto
      </button>
    </form>
  )
}
