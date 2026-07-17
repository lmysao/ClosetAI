# 👔 ClosetAI — Seu Guarda-Roupa Inteligente

> Tire fotos das suas roupas e deixe a IA montar combinações perfeitas para cada ocasião. Gerencie lavanderia, rotação, reservas para eventos, viagens e muito mais.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📋 Sumário

- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [📦 Pré-requisitos](#-pré-requisitos)
- [🚀 Rodando localmente](#-rodando-localmente)
- [🔧 Variáveis de Ambiente](#-variáveis-de-ambiente)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [📋 Scripts Disponíveis](#-scripts-disponíveis)
- [🗄️ Sobre o Banco de Dados (SQLite)](#-sobre-o-banco-de-dados-sqlite)
- [☁️ Deploy no Render](#-deploy-no-render)
- [⏰ Mantenha acordado com UptimeRobot](#-mantenha-acordado-com-uptimerobot)
- [🤖 Sobre a IA (VLM + LLM)](#-sobre-a-ia-vlm--llm)
- [❓ FAQ](#-faq)
- [📄 Licença](#-licença)

---

## ✨ Funcionalidades

### 📸 Cadastro de peças com IA
- **Tire uma foto** (ou envie da galeria) e a IA analisa automaticamente: categoria, cor, tecido, padrão, formalidade, estação, marca
- **Foto do verso opcional** — para estampas/logos nas costas (visualização em **flip card 3D**: toque para virar!)
- **Detecção de defeitos** — a IA procura buracos, manchas, desfiados, pilling, etc.
- **Instruções de lavagem** específicas por tecido
- **Restrições de uso** (ex: "não usar na chuva")
- **Dicas de conservar** (ex: "mancha de gordura sai com detergente")

### ✨ Combinações com IA
- Escolha o **evento** (casual, trabalho, social, elegante, esporte, casa, casual-chique)
- Informe horário, clima e observações
- A IA gera **3 combinações diferentes** (clássica, ousada, confortável) com pontuação e explicação
- **Personalize** qualquer sugestão: remova peças (ex: tirar o relógio), troque por outras, adicione acessórios
- **Modo Manual**: monte o look do zero, peça por peça, camada por camada

### 🧺 Lavanderia inteligente
- **Cesto de roupas sujas**, **reutilizáveis** e **em lavagem**
- **Regras de reuso** automáticas:
  - Cuecas/calcinhas/sutiãs/meias → sempre pro cesto após 1 uso
  - Camisetas → 1 reuso · Camisas → 2 · Bermudas → 2 · Calças → 4 · Calçados/casacos → 5-6
- Botão **"Lavar tudo"** ou lave peças individuais
- Alerta quando íntimas estão acabando
- Histórico de lavagens

### 📌 Reservas para eventos futuros
- Reserve um conjunto de peças para uma data/evento específico
- As peças reservadas **não entram em outras combinações** da IA
- Marque **"Usar conjunto"** quando for usar, ou **"Cancelar reserva"**

### 🧳 Modo viagem / longe de casa
- Informe destino, datas, clima, transporte e **contexto** (praia, chácara, piscina, trabalho, família, montanha, camping...)
- A IA sugere um **conjunto completo** considerando duração, clima e contexto
- Edite a sugestão antes de salvar
- Acompanhe status: planejada → em viagem → concluída

### 🛍️ Dicas de compra com IA
- A IA analisa seu guarda-roupa e sugere:
  - Peças **faltando** (essenciais em falta)
  - **Reposições** de peças muito usadas
  - **Acessórios** que dariam mais versatilidade
  - **Perfume** que combina com seu estilo (Coffee Unique e Coffee Essencial do O Boticário em destaque!)

### 📊 Estatísticas
- Score de rotação do guarda-roupa
- Gráficos: peças por categoria (barras) e por formalidade (pizza)
- Ranking de mais usadas e esquecidas no armário
- Essenciais em falta

### 👁️ Visualização de looks (Nano Banana)
- Gere um **prompt detalhado** + baixe um **ZIP** com as imagens das peças
- CRUD de **fotos de modelo** (até 3)
- Use no Nano Banana (ou similar) para vestir a pessoa da foto modelo com as peças do look

### 📦 Adicionar em lote
- **Múltiplas fotos**: selecione vários arquivos → IA analisa cada uma em paralelo → revise e salve todas
- **Foto vestida**: envie UMA foto de você (ou alguém) vestido → a IA detecta cada peça separadamente → salve as que quiser

### 🎨 Outros
- 🌙 **Modo escuro**
- 📱 **Totalmente responsivo** (mobile com bottom nav, desktop com sidebar)
- ❤️ Peças favoritas
- ⏰ Avisos de peças esquecidas no armário
- 🎯 Detecção de essenciais em falta

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, output standalone) |
| **Linguagem** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Estilo** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Banco de dados** | [Prisma ORM](https://www.prisma.io/) + SQLite (local) / Supabase PostgreSQL (produção) |
| **Estado** | [Zustand](https://zustand.docs.pmnd.rs/) (cliente) + [TanStack Query](https://tanstack.com/query) (servidor) |
| **IA - Visão** | [Google Gemini](https://ai.google.dev/gemini-api/docs) (VLM para análise de imagens) |
| **IA - Texto** | [Groq](https://console.groq.com/docs) (LLM para geração de texto) |
| **Runtime/PackageManager** | [Bun](https://bun.sh/) |
| **Ícones** | [lucide-react](https://lucide.dev/) |
| **Gráficos** | [Recharts](https://recharts.org/) |
| **ZIP** | [JSZip](https://stuk.github.io/jszip/) |

---

## 📦 Pré-requisitos

- **[Bun](https://bun.sh/)** ≥ 1.0 (runtime + package manager)
- **Node.js** ≥ 18 (algumas ferramentas podem precisar)
- **Git** para clonar o repositório

Instale o Bun:
```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

---

## 🚀 Rodando localmente

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO

# 2. Instale as dependências
bun install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# O .env já vem com DATABASE_URL apontando para SQLite local (db/custom.db)

# 4. Crie o banco de dados e gere o client do Prisma
bun run db:push

# 5. (Opcional) Popule com peças demo para testar
bun run seed
#    Ou use o botão "Criar peças demo" no dashboard da aplicação

# 6. Rode em desenvolvimento
bun run dev
```

Abra **http://localhost:3000** no navegador. 🎉

> 💡 **Dica:** Clique em **"Criar peças demo"** no dashboard (ou rode `bun run seed`) para popular com 31 peças masculinas de exemplo e testar todas as funcionalidades imediatamente.

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (use `.env.example` como base):

```env
# Banco de dados SQLite local (desenvolvimento)
DATABASE_URL="file:./dev.db"

# Supabase PostgreSQL (produção)
SUPABASE_DATABASE_URL="postgresql://postgres:[senha]@db.[projeto].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[projeto].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anonima"

# Gemini API (visão)
GEMINI_API_KEY="sua_gemini_api_key"
GEMINI_VISION_MODEL="gemini-2.5-flash"

# Groq API (texto)
GROQ_API_KEY="sua_groq_api_key"
GROQ_TEXT_MODEL="llama-3.3-70b-versatile"

# Ambiente
NODE_ENV="development"
```

> ⚠️ **Nunca commite o `.env`!** Ele já está no `.gitignore`.

### Obter as Credenciais

**Gemini API:**
1. Acesse [ai.google.dev](https://ai.google.dev/)
2. Crie um projeto e gere uma API Key
3. Plano gratuito: 15 requisições de visão/dia, 1.500 de texto/dia

**Groq API:**
1. Acesse [console.groq.com](https://console.groq.com/)
2. Crie uma conta gratuita
3. Gere uma API Key em Settings → API Keys
4. Plano gratuito: modelos Llama 3.3 70B gratuitos com alta velocidade

**Supabase:**
1. Acesse [supabase.com](https://supabase.com/)
2. Crie um projeto gratuito (500MB PostgreSQL)
3. Obtenha URL, anon key e database URL no painel

---

## 📁 Estrutura do Projeto

```
.
├── prisma/
│   └── schema.prisma          # Schema do banco (Garment, Outfit, ReservedSet, TravelPlan, ModelPhoto...)
├── src/
│   ├── app/
│   │   ├── api/               # API Routes (garments, outfits, laundry, shopping, reserved, travel, model-photos, visualize)
│   │   ├── globals.css        # Estilos globais + tema âmbar/marrom
│   │   ├── layout.tsx         # Layout raiz com providers
│   │   └── page.tsx           # Página única (shell + navegação entre seções)
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui (Button, Card, Dialog, Sheet, Tabs...)
│   │   ├── sections/          # Seções da app (dashboard, wardrobe, outfits, laundry, reserve, travel, shopping, stats)
│   │   ├── add-garment-dialog.tsx      # Adicionar peça única (foto + IA + cuidados)
│   │   ├── batch-add-dialog.tsx        # Adicionar em lote (multi-foto + foto vestida)
│   │   ├── garment-card.tsx            # Card de peça no grid
│   │   ├── garment-detail-sheet.tsx    # Detalhe da peça (flip card, editar cuidados)
│   │   ├── garment-picker-dialog.tsx   # Picker de peças por camada
│   │   ├── outfit-builder.tsx          # Builder de looks (manual + edição)
│   │   └── visualize-dialog.tsx        # Visualização (prompt + ZIP para Nano Banana)
│   ├── lib/
│   │   ├── ai.ts              # Helpers de IA (analyzeGarmentPhoto, suggestOutfits, analyzeWornOutfit, suggestTravel, generateShopping)
│   │   ├── constants.ts       # Categorias, cores, formalidades, contextos de viagem, defeitos comuns...
│   │   ├── hooks.ts           # Hooks TanStack Query (garments, laundry, reserved, travel, model-photos, visualize...)
│   │   ├── store.ts           # Store Zustand (seção ativa, filtros)
│   │   ├── types.ts           # Tipos TypeScript compartilhados
│   │   ├── image-utils.ts     # Resize/compressão de imagens no cliente
│   │   └── db.ts              # Client Prisma
│   └── hooks/                 # Hooks utilitários (use-mobile, use-toast)
├── public/                    # Assets estáticos
├── scripts/
│   └── seed.ts                # Script de seed (cria 31 peças demo via CLI)
├── prisma/
│   └── schema.prisma          # Schema SQLite (provider = "sqlite")
├── .env                       # Variáveis (NÃO commitar)
├── .env.example               # Template de variáveis
├── .gitignore
├── next.config.ts             # output: "standalone"
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📋 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `bun run dev` | Inicia o servidor de desenvolvimento (porta 3000) |
| `bun run build` | Build de produção (gera `.next/standalone`) |
| `bun run start` | Inicia o servidor de produção (após build) |
| `bun run lint` | Roda o ESLint |
| `bun run db:push` | Sincroniza o schema Prisma com o banco (cria tabelas) |
| `bun run db:generate` | Regenera o client do Prisma |
| `bun run db:migrate` | Cria e aplica migrations (desenvolvimento) |
| `bun run db:reset` | Reseta o banco (cuidado!) |
| `bun run seed` | Cria 31 peças demo (se banco vazio) |
| `bun run seed:force` | Força recriação das peças demo (apaga tudo) |

---

## ☁️ Deploy no Render

O projeto agora usa **Supabase PostgreSQL** para produção, eliminando a necessidade de disco persistente no Render.

### Passo 1: Configure o Supabase

1. Acesse [supabase.com](https://supabase.com/) e crie um projeto gratuito
2. Obtenha as credenciais no painel:
   - Project URL
   - anon key
   - Database URL (Settings → Database → Connection string)
3. Configure as variáveis de ambiente (ver seção acima)

### Passo 2: Prepare o repositório

```bash
git add .
git commit -m "feat: migrar para Gemini+Groq e Supabase"
git push origin main
```

### Passo 3: Crie o serviço no Render

1. Acesse [render.com](https://render.com/) e faça login
2. Clique em **New +** → **Web Service**
3. Conecte seu repositório do GitHub
4. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `closetai` |
| **Runtime** | `Node` |
| **Build Command** | `bun install && bun run db:generate && bun run build` |
| **Start Command** | `bun .next/standalone/server.js` |
| **Plan** | `Free` |

### Passo 4: Configure variáveis de ambiente no Render

Na aba **Environment**, adicione:

| Key | Value |
|-----|-------|
| `SUPABASE_DATABASE_URL` | `postgresql://postgres:[senha]@db.[projeto].supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[projeto].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sua_chave_anonima` |
| `GEMINI_API_KEY` | `sua_gemini_api_key` |
| `GEMINI_VISION_MODEL` | `gemini-2.5-flash` |
| `GROQ_API_KEY` | `sua_groq_api_key` |
| `GROQ_TEXT_MODEL` | `llama-3.3-70b-versatile` |
| `NODE_ENV` | `production` |

### Passo 5: Deploy

1. Clique em **Create Web Service**
2. Aguarde o build (2-5 minutos)
3. Acesse a URL gerada
4. O schema será criado automaticamente no Supabase via Prisma

> � **Plano detalhado:** Veja `RENDER_DEPLOYMENT_PLAN.md` para instruções completas.

---

## ⏰ Mantenha acordado com UptimeRobot

O plano **Free** do Render **hiberna** após 15 minutos de inatividade (o primeiro acesso após hibernação demora ~30s). O UptimeRobot faz pings periódicos para manter acordado.

### Passo 1: Crie conta no UptimeRobot

1. Acesse [uptimerobot.com](https://uptimerobot.com/) e crie uma conta grátis
2. Confirme o email

### Passo 2: Adicione um monitor

1. Clique em **Add New Monitor**
2. Configure:

| Campo | Valor |
|-------|-------|
| **Monitor Type** | `HTTP(s)` |
| **Friendly Name** | `ClosetAI` |
| **URL (or IP)** | `https://closetai.onrender.com` (sua URL do Render) |
| **Monitoring Interval** | `5 minutes` (recomendado para free tier do Render) |
| **Monitor Timeout** | `30 seconds` |
| **Alerts To** | Seu email (cadastre mais se quiser) |

3. Clique em **Create Monitor**

### Passo 3: (Opcional) Configure alertas

- Em **My Settings**, adicione outros canais de alerta (Telegram, Slack, Discord, etc.)
- Você receberá um aviso se o serviço cair

> 💡 **Dica:** Com pings a cada 5 minutos, o serviço Free do Render não hiberna. Se estiver no plano **Starter** ($7/mês), não há hibernação e o UptimeRobot serve só para monitoramento de uptime.

---

## 🗄️ Sobre o Banco de Dados (SQLite)

### Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│   Next.js App   │────▶│   Prisma ORM    │────▶│   SQLite (arquivo)  │
│  (Render/local) │     │  (server-side)  │     │  db/custom.db       │
└─────────────────┘     └─────────────────┘     └─────────────────────┘
                                                         │
                                                         │
                                          ┌──────────────┴──────────────┐
                                          │  imagens base64 em TEXT     │
                                          │  (mesmo arquivo do banco)   │
                                          └─────────────────────────────┘
```

O app (Next.js) roda no host (local ou Render). O banco é um **arquivo SQLite** (`db/custom.db`) no filesystem. As imagens das peças são armazenadas como **base64** em colunas `String` do SQLite — sem storage externo (S3, etc.).

> 💡 **Prisma + SQLite:** O Prisma é um ORM (biblioteca no seu código) que traduz queries TypeScript em SQL. O SQLite é o banco de dados em si (arquivo local). Eles não competem — trabalham juntos: Prisma lê/escreve no arquivo SQLite via `DATABASE_URL="file:..."`.

### Como o schema está configurado

O `prisma/schema.prisma` usa `provider = "sqlite"`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

No SQLite, todos os campos `String` do Prisma viram `TEXT` (sem limite de tamanho). Por isso não precisamos de anotações especiais como `@db.Text` — o SQLite é flexível com isso.

```prisma
model Garment {
  // ...
  imageData          String    // imagem frontal base64 (~50KB) — vira TEXT no SQLite
  backImage          String?   // imagem do verso base64 (opcional)
  careInstructions   String?   // texto livre de cuidados
  usageRestrictions  String?
  defects            String?
  careTips           String?
  // ...
}

model Outfit {
  garmentIds  String  @default("[]")  // JSON array de IDs (serializado como string)
  reason      String?                 // explicação da IA
}
```

Todos os campos `garmentIds` (JSON arrays serializados), `reason`, `notes`, `imageData` são guardados como `TEXT`.

### Como as imagens são armazenadas

**Fluxo completo:**

1. **Cliente (browser):** usuário tira foto ou escolhe da galeria
2. **`resizeImage()` em `src/lib/image-utils.ts`:** redimensiona para máx. 800px via canvas, converte para JPEG qualidade 0.82 → data URL `data:image/jpeg;base64,...` (~30-50KB)
3. **API Route:** recebe a data URL e salva direto no banco via Prisma (`imageData: dataUrl`)
4. **Banco (SQLite):** armazena como `TEXT` na coluna `imageData` do arquivo `db/custom.db`
5. **Leitura:** a API retorna a data URL, o `<img src={dataUrl}>` renderiza direto

**Por que base64 e não storage externo?**
- ✅ Simplifica muito — sem upload, sem URLs assinadas, sem CORS
- ✅ Backup = copiar um arquivo (`db/custom.db`)
- ✅ Funciona para app pessoal (1GB no Render comporta ~20.000 peças)
- ⚠️ Trade-off: banco cresce mais rápido. Para escalar, mover para storage externo (ver seção abaixo).

### Como o Prisma Client é gerado

O Prisma lê o `schema.prisma` e gera um client TypeScript tipado em `node_modules/@prisma/client`. Isso acontece:

- **No install/build:** `bun run db:generate` (incluído no Build Command do Render)
- **Após mudar o schema:** rode `bun run db:generate` localmente e reinicie o dev server

O client é importado em `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const db = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

O cache global evita criar múltiplas instâncias em dev (hot reload). Todas as API routes usam `import { db } from '@/lib/db'`.

### Como as tabelas são criadas

**`bun run db:push`** lê o schema e sincroniza o banco (cria/altera tabelas). Diferente de `db:migrate`, não cria arquivos de migration — é ideal para desenvolvimento rápido.

Para produção com histórico de mudanças versionadas, use `bun run db:migrate` (cria migrations em `prisma/migrations/` que podem ser commitadas e aplicadas em qualquer ambiente).

### Como o seed funciona

O `scripts/seed.ts` é um script standalone (não roda dentro do Next.js) que cria 31 peças demo usando o Prisma Client diretamente:

```bash
bun run seed              # cria se vazio
bun run seed:force        # apaga tudo e recria
```

Também dá pra criar peças demo pela UI (botão "Criar peças demo" no dashboard), que chama a API `/api/garments/seed`.

### Verificando que está funcionando

Após `bun run db:push` + `bun run seed`:

1. **Local:** o arquivo `db/custom.db` deve existir (alguns MB de tamanho)
2. **Inspecione via CLI (opcional):**
   ```bash
   # Se tiver sqlite3 instalado:
   sqlite3 db/custom.db "SELECT category, COUNT(*) FROM Garment GROUP BY category;"
   ```
3. **Na aplicação** (`bun run dev`), o dashboard deve mostrar "31 peças"
4. **No Render:** rode via Shell `bun run db:push && bun run seed` — depois acesse a URL

### Troubleshooting comum

**❌ `Error: P1001: Can't reach database server`**
- Improvável com SQLite (é arquivo local) — verifique se a pasta `db/` existe e o caminho no `.env` está correto
- No Render: confirme que o disco persistente está montado em `/opt/data` e `DATABASE_URL=file:/opt/data/custom.db`

**❌ `Error: SQLITE_BUSY: database is locked`**
- Outro processo está usando o banco — reinicie o dev server
- Em produção com SQLite, evite requisições concorrentes pesadas (não é problema pra app pessoal)

**❌ App funciona local mas não no Render**
- Confirme que `DATABASE_URL` no Render aponta para `file:/opt/data/custom.db` (disco persistente)
- Sem disco persistente, o banco é perdido a cada deploy!
- Verifique os logs do Render — erros do Prisma aparecem lá

**❌ Banco perdido após deploy no Render**
- Você esqueceu o **Disk persistente** (Passo 3 do Deploy). Adicione um disco em `/opt/data` e configure `DATABASE_URL=file:/opt/data/custom.db`

**❌ Tabelas não aparecem / "No such table"**
- Rode `bun run db:push` (cria as tabelas)
- No Render, rode via Shell: `bun run db:push`

### Caminho de escala (futuro)

| Cenário | O que fazer |
|---------|-------------|
| **Banco crescendo (>800MB)** | Mover imagens base64 para um storage externo (Cloudflare R2, S3) e guardar só a URL no banco |
| **Multi-usuário** | Adicionar `userId` nos models + NextAuth.js (ou Supabase Auth se migrar) + migrar para PostgreSQL |
| **Concorrência alta** | Migrar SQLite → PostgreSQL (Render Postgres grátis ou Supabase) — troca `provider` no schema + ajusta connection string |
| **Realtime** (notificações de lavanderia, etc) | Adicionar WebSocket ou Supabase Realtime (se migrar) |

> 💡 **Quando migrar SQLite → PostgreSQL?** Quando: (1) precisar de multi-usuário com dados isolados, (2) tiver mais de ~500MB de dados, (3) quiser dashboard web pra ver/editar dados, ou (4) quiser banco independente do host. A migração com Prisma é tranquila: troca `provider = "postgresql"`, adiciona `@db.Text` nos campos grandes, ajusta `DATABASE_URL` para `postgresql://...`. O resto do código não muda.

### Models principais

- **Garment** — peça de roupa (com imageData, backImage, careInstructions, defects, etc.)
- **Outfit** — look salvo/usado
- **ReservedSet** — conjunto reservado para evento futuro
- **TravelPlan** — plano de viagem
- **ModelPhoto** — foto de modelo para visualização
- **WashLog** — histórico de lavagens
- **ShoppingTip** — dicas de compra geradas pela IA

---

## 🤖 Sobre a IA (VLM + LLM)

O projeto usa **Gemini** (visão) e **Groq** (texto), ambos com planos gratuitos:

- **Gemini (Google AI)** — VLM para análise de imagens:
  - `analyzeGarmentPhoto(image, backImage?)` → categoria, cor, tecido, defeitos, cuidados, etc.
  - `analyzeWornOutfitPhoto(image)` → separa peças de uma foto de pessoa vestida
  - Modelo: `gemini-2.5-flash` (rápido e gratuito)
  - Limite gratuito: 15 requisições de visão/dia

- **Groq** — LLM para geração de texto:
  - `suggestOutfits(garments, event)` → 3 combinações para o evento
  - `suggestTravelOutfit(garments, trip)` → conjunto para viagem
  - `generateShoppingTips(garments, history)` → dicas de compra
  - `analyzeRotation(garments)` → análise de rotação
  - Modelo: `llama-3.3-70b-versatile` (alta velocidade com LPU)
  - Limite gratuito: modelos gratuitos com alta taxa de requisições

> ⚠️ Ambos SDKs são **server-side only**. Nunca use no cliente (pode expor credenciais).

---

## ❓ FAQ

### Onde ficam armazenadas as fotos das roupas?
As fotos são redimensionadas para no máx. 800px no cliente, convertidas para JPEG (~50KB) e armazenadas como **base64** em colunas `TEXT` do SQLite (arquivo `db/custom.db`). Não há upload para serviços externos.

### A IA funciona offline?
Não. As chamadas de VLM/LLM precisam de internet e das credenciais do SDK configuradas.

### Como fazer backup dos meus dados?
- **Local:** Basta copiar o arquivo `db/custom.db` (tudo está lá dentro — peças, imagens, reservas, etc.)
- **Render:** Copie do disco persistente (`/opt/data/custom.db`) via Shell ou use a aba de backup do disco

### Posso usar com múltiplos usuários?
Atualmente é single-user (sem autenticação). Para multi-usuário, seria necessário adicionar NextAuth.js + adicionar `userId` nos models + idealmente migrar para PostgreSQL (que suporta concorrência melhor que SQLite).

### As combinações da IA são determinísticas?
Não, o LLM gera combinações variadas a cada chamada. As regras (íntimas sempre disponíveis, respeitar reuso, excluir reservadas) são aplicadas via filtros antes de enviar para a IA.

### Como funciona a visualização no Nano Banana?
O sistema gera um **prompt detalhado** descrevendo cada peça + baixa um **ZIP** com `prompt.txt` + imagens das peças + foto modelo. Você descompacta, envia tudo no Nano Banana (ou similar) e a IA veste a pessoa da foto modelo com as peças.

---

## 📄 Licença

MIT License. Sinta-se livre para usar, modificar e distribuir.

---

<p align="center">
  Feito com 🤎 usando Next.js + IA<br/>
  <sub>Coffee Unique & Coffee Essencial — O Boticário ☕</sub>
</p>
