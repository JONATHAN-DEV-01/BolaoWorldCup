import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface RegisterFormProps {
  onSwitch: () => void
}

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await signUp(email, password, username)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-primary)', marginBottom: '0.5rem' }}>
          Conta criada!
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Verifique seu e-mail para confirmar o cadastro e depois faça login.
        </p>
        <button className="btn btn-ghost" onClick={onSwitch}>Ir para Login</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      <div>
        <label className="form-label">Username</label>
        <input
          id="register-username"
          type="text"
          className="form-input"
          placeholder="seu_username"
          value={username}
          onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
          required
          autoComplete="username"
        />
      </div>
      <div>
        <label className="form-label">E-mail</label>
        <input
          id="register-email"
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
          id="register-password"
          type="password"
          className="form-input"
          placeholder="mín. 6 caracteres"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="form-label">Confirmar Senha</label>
        <input
          id="register-confirm"
          type="password"
          className="form-input"
          placeholder="repita a senha"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
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
        id="register-submit"
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={loading}
        style={{ width: '100%', marginTop: '0.25rem' }}
      >
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Já tem conta?{' '}
        <button
          type="button"
          onClick={onSwitch}
          style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', cursor: 'pointer', fontWeight: 600 }}
        >
          Fazer login
        </button>
      </p>
    </form>
  )
}
