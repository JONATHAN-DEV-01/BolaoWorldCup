import { useState } from 'react'
import type { LeaderboardEntryV2 } from '../../types'

interface UserRankRowProps {
  entry: LeaderboardEntryV2
  isCurrentUser: boolean
}

export function UserRankRow({ entry, isCurrentUser }: UserRankRowProps) {
  const [open, setOpen] = useState(false)

  const rankClass = entry.rank === 1 ? 'rank-1' : entry.rank === 2 ? 'rank-2' : entry.rank === 3 ? 'rank-3' : 'rank-n'
  const medalIcon = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null

  const fullHits    = entry.full_hits     ?? 0
  const classRight  = entry.total_classified_correct ?? 0


  const rankColor =
    entry.rank === 1 ? '#f5c518' :
    entry.rank === 2 ? '#c0c0c0' :
    entry.rank === 3 ? '#cd7f32' :
    'var(--color-text-primary)'

  return (
    <>
      {/* ── Row clicável ── */}
      <div
        id={`rank-row-${entry.id}`}
        className={`leaderboard-row${isCurrentUser ? ' current-user' : ''} animate-fade-in`}
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        {/* Rank badge */}
        <div className={`rank-badge ${rankClass}`}>
          {medalIcon ?? entry.rank}
        </div>

        {/* User info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 }}>
          <span style={{
            fontWeight: 700,
            fontSize: '0.9375rem',
            color: isCurrentUser ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {entry.username}
            {isCurrentUser && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-accent-primary)', fontWeight: 500 }}>
                (você)
              </span>
            )}
          </span>
          {entry.full_name && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.full_name}
            </span>
          )}
        </div>


        {/* Points + knockout pills + tap hint */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: entry.rank <= 3 ? 'var(--color-accent-gold)' : 'var(--color-text-primary)',
          }}>
            {entry.total_points}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>pts</span>

          {/* Pills discretas de desempate mata-mata */}
          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '2px' }}>
            <span
              title={`${fullHits} acerto${fullHits === 1 ? '' : 's'} completo${fullHits === 1 ? '' : 's'} (mata-mata)`}
              style={{
                fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px',
                borderRadius: '100px',
                background: fullHits > 0 ? 'rgba(245,197,24,0.15)' : 'rgba(136,146,164,0.1)',
                color: fullHits > 0 ? '#f5c518' : 'var(--color-text-secondary)',
                border: `1px solid ${fullHits > 0 ? 'rgba(245,197,24,0.3)' : 'var(--color-border)'}`,
                whiteSpace: 'nowrap',
              }}
            >
              🎯 {fullHits}
            </span>
            <span
              title={`${classRight} classificado${classRight === 1 ? '' : 's'} certo${classRight === 1 ? '' : 's'} no total`}
              style={{
                fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px',
                borderRadius: '100px',
                background: classRight > 0 ? 'rgba(0,212,170,0.12)' : 'rgba(136,146,164,0.1)',
                color: classRight > 0 ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                border: `1px solid ${classRight > 0 ? 'rgba(0,212,170,0.25)' : 'var(--color-border)'}`,
                whiteSpace: 'nowrap',
              }}
            >
              ✓ {classRight}
            </span>
          </div>

          <span style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', opacity: 0.45, marginTop: '2px' }}>
            ▲ detalhes
          </span>
        </div>
      </div>

      {/* ── Bottom Sheet ── */}
      {open && (
        <>
          {/* Backdrop — fecha ao clicar fora */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 1000,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              animation: 'backdropIn 0.25s ease both',
            }}
          />

          {/* Sheet que sobe de baixo */}
          <div style={{
            position: 'fixed',
            left: 0, right: 0, bottom: 0,
            zIndex: 1001,
            background: 'var(--color-bg-secondary)',
            borderRadius: '24px 24px 0 0',
            padding: '0.75rem 1.5rem 2.5rem',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            border: '1px solid var(--color-border)',
            borderBottom: 'none',
            animation: 'sheetUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            {/* Handle pill */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: 'var(--color-border-light)',
              margin: '0 auto 1.25rem',
            }} />

            {/* Header: rank + nome + botão fechar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div className={`rank-badge ${rankClass}`} style={{ width: '3rem', height: '3rem', fontSize: '1.1rem', flexShrink: 0 }}>
                {medalIcon ?? entry.rank}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 800, fontSize: '1.125rem',
                  color: isCurrentUser ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {entry.username}
                  {isCurrentUser && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', fontWeight: 500 }}>(você)</span>}
                </div>
                {entry.full_name && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.full_name}
                  </div>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flexShrink: 0,
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '50%',
                  width: 34, height: 34,
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Pontuação total — card de destaque */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,197,24,0.1), rgba(255,152,0,0.05))',
              border: '1px solid rgba(245,197,24,0.2)',
              borderRadius: 16,
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                  Pontuação total
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.75rem', color: rankColor, lineHeight: 1 }}>
                  {entry.total_points}
                  <span style={{ fontSize: '1rem', fontWeight: 600, marginLeft: '0.25rem', color: 'var(--color-text-secondary)' }}>pts</span>
                </div>
              </div>
              <span style={{ fontSize: '2.75rem' }}>🏆</span>
            </div>

            {/* Seção de desempate */}
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', marginBottom: '0.625rem' }}>
              Critérios de desempate
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

              {/* 0 — Acertos completos (mata-mata, novo) */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--color-bg-card)',
                border: `1px solid ${fullHits > 0 ? 'rgba(245,197,24,0.4)' : 'var(--color-border)'}`,
                borderRadius: 12, padding: '0.75rem 1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '1.375rem' }}>🎯</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Acertos Completos</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', opacity: 0.8 }}>1º desempate — winner + método certos (mata-mata)</div>
                  </div>
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.625rem',
                  color: fullHits > 0 ? '#f5c518' : 'var(--color-text-secondary)',
                }}>
                  {fullHits}
                </span>
              </div>

              {/* 0b — Classificados corretos no total (mata-mata, novo) */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--color-bg-card)',
                border: `1px solid ${classRight > 0 ? 'rgba(0,212,170,0.3)' : 'var(--color-border)'}`,
                borderRadius: 12, padding: '0.75rem 1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '1.375rem' }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Classificados Certos</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', opacity: 0.8 }}>2º desempate — total de mata-mata acertados (full + parcial)</div>
                  </div>
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.625rem',
                  color: classRight > 0 ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                }}>
                  {classRight}
                </span>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  )
}
