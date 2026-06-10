import { useState } from 'react'
import { Navbar } from '../components/ui/Navbar'
import { RoundTabs } from '../components/matches/RoundTabs'
import { MatchList } from '../components/matches/MatchList'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import type { RoundNumber } from '../types'

export function PredictionsPage() {
  const [round, setRound] = useState<RoundNumber>(1)
  const { matches, loading: matchLoading } = useMatches(round)
  const { predictions, loading: predLoading, refetch } = usePredictions()

  const loading = matchLoading || predLoading

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            background: 'linear-gradient(135deg, #00d4aa, #00a8ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.25rem',
          }}>
            Meus Palpites
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Selecione a rodada e registre seus palpites antes do início de cada jogo.
          </p>
        </div>

        {/* Round Tabs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <RoundTabs active={round} onChange={setRound} />
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Jogos', value: matches.length, icon: '⚽' },
            {
              label: 'Palpitados',
              value: predictions.filter(p => matches.some(m => m.id === p.match_id)).length,
              icon: '✅',
            },
            {
              label: 'Pontos na rodada',
              value: predictions
                .filter(p => matches.some(m => m.id === p.match_id))
                .reduce((sum, p) => sum + (p.points_earned || 0), 0),
              icon: '⭐',
            },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: '1 1 100px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Match List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer" style={{ height: '140px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : (
          <MatchList
            matches={matches}
            predictions={predictions}
            onSaved={refetch}
          />
        )}
      </main>
    </div>
  )
}
