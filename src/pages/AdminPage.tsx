import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Navbar } from '../components/ui/Navbar'
import { AdminMatchList } from '../components/admin/AdminMatchList'
import { useMatches } from '../hooks/useMatches'
import { useAuth } from '../contexts/AuthContext'
import { KNOCKOUT_PHASE_LABELS } from '../components/matches/KnockoutPhaseTabs'

// ──────────────────────────────────────────────────────────────
// Tabs: fase de grupos (rounds 1-3) + mata-mata (rounds 4-9)
// 'undefined' = todos os jogos
// ──────────────────────────────────────────────────────────────
const ADMIN_TABS: { value: number | undefined; label: string; icon: string }[] = [
  { value: undefined, label: 'Todos',    icon: '📋' },
  { value: 1,         label: 'Rodada 1', icon: '⚽' },
  { value: 2,         label: 'Rodada 2', icon: '⚽' },
  { value: 3,         label: 'Rodada 3', icon: '⚽' },
  // Mata-mata — só aparecem se existirem jogos cadastrados
  ...[4, 5, 6, 7, 8, 9].map(r => ({
    value: r,
    label: KNOCKOUT_PHASE_LABELS[r] ?? `Fase ${r}`,
    icon: r >= 7 ? '🏆' : '⚔️',
  })),
]

export function AdminPage() {
  const { profile, loading: authLoading } = useAuth()
  const [round, setRound] = useState<number | undefined>(undefined)

  // Busca todos os jogos sem filtro para saber quais tabs mostrar
  const { matches: allMatches } = useMatches(undefined)
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

  // Rounds que de fato têm jogos cadastrados → mostra só essas abas
  const existingRounds = new Set(allMatches.map(m => m.round))
  const visibleTabs = ADMIN_TABS.filter(
    t => t.value === undefined || existingRounds.has(t.value)
  )

  const pending  = matches.filter(m => !m.is_finished)
  const finished = matches.filter(m =>  m.is_finished)

  const activeTab = ADMIN_TABS.find(t => t.value === round)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* ── Header ──────────────────────────────────────────── */}
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
            Insira os resultados dos jogos e a pontuação será calculada automaticamente pelo banco.
          </p>
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: round !== undefined ? `Jogos (${activeTab?.label})` : 'Total de jogos', value: matches.length,  icon: '⚽', color: 'var(--color-accent-primary)'   },
            { label: 'Pendentes',  value: pending.length,  icon: '⏳', color: 'var(--color-accent-secondary)' },
            { label: 'Encerrados', value: finished.length, icon: '✅', color: 'var(--color-accent-primary)'   },
            { label: 'Grupos',     value: allMatches.filter(m => m.round < 4).length,  icon: '⚽', color: 'var(--color-text-secondary)' },
            { label: 'Mata-mata',  value: allMatches.filter(m => m.round >= 4).length, icon: '🏆', color: '#f5c518' },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: '1 1 100px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Phase / Round Filter ─────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Divider entre grupos e mata-mata */}
          <div className="round-tabs-container" style={{ gap: '0.375rem' }}>
            {visibleTabs.map((t, i) => {
              const isKnockout = (t.value ?? 0) >= 4
              const prevIsGroup = i > 0 && (visibleTabs[i - 1].value ?? 0) < 4

              return (
                <div key={String(t.value)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {/* Separador visual entre grupos e mata-mata */}
                  {isKnockout && prevIsGroup && (
                    <div style={{
                      width: 1, height: 24,
                      background: 'var(--color-border-light)',
                      flexShrink: 0, marginRight: '0.1rem',
                    }} />
                  )}
                  <button
                    id={`admin-tab-${t.value}`}
                    className={`round-tab${round === t.value ? ' active' : ''}`}
                    onClick={() => setRound(t.value)}
                    style={isKnockout && round !== t.value ? {
                      borderColor: 'rgba(245,197,24,0.3)',
                      color: '#f5c518',
                    } : {}}
                  >
                    {t.icon} {t.label}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Match List ──────────────────────────────────────── */}
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
