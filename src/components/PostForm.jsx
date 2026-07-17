import { ArrowRight, Image, X } from '@phosphor-icons/react'
import { REDES } from '../redes'
import { primaryButtonStyle } from '../App'

// 3MB de arquivo original vira ~4MB em base64 — a Vercel limita o corpo da requisição a ~4.5MB
const TAMANHO_MAX_IMAGEM = 3 * 1024 * 1024

export default function PostForm({
  texto,
  setTexto,
  rede,
  setRede,
  incluirEmojis,
  setIncluirEmojis,
  incluirHashtags,
  setIncluirHashtags,
  imagem,
  setImagem,
  erroImagem,
  setErroImagem,
  onSubmit,
}) {
  function handleSelecionarImagem(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = '' // permite selecionar o mesmo arquivo de novo depois de remover
    if (!arquivo) return

    if (!arquivo.type.startsWith('image/')) {
      setErroImagem('Escolha um arquivo de imagem.')
      return
    }
    if (arquivo.size > TAMANHO_MAX_IMAGEM) {
      setErroImagem('Imagem muito grande. Escolha uma de até 4MB.')
      return
    }

    setErroImagem('')
    const leitor = new FileReader()
    leitor.onload = () => setImagem(leitor.result)
    leitor.readAsDataURL(arquivo)
  }

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

      <label style={{ display: 'block', textAlign: 'left', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--carvao)' }}>
        Imagem do post <span style={{ fontWeight: 400, color: 'var(--cinza-medio)' }}>(opcional)</span>
      </label>

      {imagem ? (
        <div style={{ position: 'relative', marginBottom: 8, display: 'inline-block' }}>
          <img
            src={imagem}
            alt="Prévia da imagem selecionada"
            style={{ maxHeight: 160, borderRadius: 12, display: 'block', border: '1px solid var(--cinza-claro)' }}
          />
          <button
            type="button"
            onClick={() => setImagem(null)}
            aria-label="Remover imagem"
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--carvao)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      ) : (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px dashed var(--cinza-claro)',
            fontSize: 14,
            color: 'var(--cinza-medio)',
            cursor: 'pointer',
            background: 'var(--off-white)',
          }}
        >
          <Image size={20} />
          Escolher imagem
          <input type="file" accept="image/*" onChange={handleSelecionarImagem} style={{ display: 'none' }} />
        </label>
      )}
      {erroImagem && <p style={{ color: 'var(--erro)', fontSize: 13, marginTop: 6 }}>{erroImagem}</p>}
      <p style={{ fontSize: 13, color: 'var(--cinza-medio)', marginTop: 6, marginBottom: 22 }}>
        Envie o texto, a imagem, ou os dois juntos.
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

      <button type="submit" style={{ ...primaryButtonStyle, width: '100%' }} disabled={!texto.trim() && !imagem}>
        Analisar
        <ArrowRight size={18} weight="bold" />
      </button>
    </form>
  )
}
