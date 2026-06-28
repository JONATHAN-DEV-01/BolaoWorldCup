# Migração Mata-Mata WC26 — Classificado + Método + Nova Pontuação

## Schema atual do banco (produção)

```sql
profiles: id, username, full_name, is_admin, avatar_url, total_points,
          draw_hits, round1_points, round2_points, created_at

matches:  id, group_name, home_team, away_team, home_team_flag,
          away_team_flag, match_date, round, home_score, away_score,
          is_finished, created_at

predictions: id, user_id, match_id, predicted_home_score,
             predicted_away_score, points_earned, created_at
```

## Nova fórmula de pontuação — Mata-Mata

| Tipo de Acerto | Pontos |
|---|---|
| Acerto Completo (Classificado + Método) | 20 pts |
| Acerto Parcial (Apenas o Classificado) | 12 pts |
| Errou o Classificado | 0 pts |

Onde "Método" = como o time se classificou: Tempo Normal / Prorrogação / Pênaltis.

## Critérios de desempate (em ordem)

1. Maior número de Acertos Completos (classificado + método — 20 pts)
2. Maior número de Classificados acertados no total (20 + 12 pts)

## Interface de palpite do usuário

```
┌──────────────────────────────────────────────────┐
│  Oitavas · 29 jun · 16h                          │
│                                                  │
│  🇧🇷 Brasil          🇦🇷 Argentina                │
│                                                  │
│  Quem passa?  [ Brasil ]  [ Argentina ]          │
│                                                  │
│  Como passa? (garante +8 pts)                    │
│  [ Tempo Normal ] [ Prorrogação ] [ Pênaltis ]   │
└──────────────────────────────────────────────────┘
```

## Decisões confirmadas

- Jogos da fase de grupos ocultados via flag `is_hidden` (histórico preservado)
- Navegação por fase (Oitavas / Quartas / Semifinal / Final) em vez de Rodada 1/2/3
- Desempate via flags explícitas em `predictions`: `is_full_hit` e `is_partial_hit`
- Palpite do mata-mata captura: quem passa (`predicted_winner`) + como passa
  (`predicted_method`), não mais placar numérico
- Coluna `round` em `matches` usada para identificar a fase:
  4 = 16 avos de final (16 jogos), 5 = Oitavas de final (8 jogos),
  6 = Quartas de final (4 jogos), 7 = Semifinal (2 jogos),
  8 = Disputa de 3º Lugar (1 jogo), 9 = Final (1 jogo)
- Tabela separada `bracket` armazena o chaveamento completo e alimenta
  confrontos automaticamente fase a fase via trigger

---

# FASE 1 — Pode rodar AGORA (antes do dia 28/06)

> Objetivo: preparar tudo na branch `feature/mata-mata-v2`, sem afetar
> produção nem os 33 usuários ativos na fase de grupos.

## Prompt 1.1 — Branch de trabalho

```
Crie uma branch a partir da main chamada `feature/mata-mata-v2`.
Não faça merge nem deploy até receber instrução explícita no dia
28/06 — produção continua intocada até então.
```

## Prompt 1.2 — Migration aditiva: novas colunas no banco

```
Crie a migration supabase/migrations/005_mata_mata_columns.sql,
SOMENTE ADITIVA (sem remover nem renomear nenhuma coluna existente):

-- Visibilidade dos jogos antigos da fase de grupos
ALTER TABLE matches
  ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE,
  ADD COLUMN winner TEXT,          -- 'home' ou 'away' (quem se classificou)
  ADD COLUMN match_method TEXT;    -- 'normal', 'extra_time', 'penalties'

-- Palpite do mata-mata: classificado + método
ALTER TABLE predictions
  ADD COLUMN predicted_winner TEXT,         -- 'home' ou 'away'
  ADD COLUMN predicted_method TEXT,         -- 'normal', 'extra_time', 'penalties'
  ADD COLUMN is_full_hit BOOLEAN DEFAULT FALSE,    -- acertou classificado + método (20 pts)
  ADD COLUMN is_partial_hit BOOLEAN DEFAULT FALSE; -- acertou só classificado (12 pts)

As colunas antigas predicted_home_score e predicted_away_score ficam
intactas — continuam armazenando os palpites da fase de grupos e não
devem ser removidas.

Execute essa migration APENAS em staging/banco de teste. NÃO execute
contra produção nesta fase.
```

