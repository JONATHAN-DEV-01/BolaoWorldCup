-- ============================================================
-- Migration 005: Colunas Mata-Mata v2
-- SOMENTE ADITIVA — nenhuma coluna existente é removida ou
-- renomeada. Colunas da fase de grupos (predicted_home_score,
-- predicted_away_score, home_score, away_score, etc.) ficam
-- 100% intactas para não afetar os 33 usuários ativos.
--
-- ⚠️  Execute APENAS em staging/banco de teste.
--     NÃO executar contra produção até autorização explícita.
-- ============================================================

-- ============================================================
-- 1. Tabela matches — visibilidade e resultado do mata-mata
-- ============================================================
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS is_hidden     BOOLEAN DEFAULT FALSE,
  -- Quem se classificou: 'home' ou 'away'
  ADD COLUMN IF NOT EXISTS winner        TEXT,
  -- Como o jogo foi decidido: 'normal', 'extra_time' ou 'penalties'
  ADD COLUMN IF NOT EXISTS match_method  TEXT;

-- Constraint: garante apenas valores válidos (ou NULL)
ALTER TABLE matches
  ADD CONSTRAINT chk_matches_winner
    CHECK (winner IS NULL OR winner IN ('home', 'away')),
  ADD CONSTRAINT chk_matches_match_method
    CHECK (match_method IS NULL OR match_method IN ('normal', 'extra_time', 'penalties'));

-- ============================================================
-- 2. Tabela predictions — palpites e resultado do mata-mata
--    As colunas predicted_home_score e predicted_away_score
--    NÃO são tocadas — continuam armazenando dados da fase
--    de grupos normalmente.
-- ============================================================
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS predicted_winner   TEXT,
  ADD COLUMN IF NOT EXISTS predicted_method   TEXT,
  -- Acertou classificado + método (mata-mata full hit = 20 pts)
  ADD COLUMN IF NOT EXISTS is_full_hit        BOOLEAN DEFAULT FALSE,
  -- Acertou apenas o classificado (mata-mata partial hit = 12 pts)
  ADD COLUMN IF NOT EXISTS is_partial_hit     BOOLEAN DEFAULT FALSE;

-- Constraints: garante apenas valores válidos (ou NULL)
ALTER TABLE predictions
  ADD CONSTRAINT chk_predictions_predicted_winner
    CHECK (predicted_winner IS NULL OR predicted_winner IN ('home', 'away')),
  ADD CONSTRAINT chk_predictions_predicted_method
    CHECK (predicted_method IS NULL OR predicted_method IN ('normal', 'extra_time', 'penalties'));

-- ============================================================
-- 3. Verificação — rode para confirmar as colunas criadas
-- ============================================================
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name IN ('matches', 'predictions')
--   AND column_name IN (
--     'is_hidden', 'winner', 'match_method',
--     'predicted_winner', 'predicted_method',
--     'is_full_hit', 'is_partial_hit'
--   )
-- ORDER BY table_name, column_name;
