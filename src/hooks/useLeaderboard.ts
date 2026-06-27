import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LeaderboardEntryV2 } from '../types'

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryV2[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    // Lê da view leaderboard_v2 (migration 007).
    // A view já aplica ORDER BY completo no banco:
    //   total_points DESC → full_hits DESC → total_classified_correct DESC
    //   → draw_hits DESC → round1_points DESC → round2_points DESC → username ASC
    const { data, error } = await supabase
      .from('leaderboard_v2')
      .select('*')

    if (error) {
      // Fallback gracioso: se a view ainda não existe (pré-staging),
      // cai de volta para a query antiga em profiles.
      console.warn('[useLeaderboard] leaderboard_v2 não encontrada, usando fallback:', error.message)
      await fetchLeaderboardFallback()
      return
    }

    if (data) {
      setLeaderboard(
        data.map((row, index) => ({
          ...row,
          rank: index + 1,
          // Garante que full_hits e total_classified_correct existem
          // mesmo que a view retorne null em caso de usuário sem palpites
          full_hits: (row as LeaderboardEntryV2).full_hits ?? 0,
          total_classified_correct: (row as LeaderboardEntryV2).total_classified_correct ?? 0,
        })) as LeaderboardEntryV2[]
      )
    }
    setLoading(false)
  }

  /** Fallback para quando a view leaderboard_v2 ainda não existe no banco */
  const fetchLeaderboardFallback = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', false)
      .order('total_points',  { ascending: false, nullsFirst: false })
      .order('draw_hits',     { ascending: false, nullsFirst: false })
      .order('round1_points', { ascending: false, nullsFirst: false })
      .order('round2_points', { ascending: false, nullsFirst: false })

    if (data) {
      setLeaderboard(
        data.map((profile, index) => ({
          ...profile,
          rank: index + 1,
          full_hits: 0,
          total_classified_correct: 0,
        })) as LeaderboardEntryV2[]
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard()

    // Realtime: reatualiza o ranking sempre que profiles for atualizado
    // (inclui quando o trigger recalcula total_points após jogo encerrado)
    const channel = supabase
      .channel('leaderboard-realtime-v2')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard()
      })
      // Também ouve predictions para capturar novos is_full_hit / is_partial_hit
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'predictions' }, () => {
        fetchLeaderboard()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { leaderboard, loading, refetch: fetchLeaderboard }
}