## Prompt 1.3 — Trigger novo de pontuação para o mata-mata

```
Escreva a function/trigger SQL para calcular pontos dos palpites do
mata-mata. Salve em supabase/migrations/006_mata_mata_trigger.sql.
NÃO inclua o comando CREATE TRIGGER neste arquivo ainda — deixe
apenas a function, para ativação manual na Fase 2.

Regras:
- Acerto Completo (predicted_winner = winner E predicted_method =
  match_method): 20 pontos, is_full_hit = true
- Acerto Parcial (predicted_winner = winner, predicted_method errado
  ou nulo): 12 pontos, is_partial_hit = true
- Erro (predicted_winner != winner): 0 pontos

CREATE OR REPLACE FUNCTION calculate_knockout_points()
RETURNS TRIGGER AS $$
DECLARE
  real_winner TEXT;
  real_method TEXT;
  points INTEGER := 0;
  full_hit BOOLEAN := FALSE;
  partial_hit BOOLEAN := FALSE;
BEGIN
  -- Só processa palpites de jogos do mata-mata (round >= 4)
  SELECT m.winner, m.match_method INTO real_winner, real_method
  FROM matches m WHERE m.id = NEW.match_id;

  -- Se o resultado oficial ainda não foi preenchido, sai sem calcular
  IF real_winner IS NULL THEN
    RETURN NEW;
  END IF;

  -- Se o palpite não tem predicted_winner (palpite da fase de grupos),
  -- sai sem alterar — não sobrescreve pontuação antiga
  IF NEW.predicted_winner IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.predicted_winner = real_winner THEN
    IF NEW.predicted_method IS NOT NULL
       AND NEW.predicted_method = real_method THEN
      points := 20;
      full_hit := TRUE;
    ELSE
      points := 12;
      partial_hit := TRUE;
    END IF;
  ELSE
    points := 0;
  END IF;

  NEW.points_earned := points;
  NEW.is_full_hit := full_hit;
  NEW.is_partial_hit := partial_hit;

  -- Atualizar total_points no perfil do usuário
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

Adicione também um segundo trigger em matches que recalcula
automaticamente todos os palpites quando o admin preenche o resultado
(winner/match_method), para não depender de loop manual no frontend:

CREATE OR REPLACE FUNCTION recalculate_on_result()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.winner IS NOT NULL AND (OLD.winner IS NULL OR OLD.winner != NEW.winner
     OR OLD.match_method IS DISTINCT FROM NEW.match_method) THEN
    UPDATE predictions
    SET updated_at = NOW()
    WHERE match_id = NEW.id
      AND predicted_winner IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

(O UPDATE no trigger acima dispara o trigger calculate_knockout_points
em cada prediction afetada, recalculando automaticamente.)

Teste isoladamente em staging com jogos fake, cobrindo os 3 cenários:
acerto completo (20), acerto parcial (12) e erro (0). Confirme que
is_full_hit e is_partial_hit ficam corretos em cada caso.
```

## Prompt 1.3b — Novo card de palpite do usuário para o mata-mata

