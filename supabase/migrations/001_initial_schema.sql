-- ============================================================
-- Bolão World Cup 2026 — Initial Schema
-- Execute este arquivo no Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- TABELA: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABELA: matches
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  group_name TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_team_flag TEXT,
  away_team_flag TEXT,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  round INTEGER NOT NULL DEFAULT 1,
  home_score INTEGER,
  away_score INTEGER,
  is_finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABELA: predictions
-- ============================================================
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- ============================================================
-- RLS — Row Level Security
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Admin can manage matches" ON matches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON predictions FOR UPDATE USING (
  auth.uid() = user_id AND
  (SELECT match_date FROM matches WHERE id = match_id) > NOW()
);

-- ============================================================
-- TRIGGER: calculate_points
-- Calcula pontos ao inserir/atualizar prediction
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_points()
RETURNS TRIGGER AS $$
DECLARE
  v_home_score INTEGER;
  v_away_score INTEGER;
  pred_home INTEGER;
  pred_away INTEGER;
  points INTEGER := 0;
  real_result TEXT;
  pred_result TEXT;
BEGIN
  SELECT m.home_score, m.away_score INTO v_home_score, v_away_score
  FROM matches m WHERE m.id = NEW.match_id;

  pred_home := NEW.predicted_home_score;
  pred_away := NEW.predicted_away_score;

  IF v_home_score IS NULL OR v_away_score IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_home_score > v_away_score THEN real_result := 'home';
  ELSIF v_away_score > v_home_score THEN real_result := 'away';
  ELSE real_result := 'draw';
  END IF;

  IF pred_home > pred_away THEN pred_result := 'home';
  ELSIF pred_away > pred_home THEN pred_result := 'away';
  ELSE pred_result := 'draw';
  END IF;

  IF real_result = 'draw' AND pred_result = 'draw' THEN
    points := 10;
  ELSIF real_result != 'draw' AND pred_result = real_result THEN
    points := 5;
  END IF;

  NEW.points_earned := points;

  UPDATE profiles
  SET total_points = (
    SELECT COALESCE(SUM(points_earned), 0)
    FROM predictions
    WHERE user_id = NEW.user_id
      AND id != NEW.id
  ) + points
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_prediction_scored
  BEFORE INSERT OR UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION calculate_points();

-- ============================================================
-- TRIGGER: create_profile_on_signup
-- Cria profile automaticamente ao criar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
