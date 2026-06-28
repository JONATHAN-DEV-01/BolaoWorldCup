-- seed_mata_mata.sql
-- Horários em UTC-3 (Brasília)
-- MAX(id) atual em matches = 72. IDs do mata-mata começam em 101.

INSERT INTO matches (
  id, group_name,
  home_team, away_team,
  home_team_flag, away_team_flag,
  match_date, round,
  home_score, away_score,
  is_finished, is_hidden,
  winner, match_method
) VALUES

-- ══════════════════════════════════════════════════════
-- 16 AVOS DE FINAL (round = 4)
-- ══════════════════════════════════════════════════════

-- LADO A
(101, '16 avos de Final', 'Alemanha',            'Paraguai',              '🇩🇪', '🇵🇾', '2026-06-29 17:30:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(102, '16 avos de Final', 'França',               'Suécia',                '🇫🇷', '🇸🇪', '2026-06-30 18:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(103, '16 avos de Final', 'África do Sul',        'Canadá',                '🇿🇦', '🇨🇦', '2026-06-28 16:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(104, '16 avos de Final', 'Holanda',              'Marrocos',              '🇳🇱', '🇲🇦', '2026-06-29 22:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(105, '16 avos de Final', 'Portugal',             'Croácia',               '🇵🇹', '🇭🇷', '2026-07-02 20:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(106, '16 avos de Final', 'Espanha',              'Áustria',               '🇪🇸', '🇦🇹', '2026-07-02 16:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(107, '16 avos de Final', 'Estados Unidos',       'Bósnia e Herzegovina',  '🇺🇸', '🇧🇦', '2026-07-01 21:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(108, '16 avos de Final', 'Bélgica',              'Senegal',               '🇧🇪', '🇸🇳', '2026-07-01 17:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),

-- LADO B
(109, '16 avos de Final', 'Brasil',               'Japão',                 '🇧🇷', '🇯🇵', '2026-06-29 14:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(110, '16 avos de Final', 'Costa do Marfim',      'Noruega',               '🇨🇮', '🇳🇴', '2026-06-30 14:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(111, '16 avos de Final', 'México',               'Equador',               '🇲🇽', '🇪🇨', '2026-06-30 22:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(112, '16 avos de Final', 'Inglaterra',           'Congo',                 '🏴', '🇨🇩', '2026-07-01 13:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(113, '16 avos de Final', 'Argentina',            'Cabo Verde',            '🇦🇷', '🇨🇻', '2026-07-03 19:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(114, '16 avos de Final', 'Austrália',            'Egito',                 '🇦🇺', '🇪🇬', '2026-07-03 15:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(115, '16 avos de Final', 'Suíça',                'Argélia',               '🇨🇭', '🇩🇿', '2026-07-03 00:00:00-03', 4, NULL, NULL, false, false, NULL, NULL),
(116, '16 avos de Final', 'Colômbia',             'Gana',                  '🇨🇴', '🇬🇭', '2026-07-03 22:30:00-03', 4, NULL, NULL, false, false, NULL, NULL),

-- ══════════════════════════════════════════════════════
-- OITAVAS DE FINAL (round = 5) — times preenchidos pelo trigger
-- ══════════════════════════════════════════════════════

-- LADO A
(117, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-04 18:00:00-03', 5, NULL, NULL, false, false, NULL, NULL),
(118, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-04 14:00:00-03', 5, NULL, NULL, false, false, NULL, NULL),
(119, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-06 21:00:00-03', 5, NULL, NULL, false, false, NULL, NULL),
(120, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-06 16:00:00-03', 5, NULL, NULL, false, false, NULL, NULL),

-- LADO B
(121, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-05 17:00:00-03', 5, NULL, NULL, false, false, NULL, NULL),
(122, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-05 21:00:00-03', 5, NULL, NULL, false, false, NULL, NULL),
(123, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-07 17:00:00-03', 5, NULL, NULL, false, false, NULL, NULL),
(124, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-07 13:00:00-03', 5, NULL, NULL, false, false, NULL, NULL),

-- ══════════════════════════════════════════════════════
-- QUARTAS DE FINAL (round = 6) — times preenchidos pelo trigger
-- ══════════════════════════════════════════════════════

-- LADO A
(125, 'Quartas de Final', 'TBD', 'TBD', '', '', '2026-07-09 17:00:00-03', 6, NULL, NULL, false, false, NULL, NULL),
(126, 'Quartas de Final', 'TBD', 'TBD', '', '', '2026-07-11 18:00:00-03', 6, NULL, NULL, false, false, NULL, NULL),

-- LADO B
(127, 'Quartas de Final', 'TBD', 'TBD', '', '', '2026-07-10 16:00:00-03', 6, NULL, NULL, false, false, NULL, NULL),
(128, 'Quartas de Final', 'TBD', 'TBD', '', '', '2026-07-11 22:00:00-03', 6, NULL, NULL, false, false, NULL, NULL),

-- ══════════════════════════════════════════════════════
-- SEMIFINAL (round = 7) — times preenchidos pelo trigger
-- ══════════════════════════════════════════════════════
(129, 'Semifinal', 'TBD', 'TBD', '', '', '2026-07-14 16:00:00-03', 7, NULL, NULL, false, false, NULL, NULL),
(130, 'Semifinal', 'TBD', 'TBD', '', '', '2026-07-15 16:00:00-03', 7, NULL, NULL, false, false, NULL, NULL),

-- ══════════════════════════════════════════════════════
-- DISPUTA DE 3º LUGAR (round = 8)
-- ══════════════════════════════════════════════════════
(131, 'Disputa de 3º Lugar', 'TBD', 'TBD', '', '', '2026-07-18 18:00:00-03', 8, NULL, NULL, false, false, NULL, NULL),

-- ══════════════════════════════════════════════════════
-- FINAL (round = 9)
-- ══════════════════════════════════════════════════════
(132, 'Final', 'TBD', 'TBD', '', '', '2026-07-19 16:00:00-03', 9, NULL, NULL, false, false, NULL, NULL);
