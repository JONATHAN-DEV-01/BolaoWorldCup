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
}

export interface Prediction {
  id: string
  user_id: string
  match_id: number
  predicted_home_score: number
  predicted_away_score: number
  points_earned: number
  created_at: string
}

export type MatchWithPrediction = Match & {
  prediction?: Prediction | null
}

export type RoundNumber = 1 | 2 | 3

export interface LeaderboardEntry extends Profile {
  rank: number
}
