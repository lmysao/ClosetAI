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
| **Banco de dados** | [Prisma ORM](https://www.prisma.io/) + SQLite (local) |
| **Estado** | [Zustand](https://zustand.docs.pmnd.rs/) (cliente) + [TanStack Query](https://tanstack.com/query) (servidor) |
| **IA** | [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) (VLM + LLM) |
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
# Banco de dados SQLite local (arquivo na pasta db/)
DATABASE_URL="file:/home/z/my-project/db/custom.db"

# Em produção no Render, use disco persistente (ver seção Deploy):
# DATABASE_URL="file:/opt/data/custom.db"

# Credenciais da IA (z-ai-web-dev-sdk)
# Configure conforme a documentação do SDK
# ZAI_API_KEY=sua_chave_aqui  # se aplicável
```

> ⚠️ **Nunca commite o `.env`!** Ele já está no `.gitignore`.

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

O Render hospeda a aplicação Next.js. O banco SQLite fica num **disco persistente** montado no serviço.

### Passo 1: Prepare o repositório

```bash
git add .
git commit -m "feat: ClosetAI - guarda-roupa inteligente com IA"
git push origin main
```

> ✅ O `.gitignore` já está configurado: `.env`, `db/`, `node_modules`, `.next/` não são commitados.

### Passo 2: Crie o serviço no Render

1. Acesse [render.com](https://render.com/) e faça login (pode ser com GitHub)
2. Clique em **New +** → **Web Service**
3. Conecte seu repositório do GitHub
4. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `closetai` (ou o nome que preferir) |
| **Runtime** | `Node` (ou deixe auto-detectar) |
| **Build Command** | `bun install && bun run db:generate && bun run build` |
| **Start Command** | `bun .next/standalone/server.js` |
| **Plan** | `Free` (ou `Starter` $7/mês para não hibernar) |

> ⚠️ **Start Command:** O script `start` do `package.json` usa `2>&1 | tee server.log` que pode falhar no Render. Use o comando direto `bun .next/standalone/server.js`.

### Passo 3: Disco persistente (IMPORTANTE para SQLite)

Como o Render tem filesystem efêmero (a cada deploy o disco é resetado), você precisa de um **Disk** para o banco SQLite não ser perdido:

1. Na aba **Disks** do serviço, clique em **Add Disk**
2. Configure:
   - **Name:** `closetai-data`
   - **Mount Path:** `/opt/data`
   - **Size:** `1 GB` (suficiente para SQLite + imagens base64)
3. Configure a variável de ambiente (ver Passo 4):

### Passo 4: Configure as variáveis de ambiente no Render

Na aba **Environment** do serviço, adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `file:/opt/data/custom.db` (caminho no disco persistente) |
| `NODE_ENV` | `production` |

Adicione também as credenciais da IA conforme o SDK exigir.

### Passo 5: Deploy

1. Clique em **Create Web Service** (ou **Save Changes** se já existir)
2. Aguarde o build (2-5 minutos na primeira vez)
3. Quando terminar, acesse a URL: `https://closetai.onrender.com`
4. Na primeira vez após o deploy, **rode a migration + seed** via Shell:
   - Vá em **Shell** no Render
   - Execute:
     ```bash
     bun run db:push
     bun run seed
     ```
   - Isso cria o banco no disco persistente e popula com peças demo

> 🔄 **Deploy automático:** Habilite "Auto-Deploy" no Render para re-deployar a cada `git push` na `main`.
>
> ⚠️ **Atenção:** O disco persistente é **necessário** com SQLite. Sem ele, o banco é perdido a cada deploy. Para evitar essa gestão, migre para PostgreSQL (Render Postgres grátis ou Supabase) — ver seção "Caminho de escala".

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

O projeto usa o **z-ai-web-dev-sdk** que fornece:

- **VLM (Vision Language Model)** — analisa fotos de roupas:
  - `analyzeGarmentPhoto(image, backImage?)` → categoria, cor, tecido, defeitos, cuidados, etc.
  - `analyzeWornOutfitPhoto(image)` → separa peças de uma foto de pessoa vestida
- **LLM (Large Language Model)** — gera texto inteligente:
  - `suggestOutfits(garments, event)` → 3 combinações para o evento
  - `suggestTravelOutfit(garments, trip)` → conjunto para viagem
  - `generateShoppingTips(garments, history)` → dicas de compra

> ⚠️ O SDK é **server-side only**. Nunca use no cliente (pode expor credenciais).

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
