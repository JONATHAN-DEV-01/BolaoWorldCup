import { useState } from 'react'
import type { Match, Prediction } from '../../types'
import { getFlag, formatMatchTime, hasMatchStarted } from '../../utils/points'
import { usePredictions } from '../../hooks/usePredictions'

interface MatchCardProps {
  match: Match
  prediction?: Prediction | null
  onSaved?: () => void
}

type Outcome = 'home' | 'draw' | 'away'

/** Converts an outcome choice to a representative score stored in the DB */
function outcomeToScore(outcome: Outcome): { home: number; away: number } {
  if (outcome === 'home') return { home: 1, away: 0 }
  if (outcome === 'draw') return { home: 0, away: 0 }
  return { home: 0, away: 1 }
}

/** Infers the outcome from a stored prediction */
function scoreToOutcome(home: number, away: number): Outcome {
  if (home > away) return 'home'
  if (home === away) return 'draw'
  return 'away'
}

export function MatchCard({ match, prediction, onSaved }: MatchCardProps) {
  const { savePrediction } = usePredictions()
  const [selected, setSelected] = useState<Outcome | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const started = hasMatchStarted(match.match_date)
  const hasPrediction = prediction !== null && prediction !== undefined
  const canPredict = !started && !hasPrediction

  const getStatus = () => {
    if (match.is_finished) return { label: '✅ Encerrado', cls: 'badge-closed' }
    if (started) return { label: '🔴 Em andamento', cls: 'badge-closed' }
    if (hasPrediction) return { label: '✅ Palpite enviado', cls: 'badge-predicted' }
    return { label: '🟡 Aberto', cls: 'badge-open' }
  }

  const status = getStatus()

  const handleSave = async () => {
    if (!selected) {
      setError('Selecione um resultado antes de confirmar')
      return
    }
    const { home, away } = outcomeToScore(selected)
    setSaving(true)
    setError(null)
    try {
      await savePrediction(match.id, home, away)
      setSaved(true)
      onSaved?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar palpite')
    } finally {
      setSaving(false)
    }
  }

  const homeFlag = getFlag(match.home_team)
  const awayFlag = getFlag(match.away_team)

  // Outcome already saved
  const savedOutcome: Outcome | null = hasPrediction
    ? scoreToOutcome(prediction!.predicted_home_score, prediction!.predicted_away_score)
    : null

  const pointsDisplay = hasPrediction && match.is_finished
    ? `${prediction!.points_earned} pts`
    : hasPrediction
    ? 'Aguardando'
    : 'Até 10 pts'

  const pointsBadgeCls = match.is_finished && hasPrediction
    ? prediction!.points_earned > 0 ? 'badge-predicted' : 'badge-closed'
    : 'badge-pts'

  // Official result outcome (for finished matches)
  const officialOutcome: Outcome | null =
    match.is_finished && match.home_score !== null && match.away_score !== null
      ? scoreToOutcome(match.home_score, match.away_score)
      : null

  const outcomeOptions: { key: Outcome; label: string; shortLabel: string }[] = [
    { key: 'home', label: match.home_team, shortLabel: '1' },
    { key: 'draw', label: 'Empate', shortLabel: 'X' },
    { key: 'away', label: match.away_team, shortLabel: '2' },
  ]

  return (
    <div className="match-card animate-fade-in">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--color-accent-primary)',
          background: 'rgba(0, 212, 170, 0.1)',
          padding: '2px 10px',
          borderRadius: '100px',
          border: '1px solid rgba(0, 212, 170, 0.2)',
        }}>
          {match.group_name}
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {formatMatchTime(match.match_date)}
        </span>
        <span className={`badge-sm ${status.cls}`} style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '2px 10px',
          borderRadius: '100px',
        }}>
          {status.label}
        </span>
      </div>

      {/* Teams row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        {/* Home team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <span className="team-flag">{homeFlag}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            {match.home_team}
          </span>
        </div>

        {/* VS divider */}
        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '1rem' }}>VS</span>

        {/* Away team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <span className="team-flag">{awayFlag}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Outcome buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.5rem',
        marginBottom: '0.25rem',
      }}>
        {outcomeOptions.map(({ key, label, shortLabel }) => {
          const activeOutcome = savedOutcome ?? selected
          const isActive = activeOutcome === key
          const isCorrect = match.is_finished && officialOutcome === key
          const isDisabled = !canPredict

          let btnStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.625rem 0.25rem',
            borderRadius: '10px',
            border: '2px solid',
            cursor: isDisabled ? 'default' : 'pointer',
            transition: 'all 0.22s ease',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.78rem',
            lineHeight: 1.2,
            userSelect: 'none',
            background: 'transparent',
            borderColor: 'var(--color-border-light)',
            color: 'var(--color-text-secondary)',
          }

          if (isActive && isCorrect) {
            // User predicted correctly
            btnStyle = {
              ...btnStyle,
              background: 'rgba(0, 212, 170, 0.18)',
              borderColor: 'var(--color-accent-primary)',
              color: 'var(--color-accent-primary)',
              boxShadow: '0 0 12px rgba(0, 212, 170, 0.25)',
            }
          } else if (isActive) {
            btnStyle = {
              ...btnStyle,
              background: key === 'draw'
                ? 'rgba(245, 197, 24, 0.15)'
                : key === 'home'
                ? 'rgba(0, 168, 255, 0.15)'
                : 'rgba(233, 69, 96, 0.15)',
              borderColor: key === 'draw'
                ? 'var(--color-accent-gold)'
                : key === 'home'
                ? '#00a8ff'
                : 'var(--color-accent-secondary)',
              color: key === 'draw'
                ? 'var(--color-accent-gold)'
                : key === 'home'
                ? '#00a8ff'
                : 'var(--color-accent-secondary)',
              boxShadow: key === 'draw'
                ? '0 0 12px rgba(245, 197, 24, 0.2)'
                : key === 'home'
                ? '0 0 12px rgba(0, 168, 255, 0.2)'
                : '0 0 12px rgba(233, 69, 96, 0.2)',
            }
          } else if (isCorrect) {
            // Official result but user didn't pick it
            btnStyle = {
              ...btnStyle,
              borderColor: 'rgba(0, 212, 170, 0.4)',
              color: 'var(--color-accent-primary)',
              background: 'rgba(0, 212, 170, 0.05)',
            }
          }

          return (
            <button
              key={key}
              id={`outcome-${key}-${match.id}`}
              style={btnStyle}
              disabled={isDisabled}
              onClick={() => !isDisabled && setSelected(key)}
              onMouseEnter={e => {
                if (!isDisabled && !isActive) {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--color-accent-primary)'
                  el.style.color = 'var(--color-accent-primary)'
                  el.style.background = 'rgba(0, 212, 170, 0.07)'
                  el.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={e => {
                if (!isDisabled && !isActive) {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--color-border-light)'
                  el.style.color = 'var(--color-text-secondary)'
                  el.style.background = 'transparent'
                  el.style.transform = ''
                }
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{shortLabel}</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.85, textAlign: 'center', maxWidth: '5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Official result (if finished) */}
      {match.is_finished && match.home_score !== null && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Resultado oficial:{' '}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {match.home_score} × {match.away_score}
          </span>
          {hasPrediction && match.is_finished && (
            <>
              {' · '}
              <span style={{
                fontWeight: 700,
                color: prediction!.points_earned > 0 ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)',
                fontSize: '0.875rem',
              }}>
                {prediction!.points_earned > 0 ? `+${prediction!.points_earned} pts` : '0 pts'}
              </span>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1rem',
        paddingTop: '0.875rem',
        borderTop: '1px solid var(--color-border)',
      }}>
        <span className={pointsBadgeCls} style={{
          fontSize: '0.75rem', fontWeight: 700,
          padding: '3px 12px', borderRadius: '100px',
        }}>
          {pointsDisplay}
        </span>

        {canPredict && !saved && (
          <button
            id={`confirm-${match.id}`}
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || !selected}
          >
            {saving ? '...' : '✓ Confirmar'}
          </button>
        )}

        {(saved || (hasPrediction && !started)) && !match.is_finished && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-primary)', fontWeight: 600 }}>
            Palpite registrado ✓
          </span>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(233, 69, 96, 0.1)',
          border: '1px solid rgba(233, 69, 96, 0.3)',
          borderRadius: '8px',
          color: 'var(--color-accent-secondary)',
          fontSize: '0.8rem',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
