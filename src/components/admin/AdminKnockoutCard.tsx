import { useState } from 'react'
import type { Match, KnockoutWinner, KnockoutMethod } from '../../types'
import { getFlag } from '../../utils/points'
import { supabase } from '../../lib/supabase'

// ──────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<number, string> = {
  4: '16 avos',
  5: 'Oitavas',
  6: 'Quartas',
  7: 'Semifinal',
  8: '3º Lugar',
  9: 'Final',
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

interface AdminKnockoutCardProps {
  match: Match
  onUpdated: () => void
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export function AdminKnockoutCard({ match, onUpdated }: AdminKnockoutCardProps) {
  const [winner,  setWinner]  = useState<KnockoutWinner | null>(match.winner  ?? null)
  const [method,  setMethod]  = useState<KnockoutMethod | null>(match.match_method ?? null)
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  // Finished matches start in read-only mode; pending in edit mode
  const [editing, setEditing] = useState(!match.is_finished)

  const homeFlag = getFlag(match.home_team)
  const awayFlag = getFlag(match.away_team)
  const phaseLabel = PHASE_LABELS[match.round] ?? `R${match.round}`

  const winnerName = winner === 'home' ? match.home_team
                   : winner === 'away' ? match.away_team
                   : null

  // ── Salvar resultado ─────────────────────────────────────────
  const handleSave = async () => {
    if (!winner) { setError('Selecione o classificado antes de salvar'); return }
    if (!method) { setError('Selecione o método de decisão'); return }

    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const { error: matchErr } = await supabase
        .from('matches')
        .update({
          winner,
          match_method: method,
          is_finished: true,
        })
        .eq('id', match.id)

      if (matchErr) throw matchErr
      // O trigger recalculate_on_result (migration 006) dispara
      // automaticamente em cada prediction do jogo — sem loop no frontend
      setSuccess(true)
      setEditing(false)
      onUpdated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar resultado')
    } finally {
      setSaving(false)
    }
  }