```
CONTEXTO: atualmente o card de palpite do usuário exibe três botões
(Time da Casa / Empate / Time Visitante). No mata-mata não existe
empate — sempre há um classificado — e o palpite agora captura
"quem passa" + "como passa" (método opcional que vale +8 pts).

Na branch feature/mata-mata-v2, crie um novo componente
KnockoutMatchCard (ou adapte o MatchCard existente com renderização
condicional baseada em match.round >= 4) para os jogos do mata-mata:

ESTRUTURA DO CARD:

1. Cabeçalho: fase do jogo (ex: "Oitavas de Final"), data e horário.

2. Confronto: bandeira + nome do time da casa à esquerda, "VS" no
   centro, bandeira + nome do visitante à direita.

3. Seleção de classificado (obrigatório):
   Dois botões grandes lado a lado — [Time da Casa] e [Visitante].
   Apenas um pode estar selecionado por vez. O botão selecionado
   recebe destaque visual (borda verde-menta + fundo levemente
   iluminado). Sem opção de empate.

4. Seleção de método (opcional, mas premiada):
   Três botões menores abaixo: [Tempo Normal] [Prorrogação] [Pênaltis].
   Label acima: "Como passa? (garante +8 pts se acertar)".
   O método é opcional — o usuário pode confirmar o palpite sem
   selecionar método (nesse caso predicted_method fica null e o
   máximo que pode ganhar é 12 pts).

5. Botão "Confirmar Palpite":
   Habilitado apenas quando pelo menos o classificado estiver
   selecionado. Grava predicted_winner ('home' ou 'away') e
   predicted_method ('normal', 'extra_time', 'penalties' ou null)
   na tabela predictions.

6. Estados do card após palpite registrado:
   - Inputs desabilitados, mostrando as seleções feitas (somente
     leitura).
   - Badge "Aguardando resultado..." enquanto is_finished = false.
   - Quando is_finished = true: exibir "Classificado: [time]
     via [método]" + badge de pontos obtidos:
     • 20 pts → "Acerto Completo! 🎯" (dourado)
     • 12 pts → "Classificado certo ✓" (verde-menta)
     • 0 pts → "Sem pontos" (cinza)

7. Regras de bloqueio:
   - Card bloqueado (somente leitura, sem confirmação possível) se
     match_date <= now, independentemente de ter palpite ou não.
   - Card bloqueado se já existe prediction para este match_id e
     user_id.

Teste manualmente: registre um palpite com e sem método, confirme
que predicted_winner e predicted_method são gravados corretamente
em predictions, e que o card fica somente leitura após confirmação.
```

## Prompt 1.4 — Query de ranking com desempate e navegação por fase

```
Atualize o hook useLeaderboard.ts na branch feature/mata-mata-v2
com a nova query de ranking, aplicando os dois critérios de
desempate:

SELECT
  p.id,
  p.username,
  p.total_points,
  COUNT(*) FILTER (WHERE pr.is_full_hit = true) AS full_hits,
  COUNT(*) FILTER (
    WHERE pr.is_full_hit = true OR pr.is_partial_hit = true
  ) AS total_classified_correct
FROM profiles p
LEFT JOIN predictions pr ON pr.user_id = p.id
GROUP BY p.id, p.username, p.total_points
ORDER BY
  p.total_points DESC,
  full_hits DESC,
  total_classified_correct DESC,
  p.username ASC;

No componente LeaderboardTable.tsx, exiba duas colunas extras
discretas ao lado da pontuação de cada usuário:
- Ícone 🎯 + contagem de acertos completos (full_hits)
- Ícone ✓ + contagem total de classificados certos

Isso permite que qualquer usuário entenda sua posição em caso de
empate de pontos sem precisar perguntar.

Teste com dados fake simulando empate de total_points entre dois
usuários, um com mais full_hits que o outro, e confirme que a
ordenação aplica o desempate corretamente.
```

## Prompt 1.5 — Navegação por fase do mata-mata (substituir abas de rodada)

```
Na branch feature/mata-mata-v2, substitua a navegação atual de abas
por rodada (Rodada 1 / Rodada 2 / Rodada 3) por navegação por fase
do mata-mata, usando o valor da coluna `round` dos jogos para
determinar a fase exibida:

Mapeamento de round → nome da fase:
- round = 4 → "16 avos de Final"
- round = 5 → "Oitavas de Final"
- round = 6 → "Quartas de Final"
- round = 7 → "Semifinal"
- round = 8 → "Disputa de 3º Lugar"
- round = 9 → "Final"

A aba ativa ao entrar na página deve ser a fase com jogos mais
próximos da data atual (menor match_date >= now entre os disponíveis,
ou a última fase com jogos já encerrados se todos já passaram).

A query de busca de jogos deve manter o filtro WHERE is_hidden = false
(implementado a seguir no prompt 1.6) para garantir que a fase de
grupos não apareça mesmo que is_hidden não tenha sido ativado ainda
em produção.

A lógica de renderização deve usar KnockoutMatchCard para todos os
jogos com round >= 4.
```

