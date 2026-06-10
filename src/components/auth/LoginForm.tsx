import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface LoginFormProps {
  onSwitch: () => void
}

export function LoginForm({ onSwitch }: LoginFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label className="form-label">E-mail</label>
        <input
          id="login-email"
          type="email"
          className="form-input"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label className="form-label">Senha</label>
        <input
          id="login-password"
          type="password"
          className="form-input"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(233, 69, 96, 0.1)',
          border: '1px solid rgba(233, 69, 96, 0.3)',
          borderRadius: '8px',
          color: 'var(--color-accent-secondary)',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      <button
        id="login-submit"
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={loading}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : null}
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Não tem conta?{' '}
        <button
          type="button"
          onClick={onSwitch}
          style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', cursor: 'pointer', fontWeight: 600 }}
        >
          Cadastre-se
        </button>
      </p>
    </form>
  )
}
