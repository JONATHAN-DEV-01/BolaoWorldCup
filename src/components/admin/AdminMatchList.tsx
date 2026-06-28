import type { Match } from '../../types'
import { AdminMatchCard } from './AdminMatchCard'
import { AdminKnockoutCard } from './AdminKnockoutCard'

interface AdminMatchListProps {
  matches: Match[]
  onUpdated: () => void
}

export function AdminMatchList({ matches, onUpdated }: AdminMatchListProps) {
  const pending = matches.filter(m => !m.is_finished)
  const finished = matches.filter(m => m.is_finished)

  const Section = ({ title, items }: { title: string; items: Match[] }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{
        fontSize: '0.8125rem', fontWeight: 700,
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        marginBottom: '0.75rem',
      }}>
        {title} ({items.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(m =>
          m.round >= 4 ? (
            <AdminKnockoutCard key={m.id} match={m} onUpdated={onUpdated} />
          ) : (
            <AdminMatchCard key={m.id} match={m} onUpdated={onUpdated} />
          )
        )}
      </div>
    </div>
  )

  return (
    <div>
      {pending.length > 0 && <Section title="⏳ Pendentes" items={pending} />}
      {finished.length > 0 && <Section title="✅ Encerrados" items={finished} />}
    </div>
  )
}
