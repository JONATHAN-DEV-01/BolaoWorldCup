import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Prediction, KnockoutWinner, KnockoutMethod } from '../types'

export function usePredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPredictions = async (silent = false) => {
    if (!user) return
    if (!silent) setLoading(true)
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
    setPredictions((data as Prediction[]) ?? [])
    if (!silent) setLoading(false)
  }

  useEffect(() => {
    fetchPredictions()
  }, [user])

  const savePrediction = async (matchId: number, homeScore: number, awayScore: number) => {
    if (!user) throw new Error('Não autenticado')
    const { error } = await supabase.from('predictions').insert({
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: homeScore,
      predicted_away_score: awayScore,
    })
    if (error) throw error
    await fetchPredictions(true) // silent: não faz a tela recarregar
  }

  const saveKnockoutPrediction = async (
    matchId: number,
    winner: KnockoutWinner,
    method: KnockoutMethod | null,
  ) => {
    if (!user) throw new Error('Não autenticado')
    const { error } = await supabase.from('predictions').upsert(
      {
        user_id: user.id,
        match_id: matchId,
        // Fase de grupos exige NOT NULL — usamos 0 como sentinela
        // (o trigger ignora predicted_winner NULL, que aqui é sempre preenchido)
        predicted_home_score: 0,
        predicted_away_score: 0,
        predicted_winner: winner,
        predicted_method: method,
      },
      { onConflict: 'user_id,match_id' },
    )
    if (error) throw error
    await fetchPredictions(true)
  }

  const getPrediction = (matchId: number): Prediction | null => {
    return predictions.find(p => p.match_id === matchId) ?? null
  }

  const refetch = () => fetchPredictions(false)
  const refetchSilent = () => fetchPredictions(true)

  return { predictions, loading, savePrediction, saveKnockoutPrediction, getPrediction, refetch, refetchSilent }
}
