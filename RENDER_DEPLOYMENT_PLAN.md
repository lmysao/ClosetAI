# Plano de Implementação no Render - ClosetAI

## Visão Geral
Este documento descreve como fazer o deploy do ClosetAI no Render usando:
- **Banco de dados**: Supabase PostgreSQL (produção) / SQLite local (desenvolvimento)
- **IA**: Gemini (visão) + Groq (texto) - ambos com planos gratuitos
- **Framework**: Next.js 16 com Bun

## Pré-requisitos

### 1. Configurar Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login
2. Crie um novo projeto ou use o existente: `zegztgviqzszpwbafyfv`
3. Obtenha as credenciais:
   - **Project URL**: `https://zegztgviqzszpwbafyfv.supabase.co`
   - **anon key**: Já fornecida
   - **Database URL**: No painel do Supabase → Settings → Database → Connection string → URI
   - **service_role key**: No painel do Supabase → Settings → API → service_role (opcional)

### 2. Configurar Gemini (Google AI)
1. Acesse [ai.google.dev](https://ai.google.dev/)
2. Crie um projeto ou use existente
3. Gere uma API Key em [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
4. Salve a API Key

### 3. Configurar Groq
1. Acesse [console.groq.com](https://console.groq.com/)
2. Crie uma conta gratuita
3. Gere uma API Key em Settings → API Keys
4. Salve a API Key

## Passo 1: Configurar Variáveis de Ambiente Local

Crie o arquivo `.env` na raiz do projeto:

```env
# Banco de dados SQLite local (desenvolvimento)
DATABASE_URL="file:./dev.db"

# Supabase (produção)
SUPABASE_DATABASE_URL="postgresql://postgres:[SENHA]@db.zegztgviqzszpwbafyfv.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://zegztgviqzszpwbafyfv.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publisha*****yA_aNCtQItc"

# Gemini (visão)
GEMINI_API_KEY="sua_gemini_api_key"
GEMINI_VISION_MODEL="gemini-2.5-flash"

# Groq (texto)
GROQ_API_KEY="sua_groq_api_key"
GROQ_TEXT_MODEL="llama-3.3-70b-versatile"

# Ambiente
NODE_ENV="development"
```

## Passo 2: Instalar Dependências

```bash
bun install
```

Isso instalará:
- `@google/generative-ai` - SDK do Gemini
- `groq-sdk` - SDK do Groq
- `@supabase/supabase-js` - Cliente do Supabase

## Passo 3: Configurar Banco de Dados Supabase

### Opção A: Via Prisma Migrate (Recomendado)

1. No terminal, execute:
```bash
# Usar o schema do Supabase
cp supabase/schema.prisma prisma/schema.prisma.backup
cp supabase/schema.prisma prisma/schema.prisma

# Configurar variável temporariamente
export SUPABASE_DATABASE_URL="postgresql://postgres:[SENHA]@db.zegztgviqzszpwbafyfv.supabase.co:5432/postgres"

# Gerar client
bun run db:generate

# Push do schema para o Supabase
bun run db:push
```

### Opção B: Via SQL Direto no Supabase

1. Acesse o SQL Editor no painel do Supabase
2. Execute o SQL gerado pelo Prisma:
```bash
# Gerar SQL do schema
bunx prisma db push --print-only > supabase_migration.sql
```
3. Copie e cole o SQL no SQL Editor do Supabase

## Passo 4: Testar Localmente com Supabase

```bash
# Testar com Supabase
NODE_ENV=production DATABASE_URL="postgresql://postgres:[SENHA]@db.zegztgviqzszpwbafyfv.supabase.co:5432/postgres" bun run dev
```

## Passo 5: Preparar para Deploy no Render

### 5.1 Commit das Mudanças

```bash
git add .
git commit -m "feat: migrar de Zai API para Gemini+Groq e adicionar Supabase"
git push origin main
```

### 5.2 Criar Web Service no Render

1. Acesse [render.com](https://render.com)
2. **New +** → **Web Service**
3. Conecte o repositório GitHub
4. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `closetai` |
| **Runtime** | `Node` |
| **Build Command** | `bun install && bun run db:generate && bun run build` |
| **Start Command** | `bun .next/standalone/server.js` |
| **Plan** | `Free` |

### 5.3 Configurar Variáveis de Ambiente no Render

Na aba **Environment**, adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `file:./dev.db` (SQLite para fallback) |
| `SUPABASE_DATABASE_URL` | `postgresql://postgres:[SENHA]@db.zegztgviqzszpwbafyfv.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zegztgviqzszpwbafyfv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publisha*****yA_aNCtQItc` |
| `GEMINI_API_KEY` | `sua_gemini_api_key` |
| `GEMINI_VISION_MODEL` | `gemini-2.5-flash` |
| `GROQ_API_KEY` | `sua_groq_api_key` |
| `GROQ_TEXT_MODEL` | `llama-3.3-70b-versatile` |
| `NODE_ENV` | `production` |

### 5.4 Deploy

1. Clique em **Create Web Service**
2. Aguarde o build (2-5 minutos)
3. Acesse a URL gerada

## Passo 6: Configurar Switch entre Banco Local e Supabase

### No código (`src/lib/db.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Em produção, usa Supabase; em dev, usa SQLite local
const databaseUrl = process.env.NODE_ENV === 'production' 
  ? process.env.SUPABASE_DATABASE_URL 
  : process.env.DATABASE_URL;

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

### Alternar Schema Prisma

Criar script para alternar entre SQLite e PostgreSQL:

```bash
# scripts/switch-db.sh
#!/bin/bash

if [ "$1" = "supabase" ]; then
  cp supabase/schema.prisma prisma/schema.prisma
  echo "Schema do Supabase ativado"
elif [ "$1" = "local" ]; then
  cp prisma/schema.prisma.backup prisma/schema.prisma
  echo "Schema local ativado"
else
  echo "Uso: ./switch-db.sh [supabase|local]"
fi
```

## Passo 7: Configurar UptimeRobot (Opcional)

Para evitar hibernação no plano Free do Render:

1. Acesse [uptimerobot.com](https://uptimerobot.com/)
2. **Add New Monitor**
3. Configure:
   - **Monitor Type**: `HTTP(s)`
   - **URL**: `https://closetai.onrender.com`
   - **Interval**: `5 minutes`

## Custos Estimados

| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| Render (Web Service) | Free | $0 |
| Supabase (PostgreSQL) | Free (500MB) | $0 |
| Gemini API | Free tier | $0 (até limite) |
| Groq API | Free tier | $0 (até limite) |
| **Total** | | **$0** |

## Limites dos Planos Gratuitos

### Gemini Free Tier
- 15 requisições/visão por dia
- 1.500 requisições/texto por dia
- Suficiente para uso pessoal

### Groq Free Tier
- Taxa de requisições muito alta (LPU)
- Modelos Llama 3.3 70B gratuitos
- Excelente para uso pessoal

### Supabase Free Tier
- 500MB de banco de dados
- 1GB de transferência
- 2 projetos gratuitos
- Suficiente para app pessoal

### Render Free Tier
- Hiberna após 15min de inatividade
- Primeiro acesso após hibernação: ~30s
- Build time limitado
- Sem disco persistente (usamos Supabase)

## Troubleshooting

### Erro: "GEMINI_API_KEY não configurada"
- Verifique se a variável está configurada no `.env` ou no Render

### Erro: "GROQ_API_KEY não configurada"
- Verifique se a variável está configurada no `.env` ou no Render

### Erro: "Connection refused" no Supabase
- Verifique se `SUPABASE_DATABASE_URL` está correta
- Verifique se o IP está permitido no Supabase (Settings → Database → Connection pooling)

### Erro: "Schema mismatch"
- Execute `bun run db:generate` após mudar o schema
- Use `bun run db:push` para sincronizar

### Deploy falha no Render
- Verifique os logs no Render
- Certifique-se que `bun install` está funcionando
- Verifique se todas as variáveis de ambiente estão configuradas

## Próximos Passos

1. **Testar localmente** com as novas APIs antes do deploy
2. **Fazer backup** do banco SQLite local antes de migrar
3. **Monitorar uso** das APIs Gemini e Groq nos primeiros dias
4. **Considerar upgrade** se os limites gratuitos forem insuficientes

## Referências

- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)
