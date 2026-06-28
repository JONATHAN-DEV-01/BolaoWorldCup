import type { Match } from '../../types'

// ----------------------------------------------------------------
// Mapeamento round → nome da fase
// ----------------------------------------------------------------
export const KNOCKOUT_PHASE_LABELS: Record<number, string> = {
  4: '16 avos de Final',
  5: 'Oitavas de Final',
  6: 'Quartas de Final',
  7: 'Semifinal',
  8: 'Disputa de 3º',
  9: 'Final',
}

const KNOCKOUT_PHASE_ICONS: Record<number, string> = {
  4: '⚔️',
  5: '⚔️',
  6: '⚡',
  7: '🔥',
  8: '🥉',
  9: '🏆',
}

// ----------------------------------------------------------------
// Dado o array completo de jogos do mata-mata, retorna o round
// cuja fase deve aparecer selecionada ao carregar a página:
//
//  · O round com o jogo mais próximo de agora que ainda não iniciou
//    (menor match_date >= now)
//  · Se todos os jogos já passaram, o round da última fase jogada
//  · Se não há jogos, retorna undefined
// ----------------------------------------------------------------
export function detectActiveKnockoutRound(allMatches: Match[]): number | undefined {
  if (allMatches.length === 0) return undefined

  const now = Date.now()

  // Jogos futuros (match_date >= now)
  const upcoming = allMatches
    .filter(m => new Date(m.match_date).getTime() >= now)
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

  if (upcoming.length > 0) return upcoming[0].round

  // Todos passados — retorna o round mais alto (última fase)
  const past = [...allMatches].sort((a, b) => b.round - a.round)
  return past[0].round
}

// ----------------------------------------------------------------
// Extrai os rounds únicos presentes nos jogos, ordenados
// ----------------------------------------------------------------
export function getAvailableRounds(allMatches: Match[]): number[] {
  const rounds = [...new Set(allMatches.map(m => m.round))].sort((a, b) => a - b)
  return rounds
}

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------
interface KnockoutPhaseTabsProps {
  allMatches: Match[]
  activeRound: number | undefined
  onChange: (round: number) => void
}

// ----------------------------------------------------------------
// Componente
// ----------------------------------------------------------------
export function KnockoutPhaseTabs({ allMatches, activeRound, onChange }: KnockoutPhaseTabsProps) {
  const rounds = getAvailableRounds(allMatches)

  if (rounds.length === 0) {
    return (
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(245,197,24,0.07)',
        border: '1px solid rgba(245,197,24,0.2)',
        borderRadius: '12px',
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
      }}>
        🏆 Os jogos do mata-mata aparecerão aqui quando cadastrados.
      </div>
    )
  }

  return (
    <div className="round-tabs-container">
      {rounds.map(round => {
        const label = KNOCKOUT_PHASE_LABELS[round] ?? `Fase ${round}`
        const icon  = KNOCKOUT_PHASE_ICONS[round]  ?? '⚽'
        const isActive = activeRound === round

        // Conta jogos encerrados nesta fase (para mostrar indicador)
        const finished  = allMatches.filter(m => m.round === round && m.is_finished).length
        const total     = allMatches.filter(m => m.round === round).length
        const allDone   = total > 0 && finished === total

        return (
          <button
            key={round}
            id={`ko-phase-tab-${round}`}
            className={`round-tab${isActive ? ' active' : ''}`}
            onClick={() => onChange(round)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1px',
              padding: '0.5rem 1.25rem',
              // Override de padding para caber o subtexto
            }}
          >
            {/* Indicador de fase concluída */}
            {allDone && (
              <span style={{
                position: 'absolute',
                top: '3px',
                right: '6px',
                fontSize: '0.55rem',
                color: isActive ? 'rgba(10,14,26,0.7)' : 'var(--color-accent-primary)',
                fontWeight: 700,
              }}>
                ✓
              </span>
            )}

            <span style={{ fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {icon} {label}
            </span>

            {/* Subtexto: progresso de jogos */}
            {total > 0 && (
              <span style={{
                fontSize: '0.58rem',
                fontWeight: 600,
                opacity: isActive ? 0.75 : 0.5,
                whiteSpace: 'nowrap',
              }}>
                {finished}/{total} jogos
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
