-- ============================================================
-- Migration 009: Trigger de progressão do Bracket
--
-- Cria a function advance_bracket() responsável por preencher
-- automaticamente os times (home/away) nos jogos subsequentes do 
-- mata-mata assim que um resultado é salvo.
--
-- ⚠️ Este arquivo contém APENAS a function.
--    O CREATE TRIGGER será ativado manualmente na Fase 2, 
--    após os 16 avos de final estarem definidos e validados.
-- ============================================================

CREATE OR REPLACE FUNCTION advance_bracket()
RETURNS TRIGGER AS $$
DECLARE
  b RECORD;
  advancing_team TEXT;
  advancing_flag TEXT;
  losing_team TEXT;
  losing_flag TEXT;
BEGIN
  -- Só dispara quando o vencedor do confronto (winner) for preenchido/alterado
  IF NEW.winner IS NULL OR (OLD.winner IS NOT NULL AND OLD.winner = NEW.winner) THEN
    RETURN NEW;
  END IF;

  -- Busca a configuração de progressão deste jogo no bracket
  SELECT * INTO b FROM bracket WHERE match_id = NEW.id;
  IF NOT FOUND THEN 
    RETURN NEW; 
  END IF;

  -- Determina qual time avançou e qual perdeu baseado no winner ('home' ou 'away')
  IF NEW.winner = 'home' THEN
    advancing_team := NEW.home_team;
    advancing_flag := NEW.home_team_flag;
    losing_team    := NEW.away_team;
    losing_flag    := NEW.away_team_flag;
  ELSE
    advancing_team := NEW.away_team;
    advancing_flag := NEW.away_team_flag;
    losing_team    := NEW.home_team;
    losing_flag    := NEW.home_team_flag;
  END IF;

  -- Preenche o slot do time vencedor no próximo jogo
  IF b.next_match_id IS NOT NULL THEN
    IF b.next_match_slot = 'home' THEN
      UPDATE matches 
      SET home_team = advancing_team,
          home_team_flag = advancing_flag
      WHERE id = b.next_match_id;
    ELSE
      UPDATE matches 
      SET away_team = advancing_team,
          away_team_flag = advancing_flag
      WHERE id = b.next_match_id;
    END IF;
  END IF;

  -- Preenche o slot do time perdedor na disputa de 3º lugar (aplicável apenas para Semifinais)
  IF b.loser_match_id IS NOT NULL THEN
    IF b.loser_match_slot = 'home' THEN
      UPDATE matches 
      SET home_team = losing_team,
          home_team_flag = losing_flag
      WHERE id = b.loser_match_id;
    ELSE
      UPDATE matches 
      SET away_team = losing_team,
          away_team_flag = losing_flag
      WHERE id = b.loser_match_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ⛔  CREATE TRIGGER OMITIDO INTENCIONALMENTE
--     Ativação manual na Fase 2 (junto com os triggers de pontuação):
--
--  CREATE TRIGGER on_match_result_advance_bracket
--    AFTER UPDATE ON matches
--    FOR EACH ROW EXECUTE FUNCTION advance_bracket();
-- ============================================================
