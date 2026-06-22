-- ============================================================
-- Migration 004: Corrigir total_points NULL
-- Causa: PostgreSQL ordena NULL como maior que qualquer valor
-- em ORDER BY ... DESC (NULLS FIRST por padrão), fazendo
-- usuários sem pontuação aparecerem no topo do ranking.
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Corrigir qualquer NULL existente em total_points
UPDATE profiles
SET total_points = 0
WHERE total_points IS NULL;

-- 2. Adicionar NOT NULL constraint para evitar o problema no futuro
ALTER TABLE profiles
  ALTER COLUMN total_points SET NOT NULL,
  ALTER COLUMN total_points SET DEFAULT 0;

-- 3. Verificação — deve retornar 0 linhas após a correção
-- SELECT id, username, total_points
-- FROM profiles
-- WHERE total_points IS NULL;
