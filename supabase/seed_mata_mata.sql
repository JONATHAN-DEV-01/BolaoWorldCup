-- ============================================================
-- SEED MATA-MATA — Bolão World Cup 2026
-- 32 jogos do mata-mata (rounds 4-9)
-- Horários em UTC-3 (São Paulo / Brasília)
--
-- ⚠️  NÃO executar contra produção antes do dia 28/06.
--     Os confrontos reais só são confirmados após o
--     encerramento da fase de grupos (28/06).
--
-- FLUXO DE USO:
--   1. Execute as migrations 005, 006 e 007 primeiro.
--   2. Substitua os placeholders TBD pelos times reais.
--   3. Execute este script no SQL Editor do Supabase.
--   4. Ative is_hidden = true nos jogos de grupos via Admin.
--
-- ESTRUTURA DO BRACKET (Copa do Mundo 2026 — 48 times):
--   · 12 grupos (A–L) de 4 times cada
--   · 1º e 2º de cada grupo classificam → 24 times
--   · 8 melhores 3ºs lugares classificam → +8 times
--   · Total: 32 times no mata-mata
--
-- MAPEAMENTO DE ROUNDS:
--   round = 4  → 16 avos de Final  (16 jogos)
--   round = 5  → Oitavas de Final  ( 8 jogos)
--   round = 6  → Quartas de Final  ( 4 jogos)
--   round = 7  → Semifinal         ( 2 jogos)
--   round = 8  → Disputa de 3º     ( 1 jogo )
--   round = 9  → Final             ( 1 jogo )
--   Total: 32 jogos
-- ============================================================

-- ============================================================
-- INSTRUÇÃO: como substituir os placeholders
-- ============================================================
-- Cada confronto está nomeado como:
--   '1A'  = 1º lugar do Grupo A
--   '2B'  = 2º lugar do Grupo B
--   '3ºX' = melhor 3º lugar (posição confirmada após rodadas)
--   'TBD' = a definir (fases finais — depende do resultado anterior)
--
-- Substitua diretamente no texto abaixo ANTES de executar.
-- Exemplo: '1A' → 'Brasil', '2B' → 'Alemanha'
--
-- Para home_team_flag e away_team_flag, use o emoji da bandeira:
-- '🇧🇷' → Brasil, '🇩🇪' → Alemanha, etc.
-- Deixe '' (string vazia) se preferir gerenciar via Admin.
-- ============================================================

BEGIN;

INSERT INTO matches (
  group_name, home_team, away_team, home_team_flag, away_team_flag,
  match_date, round, is_hidden, is_finished, winner, match_method
)
VALUES

-- ============================================================
-- ROUND 4 — 16 AVOS DE FINAL (16 jogos)
-- ============================================================
-- Datas aproximadas: 30/jun–05/jul/2026
-- Substitua os times pelos classificados reais.
-- Os emparelhamentos abaixo seguem o bracket oficial FIFA 2026:
--   · Metade superior: grupos A-F
--   · Metade inferior: grupos G-L
-- ============================================================

