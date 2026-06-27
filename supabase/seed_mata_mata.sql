-- ============================================================
-- SEED MATA-MATA v2 — Bolão World Cup 2026
-- 32 jogos do mata-mata com IDs FIXOS E EXPLÍCITOS (101–132)
-- IDs fixos são OBRIGATÓRIOS para que a tabela bracket possa
-- referenciar os jogos com precisão.
--
-- ⚠️  NÃO executar contra produção antes do dia 28/06.
--     Os confrontos reais só são confirmados após o
--     encerramento da fase de grupos (28/06).
--
-- PRÉ-REQUISITOS:
--   1. Migration 005 aplicada (colunas is_hidden, winner, match_method)
--   2. Migration 006 aplicada (functions de pontuação)
--   3. Migration 007 aplicada (view leaderboard_v2)
--   4. Migration 008 aplicada (tabela bracket)
--
-- FLUXO DE USO:
--   1. Execute as migrations acima primeiro.
--   2. Substitua os placeholders (ex: '1A') pelos times reais.
--   3. Confirme datas/horários com o calendário FIFA oficial.
--   4. Execute este script no SQL Editor do Supabase (staging primeiro).
--   5. Execute seed_bracket.sql logo após.
--   6. Ative is_hidden = true nos jogos de grupos via Admin UI.
--
-- ESTRUTURA DA COPA 2026 (48 times):
--   · 12 grupos (A–L) de 4 times cada
--   · 1º e 2º de cada grupo → 24 times
--   · 8 melhores 3ºs lugares → +8 times
--   · Total: 32 times no mata-mata
--
-- MAPEAMENTO DE ROUNDS / IDs:
--   round = 4 → 16 avos de Final   (16 jogos, IDs 101–116)
--   round = 5 → Oitavas de Final   ( 8 jogos, IDs 117–124)
--   round = 6 → Quartas de Final   ( 4 jogos, IDs 125–128)
--   round = 7 → Semifinal          ( 2 jogos, IDs 129–130)
--   round = 8 → Disputa de 3º Lugar( 1 jogo,  ID  131)
--   round = 9 → Final              ( 1 jogo,  ID  132)
--   Total: 32 jogos
--
-- PLACEHOLDERS:
--   '1A'     = 1º lugar do Grupo A
--   '2B'     = 2º lugar do Grupo B
--   '3º XYZ' = melhor 3º lugar (definido após grupos)
--   'TBD'    = a definir (fases finais — depende de resultado anterior)
--
-- ATENÇÃO: execute com:
--   SELECT MAX(id) FROM matches;
-- Antes de rodar. Se MAX(id) >= 101, ajuste os IDs base.
-- ============================================================

BEGIN;

-- ============================================================
-- Segurança: abort se IDs já existirem (evita duplicação)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM matches WHERE id BETWEEN 101 AND 132) THEN
    RAISE EXCEPTION 'IDs 101-132 já existem em matches. Verifique antes de executar.';
  END IF;
END;
$$;

-- ============================================================
-- Permite INSERT com ID explícito (overrides SERIAL sequence)
-- ============================================================
-- Após o INSERT, a sequence será ajustada automaticamente pelo
-- SELECT setval abaixo.

INSERT INTO matches (
  id, group_name, home_team, away_team,
  home_team_flag, away_team_flag,
  match_date, round, is_hidden, is_finished, winner, match_method
)
VALUES

-- ============================================================
-- ROUND 4 — 16 AVOS DE FINAL (16 jogos, IDs 101–116)
-- ============================================================
-- Datas: 30/jun–05/jul/2026
-- Emparelhamentos seguem o bracket oficial FIFA 2026:
--   · Metade superior (IDs 101–108): grupos A–F + 3ºs superiores
--   · Metade inferior (IDs 109–116): grupos G–L + 3ºs inferiores
-- ============================================================

