-- ============================================================
-- SEED BRACKET — Bolão World Cup 2026
-- Chaveamento completo do mata-mata da Copa do Mundo 2026
--
-- Relaciona as progressões dos 32 jogos da fase eliminatória,
-- definindo para onde cada time vencedor (ou perdedor, nas
-- semifinais) avança no torneio.
--
-- ⚠️  Execute APENAS após executar o seed_mata_mata.sql
--     (pois necessita dos matches com IDs 101–132 previamente
--      inseridos).
-- ============================================================

BEGIN;

-- Segurança: evitar inserção duplicada
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM bracket WHERE match_id BETWEEN 101 AND 132) THEN
    RAISE EXCEPTION 'O chaveamento para os IDs 101-132 já existe em bracket.';
  END IF;
END;
$$;

INSERT INTO bracket (
  match_id, next_match_id, next_match_slot, loser_match_id, loser_match_slot
)
VALUES
-- ============================================================
-- 16 AVOS → OITAVAS DE FINAL
-- ============================================================
(101, 117, 'home', null, null),
(102, 117, 'away', null, null),
(103, 118, 'home', null, null),
(105, 118, 'away', null, null),
(104, 119, 'home', null, null),
(106, 119, 'away', null, null),
(107, 120, 'home', null, null),
(108, 120, 'away', null, null),
(109, 121, 'home', null, null),
(110, 121, 'away', null, null),
(111, 122, 'home', null, null),
(112, 122, 'away', null, null),
(113, 123, 'home', null, null),
(114, 123, 'away', null, null),
(115, 124, 'home', null, null),
(116, 124, 'away', null, null),

-- ============================================================
-- OITAVAS DE FINAL → QUARTAS DE FINAL
-- ============================================================
(117, 125, 'home', null, null),
(118, 125, 'away', null, null),
(119, 126, 'home', null, null),
(120, 126, 'away', null, null),
(121, 127, 'home', null, null),
(122, 127, 'away', null, null),
(123, 128, 'home', null, null),
(124, 128, 'away', null, null),

-- ============================================================
-- QUARTAS DE FINAL → SEMIFINAIS
-- ============================================================
(125, 129, 'home', null, null),
(126, 129, 'away', null, null),
(127, 130, 'home', null, null),
(128, 130, 'away', null, null),

-- ============================================================
-- SEMIFINAIS → FINAL & DISPUTA DE 3º LUGAR
-- ============================================================
-- Vencedores vão para a Final (132), Perdedores para Disputa 3º (131)
(129, 132, 'home', 131, 'home'),
(130, 132, 'away', 131, 'away'),

-- ============================================================
-- FINS DE LINHA (Disputa de 3º e Final)
-- ============================================================
-- Sem destinos seguintes
(131, null, null, null, null),
(132, null, null, null, null);

COMMIT;

-- ============================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ============================================================
-- SELECT
--   b.match_id AS origem,
--   m1.round AS fase_origem,
--   b.next_match_id AS destino_vencedor,
--   b.next_match_slot AS slot_vencedor,
--   b.loser_match_id AS destino_perdedor,
--   b.loser_match_slot AS slot_perdedor
-- FROM bracket b
-- JOIN matches m1 ON m1.id = b.match_id
-- ORDER BY b.match_id;
