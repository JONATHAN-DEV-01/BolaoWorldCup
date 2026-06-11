-- ============================================================
-- Migration 002: Fix admin points calculation
-- Problema: RLS bloqueia admin de atualizar predictions de outros usuários
-- Solução: policy para admin + trigger que recalcula ao salvar resultado
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Permitir que admin atualize qualquer prediction (para calcular pontos)
DROP POLICY IF EXISTS "Admin can update any prediction" ON predictions;
CREATE POLICY "Admin can update any prediction" ON predictions
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 2. Permitir que admin atualize qualquer profile (total_points)
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR auth.uid() = id
  );

-- 3. Função que recalcula pontos de TODAS as predictions de um jogo
--    chamada pelo trigger quando o resultado do jogo é salvo
CREATE OR REPLACE FUNCTION recalculate_match_predictions()
RETURNS TRIGGER AS $$
DECLARE
  v_pred RECORD;
  v_points INTEGER;
  v_real_result TEXT;
  v_pred_result TEXT;
BEGIN
  -- Só recalcula quando o jogo for marcado como encerrado com resultado
  IF NEW.is_finished = TRUE AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN

    -- Determinar resultado real
    IF NEW.home_score > NEW.away_score THEN v_real_result := 'home';
    ELSIF NEW.away_score > NEW.home_score THEN v_real_result := 'away';
    ELSE v_real_result := 'draw';
    END IF;

    -- Atualizar pontos de cada prediction deste jogo
    FOR v_pred IN
      SELECT * FROM predictions WHERE match_id = NEW.id
    LOOP
      -- Determinar resultado palpitado
      IF v_pred.predicted_home_score > v_pred.predicted_away_score THEN v_pred_result := 'home';
      ELSIF v_pred.predicted_away_score > v_pred.predicted_home_score THEN v_pred_result := 'away';
      ELSE v_pred_result := 'draw';
      END IF;

      -- Calcular pontos
      IF v_real_result = 'draw' AND v_pred_result = 'draw' THEN
        v_points := 10;
      ELSIF v_real_result != 'draw' AND v_pred_result = v_real_result THEN
        v_points := 5;
      ELSE
        v_points := 0;
      END IF;

      -- Atualizar prediction
      UPDATE predictions SET points_earned = v_points WHERE id = v_pred.id;

      -- Atualizar total_points do usuário
      UPDATE profiles
      SET total_points = (
        SELECT COALESCE(SUM(points_earned), 0)
        FROM predictions
        WHERE user_id = v_pred.user_id
      )
      WHERE id = v_pred.user_id;

    END LOOP;

  -- Se o jogo foi reaberto (is_finished = false), zerar os pontos
  ELSIF NEW.is_finished = FALSE AND (OLD.is_finished = TRUE OR OLD.home_score IS NOT NULL) THEN

    FOR v_pred IN
      SELECT * FROM predictions WHERE match_id = NEW.id
    LOOP
      UPDATE predictions SET points_earned = 0 WHERE id = v_pred.id;

      UPDATE profiles
      SET total_points = (
        SELECT COALESCE(SUM(points_earned), 0)
        FROM predictions
        WHERE user_id = v_pred.user_id
      )
      WHERE id = v_pred.user_id;
    END LOOP;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger na tabela matches
DROP TRIGGER IF EXISTS on_match_result_saved ON matches;
CREATE TRIGGER on_match_result_saved
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION recalculate_match_predictions();
