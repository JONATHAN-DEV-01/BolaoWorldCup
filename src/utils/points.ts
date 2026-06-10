// ============================================================
// Points calculation — mirrors the SQL trigger logic
// ============================================================

export type MatchResult = 'home' | 'away' | 'draw'

export function getResult(home: number, away: number): MatchResult {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

export function calculatePoints(
  realHome: number,
  realAway: number,
  predHome: number,
  predAway: number
): number {
  const real = getResult(realHome, realAway)
  const pred = getResult(predHome, predAway)

  if (real === 'draw' && pred === 'draw') return 10
  if (real !== 'draw' && pred === real) return 5
  return 0
}

// Flag emoji map
export const FLAG_MAP: Record<string, string> = {
  'México': '🇲🇽',
  'África do Sul': '🇿🇦',
  'Coreia do Sul': '🇰🇷',
  'República Tcheca': '🇨🇿',
  'Canadá': '🇨🇦',
  'Bósnia e Herzegovina': '🇧🇦',
  'Catar': '🇶🇦',
  'Suíça': '🇨🇭',
  'Brasil': '🇧🇷',
  'Marrocos': '🇲🇦',
  'Haiti': '🇭🇹',
  'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Estados Unidos': '🇺🇸',
  'Paraguai': '🇵🇾',
  'Austrália': '🇦🇺',
  'Turquia': '🇹🇷',
  'Alemanha': '🇩🇪',
  'Curaçao': '🇨🇼',
  'Costa do Marfim': '🇨🇮',
  'Equador': '🇪🇨',
  'Holanda': '🇳🇱',
  'Japão': '🇯🇵',
  'Suécia': '🇸🇪',
  'Tunísia': '🇹🇳',
  'Bélgica': '🇧🇪',
  'Egito': '🇪🇬',
  'Irã': '🇮🇷',
  'Nova Zelândia': '🇳🇿',
  'Espanha': '🇪🇸',
  'Cabo Verde': '🇨🇻',
  'Arábia Saudita': '🇸🇦',
  'Uruguai': '🇺🇾',
  'França': '🇫🇷',
  'Senegal': '🇸🇳',
  'Iraque': '🇮🇶',
  'Noruega': '🇳🇴',
  'Argentina': '🇦🇷',
  'Argélia': '🇩🇿',
  'Áustria': '🇦🇹',
  'Jordânia': '🇯🇴',
  'Portugal': '🇵🇹',
  'RD Congo': '🇨🇩',
  'Uzbequistão': '🇺🇿',
  'Colômbia': '🇨🇴',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croácia': '🇭🇷',
  'Gana': '🇬🇭',
  'Panamá': '🇵🇦',
}

export function getFlag(team: string): string {
  return FLAG_MAP[team] ?? '🏳️'
}

export function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export function formatMatchTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function hasMatchStarted(dateStr: string): boolean {
  return new Date() >= new Date(dateStr)
}
