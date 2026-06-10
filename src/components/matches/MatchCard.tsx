import { useState } from 'react'
import type { Match, Prediction } from '../../types'
import { getFlag, formatMatchTime, hasMatchStarted } from '../../utils/points'
import { usePredictions } from '../../hooks/usePredictions'

interface MatchCardProps {
  match: Match
  prediction?: Prediction | null
  onSaved?: () => void
}

export function MatchCard({ match, prediction, onSaved }: MatchCardProps) {
  const { savePrediction } = usePredictions()
  const [homeInput, setHomeInput] = useState('')
  const [awayInput, setAwayInput] = useState('')
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
    const h = parseInt(homeInput)
    const a = parseInt(awayInput)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError('Insira um placar válido (0 ou mais)')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await savePrediction(match.id, h, a)
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

  // Points earned or possible
  const pointsDisplay = hasPrediction && match.is_finished
    ? `${prediction!.points_earned} pts`
    : hasPrediction
    ? 'Aguardando'
    : 'Até 10 pts'

  const pointsBadgeCls = match.is_finished && hasPrediction
    ? prediction!.points_earned > 0 ? 'badge-predicted' : 'badge-closed'
    : 'badge-pts'

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

      {/* Teams + Inputs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '1rem',
      }}>
        {/* Home team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <span className="team-flag">{homeFlag}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            {match.home_team}
          </span>
        </div>

        {/* Score inputs / result */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {hasPrediction || started || match.is_finished ? (
            // Show result or prediction, not editable
            <>
              <div className="score-input" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: match.is_finished ? 'rgba(0, 212, 170, 0.05)' : undefined,
                opacity: hasPrediction ? 1 : 0.4,
              }}>
                {hasPrediction
                  ? prediction!.predicted_home_score
                  : match.home_score ?? '—'}
              </div>
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '1.25rem' }}>×</span>
              <div className="score-input" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: match.is_finished ? 'rgba(0, 212, 170, 0.05)' : undefined,
                opacity: hasPrediction ? 1 : 0.4,
              }}>
                {hasPrediction
                  ? prediction!.predicted_away_score
                  : match.away_score ?? '—'}
              </div>
            </>
          ) : (
            // Editable inputs
            <>
              <input
                id={`home-score-${match.id}`}
                type="number"
                min="0"
                max="99"
                className="score-input"
                value={homeInput}
                onChange={e => setHomeInput(e.target.value)}
                placeholder="0"
              />
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '1.25rem' }}>×</span>
              <input
                id={`away-score-${match.id}`}
                type="number"
                min="0"
                max="99"
                className="score-input"
                value={awayInput}
                onChange={e => setAwayInput(e.target.value)}
                placeholder="0"
              />
            </>
          )}
        </div>

        {/* Away team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <span className="team-flag">{awayFlag}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Official result (if finished) */}
      {match.is_finished && match.home_score !== null && (
        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
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
            disabled={saving || !homeInput || !awayInput}
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
