import type { LeaderboardEntryV2 } from '../../types'
import { UserRankRow } from './UserRankRow'

interface LeaderboardTableProps {
  entries: LeaderboardEntryV2[]
  currentUserId?: string
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
        <p>Nenhum participante ainda.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {entries.map(entry => (
        <UserRankRow
          key={entry.id}
          entry={entry}
          isCurrentUser={entry.id === currentUserId}
        />
      ))}
    </div>
  )
}
