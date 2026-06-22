import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LeaderboardEntry } from '../types'

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', false)
      .order('total_points', { ascending: false, nullsFirst: false })
      .order('draw_hits', { ascending: false, nullsFirst: false })
      .order('round1_points', { ascending: false, nullsFirst: false })
      .order('round2_points', { ascending: false, nullsFirst: false })
    if (data) {
      setLeaderboard(
        data.map((profile, index) => ({ ...profile, rank: index + 1 })) as LeaderboardEntry[]
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard()

    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { leaderboard, loading, refetch: fetchLeaderboard }
}
