import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Match } from '../types'

export function useMatches(round?: number) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = async () => {
    setLoading(true)
    let query = supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true })

    if (round !== undefined) {
      query = query.eq('round', round)
    }

    const { data, error } = await query
    if (error) setError(error.message)
    else setMatches(data as Match[])
    setLoading(false)
  }

  useEffect(() => {
    fetchMatches()
  }, [round])

  return { matches, loading, error, refetch: fetchMatches }
}