## Prompt 1.6 — Lógica de visibilidade e filtro de jogos

```
Na branch feature/mata-mata-v2, ajuste a query de busca de jogos
(useMatches.ts ou equivalente) para incluir:

.eq('is_hidden', false)

Isso garante que jogos da fase de grupos (que receberão is_hidden =
true na Fase 2) desapareçam automaticamente da tela de Palpites e
da navegação por fase assim que a flag for ativada em produção.

Implemente também um tratamento visual para o estado em que nenhum
jogo visível existe ainda (ex: "Os confrontos do mata-mata serão
divulgados em breve." com ícone e call-to-action), pois entre o
hide da fase de grupos e o insert dos jogos do mata-mata pode haver
uma janela de minutos onde a tela ficaria vazia.
```

## Prompt 1.7 — Tela de Admin: resultado do mata-mata

```
Na branch feature/mata-mata-v2, atualize a tela de Admin para que
os jogos do mata-mata (round >= 4) exibam um formulário diferente
do usado na fase de grupos:

Em vez de dois inputs de placar numérico (home_score / away_score),
exibir:

1. Seleção do classificado: dois botões [Time da Casa] [Visitante],
   gravando em matches.winner ('home' ou 'away').

2. Seleção do método: três botões [Tempo Normal] [Prorrogação]
   [Pênaltis], gravando em matches.match_method ('normal',
   'extra_time', 'penalties').

3. Botão "Salvar Resultado": grava winner e match_method na linha
   correspondente de matches e marca is_finished = true.
   O trigger recalculate_on_result (Prompt 1.3) cuida de disparar
   o recálculo automático de todos os palpites daquele jogo — o
   admin não precisa fazer nada além de salvar.

4. Após salvar, o card do admin deve exibir o resultado registrado
   em modo somente leitura com opção "Corrigir" caso o admin precise
   alterar (re-habilita os campos).

Os cards de jogos da fase de grupos na tela do admin continuam com
o formulário antigo de placar numérico (home_score / away_score),
usando renderização condicional por round.
```

## Prompt 1.8 — Modelagem do bracket e seed dos jogos do mata-mata

