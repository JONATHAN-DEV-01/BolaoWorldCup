import { useMemo } from 'react'
import type { Match, Prediction } from '../../types'
import { MatchCard } from './MatchCard'
import { KnockoutMatchCard } from './KnockoutMatchCard'
import { formatMatchDate } from '../../utils/points'

interface MatchListProps {
  matches: Match[]
  predictions: Prediction[]
  onSaved?: () => void
}

export function MatchList({ matches, predictions, onSaved }: MatchListProps) {
  // Group matches by date
  const grouped = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of matches) {
      const dateKey = formatMatchDate(m.match_date)
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(m)
    }
    return map
  }, [matches])

  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚽</div>
        <p>Nenhum jogo encontrado para esta rodada.</p>
      </div>
    )
  }

  return (
    <div>
      {Array.from(grouped.entries()).map(([date, dayMatches]) => (
        <div key={date}>
          <div className="date-header">
            📅 {date}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dayMatches.map(match => {
              const prediction = predictions.find(p => p.match_id === match.id) ?? null
              // round >= 4 → mata-mata card (sem empate, com método)
              return match.round >= 4 ? (
                <KnockoutMatchCard
                  key={match.id}
                  match={match}
                  prediction={prediction}
                  onSaved={onSaved}
                />
              ) : (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={prediction}
                  onSaved={onSaved}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
