import { useState } from 'react'
import type { Match } from '../../types'
import { getFlag, calculatePoints } from '../../utils/points'
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

  const homeFlag = getFlag(match.home_team)
  const awayFlag = getFlag(match.away_team)

  const handleSave = async () => {
    const h = parseInt(homeScore)
    const a = parseInt(awayScore)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError('Insira placares válidos')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Update match result
      const { error: matchErr } = await supabase
        .from('matches')
        .update({ home_score: h, away_score: a, is_finished: true })
        .eq('id', match.id)

      if (matchErr) throw matchErr

      // Fetch all predictions for this match
      const { data: preds } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', match.id)

      if (preds && preds.length > 0) {
        // Update points for each prediction
        for (const pred of preds) {
          const pts = calculatePoints(h, a, pred.predicted_home_score, pred.predicted_away_score)
          await supabase
            .from('predictions')
            .update({ points_earned: pts })
            .eq('id', pred.id)
        }

        // Update total_points for each affected user
        const userIds = [...new Set(preds.map((p: { user_id: string }) => p.user_id))]
        for (const userId of userIds) {
          const { data: allPreds } = await supabase
            .from('predictions')
            .select('points_earned')
            .eq('user_id', userId)
          const total = allPreds?.reduce((sum: number, p: { points_earned: number }) => sum + (p.points_earned || 0), 0) || 0
          await supabase.from('profiles').update({ total_points: total }).eq('id', userId)
        }
      }

      setSuccess(true)
      onUpdated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`admin-match-card${match.is_finished ? ' finished' : ''}`}>
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
        {match.is_finished && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            color: 'var(--color-accent-primary)', marginLeft: 'auto',
          }}>
            ✅ Resultado salvo
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{homeFlag}</span>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>{match.home_team}</span>

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

        <span style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1, textAlign: 'right' }}>{match.away_team}</span>
        <span style={{ fontSize: '1.25rem' }}>{awayFlag}</span>

        <button
          id={`admin-save-${match.id}`}
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
          style={{ minWidth: 80 }}
        >
          {saving ? '...' : match.is_finished ? 'Atualizar' : 'Salvar'}
        </button>
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
