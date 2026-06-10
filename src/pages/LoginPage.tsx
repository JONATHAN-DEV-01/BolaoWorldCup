import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  if (loading) {
    return (
      <div className="auth-container">
        <div className="spinner" />
      </div>
    )
  }

  if (user) return <Navigate to="/predictions" replace />

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏆</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.75rem',
            background: 'linear-gradient(135deg, #00d4aa, #00a8ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.25rem',
          }}>
            Bolão World Cup
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Copa do Mundo 2026 — Faça seus palpites!
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 52, 96, 0.4)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '1.75rem',
          border: '1px solid var(--color-border)',
        }}>
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setMode(tab)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                background: mode === tab ? 'var(--color-accent-primary)' : 'transparent',
                color: mode === tab ? '#0a0e1a' : 'var(--color-text-secondary)',
                boxShadow: mode === tab ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none',
              }}
            >
              {tab === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {mode === 'login'
          ? <LoginForm onSwitch={() => setMode('register')} />
          : <RegisterForm onSwitch={() => setMode('login')} />
        }
      </div>
    </div>
  )
}
