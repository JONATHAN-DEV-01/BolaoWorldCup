# Bolão World Cup 2026

Sistema de bolão para a Copa do Mundo 2026, desenvolvido com React + TypeScript + Supabase.

## Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS v4 + CSS Custom Properties
- **Backend/DB:** Supabase (Auth + PostgreSQL + Realtime)
- **Roteamento:** React Router v6
- **State Management:** React Context API + Hooks

## Funcionalidades

- ✅ Autenticação (login + cadastro + logout)
- ✅ Palpites por jogo (placar exato, um por usuário)
- ✅ Bloqueio de palpite após início do jogo
- ✅ Ranking em tempo real via Supabase Realtime
- ✅ Painel admin para inserir resultados
- ✅ Cálculo automático de pontos
- ✅ Design dark mode premium responsivo
- ✅ 72 jogos inseridos (Rodadas 1, 2 e 3)

## Pontuação

| Acerto | Pontos |
|--------|--------|
| Empate correto | **10 pts** |
| Vencedor correto | **5 pts** |
| Resultado errado | 0 pts |

## Setup Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/JONATHAN-DEV-01/BolaoWorldCup.git
   cd BolaoWorldCup
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o banco de dados no **Supabase Dashboard → SQL Editor**:
   - Execute `supabase/migrations/001_initial_schema.sql`
   - Execute `supabase/seed.sql`

4. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais Supabase
   ```

5. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy

```bash
npm run build
```
A pasta `dist/` gerada é compatível com **Vercel** e **Netlify**.

## Estrutura de Rotas

| Rota | Descrição |
|------|-----------|
| `/login` | Login + Cadastro |
| `/predictions` | Palpites por rodada (protegida) |
| `/dashboard` | Ranking em tempo real (protegida) |
| `/admin` | Painel admin — apenas `is_admin = true` |

## Tornar usuário Admin

Execute no Supabase SQL Editor:
```sql
UPDATE profiles SET is_admin = true WHERE username = 'seu_username';
```
