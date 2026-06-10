-- ============================================================
-- SEED — Bolão World Cup 2026
-- Todos os 72 jogos (Rodadas 1, 2 e 3)
-- Horários em UTC-3 (São Paulo / Brasília)
-- Execute no Supabase Dashboard → SQL Editor
-- APÓS ter executado 001_initial_schema.sql
-- ============================================================

-- Limpar jogos existentes (se necessário)
-- DELETE FROM matches;

INSERT INTO matches (group_name, home_team, away_team, match_date, round) VALUES

-- ============================================================
-- RODADA 1
-- ============================================================

-- Grupo A
('Grupo A', 'México',        'África do Sul',        '2026-06-11T16:00:00-03:00', 1),
('Grupo A', 'Coreia do Sul', 'República Tcheca',     '2026-06-11T23:00:00-03:00', 1),

-- Grupo B
('Grupo B', 'Canadá',        'Bósnia e Herzegovina', '2026-06-12T16:00:00-03:00', 1),
('Grupo B', 'Catar',         'Suíça',                '2026-06-13T16:00:00-03:00', 1),

-- Grupo C
('Grupo C', 'Brasil',        'Marrocos',             '2026-06-13T19:00:00-03:00', 1),
('Grupo C', 'Haiti',         'Escócia',              '2026-06-13T22:00:00-03:00', 1),

-- Grupo D
('Grupo D', 'Estados Unidos','Paraguai',             '2026-06-12T22:00:00-03:00', 1),
('Grupo D', 'Austrália',     'Turquia',              '2026-06-14T01:00:00-03:00', 1),

-- Grupo E
('Grupo E', 'Alemanha',      'Curaçao',              '2026-06-14T14:00:00-03:00', 1),
('Grupo E', 'Costa do Marfim','Equador',             '2026-06-14T20:00:00-03:00', 1),

-- Grupo F
('Grupo F', 'Holanda',       'Japão',                '2026-06-14T17:00:00-03:00', 1),
('Grupo F', 'Suécia',        'Tunísia',              '2026-06-14T23:00:00-03:00', 1),

-- Grupo G
('Grupo G', 'Bélgica',       'Egito',                '2026-06-15T16:00:00-03:00', 1),
('Grupo G', 'Irã',           'Nova Zelândia',        '2026-06-15T22:00:00-03:00', 1),

-- Grupo H
('Grupo H', 'Espanha',       'Cabo Verde',           '2026-06-15T13:00:00-03:00', 1),
('Grupo H', 'Arábia Saudita','Uruguai',              '2026-06-15T19:00:00-03:00', 1),

-- Grupo I
('Grupo I', 'França',        'Senegal',              '2026-06-16T16:00:00-03:00', 1),
('Grupo I', 'Iraque',        'Noruega',              '2026-06-16T19:00:00-03:00', 1),

-- Grupo J
('Grupo J', 'Argentina',     'Argélia',              '2026-06-16T22:00:00-03:00', 1),
('Grupo J', 'Áustria',       'Jordânia',             '2026-06-17T01:00:00-03:00', 1),

-- Grupo K
('Grupo K', 'Portugal',      'RD Congo',             '2026-06-17T14:00:00-03:00', 1),
('Grupo K', 'Uzbequistão',   'Colômbia',             '2026-06-17T23:00:00-03:00', 1),

-- Grupo L
('Grupo L', 'Inglaterra',    'Croácia',              '2026-06-17T17:00:00-03:00', 1),
('Grupo L', 'Gana',          'Panamá',               '2026-06-17T20:00:00-03:00', 1),

-- ============================================================
-- RODADA 2
-- ============================================================

-- Grupo A
('Grupo A', 'México',        'Coreia do Sul',        '2026-06-18T16:00:00-03:00', 2),
('Grupo A', 'República Tcheca','África do Sul',      '2026-06-18T23:00:00-03:00', 2),

-- Grupo B
('Grupo B', 'Canadá',        'Catar',                '2026-06-18T19:00:00-03:00', 2),
('Grupo B', 'Suíça',         'Bósnia e Herzegovina', '2026-06-19T16:00:00-03:00', 2),

-- Grupo C
('Grupo C', 'Brasil',        'Haiti',                '2026-06-19T19:00:00-03:00', 2),
('Grupo C', 'Escócia',       'Marrocos',             '2026-06-19T22:00:00-03:00', 2),

-- Grupo D
('Grupo D', 'Estados Unidos','Austrália',            '2026-06-19T13:00:00-03:00', 2),
('Grupo D', 'Turquia',       'Paraguai',             '2026-06-20T01:00:00-03:00', 2),

-- Grupo E
('Grupo E', 'Alemanha',      'Costa do Marfim',      '2026-06-20T14:00:00-03:00', 2),
('Grupo E', 'Equador',       'Curaçao',              '2026-06-20T20:00:00-03:00', 2),

