import type { RoundNumber } from '../../types'

interface RoundTabsProps {
  active: RoundNumber
  onChange: (round: RoundNumber) => void
}

const ROUNDS: { value: RoundNumber; label: string }[] = [
  { value: 1, label: '⚽ Rodada 1' },
  { value: 2, label: '⚽ Rodada 2' },
  { value: 3, label: '⚽ Rodada 3' },
]

export function RoundTabs({ active, onChange }: RoundTabsProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      overflowX: 'auto',
      paddingBottom: '0.25rem',
    }}>
      {ROUNDS.map(r => (
        <button
          key={r.value}
          id={`round-tab-${r.value}`}
          className={`round-tab${active === r.value ? ' active' : ''}`}
          onClick={() => onChange(r.value)}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