```
CONTEXTO: a Copa 2026 tem 48 times. O mata-mata começa nos 16 avos
de final (32 times, 16 jogos), seguido de oitavas (8 jogos), quartas
(4 jogos), semifinal (2 jogos), disputa de 3º lugar (1 jogo) e final
(1 jogo) — total de 32 jogos no mata-mata.

O objetivo desta tarefa é:
1. Criar a tabela `bracket` que armazena o chaveamento completo e
   define quais jogos alimentam quais confrontos nas fases seguintes.
2. Preparar o seed dos 32 jogos em `matches` com IDs FIXOS e
   explícitos (usar INSERT com ID literal, não autoincrement), para
   que o bracket possa referenciar esses IDs com precisão.
3. Criar o trigger que preenche automaticamente home_team/away_team
   nos jogos das fases seguintes quando o admin salva o resultado de
   um jogo da fase anterior.

────────────────────────────────────────────────────
PARTE A — Tabela bracket
────────────────────────────────────────────────────

Crie a migration supabase/migrations/007_bracket.sql:

CREATE TABLE bracket (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches(id),  -- jogo que esta linha representa
  next_match_id INTEGER REFERENCES matches(id),       -- jogo para onde o vencedor vai
  next_match_slot TEXT CHECK (next_match_slot IN ('home', 'away')),
  -- 'home' = vencedor entra como time da casa no próximo jogo
  -- 'away' = vencedor entra como visitante no próximo jogo
  loser_match_id INTEGER REFERENCES matches(id),      -- só preenchido para semifinais (disputa 3º)
  loser_match_slot TEXT CHECK (loser_match_slot IN ('home', 'away'))
);

Mapeamento de round → nome e quantidade de jogos:
- round = 4 → "16 avos de Final"   (16 jogos, IDs 101–116)
- round = 5 → "Oitavas de Final"   ( 8 jogos, IDs 117–124)
- round = 6 → "Quartas de Final"   ( 4 jogos, IDs 125–128)
- round = 7 → "Semifinal"          ( 2 jogos, IDs 129–130)
- round = 8 → "Disputa de 3º Lugar"( 1 jogo,  ID  131)
- round = 9 → "Final"              ( 1 jogo,  ID  132)

(Ajuste os IDs iniciais conforme o maior ID atual em matches no
banco de produção — verifique com SELECT MAX(id) FROM matches antes
de rodar. Os IDs acima são sugestão de base; o importante é que
sejam explícitos e sequenciais.)

────────────────────────────────────────────────────
PARTE B — Seed dos 32 jogos com IDs fixos
────────────────────────────────────────────────────

Salve em supabase/seed_mata_mata.sql. Use INSERT com ID explícito:

-- Exemplo: 16 avos de final (ajuste datas/horários com os valores
-- reais confirmados — você informará as datas ao executar na Fase 2)
INSERT INTO matches
  (id, group_name, home_team, away_team, home_team_flag,
   away_team_flag, match_date, round, is_hidden, winner, match_method)
VALUES
  (101, '16 avos de Final', 'TBD', 'TBD', '', '', '2026-07-04 19:00:00-03', 4, false, null, null),
  (102, '16 avos de Final', 'TBD', 'TBD', '', '', '2026-07-04 15:00:00-03', 4, false, null, null),
  -- ... (16 linhas para os 16 avos, IDs 101–116)

  (117, 'Oitavas de Final', 'TBD', 'TBD', '', '', '2026-07-09 17:00:00-03', 5, false, null, null),
  -- ... (8 linhas para oitavas, IDs 117–124)

  (125, 'Quartas de Final', 'TBD', 'TBD', '', '', '2026-07-14 16:00:00-03', 6, false, null, null),
  -- ... (4 linhas para quartas, IDs 125–128)

  (129, 'Semifinal',         'TBD', 'TBD', '', '', '2026-07-?? ??:??:??-03', 7, false, null, null),
  (130, 'Semifinal',         'TBD', 'TBD', '', '', '2026-07-?? ??:??:??-03', 7, false, null, null),
  (131, 'Disputa de 3º Lugar','TBD','TBD', '', '', '2026-07-18 18:00:00-03', 8, false, null, null),
  (132, 'Final',              'TBD', 'TBD','', '', '2026-07-19 16:00:00-03', 9, false, null, null);

────────────────────────────────────────────────────
PARTE C — Seed do bracket (relacionamento entre jogos)
────────────────────────────────────────────────────

Salve em supabase/seed_bracket.sql. Preencha a tabela bracket
seguindo o chaveamento oficial da Copa 2026 (Lado A e Lado B
conforme imagens de referência fornecidas):

-- Exemplo parcial (Lado A):
INSERT INTO bracket (match_id, next_match_id, next_match_slot, loser_match_id, loser_match_slot)
VALUES
-- 16 avos → oitavas
  (101, 117, 'home', null, null),  -- vencedor do jogo 101 → casa do jogo 117
  (102, 117, 'away', null, null),  -- vencedor do jogo 102 → visitante do jogo 117
  (103, 118, 'home', null, null),
  (104, 118, 'away', null, null),
  -- ... (continuar para todos os 16 avos)

-- Oitavas → quartas
  (117, 125, 'home', null, null),
  (118, 125, 'away', null, null),
  -- ...

-- Quartas → semifinal
  (125, 129, 'home', null, null),
  (126, 129, 'away', null, null),
  (127, 130, 'home', null, null),
  (128, 130, 'away', null, null),

-- Semifinal → final e disputa de 3º
  (129, 132, 'home', 131, 'home'),  -- vencedor vai à final, perdedor à disputa 3º
  (130, 132, 'away', 131, 'away');

NÃO execute nada contra produção ainda. Preencha os IDs e datas
reais assim que os confrontos dos 16 avos forem confirmados
(dia 28/06). O chaveamento completo (oitavas em diante) segue a
estrutura fixa das imagens de referência — apenas os times mudam
conforme os resultados.

────────────────────────────────────────────────────
PARTE D — Trigger de progressão automática de confrontos
────────────────────────────────────────────────────

Salve em supabase/migrations/008_bracket_progression.sql:

CREATE OR REPLACE FUNCTION advance_bracket()
RETURNS TRIGGER AS $$
DECLARE
  b RECORD;
BEGIN
  -- Só dispara quando winner é preenchido (resultado definido)
  IF NEW.winner IS NULL OR OLD.winner = NEW.winner THEN
    RETURN NEW;
  END IF;

  -- Busca a linha de bracket para este jogo
  SELECT * INTO b FROM bracket WHERE match_id = NEW.id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Determina qual time avançou
  DECLARE
    advancing_team TEXT;
    advancing_flag TEXT;
    losing_team TEXT;
    losing_flag TEXT;
  BEGIN
    IF NEW.winner = 'home' THEN
      advancing_team := NEW.home_team;
      advancing_flag := NEW.home_team_flag;
      losing_team    := NEW.away_team;
      losing_flag    := NEW.away_team_flag;
    ELSE
      advancing_team := NEW.away_team;
      advancing_flag := NEW.away_team_flag;
      losing_team    := NEW.home_team;
      losing_flag    := NEW.home_team_flag;
    END IF;

    -- Preenche o slot do vencedor no próximo jogo
    IF b.next_match_id IS NOT NULL THEN
      IF b.next_match_slot = 'home' THEN
        UPDATE matches SET home_team = advancing_team,
                           home_team_flag = advancing_flag
        WHERE id = b.next_match_id;
      ELSE
        UPDATE matches SET away_team = advancing_team,
                           away_team_flag = advancing_flag
        WHERE id = b.next_match_id;
      END IF;
    END IF;

    -- Preenche o slot do perdedor na disputa de 3º (se semifinal)
    IF b.loser_match_id IS NOT NULL THEN
      IF b.loser_match_slot = 'home' THEN
        UPDATE matches SET home_team = losing_team,
                           home_team_flag = losing_flag
        WHERE id = b.loser_match_id;
      ELSE
        UPDATE matches SET away_team = losing_team,
                           away_team_flag = losing_flag
        WHERE id = b.loser_match_id;
      END IF;
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

NÃO crie o CREATE TRIGGER ainda — deixe apenas a function para
ativação manual na Fase 2 (Prompt 2.3b).

Teste em staging: insira dois jogos fake de 16 avos com times reais,
salve o winner do primeiro, e confirme que home_team ou away_team do
jogo de oitavas correspondente foi preenchido automaticamente.
```

