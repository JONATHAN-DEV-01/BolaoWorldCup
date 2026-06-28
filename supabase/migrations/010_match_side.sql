-- 010_match_side.sql
-- Adiciona coluna side para identificar Lado A / Lado B do chaveamento
-- Aditiva: não remove nem altera nenhuma coluna existente
--
-- Valores possíveis:
--   'A'  → jogo pertence ao Lado A do chaveamento (rounds 4–6)
--   'B'  → jogo pertence ao Lado B do chaveamento (rounds 4–6)
--   NULL → sem lado (Semifinal, Disputa de 3º, Final)
--
-- ⚠️  Execute APENAS em staging/banco de teste.
--     NÃO executar contra produção até autorização explícita.
--     DEVE rodar ANTES do seed_mata_mata.sql (que insere valores na coluna).

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS side TEXT CHECK (side IN ('A', 'B'));

-- side = NULL é válido (semifinal, disputa 3º, final não têm lado)
-- Constraint só aceita 'A', 'B' ou NULL

COMMENT ON COLUMN matches.side IS
  '''A'' = Chave A do chaveamento, ''B'' = Chave B. NULL para Semifinal, Disputa 3º e Final.';

-- Verificação pós-execução:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'matches' AND column_name = 'side';
