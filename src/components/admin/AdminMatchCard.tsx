import { useState } from 'react'
import type { Match } from '../../types'
import { getFlag } from '../../utils/points'
import { supabase } from '../../lib/supabase'

interface AdminMatchCardProps {
  match: Match
  onUpdated: () => void
}

export function AdminMatchCard({ match, onUpdated }: AdminMatchCardProps) {
  const [homeScore, setHomeScore] = useState(match.home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState(match.away_score?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // editing mode: finished matches start collapsed; pending start ready to fill
  const [editing, setEditing] = useState(!match.is_finished)

  const homeFlag = getFlag(match.home_team)
  const awayFlag = getFlag(match.away_team)

  const handleReopen = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const { error: matchErr } = await supabase
        .from('matches')
        .update({ home_score: null, away_score: null, is_finished: false })
        .eq('id', match.id)
      if (matchErr) throw matchErr
      // O trigger no banco zera os pontos automaticamente
      setHomeScore('')
      setAwayScore('')
      setEditing(true)
      onUpdated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao reabrir')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    const h = parseInt(homeScore)
    const a = parseInt(awayScore)
    if (homeScore.trim() === '' || awayScore.trim() === '' || isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError('Insira placares válidos (0 é aceito)')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      // Apenas salva o resultado — o trigger no banco recalcula tudo
      const { error: matchErr } = await supabase
        .from('matches')
        .update({ home_score: h, away_score: a, is_finished: true })
        .eq('id', match.id)
      if (matchErr) throw matchErr
      setSuccess(true)
      setEditing(false)
      onUpdated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = () => {
    setHomeScore(match.home_score?.toString() ?? '')
    setAwayScore(match.away_score?.toString() ?? '')
    setSuccess(false)
    setError(null)
    setEditing(true)
  }

  const handleCancel = () => {
    setHomeScore(match.home_score?.toString() ?? '')
    setAwayScore(match.away_score?.toString() ?? '')
    setSuccess(false)
    setError(null)
    setEditing(false)
  }

  return (
    <div className={`admin-match-card${match.is_finished ? ' finished' : ''}`}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--color-accent-primary)',
          background: 'rgba(0, 212, 170, 0.1)',
          padding: '1px 8px',
          borderRadius: '100px',
          border: '1px solid rgba(0, 212, 170, 0.2)',
        }}>
          {match.group_name}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          R{match.round} · {new Date(match.match_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {new Date(match.match_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {match.is_finished && !editing && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            color: 'var(--color-accent-primary)', marginLeft: 'auto',
          }}>
            ✅ Resultado salvo
          </span>
        )}
        {match.is_finished && editing && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            color: 'var(--color-accent-gold)', marginLeft: 'auto',
          }}>
            ✏️ Editando
          </span>
        )}
      </div>

      {/* Teams + Scores */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{homeFlag}</span>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>{match.home_team}</span>

        {editing ? (
          /* Editable inputs */
          <>
            <input
              id={`admin-home-${match.id}`}
              type="number"
              min="0"
              max="99"
              className="score-input"
              style={{ width: 48, height: 44, fontSize: '1.1rem' }}
              value={homeScore}
              onChange={e => setHomeScore(e.target.value)}
              placeholder="0"
              autoFocus
            />
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>×</span>
            <input
              id={`admin-away-${match.id}`}
              type="number"
              min="0"
              max="99"
              className="score-input"
              style={{ width: 48, height: 44, fontSize: '1.1rem' }}
              value={awayScore}
              onChange={e => setAwayScore(e.target.value)}
              placeholder="0"
            />
          </>
        ) : (
          /* Read-only result display */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}>
            <div className="score-input" style={{
              width: 44, height: 40, fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0, 212, 170, 0.08)',
              borderColor: 'rgba(0, 212, 170, 0.3)',
              cursor: 'default',
            }}>
              {match.home_score ?? '—'}
            </div>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>×</span>
            <div className="score-input" style={{
              width: 44, height: 40, fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0, 212, 170, 0.08)',
              borderColor: 'rgba(0, 212, 170, 0.3)',
              cursor: 'default',
            }}>
              {match.away_score ?? '—'}
            </div>
          </div>
        )}

        <span style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1, textAlign: 'right' }}>{match.away_team}</span>
        <span style={{ fontSize: '1.25rem' }}>{awayFlag}</span>

        {/* Action buttons */}
        {editing ? (
          <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
            <button
              id={`admin-save-${match.id}`}
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving}
              style={{ minWidth: 72 }}
            >
              {saving ? '...' : '✓ Salvar'}
            </button>
            {match.is_finished && (
              <button
                id={`admin-cancel-${match.id}`}
                className="btn btn-ghost btn-sm"
                onClick={handleCancel}
                disabled={saving}
                style={{ minWidth: 60 }}
              >
                Cancelar
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
            <button
              id={`admin-edit-${match.id}`}
              className="btn btn-ghost btn-sm"
              onClick={handleEdit}
              disabled={saving}
              style={{
                minWidth: 76,
                borderColor: 'rgba(245, 197, 24, 0.4)',
                color: 'var(--color-accent-gold)',
              }}
            >
              ✏️ Editar
            </button>
            <button
              id={`admin-reopen-${match.id}`}
              className="btn btn-ghost btn-sm"
              onClick={handleReopen}
              disabled={saving}
              style={{
                minWidth: 84,
                borderColor: 'rgba(233, 69, 96, 0.4)',
                color: 'var(--color-accent-secondary)',
              }}
            >
              {saving ? '...' : '↩ Reabrir'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '0.5rem', color: 'var(--color-accent-secondary)', fontSize: '0.8rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginTop: '0.5rem', color: 'var(--color-accent-primary)', fontSize: '0.8rem' }}>
          ✅ Resultado e pontos atualizados!
        </div>
      )}
    </div>
  )
}
