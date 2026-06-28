import { Navbar } from '../components/ui/Navbar'
import { LeaderboardTable } from '../components/dashboard/LeaderboardTable'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useAuth } from '../contexts/AuthContext'

export function DashboardPage() {
  const { leaderboard, loading } = useLeaderboard()
  const { user } = useAuth()

  const topThree = leaderboard.slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            background: 'linear-gradient(135deg, #f5c518, #ff9800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Ranking do Bolão
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Atualizado em tempo real · Copa do Mundo 2026
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            marginTop: '0.75rem',
            background: 'rgba(0, 212, 170, 0.08)',
            border: '1px solid rgba(0, 212, 170, 0.2)',
            borderRadius: '100px',
            padding: '4px 14px',
            fontSize: '0.75rem',
            color: 'var(--color-accent-primary)',
            fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
            Realtime
          </div>
        </div>

        {/* Top 3 podium */}
        {!loading && topThree.length >= 3 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.05), rgba(255, 152, 0, 0.02))',
            borderRadius: '20px',
            border: '1px solid rgba(245, 197, 24, 0.1)',
          }}>
            {/* 2nd place */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥈</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                {topThree[1]?.username}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c0c0c0', fontFamily: 'var(--font-display)' }}>
                {topThree[1]?.total_points}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>pts</div>
            </div>

            {/* 1st place */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '2.75rem', marginBottom: '0.5rem' }}>🥇</div>
              <div style={{
                fontWeight: 800, fontSize: '1rem',
                background: 'linear-gradient(135deg, #f5c518, #ff9800)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {topThree[0]?.username}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent-gold)', fontFamily: 'var(--font-display)' }}>
                {topThree[0]?.total_points}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>pts</div>
            </div>

            {/* 3rd place */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥉</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                {topThree[2]?.username}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#cd7f32', fontFamily: 'var(--font-display)' }}>
                {topThree[2]?.total_points}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>pts</div>
            </div>
          </div>
        )}

        {/* Full leaderboard */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              Classificação Completa
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {leaderboard.length} participantes
            </span>
          </div>

          <div style={{ padding: '0.75rem' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="shimmer" style={{ height: '56px', borderRadius: '12px' }} />
                ))}
              </div>
            ) : (
              <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />
            )}
          </div>
        </div>

        {/* Scoring Legend */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pontuação
          </h3>

          {/* Mata-mata */}
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#f5c518', opacity: 0.8, marginBottom: '0.4rem' }}>
            🏆 Mata-Mata
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { icon: '🎯', text: 'Classificado + Método certos',  pts: '20 pts' },
              { icon: '✓',  text: 'Só o classificado certo',       pts: '12 pts' },
              { icon: '❌', text: 'Classificado errado',           pts: '0 pts'  },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1rem', minWidth: '1.25rem', textAlign: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{item.text}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-accent-gold)', fontSize: '0.875rem' }}>{item.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
