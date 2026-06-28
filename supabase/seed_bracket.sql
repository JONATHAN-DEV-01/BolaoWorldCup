-- seed_bracket.sql
-- Chaveamento completo Copa 2026 — Mata-Mata
--
-- Lógica de leitura de cada linha:
--   match_id        = jogo desta linha
--   next_match_id   = jogo para onde o VENCEDOR avança
--   next_match_slot = se o vencedor entra como 'home' ou 'away'
--   loser_match_id  = jogo para onde o PERDEDOR vai (só semifinais)
--   loser_match_slot= slot do perdedor no jogo de 3º lugar

INSERT INTO bracket (
  match_id,
  next_match_id, next_match_slot,
  loser_match_id, loser_match_slot
) VALUES

-- ══════════════════════════════════════════════════════
-- 16 AVOS → OITAVAS
-- ══════════════════════════════════════════════════════

-- LADO A
-- J1 (101 Alemanha×Paraguai) e J2 (102 França×Suécia) → Oitavas 117
(101, 117, 'home', NULL, NULL),
(102, 117, 'away', NULL, NULL),

-- J3 (103 África do Sul×Canadá) e J4 (104 Holanda×Marrocos) → Oitavas 118
(103, 118, 'home', NULL, NULL),
(104, 118, 'away', NULL, NULL),

-- J5 (105 Portugal×Croácia) e J6 (106 Espanha×Áustria) → Oitavas 119
(105, 119, 'home', NULL, NULL),
(106, 119, 'away', NULL, NULL),

-- J7 (107 EUA×Bósnia) e J8 (108 Bélgica×Senegal) → Oitavas 120
(107, 120, 'home', NULL, NULL),
(108, 120, 'away', NULL, NULL),

-- LADO B
-- J9 (109 Brasil×Japão) e J10 (110 Costa do Marfim×Noruega) → Oitavas 121
(109, 121, 'home', NULL, NULL),
(110, 121, 'away', NULL, NULL),

-- J11 (111 México×Equador) e J12 (112 Inglaterra×Congo) → Oitavas 122
(111, 122, 'home', NULL, NULL),
(112, 122, 'away', NULL, NULL),

-- J13 (113 Argentina×Cabo Verde) e J14 (114 Austrália×Egito) → Oitavas 123
(113, 123, 'home', NULL, NULL),
(114, 123, 'away', NULL, NULL),

-- J15 (115 Suíça×Argélia) e J16 (116 Colômbia×Gana) → Oitavas 124
(115, 124, 'home', NULL, NULL),
(116, 124, 'away', NULL, NULL),

-- ══════════════════════════════════════════════════════
-- OITAVAS → QUARTAS
-- ══════════════════════════════════════════════════════

-- LADO A
(117, 125, 'home', NULL, NULL),
(118, 125, 'away', NULL, NULL),
(119, 126, 'home', NULL, NULL),
(120, 126, 'away', NULL, NULL),

-- LADO B
(121, 127, 'home', NULL, NULL),
(122, 127, 'away', NULL, NULL),
(123, 128, 'home', NULL, NULL),
(124, 128, 'away', NULL, NULL),

-- ══════════════════════════════════════════════════════
-- QUARTAS → SEMIFINAL
-- ══════════════════════════════════════════════════════

-- LADO A → Semifinal 129
(125, 129, 'home', NULL, NULL),
(126, 129, 'away', NULL, NULL),

-- LADO B → Semifinal 130
(127, 130, 'home', NULL, NULL),
(128, 130, 'away', NULL, NULL),

-- ══════════════════════════════════════════════════════
-- SEMIFINAL → FINAL e DISPUTA DE 3º LUGAR
-- ══════════════════════════════════════════════════════

-- Semifinal A (129): vencedor → Final (132 home), perdedor → 3º (131 home)
(129, 132, 'home', 131, 'home'),

-- Semifinal B (130): vencedor → Final (132 away), perdedor → 3º (131 away)
(130, 132, 'away', 131, 'away');

-- Final (132) e Disputa de 3º (131) não alimentam nenhum próximo jogo.
-- Não inserir linhas para os IDs 131 e 132 na tabela bracket.