## Prompt 1.9 — Testes completos na branch isolada

```
Valide na branch feature/mata-mata-v2 usando banco de teste/staging,
cobrindo todos os cenários:

Pontuação:
1. Palpite com classificado certo + método certo → 20 pts,
   is_full_hit = true, is_partial_hit = false.
2. Palpite com classificado certo + método errado → 12 pts,
   is_full_hit = false, is_partial_hit = true.
3. Palpite com classificado certo + sem método → 12 pts,
   is_full_hit = false, is_partial_hit = true.
4. Palpite com classificado errado → 0 pts,
   is_full_hit = false, is_partial_hit = false.
5. Admin preenche resultado → trigger recalcula todos os palpites
   daquele jogo automaticamente, sem loop manual.

Bracket e progressão automática:
6. Inserir seed_mata_mata.sql + seed_bracket.sql em staging.
7. Salvar winner = 'home' em jogo dos 16 avos → confirmar que
   home_team do jogo de oitavas correspondente foi preenchido
   automaticamente com o nome correto do time.
8. Salvar winner = 'away' em outro jogo dos 16 avos → confirmar
   que away_team do mesmo jogo de oitavas foi preenchido.
9. Simular as duas semifinais: confirmar que vencedor vai para a
   Final e perdedor vai para Disputa de 3º Lugar automaticamente.
10. Confirmar que card de jogo com TBD fica bloqueado para palpite
    na interface (usuário não consegue palpitar antes de saber
    quem são os times).

Ranking e desempate:
11. Dois usuários com mesmo total_points, mas full_hits diferentes →
    quem tem mais full_hits aparece na frente.
12. Dois usuários com mesmo total_points e mesmo full_hits, mas
    total_classified_correct diferentes → quem tem mais aparece
    na frente.

Interface:
13. Card bloqueado quando match_date <= now.
14. Card bloqueado após palpite registrado (somente leitura).
15. Badge correto exibido para 20 pts, 12 pts e 0 pts.
16. Navegação por fase exibe corretamente 16 avos / Oitavas /
    Quartas / Semifinal / Disputa 3º / Final.
17. Jogos com is_hidden = true não aparecem na tela de Palpites.

Documente os resultados em TESTING.md na branch, sem fazer merge.
```

