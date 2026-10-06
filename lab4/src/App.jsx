import { useState } from 'react'
import './App.css'
import { cifrar, descifrar, hashear } from './crypto.js'

export default function App() {
  const [textoPlano, setTextoPlano] = useState('')
  const [textoCifrado, setTextoCifrado] = useState('')
  const [textoOriginal, setTextoOriginal] = useState('')
  const [hash, setHash] = useState('')
  const [error, setError] = useState('')

  const hayTexto = textoPlano.trim().length > 0

  function handleCifrar(evento) {
    evento.preventDefault()
    if (!hayTexto) return

    setTextoCifrado(cifrar(textoPlano))
    setHash(hashear(textoPlano))
    setTextoOriginal('')
    setError('')
  }

  function handleDescifrar() {
    const resultado = descifrar(textoCifrado)

    // AES no falla con una llave equivocada: devuelve bytes que no son UTF-8
    // válido y toString() entrega una cadena vacía.
    if (!resultado) {
      setTextoOriginal('')
      setError('No se pudo descifrar: el texto o la llave no son válidos.')
      return
    }

    setTextoOriginal(resultado)
    setError('')
  }

  function handleLimpiar() {
    setTextoPlano('')
    setTextoCifrado('')
    setTextoOriginal('')
    setHash('')
    setError('')
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Cipher &amp; Decipher</h1>
        <p className="meta">Lab 4 &middot; AES-256 con crypto-js</p>
      </header>

      <form className="card" onSubmit={handleCifrar}>
        <label className="field">
          <span className="field-label">Texto plano</span>
          <textarea
            value={textoPlano}
            onChange={(evento) => setTextoPlano(evento.target.value)}
            placeholder="Escribe aquí el mensaje que quieres cifrar…"
            rows={4}
            autoFocus
          />
        </label>

        <div className="actions">
          <button type="submit" className="btn-primary" disabled={!hayTexto}>
            Cifrar
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleDescifrar}
            disabled={!textoCifrado}
          >
            Descifrar
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleLimpiar}
            disabled={!hayTexto && !textoCifrado}
          >
            Limpiar
          </button>
        </div>
      </form>

      <section className="resultados" aria-live="polite">
        <article className="resultado">
          <h2>Texto cifrado</h2>
          <p className="salida mono">
            {textoCifrado || <span className="vacio">Aún no hay nada cifrado.</span>}
          </p>
        </article>

        <article className="resultado">
          <h2>Texto original</h2>
          <p className="salida">
            {textoOriginal || <span className="vacio">Aún no hay nada descifrado.</span>}
          </p>
        </article>

        <article className="resultado">
          <h2>
            Hash SHA-512 <span className="badge">unidireccional</span>
          </h2>
          <p className="salida mono">
            {hash || <span className="vacio">Se genera al cifrar.</span>}
          </p>
        </article>
      </section>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  )
}
