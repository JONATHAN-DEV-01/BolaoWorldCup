import type { LeaderboardEntry } from '../../types'

interface UserRankRowProps {
  entry: LeaderboardEntry
  isCurrentUser: boolean
}

export function UserRankRow({ entry, isCurrentUser }: UserRankRowProps) {
  const rankClass = entry.rank === 1 ? 'rank-1' : entry.rank === 2 ? 'rank-2' : entry.rank === 3 ? 'rank-3' : 'rank-n'

  const medalIcon = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null

  return (
    <div
      id={`rank-row-${entry.id}`}
      className={`leaderboard-row${isCurrentUser ? ' current-user' : ''} animate-fade-in`}
    >
      {/* Rank */}
      <div className={`rank-badge ${rankClass}`}>
        {medalIcon ?? entry.rank}
      </div>

      {/* User info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={{
          fontWeight: 700,
          fontSize: '0.9375rem',
          color: isCurrentUser ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
        }}>
          {entry.username}
          {isCurrentUser && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-accent-primary)', fontWeight: 500 }}>
              (você)
            </span>
          )}
        </span>
        {entry.full_name && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            {entry.full_name}
          </span>
        )}
      </div>

      {/* Points */}
      <div style={{ display: 'flex', flex: 'column', alignItems: 'flex-end', gap: '1px' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: entry.rank <= 3 ? 'var(--color-accent-gold)' : 'var(--color-text-primary)',
        }}>
          {entry.total_points}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>pts</span>
      </div>
    </div>
  )
}
