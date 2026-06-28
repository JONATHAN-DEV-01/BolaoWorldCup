-- ============================================================
-- Migration 007: View de Ranking com Desempate Mata-Mata v2
-- Cria a view leaderboard_v2 que inclui full_hits e
-- total_classified_correct como critérios de desempate extras.
--
-- A view substitui a query manual no hook useLeaderboard.
-- Os critérios antigos (draw_hits, round1_points, round2_points)
-- ficam preservados nas colunas originais de profiles.
--
-- ⚠️  Execute APENAS em staging/banco de teste.
--     NÃO executar contra produção até autorização explícita.
-- ============================================================

-- ============================================================
-- 1. View: leaderboard_v2
--    Calcula full_hits e total_classified_correct via
--    COUNT(*) FILTER — suportado nativamente no PostgreSQL 9.4+
-- ============================================================
CREATE OR REPLACE VIEW leaderboard_v2 AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.is_admin,
  p.total_points,
  p.draw_hits,
  p.round1_points,
  p.round2_points,
  p.created_at,

  -- Novo critério 1: acertos completos (winner + método corretos)
  COUNT(*) FILTER (
    WHERE pr.is_full_hit = TRUE
  )::INTEGER AS full_hits,

  -- Novo critério 2: qualquer classificado correto (full ou partial)
  COUNT(*) FILTER (
    WHERE pr.is_full_hit = TRUE OR pr.is_partial_hit = TRUE
  )::INTEGER AS total_classified_correct

FROM profiles p
LEFT JOIN predictions pr ON pr.user_id = p.id
WHERE p.is_admin = FALSE
GROUP BY
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.is_admin,
  p.total_points,
  p.draw_hits,
  p.round1_points,
  p.round2_points,
  p.created_at
ORDER BY
  p.total_points              DESC,
  full_hits                   DESC,   -- 1º desempate: mais acertos completos (mata-mata)
  total_classified_correct    DESC,   -- 2º desempate: mais classificados corretos (full+partial)
  p.draw_hits                 DESC,   -- 3º desempate: empates acertados (fase de grupos)
  p.round1_points             DESC,   -- 4º desempate: pontos na Rodada 1
  p.round2_points             DESC,   -- 5º desempate: pontos na Rodada 2
  p.username                  ASC;    -- 6º desempate: alfabético (determinístico)

-- ============================================================
-- 2. RLS na view — herda as políticas de profiles
--    (views não têm RLS própria, mas SELECT é aberto em profiles)
-- ============================================================
-- Não é necessário CREATE POLICY na view.
-- O acesso é controlado pela política "Users can view all profiles".

-- ============================================================
-- 3. Script de teste — simula empate e valida desempate
-- ============================================================

/*
--------------------------------------------------------------
-- Pré-condição: 2 usuários com o mesmo total_points,
--   mas user_A tem mais full_hits que user_B.
--   Esperado: user_A aparece antes na view.
--
-- Substitua <user_id_A> e <user_id_B> por UUIDs reais
-- de usuários de teste no banco de staging.
--------------------------------------------------------------

-- 1. Forçar empate de total_points
UPDATE profiles SET total_points = 50 WHERE id IN ('<user_id_A>', '<user_id_B>');

-- 2. Criar predictions fake de mata-mata para user_A (2 full_hits)
INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score,
                         predicted_winner, predicted_method, is_full_hit, is_partial_hit, points_earned)
VALUES
  ('<user_id_A>', <match_ko_id_1>, 0, 0, 'home', 'penalties', TRUE,  FALSE, 20),
  ('<user_id_A>', <match_ko_id_2>, 0, 0, 'away', 'normal',   TRUE,  FALSE, 20)
ON CONFLICT (user_id, match_id) DO UPDATE
  SET is_full_hit = EXCLUDED.is_full_hit,
      is_partial_hit = EXCLUDED.is_partial_hit,
      points_earned = EXCLUDED.points_earned;

-- 3. Criar predictions fake para user_B (0 full_hits, 1 partial_hit)
INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score,
                         predicted_winner, predicted_method, is_full_hit, is_partial_hit, points_earned)
VALUES
  ('<user_id_B>', <match_ko_id_1>, 0, 0, 'home', 'normal',  FALSE, TRUE,  12)
ON CONFLICT (user_id, match_id) DO UPDATE
  SET is_full_hit = EXCLUDED.is_full_hit,
      is_partial_hit = EXCLUDED.is_partial_hit,
      points_earned = EXCLUDED.points_earned;

-- 4. Verificar ordenação — user_A deve aparecer antes de user_B
SELECT
  username,
  total_points,
  full_hits,
  total_classified_correct,
  CASE
    WHEN username = '<username_A>'
      AND full_hits = 2
      AND total_classified_correct = 2
    THEN '✅ user_A: full_hits correto'
    WHEN username = '<username_B>'
      AND full_hits = 0
      AND total_classified_correct = 1
    THEN '✅ user_B: partial correto'
    ELSE '❌ RESULTADO INESPERADO'
  END AS resultado_teste
FROM leaderboard_v2
WHERE username IN ('<username_A>', '<username_B>')
ORDER BY total_points DESC, full_hits DESC;

-- Deve retornar user_A na primeira linha e user_B na segunda.
-- Se invertido → desempate não está funcionando.
--------------------------------------------------------------
*/