---

# FASE 2 — Só rodar a PARTIR do dia 28/06 (momento da virada)

> Estes prompts afetam produção e o ranking dos 33 usuários.
> Execute na ordem exata, antes do primeiro jogo do mata-mata.

## Prompt 2.1 — Merge e deploy

```
Faça merge da branch feature/mata-mata-v2 para main. Confirme que o
deploy automático no Vercel terminou com sucesso e que a aplicação
em produção está servindo a nova versão antes de seguir para o
próximo passo.
```

## Prompt 2.2 — Rodar migrations aditivas em produção

```
Execute contra o banco de produção, na ordem:

1. supabase/migrations/005_mata_mata_columns.sql
   (adiciona is_hidden, winner, match_method em matches;
    adiciona predicted_winner, predicted_method, is_full_hit,
    is_partial_hit em predictions)

2. supabase/migrations/006_mata_mata_trigger.sql
   (cria as functions calculate_knockout_points e
    recalculate_on_result — ainda sem ativar os triggers)

3 007_leaderboard_v2_view.sql

4 008_bracket.sql 

5 009_bracket_progression.sql

6 seed_bracket.sql

7 seed_mata_mata.sql

Confirme que todas as colunas foram criadas sem erro e sem afetar
os registros existentes da fase de grupos.
```

## Prompt 2.3 — Ativar triggers em produção

```
Execute contra produção:

-- Trigger principal: calcula pontos ao inserir/atualizar palpite
DROP TRIGGER IF EXISTS on_knockout_prediction ON predictions;
CREATE TRIGGER on_knockout_prediction
  BEFORE INSERT OR UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION calculate_knockout_points();

-- Trigger auxiliar: recalcula automaticamente quando admin salva resultado
DROP TRIGGER IF EXISTS on_match_result ON matches;
CREATE TRIGGER on_match_result
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION recalculate_on_result();

A partir deste momento, todo novo palpite do mata-mata e toda
atualização de resultado pelo admin disparam o cálculo correto.
```

## Prompt 2.3b — Ativar trigger de progressão automática do bracket

```
Execute contra produção:

-- Trigger de chaveamento: avança times para próxima fase automaticamente
DROP TRIGGER IF EXISTS on_bracket_advance ON matches;
CREATE TRIGGER on_bracket_advance
  AFTER UPDATE OF winner ON matches
  FOR EACH ROW EXECUTE FUNCTION advance_bracket();

A partir deste momento, toda vez que o admin preencher o vencedor
(campo winner) de qualquer jogo, o sistema automaticamente:
- Identifica qual jogo da próxima fase é alimentado por este resultado
  (via tabela bracket)
- Preenche home_team ou away_team do próximo jogo com o nome e bandeira
  do time classificado
- Se for uma semifinal, preenche também o perdedor na disputa de 3º lugar

O admin não precisa digitar os times manualmente nas fases seguintes —
basta salvar o resultado de cada jogo que o bracket avança sozinho.

Valide em produção após ativar:
1. Salve o winner de um jogo dos 16 avos.
2. Confirme que o slot correto (home_team ou away_team) do jogo de
   oitavas correspondente foi preenchido automaticamente.
3. Confirme que o card desse jogo de oitavas já exibe o nome do
   time classificado na interface do usuário.
```