-- Jogo 101 — 30/jun (segunda) 13h BRT
(101, '16 avos de Final', '1A', '2C', '', '', '2026-06-30T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 102 — 30/jun (segunda) 17h BRT
(102, '16 avos de Final', '1C', '2A', '', '', '2026-06-30T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 103 — 30/jun (segunda) 21h BRT
(103, '16 avos de Final', '1B', '2D', '', '', '2026-06-30T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 104 — 01/jul (terça) 13h BRT
(104, '16 avos de Final', '1D', '2B', '', '', '2026-07-01T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 105 — 01/jul (terça) 17h BRT
(105, '16 avos de Final', '1E', '3º ABCD', '', '', '2026-07-01T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 106 — 01/jul (terça) 21h BRT
(106, '16 avos de Final', '1F', '2E', '', '', '2026-07-01T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 107 — 02/jul (quarta) 13h BRT
(107, '16 avos de Final', '1G', '3º EFGH', '', '', '2026-07-02T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 108 — 02/jul (quarta) 17h BRT
(108, '16 avos de Final', '2F', '3º ABCDEF', '', '', '2026-07-02T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 109 — 02/jul (quarta) 21h BRT
(109, '16 avos de Final', '1H', '2G', '', '', '2026-07-02T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 110 — 03/jul (quinta) 13h BRT
(110, '16 avos de Final', '1I', '2K', '', '', '2026-07-03T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 111 — 03/jul (quinta) 17h BRT
(111, '16 avos de Final', '1K', '2I', '', '', '2026-07-03T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 112 — 03/jul (quinta) 21h BRT
(112, '16 avos de Final', '1J', '2L', '', '', '2026-07-03T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 113 — 04/jul (sexta) 13h BRT
(113, '16 avos de Final', '1L', '2J', '', '', '2026-07-04T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 114 — 04/jul (sexta) 17h BRT
(114, '16 avos de Final', '3º GHIJ', '3º IJKL', '', '', '2026-07-04T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 115 — 04/jul (sexta) 21h BRT
(115, '16 avos de Final', '2H', '3º GIJK', '', '', '2026-07-04T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 116 — 05/jul (sábado) 17h BRT
(116, '16 avos de Final', '2K', '3º HJKL', '', '', '2026-07-05T17:00:00-03:00', 4, false, false, null, null),

-- ============================================================
-- ROUND 5 — OITAVAS DE FINAL (8 jogos, IDs 117–124)
-- ============================================================
-- Datas: 07/jul–09/jul/2026
-- Times: TBD (dependem dos resultados dos 16 avos)
-- A function advance_bracket() preencherá automaticamente
-- home_team/away_team quando o admin salvar os 16 avos.
-- ============================================================

-- Oitavas 1 (ID 117) — Vencedores: Jogo 101 vs Jogo 102
(117, 'Oitavas de Final', 'TBD J101', 'TBD J102', '', '', '2026-07-07T13:00:00-03:00', 5, false, false, null, null),

-- Oitavas 2 (ID 118) — Vencedores: Jogo 103 vs Jogo 105
(118, 'Oitavas de Final', 'TBD J103', 'TBD J105', '', '', '2026-07-07T17:00:00-03:00', 5, false, false, null, null),

-- Oitavas 3 (ID 119) — Vencedores: Jogo 104 vs Jogo 106
(119, 'Oitavas de Final', 'TBD J104', 'TBD J106', '', '', '2026-07-07T21:00:00-03:00', 5, false, false, null, null),

-- Oitavas 4 (ID 120) — Vencedores: Jogo 107 vs Jogo 108
(120, 'Oitavas de Final', 'TBD J107', 'TBD J108', '', '', '2026-07-08T13:00:00-03:00', 5, false, false, null, null),

-- Oitavas 5 (ID 121) — Vencedores: Jogo 109 vs Jogo 110
(121, 'Oitavas de Final', 'TBD J109', 'TBD J110', '', '', '2026-07-08T17:00:00-03:00', 5, false, false, null, null),

-- Oitavas 6 (ID 122) — Vencedores: Jogo 111 vs Jogo 112
(122, 'Oitavas de Final', 'TBD J111', 'TBD J112', '', '', '2026-07-08T21:00:00-03:00', 5, false, false, null, null),

-- Oitavas 7 (ID 123) — Vencedores: Jogo 113 vs Jogo 114
(123, 'Oitavas de Final', 'TBD J113', 'TBD J114', '', '', '2026-07-09T13:00:00-03:00', 5, false, false, null, null),

-- Oitavas 8 (ID 124) — Vencedores: Jogo 115 vs Jogo 116
(124, 'Oitavas de Final', 'TBD J115', 'TBD J116', '', '', '2026-07-09T17:00:00-03:00', 5, false, false, null, null),

-- ============================================================
-- ROUND 6 — QUARTAS DE FINAL (4 jogos, IDs 125–128)
-- ============================================================
-- Datas: 11/jul–12/jul/2026
-- ============================================================

-- Quartas 1 (ID 125) — Vencedores: Oitavas 117 vs Oitavas 118
(125, 'Quartas de Final', 'TBD O117', 'TBD O118', '', '', '2026-07-11T13:00:00-03:00', 6, false, false, null, null),

-- Quartas 2 (ID 126) — Vencedores: Oitavas 119 vs Oitavas 120
(126, 'Quartas de Final', 'TBD O119', 'TBD O120', '', '', '2026-07-11T17:00:00-03:00', 6, false, false, null, null),

-- Quartas 3 (ID 127) — Vencedores: Oitavas 121 vs Oitavas 122
(127, 'Quartas de Final', 'TBD O121', 'TBD O122', '', '', '2026-07-12T13:00:00-03:00', 6, false, false, null, null),

-- Quartas 4 (ID 128) — Vencedores: Oitavas 123 vs Oitavas 124
(128, 'Quartas de Final', 'TBD O123', 'TBD O124', '', '', '2026-07-12T17:00:00-03:00', 6, false, false, null, null),

-- ============================================================
-- ROUND 7 — SEMIFINAIS (2 jogos, IDs 129–130)
-- ============================================================
-- Datas: 15/jul e 16/jul/2026
-- ============================================================

-- Semifinal 1 (ID 129) — Vencedores: Quartas 125 vs Quartas 126
(129, 'Semifinal', 'TBD Q125', 'TBD Q126', '', '', '2026-07-15T17:00:00-03:00', 7, false, false, null, null),

-- Semifinal 2 (ID 130) — Vencedores: Quartas 127 vs Quartas 128
(130, 'Semifinal', 'TBD Q127', 'TBD Q128', '', '', '2026-07-16T17:00:00-03:00', 7, false, false, null, null),

-- ============================================================
-- ROUND 8 — DISPUTA DE 3º LUGAR (1 jogo, ID 131)
-- ============================================================
-- Data: 19/jul/2026
-- Perdedores das semifinais 129 e 130
-- ============================================================

(131, 'Disputa de 3º Lugar', 'TBD Perdedor S129', 'TBD Perdedor S130', '', '', '2026-07-19T13:00:00-03:00', 8, false, false, null, null),

-- ============================================================
-- ROUND 9 — FINAL (1 jogo, ID 132)
-- ============================================================
-- Data: 19/jul/2026
-- Local: MetLife Stadium, East Rutherford, Nova Jersey (EUA)
-- Vencedores das semifinais 129 e 130
-- ============================================================

(132, 'Final', 'TBD Vencedor S129', 'TBD Vencedor S130', '', '', '2026-07-19T17:00:00-03:00', 9, false, false, null, null);

-- ============================================================
-- Ajustar a sequence para não conflitar com futuros inserts
-- ============================================================
SELECT setval(pg_get_serial_sequence('matches', 'id'), GREATEST(132, (SELECT MAX(id) FROM matches)));

COMMIT;

-- ============================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ============================================================
SELECT
  id,
  round,
  CASE round
    WHEN 4 THEN '16 avos de Final'
    WHEN 5 THEN 'Oitavas de Final'
    WHEN 6 THEN 'Quartas de Final'
    WHEN 7 THEN 'Semifinal'
    WHEN 8 THEN 'Disputa de 3º Lugar'
    WHEN 9 THEN 'Final'
  END AS fase,
  home_team,
  away_team,
  match_date
FROM matches
WHERE id BETWEEN 101 AND 132
ORDER BY id;

-- Deve retornar 32 linhas, IDs 101–132, sem gaps.

-- ============================================================
-- CHECKLIST ANTES DE EXECUTAR EM PRODUÇÃO (Fase 2 — 28/06)
-- ============================================================
-- [ ] SELECT MAX(id) FROM matches — confirmar que max < 101
-- [ ] Migration 005 aplicada (is_hidden, winner, match_method)
-- [ ] Migration 006 aplicada (functions de pontuação)
-- [ ] Migration 007 aplicada (view leaderboard_v2)
-- [ ] Migration 008 aplicada (tabela bracket)
-- [ ] Placeholders substituídos pelos times reais (28/06 após grupos)
-- [ ] Datas/horários confirmados com calendário FIFA oficial
-- [ ] Testado em banco de staging antes de produção
-- [ ] seed_bracket.sql executado logo após este script
-- ============================================================