  // ── Reabrir jogo (zera resultado) ────────────────────────────
  const handleReopen = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const { error: matchErr } = await supabase
        .from('matches')
        .update({ winner: null, match_method: null, is_finished: false })
        .eq('id', match.id)
      if (matchErr) throw matchErr
      setWinner(null)
      setMethod(null)
      setEditing(true)
      onUpdated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao reabrir')
    } finally {
      setSaving(false)
    }
  }

  // ── Entrar em modo de correção ───────────────────────────────
  const handleCorrect = () => {
    setWinner(match.winner ?? null)
    setMethod(match.match_method ?? null)
    setSuccess(false)
    setError(null)
    setEditing(true)
  }

  // ── Cancelar correção ────────────────────────────────────────
  const handleCancel = () => {
    setWinner(match.winner ?? null)
    setMethod(match.match_method ?? null)
    setSuccess(false)
    setError(null)
    setEditing(false)
  }

  // ──────────────────────────────────────────────────────────────
  return (
    <div
      className={`admin-match-card${match.is_finished ? ' finished' : ''}`}
      style={{ borderLeft: '3px solid rgba(245,197,24,0.4)' }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {/* Fase badge */}
        <span style={{
          fontSize: '0.7rem', fontWeight: 700,
          color: '#f5c518',
          background: 'rgba(245,197,24,0.12)',
          padding: '1px 8px', borderRadius: '100px',
          border: '1px solid rgba(245,197,24,0.3)',
        }}>
          🏆 {phaseLabel}
        </span>

        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          {new Date(match.match_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          {' · '}
          {new Date(match.match_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>

        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700,
          color: match.is_finished && !editing
            ? 'var(--color-accent-primary)'
            : editing && match.is_finished
            ? 'var(--color-accent-gold)'
            : 'var(--color-text-secondary)',
        }}>
          {match.is_finished && !editing && '✅ Resultado salvo'}
          {match.is_finished &&  editing && '✏️ Corrigindo'}
          {!match.is_finished && editing && '⏳ Aguardando resultado'}
        </span>
      </div>

      {/* ── Times ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{homeFlag}</span>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>{match.home_team}</span>
        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 800, fontSize: '0.85rem' }}>VS</span>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1, textAlign: 'right' }}>{match.away_team}</span>
        <span style={{ fontSize: '1.25rem' }}>{awayFlag}</span>
      </div>

      {/* ── Read-only: resultado salvo ───────────────────────── */}
      {!editing && match.is_finished && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', flexWrap: 'wrap',
        }}>
          {/* Resumo do resultado */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.5rem 0.875rem',
            background: 'rgba(0,212,170,0.07)',
            border: '1px solid rgba(0,212,170,0.2)',
            borderRadius: '10px',
            flex: 1,
          }}>
            <span style={{ fontSize: '1.25rem' }}>
              {match.winner === 'home' ? homeFlag : awayFlag}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-accent-primary)' }}>
                {winnerName ?? '—'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                via {methodLabel(match.match_method)}
              </div>
            </div>
          </div>

          {/* Botões de ação no modo leitura */}
          <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
            <button
              id={`admin-ko-correct-${match.id}`}
              className="btn btn-ghost btn-sm"
              onClick={handleCorrect}
              disabled={saving}
              style={{ borderColor: 'rgba(245,197,24,0.4)', color: 'var(--color-accent-gold)' }}
            >
              ✏️ Corrigir
            </button>
            <button
              id={`admin-ko-reopen-${match.id}`}
              className="btn btn-ghost btn-sm"
              onClick={handleReopen}
              disabled={saving}
              style={{ borderColor: 'rgba(233,69,96,0.4)', color: 'var(--color-accent-secondary)' }}
            >
              {saving ? '...' : '↩ Reabrir'}
            </button>
          </div>
        </div>
      )}

      {/* ── Edit mode: formulário de resultado ──────────────── */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

          {/* 1. Seleção do classificado */}
          <div>
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: 'var(--color-text-secondary)',
              marginBottom: '0.4rem',
            }}>
              Classificado
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {(['home', 'away'] as KnockoutWinner[]).map(side => {
                const isActive = winner === side
                const teamName = side === 'home' ? match.home_team : match.away_team
                const teamFlag = side === 'home' ? homeFlag : awayFlag
                return (
                  <button
                    key={side}
                    id={`admin-ko-winner-${side}-${match.id}`}
                    onClick={() => setWinner(side)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '10px',
                      border: `2px solid ${isActive ? '#f5c518' : 'var(--color-border-light)'}`,
                      background: isActive ? 'rgba(245,197,24,0.12)' : 'transparent',
                      color: isActive ? '#f5c518' : 'var(--color-text-secondary)',
                      fontWeight: 700, fontSize: '0.8rem',
                      cursor: 'pointer', transition: 'all 0.18s ease',
                      boxShadow: isActive ? '0 0 10px rgba(245,197,24,0.2)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{teamFlag}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {teamName}
                    </span>
                    {isActive && <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Seleção do método */}
          <div>
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: 'var(--color-text-secondary)',
              marginBottom: '0.4rem',
            }}>
              Método de decisão
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
              {METHOD_OPTIONS.map(({ key, label, icon }) => {
                const isActive = method === key
                return (
                  <button
                    key={key}
                    id={`admin-ko-method-${key}-${match.id}`}
                    onClick={() => setMethod(key)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '0.2rem', padding: '0.5rem 0.25rem',
                      borderRadius: '10px',
                      border: `2px solid ${isActive ? 'var(--color-accent-primary)' : 'var(--color-border-light)'}`,
                      background: isActive ? 'rgba(0,212,170,0.12)' : 'transparent',
                      color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                      fontWeight: 700, fontSize: '0.72rem',
                      cursor: 'pointer', transition: 'all 0.18s ease',
                      boxShadow: isActive ? '0 0 10px rgba(0,212,170,0.2)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                    <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Botões de ação */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              id={`admin-ko-save-${match.id}`}
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving || !winner || !method}
              style={{ flex: 1, minWidth: 120 }}
            >
              {saving ? '...' : '✓ Salvar Resultado'}
            </button>

            {match.is_finished && (
              <button
                id={`admin-ko-cancel-${match.id}`}
                className="btn btn-ghost btn-sm"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </button>
            )}
          </div>

          {/* Aviso sobre trigger */}
          {winner && method && (
            <p style={{
              fontSize: '0.68rem', color: 'var(--color-text-secondary)', opacity: 0.7,
              textAlign: 'center',
            }}>
              ⚡ Ao salvar, o banco recalcula todos os palpites automaticamente.
            </p>
          )}
        </div>
      )}

      {/* ── Feedback ────────────────────────────────────────── */}
      {error && (
        <div style={{
          marginTop: '0.625rem', padding: '0.4rem 0.75rem',
          background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
          borderRadius: '8px', color: 'var(--color-accent-secondary)', fontSize: '0.8rem',
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          marginTop: '0.625rem', padding: '0.4rem 0.75rem',
          background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)',
          borderRadius: '8px', color: 'var(--color-accent-primary)', fontSize: '0.8rem',
        }}>
          ✅ Resultado salvo! Pontos recalculados automaticamente pelo banco.
        </div>
      )}
    </div>
  )
}
