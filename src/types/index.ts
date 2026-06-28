// ============================================================
// Types — Bolão World Cup 2026
// ============================================================

export interface Profile {
  id: string
  username: string
  full_name: string | null
  is_admin: boolean
  avatar_url: string | null
  total_points: number
  // Critérios de desempate
  draw_hits: number        // empates acertados
  round1_points: number    // pontos acumulados na Rodada 1
  round2_points: number    // pontos acumulados na Rodada 2
  created_at: string
}

export type KnockoutWinner  = 'home' | 'away'
export type KnockoutMethod  = 'normal' | 'extra_time' | 'penalties'

export interface Match {
  id: number
  group_name: string
  home_team: string
  away_team: string
  home_team_flag: string | null
  away_team_flag: string | null
  match_date: string
  round: number
  home_score: number | null
  away_score: number | null
  is_finished: boolean
  created_at: string
  // Mata-mata v2 (migration 005)
  is_hidden:    boolean | null
  winner:       KnockoutWinner | null
  match_method: KnockoutMethod | null
  // Chaveamento lado A ou B (migration 010) — NULL para Semi, 3º e Final
  side:         'A' | 'B' | null
}

export interface Prediction {
  id: string
  user_id: string
  match_id: number
  predicted_home_score: number
  predicted_away_score: number
  points_earned: number
  created_at: string
  // Mata-mata v2 (migration 005)
  predicted_winner:  KnockoutWinner | null
  predicted_method:  KnockoutMethod | null
  is_full_hit:       boolean
  is_partial_hit:    boolean
}

export type MatchWithPrediction = Match & {
  prediction?: Prediction | null
}

export type RoundNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface LeaderboardEntry extends Profile {
  rank: number
}

/** Versão estendida retornada pela view leaderboard_v2 (mata-mata v2) */
export interface LeaderboardEntryV2 extends LeaderboardEntry {
  /** Acertos completos do mata-mata (winner + método corretos) — 1º desempate extra */
  full_hits: number
  /** Classificados certos no total (full_hit + partial_hit) — 2º desempate extra */
  total_classified_correct: number
}