## Prompt 2.4 — Ocultar jogos da fase de grupos

```
Execute contra produção:

UPDATE matches SET is_hidden = true WHERE round IN (1, 2, 3);

Ajuste a condição WHERE se necessário (pode usar intervalo de
match_date como alternativa: WHERE match_date < '2026-06-28').

Confirme visualmente na tela de Palpites que os jogos da fase de
grupos sumiram, mas continuam existindo no banco (não deletados).
```

## Prompt 2.5 — Inserir jogos do mata-mata e seed do bracket

```
ANTES DE EXECUTAR: verifique o maior ID atual em matches no banco
de produção para garantir que os IDs fixos do seed não colidem:

SELECT MAX(id) FROM matches;

Ajuste os IDs do seed_mata_mata.sql se necessário.

Em seguida, substitua todos os placeholders (TBD) em
supabase/seed_mata_mata.sql pelos times reais dos 16 avos de final
confirmados após o encerramento da fase de grupos. Os jogos das
fases seguintes (oitavas em diante) ficam com TBD — o trigger de
progressão os preencherá automaticamente conforme os resultados
dos 16 avos forem sendo salvos pelo admin.

Execute contra produção NA ORDEM:

1. supabase/seed_mata_mata.sql
   (insere os 32 jogos com IDs fixos — apenas os 16 avos com times
   reais, demais com TBD)

2. supabase/seed_bracket.sql
   (insere o chaveamento completo na tabela bracket, ligando cada
   jogo ao próximo — já deve estar completo pois o chaveamento da
   Copa é fixo, independente dos times)

Confirme após execução:
1. Os 32 jogos aparecem no banco com os IDs corretos.
2. A tabela bracket tem 31 linhas (uma por jogo, exceto a final
   que não alimenta nenhum próximo).
3. Os jogos dos 16 avos aparecem na tela de Palpites com times
   reais e KnockoutMatchCard habilitado.
4. Os jogos de oitavas em diante aparecem com "TBD x TBD" e card
   bloqueado (match_date futura — usuários poderão palpitar quando
   os times forem preenchidos pelo trigger após o resultado dos avos).
5. Salve o winner de um jogo dos 16 avos de teste e confirme que o
   time avança automaticamente para o slot correto nas oitavas.
```

## Prompt 2.6 — Reset do ranking

```
Execute contra produção:

UPDATE profiles SET total_points = 0;

Os registros da tabela predictions da fase de grupos são preservados
como histórico — apenas total_points é zerado, não os palpites.

Confirme visualmente que o dashboard mostra 0 pts para todos os
usuários antes de abrir os palpites do mata-mata.
```

## Prompt 2.7 — Validação final pós-virada

```
Antes de comunicar a virada aos usuários, valide em produção:

1. Dashboard mostra 0 pts para todos os usuários.
2. Jogos da fase de grupos não aparecem na tela de Palpites.
3. Jogos do mata-mata aparecem corretamente por fase, com
   KnockoutMatchCard e botões habilitados.
4. Palpite de teste registrado (com método) → após admin salvar
   resultado, pontuação calculada automaticamente (20 ou 12 pts),
   sem ação manual adicional.
5. Desempate funciona: dois usuários de teste com mesmo total_points
   ordenados corretamente por full_hits.
6. Sem erros no console do navegador nem nos logs do Supabase.

Após validado, comunique aos usuários:
"O ranking foi zerado. Começa agora o Bolão do Mata-Mata!
Regras: acertar quem passa = 12 pts | acertar quem passa + como
passa = 20 pts. Boa sorte!"
```
