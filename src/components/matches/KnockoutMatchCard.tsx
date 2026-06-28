import { useState } from 'react'
import type { Match, Prediction, KnockoutWinner, KnockoutMethod } from '../../types'
import { getFlag, formatMatchTime, hasMatchStarted } from '../../utils/points'
import { usePredictions } from '../../hooks/usePredictions'

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<number, string> = {
  4: 'Oitavas de Final',
  5: 'Quartas de Final',
  6: 'Semifinal',
  7: 'Disputa 3º Lugar',
  8: 'Final',
}

const METHOD_OPTIONS: { key: KnockoutMethod; label: string; icon: string }[] = [
  { key: 'normal',     label: 'Tempo Normal', icon: '⚽' },
  { key: 'extra_time', label: 'Prorrogação',  icon: '⏱' },
  { key: 'penalties',  label: 'Pênaltis',     icon: '🎯' },
]

function methodLabel(m: KnockoutMethod | null | undefined): string {
  return METHOD_OPTIONS.find(o => o.key === m)?.label ?? '—'
}

// ──────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────

interface KnockoutMatchCardProps {
  match: Match
  prediction?: Prediction | null
  onSaved?: () => void
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export function KnockoutMatchCard({ match, prediction, onSaved }: KnockoutMatchCardProps) {
  const { saveKnockoutPrediction } = usePredictions()

  const [selectedWinner, setSelectedWinner] = useState<KnockoutWinner | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<KnockoutMethod | null>(null)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const started       = hasMatchStarted(match.match_date)
  const hasPrediction = prediction !== null && prediction !== undefined
  const canPredict    = !started && !hasPrediction

  // After saving locally, show the selection as read-only
  const activeWinner: KnockoutWinner | null =
    saved
      ? selectedWinner
      : hasPrediction
      ? prediction!.predicted_winner
      : selectedWinner

  const activeMethod: KnockoutMethod | null =
    saved
      ? selectedMethod
      : hasPrediction
      ? prediction!.predicted_method
      : selectedMethod

  // ── Status badge ──────────────────────────────────────────
  const getStatus = () => {
    if (match.is_finished) return { label: '✅ Encerrado',        cls: 'badge-closed'    }
    if (started)           return { label: '🔴 Em andamento',     cls: 'badge-closed'    }
    if (hasPrediction || saved) return { label: '✅ Palpite enviado', cls: 'badge-predicted' }
    return                        { label: '🟡 Aberto',           cls: 'badge-open'      }
  }
  const status = getStatus()

  // ── Points display ────────────────────────────────────────
  const getPointsInfo = (): { label: string; cls: string } => {
    if (match.is_finished && hasPrediction) {
      const pts = prediction!.points_earned
      if (prediction!.is_full_hit)    return { label: `Acerto Completo! 🎯 +${pts} pts`, cls: 'ko-badge-gold'    }
      if (prediction!.is_partial_hit) return { label: `Classificado certo ✓ +${pts} pts`, cls: 'ko-badge-mint'   }
      return                                 { label: 'Sem pontos',                        cls: 'ko-badge-gray'   }
    }
    if (hasPrediction || saved) return { label: 'Aguardando resultado...', cls: 'ko-badge-wait' }
    if (activeWinner && activeMethod) return { label: 'Até 20 pts 🎯', cls: 'badge-pts' }
    return { label: 'Selecione classificado + método',  cls: 'badge-pts' }
  }
  const pointsInfo = getPointsInfo()

  // ── Save handler ─────────────────────────────────────────
  const handleSave = async () => {
    if (!activeWinner) { setError('Selecione quem se classifica'); return }
    if (!selectedMethod) { setError('Selecione como o time se classifica'); return }
    setSaving(true)
    setError(null)
    try {
      await saveKnockoutPrediction(match.id, activeWinner, selectedMethod)
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
  const phaseLabel = PHASE_LABELS[match.round] ?? `Fase ${match.round}`

  // ── Winner team name (when match is finished) ─────────────
  const winnerName =
    match.winner === 'home' ? match.home_team :
    match.winner === 'away' ? match.away_team : null

  // ──────────────────────────────────────────────────────────
  return (
    <div className="match-card animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Knockout accent stripe — gold */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, transparent, #f5c518 40%, #ff9800 60%, transparent)',
        opacity: 0.9,
      }} />

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 800,
          color: '#f5c518',
          background: 'rgba(245, 197, 24, 0.12)',
          padding: '2px 10px', borderRadius: '100px',
          border: '1px solid rgba(245, 197, 24, 0.3)',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          🏆 {phaseLabel}
        </span>

        {/* Badge de chave (A/B) — apenas rounds com side definido */}
        {match.side && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700,
            padding: '2px 8px', borderRadius: '100px',
            letterSpacing: '0.06em',
            ...(match.side === 'A'
              ? { color: 'var(--color-accent-primary)', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)' }
              : { color: 'var(--color-accent-secondary)', background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.25)' }
            ),
          }}>
            Chave {match.side}
          </span>
        )}

        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {formatMatchTime(match.match_date)}
        </span>

        <span className={`badge-sm ${status.cls}`} style={{
          fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px', borderRadius: '100px',
        }}>
          {status.label}
        </span>
      </div>

      {/* ── Teams ──────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', gap: '0.75rem', marginBottom: '1.125rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <span className="team-flag">{homeFlag}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            {match.home_team}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 800, fontSize: '1rem' }}>VS</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--color-accent-gold)', fontWeight: 700, letterSpacing: '0.06em' }}>
            MATA-MATA
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <span className="team-flag">{awayFlag}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            {match.away_team}
          </span>
        </div>
      </div>

      {/* ── Quem passa? (obrigatório) ───────────────────────── */}
      <div style={{ marginBottom: '0.875rem' }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--color-text-secondary)',
          marginBottom: '0.5rem',
        }}>
          Quem se classifica?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
          {(['home', 'away'] as KnockoutWinner[]).map(side => {
            const isActive     = activeWinner === side
            const isCorrect    = match.is_finished && match.winner === side
            const isDisabled   = !canPredict
            const teamName     = side === 'home' ? match.home_team : match.away_team
            const teamFlag     = side === 'home' ? homeFlag : awayFlag

            let style: React.CSSProperties = {
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.375rem', padding: '0.75rem 0.5rem',
              borderRadius: '12px', border: '2px solid',
              cursor: isDisabled ? 'default' : 'pointer',
              transition: 'all 0.22s ease',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '0.82rem', userSelect: 'none',
              borderColor: 'var(--color-border-light)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
            }

            if (isActive && isCorrect) {
              style = { ...style,
                borderColor: 'var(--color-accent-primary)',
                background: 'rgba(0, 212, 170, 0.18)',
                color: 'var(--color-accent-primary)',
                boxShadow: '0 0 16px rgba(0, 212, 170, 0.3)',
              }
            } else if (isActive) {
              style = { ...style,
                borderColor: '#f5c518',
                background: 'rgba(245, 197, 24, 0.12)',
                color: '#f5c518',
                boxShadow: '0 0 16px rgba(245, 197, 24, 0.2)',
              }
            } else if (isCorrect) {
              style = { ...style,
                borderColor: 'rgba(0, 212, 170, 0.4)',
                background: 'rgba(0, 212, 170, 0.05)',
                color: 'var(--color-accent-primary)',
              }
            }

            return (
              <button
                key={side}
                id={`ko-winner-${side}-${match.id}`}
                style={style}
                disabled={isDisabled}
                onClick={() => !isDisabled && setSelectedWinner(side)}
                onMouseEnter={e => {
                  if (!isDisabled && !isActive) {
                    const el = e.currentTarget
                    el.style.borderColor = '#f5c518'
                    el.style.color = '#f5c518'
                    el.style.background = 'rgba(245, 197, 24, 0.07)'
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
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{teamFlag}</span>
                <span style={{ textAlign: 'center', fontSize: '0.8rem', lineHeight: 1.25, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {teamName}
                </span>
                {isActive && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>✓ selecionado</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Como passa? (opcional) ──────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', marginBottom: '0.5rem',
          color: canPredict ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
        }}>
          Como passa?{' '}
          <span style={{ fontWeight: 600, textTransform: 'none', letterSpacing: 0, color: 'var(--color-accent-secondary)', opacity: 0.9 }}>
            (obrigatório)
          </span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {METHOD_OPTIONS.map(({ key, label, icon }) => {
            const isActive   = activeMethod === key
            const isDisabled = !canPredict

            let style: React.CSSProperties = {
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.2rem', padding: '0.5rem 0.25rem',
              borderRadius: '10px', border: '1.5px solid',
              cursor: isDisabled ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: '0.72rem', userSelect: 'none',
              borderColor: 'var(--color-border-light)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
            }

            if (isActive) {
              style = { ...style,
                borderColor: 'var(--color-accent-primary)',
                background: 'rgba(0, 212, 170, 0.12)',
                color: 'var(--color-accent-primary)',
                boxShadow: '0 0 10px rgba(0, 212, 170, 0.2)',
              }
            }

            return (
              <button
                key={key}
                id={`ko-method-${key}-${match.id}`}
                style={style}
                disabled={isDisabled}
                onClick={() => !isDisabled && setSelectedMethod(isActive ? null : key)}
                onMouseEnter={e => {
                  if (!isDisabled && !isActive) {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--color-accent-primary)'
                    el.style.color = 'var(--color-accent-primary)'
                    el.style.background = 'rgba(0, 212, 170, 0.06)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isDisabled && !isActive) {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--color-border-light)'
                    el.style.color = 'var(--color-text-secondary)'
                    el.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
              </button>
            )
          })}
        </div>

        {canPredict && !activeMethod && activeWinner && (
          <p style={{ fontSize: '0.68rem', color: 'var(--color-accent-secondary)', marginTop: '0.375rem', textAlign: 'center', opacity: 0.85 }}>
            ⚠️ Selecione o método para confirmar o palpite
          </p>
        )}
      </div>

      {/* ── Resultado oficial (quando encerrado) ────────────── */}
      {match.is_finished && winnerName && (
        <div style={{
          padding: '0.625rem 0.875rem',
          background: 'rgba(0, 212, 170, 0.07)',
          borderRadius: '10px', marginBottom: '0.875rem',
          border: '1px solid rgba(0, 212, 170, 0.2)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Classificado:{' '}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent-primary)' }}>
            {winnerName}
          </span>
          {match.match_method && (
            <>
              <span style={{ color: 'var(--color-text-secondary)', margin: '0 0.35rem' }}>via</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {methodLabel(match.match_method)}
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '0.25rem', paddingTop: '0.875rem',
        borderTop: '1px solid var(--color-border)',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        {/* Points badge */}
        <span style={{
          fontSize: '0.75rem', fontWeight: 700,
          padding: '4px 12px', borderRadius: '100px',
          ...(pointsInfo.cls === 'ko-badge-gold'
            ? { background: 'rgba(245,197,24,0.18)', color: '#f5c518', border: '1px solid rgba(245,197,24,0.35)' }
            : pointsInfo.cls === 'ko-badge-mint'
            ? { background: 'rgba(0,212,170,0.18)', color: 'var(--color-accent-primary)', border: '1px solid rgba(0,212,170,0.3)' }
            : pointsInfo.cls === 'ko-badge-gray'
            ? { background: 'rgba(136,146,164,0.15)', color: 'var(--color-text-secondary)', border: '1px solid rgba(136,146,164,0.25)' }
            : pointsInfo.cls === 'ko-badge-wait'
            ? { background: 'rgba(245,197,24,0.12)', color: '#f5c518', border: '1px solid rgba(245,197,24,0.25)' }
            : { background: 'rgba(0,168,255,0.15)', color: '#00a8ff', border: '1px solid rgba(0,168,255,0.3)' }),
        }}>
          {pointsInfo.label}
        </span>

        {/* Confirm button */}
        {canPredict && !saved && (
          <button
            id={`ko-confirm-${match.id}`}
            className="btn btn-primary btn-sm"
            style={(activeWinner && activeMethod) ? {} : { opacity: 0.45, cursor: 'not-allowed' }}
            onClick={handleSave}
            disabled={saving || !activeWinner || !activeMethod}
          >
            {saving ? '...' : '✓ Confirmar Palpite'}
          </button>
        )}

        {/* Read-only confirmation */}
        {(saved || (hasPrediction && !started)) && !match.is_finished && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-primary)', fontWeight: 600 }}>
            Palpite registrado ✓
          </span>
        )}

        {/* Locked info */}
        {started && !hasPrediction && !match.is_finished && (
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>
            🔒 Jogo iniciado
          </span>
        )}
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div style={{
          marginTop: '0.625rem', padding: '0.5rem 0.75rem',
          background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
          borderRadius: '8px', color: 'var(--color-accent-secondary)', fontSize: '0.8rem',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
