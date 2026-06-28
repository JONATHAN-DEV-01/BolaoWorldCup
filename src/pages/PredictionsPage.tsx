import { useState, useEffect } from 'react'
import { Navbar } from '../components/ui/Navbar'
import { KnockoutPhaseTabs, detectActiveKnockoutRound, KNOCKOUT_PHASE_LABELS } from '../components/matches/KnockoutPhaseTabs'
import { KnockoutMatchCard } from '../components/matches/KnockoutMatchCard'
import { useKnockoutMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { formatMatchDate } from '../utils/points'
import type { Match } from '../types'

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/** Agrupa jogos por data */
function groupByDate(matches: Match[]) {
  const map = new Map<string, Match[]>()
  for (const m of matches) {
    const key = formatMatchDate(m.match_date)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(m)
  }
  return map
}

/** Renderiza um grupo de jogos agrupados por data */
function MatchGroup({ matches, predictions, onSaved }: {
  matches: Match[]
  predictions: ReturnType<typeof usePredictionsLocal>
  onSaved: () => void
}) {
  const grouped = groupByDate(matches)
  return (
    <>
      {Array.from(grouped.entries()).map(([date, dayMatches]) => (
        <div key={date}>
          <div className="date-header">📅 {date}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {dayMatches.map(match => {
              const prediction = predictions.find((p: { match_id: number }) => p.match_id === match.id) ?? null
              return (
                <KnockoutMatchCard
                  key={match.id}
                  match={match}
                  prediction={prediction}
                  onSaved={onSaved}
                />
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}

// Tipo auxiliar para evitar import circular
type PredictionList = ReturnType<typeof Array.prototype.find> extends infer T ? T[] : never
const usePredictionsLocal = (arr: PredictionList) => arr

// ──────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────

export function PredictionsPage() {
  // activeRound começa undefined até o allMatches chegar
  const [activeRound, setActiveRound] = useState<number | undefined>(undefined)

  const {
    matches, allMatches, loading: matchLoading, usingFallback, refetch,
  } = useKnockoutMatches(activeRound)
  const { predictions, loading: predLoading, refetchSilent } = usePredictions()

  const loading = matchLoading || predLoading

  // Assim que allMatches carregar, define a aba ativa padrão
  useEffect(() => {
    if (allMatches.length > 0 && activeRound === undefined) {
      const detected = detectActiveKnockoutRound(allMatches)
      if (detected !== undefined) setActiveRound(detected)
    }
  }, [allMatches])

  // ── Janela de transição: polling de 30s ──────────────────────
  // Garante que, mesmo sem Realtime, a tela atualiza automaticamente
  // durante os minutos entre o hide da fase de grupos e o insert
  // dos jogos do mata-mata. Para assim que allMatches tiver conteúdo.
  useEffect(() => {
    if (allMatches.length > 0) return // já tem jogos, sem necessidade
    const timer = setInterval(() => { refetch() }, 30_000)
    return () => clearInterval(timer)
  }, [allMatches.length, refetch])

  // ── Stats da fase ativa ──────────────────────────────────────
  const phasePredictions = predictions.filter(p =>
    matches.some(m => m.id === p.match_id)
  )
  const phasePoints = phasePredictions.reduce((s, p) => s + (p.points_earned || 0), 0)
  const fullHits    = phasePredictions.filter(p => p.is_full_hit).length
  const classRight  = phasePredictions.filter(p => p.is_full_hit || p.is_partial_hit).length

  const phaseLabel = activeRound !== undefined
    ? (KNOCKOUT_PHASE_LABELS[activeRound] ?? `Fase ${activeRound}`)
    : 'Mata-Mata'

  // ── Janela de transição: sem jogos visíveis ─────────────────
  // noMatchesYet = true durante a janela em que:
  //   (a) admin já ativou is_hidden nos jogos de grupos, E
  //   (b) jogos do mata-mata ainda não foram inseridos
  const noMatchesYet = !matchLoading && allMatches.length === 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* ── Page Header ─────────────────────────────────────── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            background: 'linear-gradient(135deg, #f5c518, #ff9800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.25rem',
          }}>
            🏆 Mata-Mata
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Selecione a fase e registre seus palpites antes do início de cada jogo.
          </p>
        </div>

        {/* ── Phase Tabs ──────────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <KnockoutPhaseTabs
            allMatches={allMatches}
            activeRound={activeRound}
            onChange={setActiveRound}
          />
        </div>

        {/* ── Stats bar ───────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.75rem',
          marginBottom: '1.5rem', flexWrap: 'wrap',
        }}>
          {[
            { label: 'Jogos', value: matches.length, icon: '⚽' },
            { label: 'Palpitados', value: phasePredictions.length, icon: '✅' },
            { label: 'Pts na fase', value: phasePoints, icon: '⭐' },
            { label: '🎯 Completos', value: fullHits, icon: '🎯' },
            { label: '✓ Certos', value: classRight, icon: '✓' },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: '1 1 80px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '0.625rem 0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Match list ──────────────────────────────────────── */}

        {/* ── Estado de transição: janela entre grupos e mata-mata ── */}
        {noMatchesYet && !loading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(245,197,24,0.06) 0%, rgba(30,45,74,0.95) 100%)',
            border: '1px solid rgba(245,197,24,0.2)',
            borderRadius: '20px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Stripe decorativa */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, transparent, #f5c518 40%, #ff9800 60%, transparent)',
            }} />

            {/* Ícone animado */}
            <div style={{
              fontSize: '4rem', marginBottom: '1rem',
              animation: 'pulse-glow 2.5s ease-in-out infinite',
              filter: 'drop-shadow(0 0 12px rgba(245,197,24,0.5))',
            }}>🏆</div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: '1.375rem',
              background: 'linear-gradient(135deg, #f5c518, #ff9800)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.625rem',
            }}>
              Os confrontos do Mata-Mata
            </h2>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: '1.375rem',
              background: 'linear-gradient(135deg, #f5c518, #ff9800)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem',
            }}>
              serão divulgados em breve!
            </h2>

            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              maxWidth: '360px',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}>
              A fase de grupos encerrou. Assim que os confrontos das
              {' '}<strong style={{ color: 'var(--color-text-primary)' }}>Oitavas de Final</strong>{' '}
              forem cadastrados, eles aparecerão aqui automaticamente.
            </p>

            {/* Indicador de atualização automática */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 1rem',
              background: 'rgba(0,212,170,0.08)',
              border: '1px solid rgba(0,212,170,0.2)',
              borderRadius: '100px',
              fontSize: '0.75rem', color: 'var(--color-accent-primary)',
              fontWeight: 600, marginBottom: '1rem',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#00d4aa',
                display: 'inline-block',
                animation: 'pulse-glow 2s infinite',
              }} />
              Atualizando automaticamente
            </div>

            {/* Botão manual de refresh */}
            <button
              id="ko-transition-refresh"
              className="btn btn-ghost btn-sm"
              onClick={() => refetch()}
              style={{ marginTop: '0.25rem' }}
            >
              🔄 Verificar agora
            </button>

            {/* Aviso sobre fallback (apenas dev — remover em produção) */}
            {usingFallback && (
              <p style={{
                marginTop: '1.5rem',
                fontSize: '0.65rem',
                color: 'var(--color-text-secondary)',
                opacity: 0.45,
                fontFamily: 'monospace',
              }}>
                ⚠️ Migration 005 pendente — filtro is_hidden inativo
              </p>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && activeRound !== undefined && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer" style={{ height: '220px', borderRadius: '16px' }} />
            ))}
          </div>
        )}

        {/* Jogos agrupados por data */}
        {!loading && activeRound !== undefined && matches.length > 0 && (
          <div>
            {/* Cabeçalho da fase */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              marginBottom: '1rem',
              padding: '0.5rem 0.875rem',
              background: 'rgba(245,197,24,0.07)',
              border: '1px solid rgba(245,197,24,0.18)',
              borderRadius: '10px',
            }}>
              <span style={{ fontSize: '1rem' }}>🏆</span>
              <span style={{
                fontWeight: 700, fontSize: '0.875rem',
                color: '#f5c518',
              }}>
                {phaseLabel}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
                {matches.length} {matches.length === 1 ? 'jogo' : 'jogos'}
              </span>
            </div>

            <MatchGroup matches={matches} predictions={predictions} onSaved={refetchSilent} />
          </div>
        )}

        {/* Fase sem jogos (aba válida mas round sem jogos no banco) */}
        {!loading && activeRound !== undefined && matches.length === 0 && !noMatchesYet && (
          <div style={{
            textAlign: 'center', padding: '3rem',
            color: 'var(--color-text-secondary)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
            <p>Nenhum jogo cadastrado para esta fase ainda.</p>
          </div>
        )}

      </main>
    </div>
  )
}
