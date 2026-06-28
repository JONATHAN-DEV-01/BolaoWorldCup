-- ============================================================
-- Migration 008: Tabela bracket — Chaveamento do Mata-Mata v2
--
-- Armazena o mapeamento entre jogos:
--   · match_id        → jogo que esta linha representa
--   · next_match_id   → jogo para onde o VENCEDOR avança
--   · next_match_slot → 'home' ou 'away' no próximo jogo
--   · loser_match_id  → jogo da disputa de 3º (só semifinais)
--   · loser_match_slot→ slot do PERDEDOR na disputa de 3º
--
-- Mapeamento de rounds:
--   round = 4 → "16 avos de Final"    (16 jogos, IDs 101–116)
--   round = 5 → "Oitavas de Final"    ( 8 jogos, IDs 117–124)
--   round = 6 → "Quartas de Final"    ( 4 jogos, IDs 125–128)
--   round = 7 → "Semifinal"           ( 2 jogos, IDs 129–130)
--   round = 8 → "Disputa de 3º Lugar" ( 1 jogo,  ID  131)
--   round = 9 → "Final"               ( 1 jogo,  ID  132)
--
-- ⚠️  Execute APENAS em staging/banco de teste.
--     NÃO executar contra produção até autorização explícita.
--
-- PRÉ-REQUISITO: seed_mata_mata_v2.sql deve ser executado antes
--   (insere matches com IDs fixos 101–132 que o bracket referencia).
-- ============================================================

-- ============================================================
-- 1. Tabela bracket
-- ============================================================
CREATE TABLE IF NOT EXISTS bracket (
  id               SERIAL PRIMARY KEY,

  -- Jogo que esta linha representa
  match_id         INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,

  -- Jogo para onde o VENCEDOR vai (NULL = Final ou Disputa 3º — destino final)
  next_match_id    INTEGER REFERENCES matches(id) ON DELETE SET NULL,

  -- Slot do vencedor no próximo jogo
  next_match_slot  TEXT CHECK (next_match_slot IN ('home', 'away')),

  -- Jogo da disputa de 3º lugar (somente para semifinais — IDs 129, 130)
  loser_match_id   INTEGER REFERENCES matches(id) ON DELETE SET NULL,

  -- Slot do perdedor na disputa de 3º
  loser_match_slot TEXT CHECK (loser_match_slot IN ('home', 'away')),

  -- Cada jogo aparece exatamente uma vez no bracket
  CONSTRAINT uq_bracket_match UNIQUE (match_id),

  -- Se next_match_slot está preenchido, next_match_id também deve estar
  CONSTRAINT chk_next_slot_requires_id
    CHECK (next_match_slot IS NULL OR next_match_id IS NOT NULL),

  -- Se loser_match_slot está preenchido, loser_match_id também deve estar
  CONSTRAINT chk_loser_slot_requires_id
    CHECK (loser_match_slot IS NULL OR loser_match_id IS NOT NULL)
);

-- ============================================================
-- 2. Índices para performance (lookup por match_id é o caso quente)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bracket_match_id       ON bracket(match_id);
CREATE INDEX IF NOT EXISTS idx_bracket_next_match_id  ON bracket(next_match_id);

-- ============================================================
-- 3. Comentários descritivos
-- ============================================================
COMMENT ON TABLE  bracket IS
  'Chaveamento do mata-mata da Copa 2026: define a progressão entre jogos';
COMMENT ON COLUMN bracket.match_id IS
  'ID do jogo que esta linha representa (FK → matches.id)';
COMMENT ON COLUMN bracket.next_match_id IS
  'ID do jogo para onde o vencedor avança (NULL = jogo é destino final)';
COMMENT ON COLUMN bracket.next_match_slot IS
  '''home'' ou ''away'': slot do vencedor no próximo jogo';
COMMENT ON COLUMN bracket.loser_match_id IS
  'ID do jogo da disputa de 3º lugar (somente para semifinais 129 e 130)';
COMMENT ON COLUMN bracket.loser_match_slot IS
  '''home'' ou ''away'': slot do perdedor na disputa de 3º';

-- ============================================================
-- 4. Row Level Security
-- ============================================================
ALTER TABLE bracket ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ler (bracket é público no contexto do bolão)
CREATE POLICY "bracket_select_authenticated"
  ON bracket FOR SELECT
  TO authenticated
  USING (true);

-- Apenas service_role escreve via migrations/seeds (sem policy de INSERT para anon)

-- ============================================================
-- 5. Verificação — rode para confirmar estrutura criada
-- ============================================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'bracket'
-- ORDER BY ordinal_position;
