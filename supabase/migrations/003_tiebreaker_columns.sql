-- ============================================================
-- Migration 003: Critérios de Desempate
-- Adiciona draw_hits, round1_points, round2_points em profiles
-- Faz backfill dos dados já existentes sem perder nenhuma info
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. Adicionar colunas (seguro: IF NOT EXISTS evita erro se
--    já existirem de uma execução anterior)
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS draw_hits    INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS round1_points INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS round2_points INTEGER DEFAULT 0 NOT NULL;

-- ============================================================
-- 2. BACKFILL — Recalcular a partir das predictions existentes
--    Garante que usuários que já jogaram não perdem posição
-- ============================================================
UPDATE profiles p
SET
  draw_hits = (
    SELECT COUNT(*)
    FROM predictions pr
    JOIN matches m ON m.id = pr.match_id
    WHERE pr.user_id = p.id
      AND m.is_finished = TRUE
      AND m.home_score IS NOT NULL
      AND m.away_score IS NOT NULL
      -- Resultado real foi empate
      AND m.home_score = m.away_score
      -- Usuário chutou empate
      AND pr.predicted_home_score = pr.predicted_away_score
  ),
  round1_points = (
    SELECT COALESCE(SUM(pr.points_earned), 0)
    FROM predictions pr
    JOIN matches m ON m.id = pr.match_id
    WHERE pr.user_id = p.id
      AND m.round = 1
  ),
  round2_points = (
    SELECT COALESCE(SUM(pr.points_earned), 0)
    FROM predictions pr
    JOIN matches m ON m.id = pr.match_id
    WHERE pr.user_id = p.id
      AND m.round = 2
  );

-- ============================================================
-- 3. Atualizar trigger recalculate_match_predictions
--    para manter draw_hits, round1_points e round2_points
--    sempre atualizados quando um jogo é encerrado
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_match_predictions()
RETURNS TRIGGER AS $$
DECLARE
  v_pred        RECORD;
  v_points      INTEGER;
  v_real_result TEXT;
  v_pred_result TEXT;
BEGIN

  -- --------------------------------------------------------
  -- Caso A: Jogo encerrado com resultado → calcular pontos
  -- --------------------------------------------------------
  IF NEW.is_finished = TRUE AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN

    -- Resultado real
    IF NEW.home_score > NEW.away_score THEN
      v_real_result := 'home';
    ELSIF NEW.away_score > NEW.home_score THEN
      v_real_result := 'away';
    ELSE
      v_real_result := 'draw';
    END IF;

    -- Iterar sobre cada prediction deste jogo
    FOR v_pred IN
      SELECT * FROM predictions WHERE match_id = NEW.id
    LOOP
      -- Resultado palpitado
      IF v_pred.predicted_home_score > v_pred.predicted_away_score THEN
        v_pred_result := 'home';
      ELSIF v_pred.predicted_away_score > v_pred.predicted_home_score THEN
        v_pred_result := 'away';
      ELSE
        v_pred_result := 'draw';
      END IF;

      -- Calcular pontos desta prediction
      IF v_real_result = 'draw' AND v_pred_result = 'draw' THEN
        v_points := 10;
      ELSIF v_real_result != 'draw' AND v_pred_result = v_real_result THEN
        v_points := 5;
      ELSE
        v_points := 0;
      END IF;

      -- Atualizar prediction
      UPDATE predictions
        SET points_earned = v_points
      WHERE id = v_pred.id;

      -- Atualizar todos os campos do profile de uma vez
      UPDATE profiles
      SET
        -- Pontuação total
        total_points = (
          SELECT COALESCE(SUM(points_earned), 0)
          FROM predictions
          WHERE user_id = v_pred.user_id
        ),
        -- Empates acertados (recalcula do zero para ser preciso)
        draw_hits = (
          SELECT COUNT(*)
          FROM predictions pr
          JOIN matches m ON m.id = pr.match_id
          WHERE pr.user_id = v_pred.user_id
            AND m.is_finished = TRUE
            AND m.home_score IS NOT NULL
            AND m.away_score IS NOT NULL
            AND m.home_score = m.away_score
            AND pr.predicted_home_score = pr.predicted_away_score
        ),
        -- Pontos na rodada 1
        round1_points = (
          SELECT COALESCE(SUM(pr.points_earned), 0)
          FROM predictions pr
          JOIN matches m ON m.id = pr.match_id
          WHERE pr.user_id = v_pred.user_id
            AND m.round = 1
        ),
        -- Pontos na rodada 2
        round2_points = (
          SELECT COALESCE(SUM(pr.points_earned), 0)
          FROM predictions pr
          JOIN matches m ON m.id = pr.match_id
          WHERE pr.user_id = v_pred.user_id
            AND m.round = 2
        )
      WHERE id = v_pred.user_id;

    END LOOP;

  -- --------------------------------------------------------
  -- Caso B: Jogo reaberto → zerar pontos das predictions
  -- --------------------------------------------------------
  ELSIF NEW.is_finished = FALSE AND (OLD.is_finished = TRUE OR OLD.home_score IS NOT NULL) THEN

    FOR v_pred IN
      SELECT * FROM predictions WHERE match_id = NEW.id
    LOOP
      UPDATE predictions SET points_earned = 0 WHERE id = v_pred.id;

      -- Recalcular tudo do zero para este usuário
      UPDATE profiles
      SET
        total_points = (
          SELECT COALESCE(SUM(points_earned), 0)
          FROM predictions
          WHERE user_id = v_pred.user_id
        ),
        draw_hits = (
          SELECT COUNT(*)
          FROM predictions pr
          JOIN matches m ON m.id = pr.match_id
          WHERE pr.user_id = v_pred.user_id
            AND m.is_finished = TRUE
            AND m.home_score IS NOT NULL
            AND m.away_score IS NOT NULL
            AND m.home_score = m.away_score
            AND pr.predicted_home_score = pr.predicted_away_score
        ),
        round1_points = (
          SELECT COALESCE(SUM(pr.points_earned), 0)
          FROM predictions pr
          JOIN matches m ON m.id = pr.match_id
          WHERE pr.user_id = v_pred.user_id
            AND m.round = 1
        ),
        round2_points = (
          SELECT COALESCE(SUM(pr.points_earned), 0)
          FROM predictions pr
          JOIN matches m ON m.id = pr.match_id
          WHERE pr.user_id = v_pred.user_id
            AND m.round = 2
        )
      WHERE id = v_pred.user_id;

    END LOOP;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- O trigger já existe (criado em 002), a função foi substituída acima.
-- Caso precise recriar o trigger:
DROP TRIGGER IF EXISTS on_match_result_saved ON matches;
CREATE TRIGGER on_match_result_saved
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION recalculate_match_predictions();

-- ============================================================
-- 4. Verificação rápida (opcional — rode para conferir)
-- ============================================================
-- SELECT id, username, total_points, draw_hits, round1_points, round2_points
-- FROM profiles
-- WHERE is_admin = FALSE
-- ORDER BY total_points DESC, draw_hits DESC, round1_points DESC, round2_points DESC;
