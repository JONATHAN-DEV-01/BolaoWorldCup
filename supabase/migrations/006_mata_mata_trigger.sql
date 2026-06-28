-- ============================================================
-- Migration 006: Functions de Pontuação — Mata-Mata v2
-- ⚠️  Este arquivo contém APENAS as functions.
--     Os CREATE TRIGGER serão ativados manualmente na Fase 2,
--     após validação em staging.
--
-- ⚠️  Execute APENAS em staging/banco de teste.
--     NÃO executar contra produção até autorização explícita.
-- ============================================================

-- ============================================================
-- Pré-requisito: predictions precisa de updated_at para que
-- recalculate_on_result() possa disparar o trigger row-level.
-- ADD COLUMN IF NOT EXISTS é idempotente — seguro reexecutar.
-- ============================================================
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================
-- FUNCTION 1: calculate_knockout_points()
-- Disparo: BEFORE INSERT OR UPDATE ON predictions
-- Responsabilidade:
--   · Calcular pontos do mata-mata (20 / 12 / 0)
--   · Atualizar is_full_hit / is_partial_hit na row
--   · Atualizar total_points no perfil do usuário
--   · Pular silenciosamente palpites da fase de grupos
--     (predicted_winner IS NULL) — não sobrescreve pontuação antiga
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_knockout_points()
RETURNS TRIGGER AS $$
DECLARE
  real_winner  TEXT;
  real_method  TEXT;
  v_round      INTEGER;
  v_points     INTEGER := 0;
  v_full_hit   BOOLEAN := FALSE;
  v_partial    BOOLEAN := FALSE;
BEGIN

  -- Busca resultado oficial e round do jogo
  SELECT m.winner, m.match_method, m.round
    INTO real_winner, real_method, v_round
    FROM matches m
   WHERE m.id = NEW.match_id;

  -- Só processa jogos de mata-mata (round >= 4)
  IF v_round IS NULL OR v_round < 4 THEN
    RETURN NEW;
  END IF;

  -- Resultado oficial ainda não preenchido → não calcula
  IF real_winner IS NULL THEN
    RETURN NEW;
  END IF;

  -- Palpite sem predicted_winner = palpite da fase de grupos
  -- → sai sem alterar nada (protege pontuação existente)
  IF NEW.predicted_winner IS NULL THEN
    RETURN NEW;
  END IF;

  -- --------------------------------------------------------
  -- Regras de pontuação
  -- --------------------------------------------------------
  IF NEW.predicted_winner = real_winner THEN
    IF NEW.predicted_method IS NOT NULL
       AND NEW.predicted_method = real_method THEN
      -- Acerto Completo: classificado + método corretos
      v_points   := 20;
      v_full_hit := TRUE;
    ELSE
      -- Acerto Parcial: classificado correto, método errado ou nulo
      v_points  := 12;
      v_partial := TRUE;
    END IF;
  ELSE
    -- Erro: classificado errado
    v_points := 0;
  END IF;

  -- Aplica na própria row (BEFORE trigger → NEW é mutável)
  NEW.points_earned  := v_points;
  NEW.is_full_hit    := v_full_hit;
  NEW.is_partial_hit := v_partial;

  -- Atualiza total_points no perfil:
  --   soma todas as predictions deste usuário, exceto a atual
  --   (que ainda não foi gravada), e adiciona os novos pontos.
  UPDATE profiles
     SET total_points = (
           SELECT COALESCE(SUM(points_earned), 0)
             FROM predictions
            WHERE user_id = NEW.user_id
              AND id != NEW.id
         ) + v_points
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION 2: recalculate_on_result()
-- Disparo: AFTER UPDATE ON matches
-- Responsabilidade:
--   · Detectar quando admin preenche winner / match_method
--   · Tocar updated_at de cada prediction do jogo que tenha
--     predicted_winner preenchido, disparando o trigger
--     calculate_knockout_points em cascata (sem loop no frontend)
--
-- Observação: o UPDATE em predictions.updated_at dispara o
-- trigger on_knockout_prediction_scored (Fase 2) para cada
-- row, recalculando pontos automaticamente.
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_on_result()
RETURNS TRIGGER AS $$
BEGIN

  -- ── Caso 1: Resultado salvo ou corrigido pelo admin ──────────
  -- Dispara quando winner é preenchido pela primeira vez,
  -- ou quando winner / match_method mudam (correção).
  IF NEW.winner IS NOT NULL AND (
    OLD.winner IS NULL OR
    OLD.winner      IS DISTINCT FROM NEW.winner OR
    OLD.match_method IS DISTINCT FROM NEW.match_method
  ) THEN
    -- Touch em updated_at → dispara calculate_knockout_points
    -- (BEFORE UPDATE) em cada prediction afetada em cascata.
    UPDATE predictions
       SET updated_at = NOW()
     WHERE match_id = NEW.id
       AND predicted_winner IS NOT NULL;

  -- ── Caso 2: Resultado apagado / jogo reaberto pelo admin ─────
  -- Dispara quando winner volta a NULL (admin limpou o resultado)
  -- ou quando is_finished vai de TRUE para FALSE (reabertura).
  ELSIF (OLD.winner IS NOT NULL AND NEW.winner IS NULL)
     OR (OLD.is_finished = TRUE AND NEW.is_finished = FALSE) THEN

    -- Zera flags e pontos do mata-mata para este jogo
    UPDATE predictions
       SET is_full_hit    = false,
           is_partial_hit = false,
           points_earned  = 0
     WHERE match_id = NEW.id
       AND predicted_winner IS NOT NULL;

    -- Recalcula total_points de cada usuário afetado (soma do zero)
    UPDATE profiles p
       SET total_points = (
             SELECT COALESCE(SUM(pr.points_earned), 0)
               FROM predictions pr
              WHERE pr.user_id = p.id
           )
     WHERE p.id IN (
       SELECT DISTINCT user_id
         FROM predictions
        WHERE match_id = NEW.id
          AND predicted_winner IS NOT NULL
     );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ⛔  CREATE TRIGGER OMITIDO INTENCIONALMENTE