-- Jogo 1 — 30/jun (segunda)
('16 avos de Final', '1A', '2C', '', '', '2026-06-30T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 2 — 30/jun (segunda)
('16 avos de Final', '1C', '2A', '', '', '2026-06-30T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 3 — 30/jun (segunda)
('16 avos de Final', '1B', '2D', '', '', '2026-06-30T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 4 — 01/jul (terça)
('16 avos de Final', '1D', '2B', '', '', '2026-07-01T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 5 — 01/jul (terça)
('16 avos de Final', '1E', '3º ABCD', '', '', '2026-07-01T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 6 — 01/jul (terça)
('16 avos de Final', '1F', '2E', '', '', '2026-07-01T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 7 — 02/jul (quarta)
('16 avos de Final', '1G', '3º EFGH', '', '', '2026-07-02T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 8 — 02/jul (quarta)
('16 avos de Final', '2F', '3º ABCDEF', '', '', '2026-07-02T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 9 — 02/jul (quarta)
('16 avos de Final', '1H', '2G', '', '', '2026-07-02T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 10 — 03/jul (quinta)
('16 avos de Final', '1I', '2K', '', '', '2026-07-03T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 11 — 03/jul (quinta)
('16 avos de Final', '1K', '2I', '', '', '2026-07-03T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 12 — 03/jul (quinta)
('16 avos de Final', '1J', '2L', '', '', '2026-07-03T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 13 — 04/jul (sexta)
('16 avos de Final', '1L', '2J', '', '', '2026-07-04T13:00:00-03:00', 4, false, false, null, null),

-- Jogo 14 — 04/jul (sexta)
('16 avos de Final', '3º GHIJ', '3º IJKL', '', '', '2026-07-04T17:00:00-03:00', 4, false, false, null, null),

-- Jogo 15 — 04/jul (sexta)
('16 avos de Final', '2H', '3º GIJK', '', '', '2026-07-04T21:00:00-03:00', 4, false, false, null, null),

-- Jogo 16 — 05/jul (sábado)
('16 avos de Final', '2K', '3º HJKL', '', '', '2026-07-05T17:00:00-03:00', 4, false, false, null, null),

-- ============================================================
-- ROUND 5 — OITAVAS DE FINAL (8 jogos)
-- ============================================================
-- Datas aproximadas: 07/jul–10/jul/2026
-- Todos os times são TBD (dependem dos 16 avos)
-- ============================================================

-- Oitavas 1 — vencedores Jogos 1 e 2 (metade superior A)
('Oitavas de Final', 'TBD Jogo 1', 'TBD Jogo 2', '', '', '2026-07-07T13:00:00-03:00', 5, false, false, null, null),

-- Oitavas 2 — vencedores Jogos 3 e 5
('Oitavas de Final', 'TBD Jogo 3', 'TBD Jogo 5', '', '', '2026-07-07T17:00:00-03:00', 5, false, false, null, null),

-- Oitavas 3 — vencedores Jogos 4 e 6
('Oitavas de Final', 'TBD Jogo 4', 'TBD Jogo 6', '', '', '2026-07-07T21:00:00-03:00', 5, false, false, null, null),

-- Oitavas 4 — vencedores Jogos 7 e 8
('Oitavas de Final', 'TBD Jogo 7', 'TBD Jogo 8', '', '', '2026-07-08T13:00:00-03:00', 5, false, false, null, null),

-- Oitavas 5 — vencedores Jogos 9 e 10
('Oitavas de Final', 'TBD Jogo 9', 'TBD Jogo 10', '', '', '2026-07-08T17:00:00-03:00', 5, false, false, null, null),

-- Oitavas 6 — vencedores Jogos 11 e 12
('Oitavas de Final', 'TBD Jogo 11', 'TBD Jogo 12', '', '', '2026-07-08T21:00:00-03:00', 5, false, false, null, null),

-- Oitavas 7 — vencedores Jogos 13 e 14
('Oitavas de Final', 'TBD Jogo 13', 'TBD Jogo 14', '', '', '2026-07-09T13:00:00-03:00', 5, false, false, null, null),

-- Oitavas 8 — vencedores Jogos 15 e 16
('Oitavas de Final', 'TBD Jogo 15', 'TBD Jogo 16', '', '', '2026-07-09T17:00:00-03:00', 5, false, false, null, null),

-- ============================================================
-- ROUND 6 — QUARTAS DE FINAL (4 jogos)
-- ============================================================
-- Datas aproximadas: 11/jul–12/jul/2026
-- ============================================================

-- Quartas 1 — vencedores Oitavas 1 e 2
('Quartas de Final', 'TBD Oitavas 1', 'TBD Oitavas 2', '', '', '2026-07-11T13:00:00-03:00', 6, false, false, null, null),

-- Quartas 2 — vencedores Oitavas 3 e 4
('Quartas de Final', 'TBD Oitavas 3', 'TBD Oitavas 4', '', '', '2026-07-11T17:00:00-03:00', 6, false, false, null, null),

-- Quartas 3 — vencedores Oitavas 5 e 6
('Quartas de Final', 'TBD Oitavas 5', 'TBD Oitavas 6', '', '', '2026-07-12T13:00:00-03:00', 6, false, false, null, null),

-- Quartas 4 — vencedores Oitavas 7 e 8
('Quartas de Final', 'TBD Oitavas 7', 'TBD Oitavas 8', '', '', '2026-07-12T17:00:00-03:00', 6, false, false, null, null),

-- ============================================================
-- ROUND 7 — SEMIFINAIS (2 jogos)
-- ============================================================
-- Datas aproximadas: 15/jul e 16/jul/2026
-- ============================================================

-- Semifinal 1 — vencedores Quartas 1 e 2
('Semifinal', 'TBD Quartas 1', 'TBD Quartas 2', '', '', '2026-07-15T17:00:00-03:00', 7, false, false, null, null),

-- Semifinal 2 — vencedores Quartas 3 e 4
('Semifinal', 'TBD Quartas 3', 'TBD Quartas 4', '', '', '2026-07-16T17:00:00-03:00', 7, false, false, null, null),

-- ============================================================
-- ROUND 8 — DISPUTA DE 3º LUGAR (1 jogo)
-- ============================================================
-- Data aproximada: 19/jul/2026
-- ============================================================

('Disputa de 3º Lugar', 'TBD Perdedor Semi 1', 'TBD Perdedor Semi 2', '', '', '2026-07-19T13:00:00-03:00', 8, false, false, null, null),

-- ============================================================
-- ROUND 9 — FINAL (1 jogo)
-- ============================================================
-- Data aproximada: 19/jul/2026
-- Local: MetLife Stadium, Nova Jersey (EUA)
-- ============================================================

('Final', 'TBD Vencedor Semi 1', 'TBD Vencedor Semi 2', '', '', '2026-07-19T17:00:00-03:00', 9, false, false, null, null);

COMMIT;

-- ============================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ============================================================
SELECT
  round,
  CASE round
    WHEN 4 THEN '16 avos de Final'
    WHEN 5 THEN 'Oitavas de Final'
    WHEN 6 THEN 'Quartas de Final'
    WHEN 7 THEN 'Semifinal'
    WHEN 8 THEN 'Disputa de 3º Lugar'
    WHEN 9 THEN 'Final'
  END AS fase,
  COUNT(*) AS jogos_inseridos
FROM matches
WHERE round >= 4
GROUP BY round
ORDER BY round;

-- Deve retornar:
-- round | fase               | jogos_inseridos
--   4   | 16 avos de Final   | 16
--   5   | Oitavas de Final   |  8
--   6   | Quartas de Final   |  4
--   7   | Semifinal          |  2
--   8   | Disputa de 3º Lugar|  1
--   9   | Final              |  1
-- Total: 32 jogos

-- ============================================================
-- CHECKLIST ANTES DE EXECUTAR EM PRODUÇÃO (Fase 2 — 28/06)
-- ============================================================
-- [ ] Migration 005 aplicada (colunas is_hidden, winner, match_method)
-- [ ] Migration 006 aplicada (functions calculate_knockout_points,
--                             recalculate_on_result)
-- [ ] Migration 007 aplicada (view leaderboard_v2)
-- [ ] Placeholders substituídos pelos times reais
-- [ ] Datas e horários confirmados com o calendário FIFA oficial
-- [ ] Testado em banco de staging antes de produção
-- [ ] Script executado dentro de uma transação (BEGIN/COMMIT já incluídos)
-- ============================================================
