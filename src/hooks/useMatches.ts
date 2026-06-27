import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Match } from '../types'

// ----------------------------------------------------------------
// useMatches — carrega jogos por round (fase de grupos / admin)
// ----------------------------------------------------------------
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

// ----------------------------------------------------------------
// Utilitário: aplica filtro is_hidden = false com fallback gracioso
//
// Estratégia:
//  1. Tenta com .eq('is_hidden', false) — filtro correto pós-005
//  2. Se a coluna ainda não existir (erro de schema), refaz a
//     query sem o filtro (round >= 4 já blinda contra fase de grupos)
//
// Retorna { data, fromFallback }
// ----------------------------------------------------------------
async function queryWithHiddenFilter(
  baseQuery: ReturnType<ReturnType<typeof supabase.from>['select']>
): Promise<{ data: Match[] | null; fromFallback: boolean }> {
  // Tentativa 1: filtro explícito is_hidden = false (pós-migration 005)
  const { data, error } = await (baseQuery as any).eq('is_hidden', false)

  if (!error) return { data: data as Match[], fromFallback: false }

  // Fallback: coluna ainda não existe — log de aviso e retorna sem filtro
  console.warn(
    '[useKnockoutMatches] Coluna is_hidden não encontrada, ' +
    'usando fallback sem filtro (round >= 4 protege). ' +
    'Execute migration 005 para ativar o filtro completo. ' +
    `Detalhe: ${error.message}`
  )

  const { data: fallback, error: fallbackErr } = await (baseQuery as any)
  if (fallbackErr) return { data: null, fromFallback: true }
  return { data: fallback as Match[], fromFallback: true }
}

// ----------------------------------------------------------------
// useKnockoutMatches — busca jogos do mata-mata (round >= 4)
//
// Filtros aplicados:
//   · round >= 4  — só mata-mata
//   · is_hidden = false — exclui fase de grupos quando flag ativada
//     (com fallback gracioso se a coluna ainda não existir)
//
// Inclui Realtime subscription na tabela matches para:
//   · Auto-refresh quando admin insere novos jogos do mata-mata
//   · Auto-refresh quando admin ativa is_hidden nos jogos da fase
//     de grupos (elimina a "janela de minutos" de tela vazia)
// ----------------------------------------------------------------
export function useKnockoutMatches(activeRound: number | undefined) {
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Indica se a migration 005 ainda não foi aplicada (coluna ausente)
  const [usingFallback, setUsingFallback] = useState(false)

  // ── Busca todos os rounds do mata-mata ──────────────────────
  const fetchAll = useCallback(async () => {
    const baseQuery = supabase
      .from('matches')
      .select('*')
      .gte('round', 4)
      .order('match_date', { ascending: true })

    const { data, fromFallback } = await queryWithHiddenFilter(baseQuery)
    setUsingFallback(fromFallback)
    if (data) setAllMatches(data)
  }, [])

  // ── Busca apenas o round ativo ──────────────────────────────
  const fetchRound = useCallback(async (round: number) => {
    setLoading(true)
    const baseQuery = supabase
      .from('matches')
      .select('*')
      .eq('round', round)
      .order('match_date', { ascending: true })

    const { data, fromFallback } = await queryWithHiddenFilter(baseQuery)
    setUsingFallback(fromFallback)
    if (data) {
      setMatches(data)
    } else {
      setError('Erro ao carregar jogos desta fase.')
    }
    setLoading(false)
  }, [])

  // ── Carrega allMatches uma vez na montagem ──────────────────
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Carrega o round ativo sempre que ele muda ───────────────
  useEffect(() => {
    if (activeRound !== undefined) {
      fetchRound(activeRound)
    }
  }, [activeRound, fetchRound])

  // ── Realtime: escuta INSERT/UPDATE/DELETE em matches ────────
  // Garante auto-refresh sem o usuário precisar recarregar a página:
  //   · Admin insere jogo do mata-mata → novas abas aparecem
  //   · Admin ativa is_hidden em jogos da fase de grupos →
  //     página atualiza e mostra estado "confrontos em breve"
  //   · Admin preenche winner/match_method → cards atualizam
  useEffect(() => {
    const channel = supabase
      .channel('knockout-matches-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          // Só re-busca se o evento envolve um jogo de mata-mata
          // (round >= 4) ou um jogo que está sendo ocultado (is_hidden)
          const row = (payload.new ?? payload.old) as Partial<Match>
          const isKnockout = (row?.round ?? 0) >= 4
          const isHiddenChange =
            payload.eventType === 'UPDATE' &&
            (payload.new as Match)?.is_hidden !== (payload.old as Match)?.is_hidden

          if (isKnockout || isHiddenChange) {
            fetchAll()
            if (activeRound !== undefined) fetchRound(activeRound)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeRound, fetchAll, fetchRound])

  return {
    matches,      // jogos do round ativo (filtrados por is_hidden)
    allMatches,   // todos os rounds >= 4 (para abas + aba inicial)
    loading,
    error,
    usingFallback, // true se migration 005 ainda não aplicada
    refetch: () => {
      fetchAll()
      if (activeRound !== undefined) fetchRound(activeRound)
    },
  }
}
