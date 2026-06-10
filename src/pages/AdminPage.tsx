import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Navbar } from '../components/ui/Navbar'
import { AdminMatchList } from '../components/admin/AdminMatchList'
import { useMatches } from '../hooks/useMatches'
import { useAuth } from '../contexts/AuthContext'
import type { RoundNumber } from '../types'

export function AdminPage() {
  const { profile, loading: authLoading } = useAuth()
  const [round, setRound] = useState<RoundNumber | undefined>(undefined)
  const { matches, loading, refetch } = useMatches(round)

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!profile?.is_admin) {
    return <Navigate to="/predictions" replace />
  }

  const rounds: { value: RoundNumber | undefined; label: string }[] = [
    { value: undefined, label: 'Todos' },
    { value: 1, label: 'Rodada 1' },
    { value: 2, label: 'Rodada 2' },
    { value: 3, label: 'Rodada 3' },
  ]

  const pending = matches.filter(m => !m.is_finished)
  const finished = matches.filter(m => m.is_finished)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: 'var(--color-text-primary)',
            marginBottom: '0.25rem',
          }}>
            ⚙️ Painel Admin
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Insira os resultados dos jogos e a pontuação será calculada automaticamente.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total de jogos', value: matches.length, icon: '⚽', color: 'var(--color-accent-primary)' },
            { label: 'Pendentes', value: pending.length, icon: '⏳', color: 'var(--color-accent-secondary)' },
            { label: 'Encerrados', value: finished.length, icon: '✅', color: 'var(--color-accent-primary)' },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: '1 1 140px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '0.875rem 1.125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Round Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {rounds.map(r => (
            <button
              key={String(r.value)}
              id={`admin-round-${r.value}`}
              className={`round-tab${round === r.value ? ' active' : ''}`}
              onClick={() => setRound(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Match List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer" style={{ height: '80px', borderRadius: '14px' }} />
            ))}
          </div>
        ) : (
          <AdminMatchList matches={matches} onUpdated={refetch} />
        )}
      </main>
    </div>
  )
}