--     Ativação manual na Fase 2 (após validação em staging):
--
--  -- Trigger 1: pontua cada palpite ao salvar/atualizar
--  CREATE TRIGGER on_knockout_prediction_scored
--    BEFORE INSERT OR UPDATE ON predictions
--    FOR EACH ROW EXECUTE FUNCTION calculate_knockout_points();
--
--  -- Trigger 2: recalcula todos ao admin preencher resultado
--  CREATE TRIGGER on_match_result_knockout
--    AFTER UPDATE ON matches
--    FOR EACH ROW EXECUTE FUNCTION recalculate_on_result();
-- ============================================================

-- ============================================================
-- SCRIPT DE TESTE ISOLADO EM STAGING
-- Execute bloco a bloco no SQL Editor do projeto de teste.
-- Cobre os 3 cenários: acerto completo, parcial e erro.
-- ============================================================

/*
--------------------------------------------------------------
-- 0. Limpeza prévia (caso re-execute)
--------------------------------------------------------------
DELETE FROM predictions WHERE match_id IN (
  SELECT id FROM matches WHERE group_name = '__TEST_KO__'
);
DELETE FROM matches WHERE group_name = '__TEST_KO__';

--------------------------------------------------------------
-- 1. Jogo fake de mata-mata (round = 4)
--------------------------------------------------------------
INSERT INTO matches (
  group_name, home_team, away_team,
  home_team_flag, away_team_flag,
  match_date, round,
  winner, match_method, is_finished
) VALUES (
  '__TEST_KO__', 'Brasil', 'Argentina',
  '🇧🇷', '🇦🇷',
  NOW(), 4,
  'home', 'penalties', TRUE
) RETURNING id;
-- Anote o id retornado como <match_id>

--------------------------------------------------------------
-- 2a. Acerto Completo (esperado: 20 pts, is_full_hit = true)
--------------------------------------------------------------
INSERT INTO predictions (
  user_id, match_id,
  predicted_home_score, predicted_away_score,
  predicted_winner, predicted_method
) VALUES (
  '<user_id_teste>', <match_id>,
  0, 0,
  'home', 'penalties'   -- bate exato com winner + match_method
);

--------------------------------------------------------------
-- 2b. Acerto Parcial (esperado: 12 pts, is_partial_hit = true)
--------------------------------------------------------------
INSERT INTO predictions (
  user_id, match_id,
  predicted_home_score, predicted_away_score,
  predicted_winner, predicted_method
) VALUES (
  '<user_id_teste_2>', <match_id>,
  0, 0,
  'home', 'extra_time'  -- winner certo, método errado
);

--------------------------------------------------------------
-- 2c. Erro (esperado: 0 pts, ambos false)
--------------------------------------------------------------
INSERT INTO predictions (
  user_id, match_id,
  predicted_home_score, predicted_away_score,
  predicted_winner, predicted_method
) VALUES (
  '<user_id_teste_3>', <match_id>,
  0, 0,
  'away', 'normal'      -- winner errado
);

--------------------------------------------------------------
-- 3. Verificação — deve retornar 3 linhas com valores corretos
--------------------------------------------------------------
SELECT
  p.user_id,
  p.predicted_winner,
  p.predicted_method,
  p.points_earned,
  p.is_full_hit,
  p.is_partial_hit,
  CASE
    WHEN p.points_earned = 20 AND p.is_full_hit    = TRUE  AND p.is_partial_hit = FALSE THEN '✅ Acerto Completo OK'
    WHEN p.points_earned = 12 AND p.is_full_hit    = FALSE AND p.is_partial_hit = TRUE  THEN '✅ Acerto Parcial OK'
    WHEN p.points_earned =  0 AND p.is_full_hit    = FALSE AND p.is_partial_hit = FALSE THEN '✅ Erro OK'
    ELSE '❌ RESULTADO INESPERADO'
  END AS resultado_teste
FROM predictions p
WHERE p.match_id = <match_id>
ORDER BY p.points_earned DESC;

--------------------------------------------------------------
-- 4. Verificar total_points atualizado nos profiles
--------------------------------------------------------------
SELECT pr.id, pr.username, pr.total_points
FROM profiles pr
WHERE pr.id IN (
  '<user_id_teste>', '<user_id_teste_2>', '<user_id_teste_3>'
);

--------------------------------------------------------------
-- 5. Teste de recalculate_on_result (após ativar triggers Fase 2):
--    Mudar match_method → todas as predictions devem ser recalculadas
--------------------------------------------------------------
-- UPDATE matches SET match_method = 'extra_time'
-- WHERE group_name = '__TEST_KO__';
--
-- Verificar novamente com a query do passo 3 acima.
-- is_full_hit do usuário 2a deve virar TRUE (20 pts) e
-- is_partial_hit do usuário 2b deve virar FALSE (12→0 pts).
--------------------------------------------------------------
*/