-- Grupo F
('Grupo F', 'Holanda',       'Suécia',               '2026-06-20T17:00:00-03:00', 2),
('Grupo F', 'Tunísia',       'Japão',                '2026-06-20T23:00:00-03:00', 2),

-- Grupo G
('Grupo G', 'Bélgica',       'Irã',                  '2026-06-21T16:00:00-03:00', 2),
('Grupo G', 'Nova Zelândia', 'Egito',                '2026-06-21T22:00:00-03:00', 2),

-- Grupo H
('Grupo H', 'Espanha',       'Arábia Saudita',       '2026-06-21T13:00:00-03:00', 2),
('Grupo H', 'Uruguai',       'Cabo Verde',           '2026-06-21T19:00:00-03:00', 2),

-- Grupo I
('Grupo I', 'França',        'Iraque',               '2026-06-22T16:00:00-03:00', 2),
('Grupo I', 'Noruega',       'Senegal',              '2026-06-22T19:00:00-03:00', 2),

-- Grupo J
('Grupo J', 'Argentina',     'Áustria',              '2026-06-22T22:00:00-03:00', 2),
('Grupo J', 'Jordânia',      'Argélia',              '2026-06-23T01:00:00-03:00', 2),

-- Grupo K
('Grupo K', 'Portugal',      'Uzbequistão',          '2026-06-23T14:00:00-03:00', 2),
('Grupo K', 'Colômbia',      'RD Congo',             '2026-06-23T23:00:00-03:00', 2),

-- Grupo L
('Grupo L', 'Inglaterra',    'Gana',                 '2026-06-23T17:00:00-03:00', 2),
('Grupo L', 'Panamá',        'Croácia',              '2026-06-24T20:00:00-03:00', 2),

-- ============================================================
-- RODADA 3
-- ============================================================

-- Grupo A
('Grupo A', 'México',        'República Tcheca',     '2026-06-24T16:00:00-03:00', 3),
('Grupo A', 'África do Sul', 'Coreia do Sul',        '2026-06-24T16:00:00-03:00', 3),

-- Grupo B
('Grupo B', 'Canadá',        'Suíça',                '2026-06-24T20:00:00-03:00', 3),
('Grupo B', 'Catar',         'Bósnia e Herzegovina', '2026-06-24T20:00:00-03:00', 3),

-- Grupo C
('Grupo C', 'Brasil',        'Escócia',              '2026-06-25T16:00:00-03:00', 3),
('Grupo C', 'Haiti',         'Marrocos',             '2026-06-25T16:00:00-03:00', 3),

-- Grupo D
('Grupo D', 'Estados Unidos','Turquia',              '2026-06-25T20:00:00-03:00', 3),
('Grupo D', 'Austrália',     'Paraguai',             '2026-06-25T20:00:00-03:00', 3),

-- Grupo E
('Grupo E', 'Alemanha',      'Equador',              '2026-06-26T16:00:00-03:00', 3),
('Grupo E', 'Costa do Marfim','Curaçao',             '2026-06-26T16:00:00-03:00', 3),

-- Grupo F
('Grupo F', 'Holanda',       'Tunísia',              '2026-06-26T20:00:00-03:00', 3),
('Grupo F', 'Suécia',        'Japão',                '2026-06-26T20:00:00-03:00', 3),

-- Grupo G
('Grupo G', 'Bélgica',       'Nova Zelândia',        '2026-06-27T16:00:00-03:00', 3),
('Grupo G', 'Irã',           'Egito',                '2026-06-27T16:00:00-03:00', 3),

-- Grupo H
('Grupo H', 'Espanha',       'Uruguai',              '2026-06-27T20:00:00-03:00', 3),
('Grupo H', 'Arábia Saudita','Cabo Verde',           '2026-06-27T20:00:00-03:00', 3),

-- Grupo I
('Grupo I', 'França',        'Noruega',              '2026-06-28T16:00:00-03:00', 3),
('Grupo I', 'Iraque',        'Senegal',              '2026-06-28T16:00:00-03:00', 3),

-- Grupo J
('Grupo J', 'Argentina',     'Jordânia',             '2026-06-28T20:00:00-03:00', 3),
('Grupo J', 'Áustria',       'Argélia',              '2026-06-28T20:00:00-03:00', 3),

-- Grupo K
('Grupo K', 'Portugal',      'Colômbia',             '2026-06-29T16:00:00-03:00', 3),
('Grupo K', 'Uzbequistão',   'RD Congo',             '2026-06-29T16:00:00-03:00', 3),

-- Grupo L
('Grupo L', 'Inglaterra',    'Panamá',               '2026-06-29T20:00:00-03:00', 3),
('Grupo L', 'Gana',          'Croácia',              '2026-06-29T20:00:00-03:00', 3);

-- Verificar contagem (deve ser 72)
SELECT COUNT(*) as total_jogos FROM matches;
SELECT round, COUNT(*) as jogos_por_rodada FROM matches GROUP BY round ORDER BY round;
