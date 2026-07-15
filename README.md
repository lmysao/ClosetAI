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
- [🗄️ Configurando o Supabase (banco de dados)](#-configurando-o-supabase-banco-de-dados)
- [☁️ Deploy no Render](#-deploy-no-render)
- [⏰ Mantenha acordado com UptimeRobot](#-mantenha-acordado-com-uptimerobot)
- [🗄️ Sobre o Banco de Dados (Supabase / PostgreSQL)](#-sobre-o-banco-de-dados-supabase--postgresql)
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
| **Banco de dados** | [Prisma ORM](https://www.prisma.io/) + [Supabase](https://supabase.com/) (PostgreSQL) |
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
# Edite o .env com sua connection string do Supabase (ver seção abaixo)

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
# Banco de dados Supabase (PostgreSQL)
# Pegue no painel: Project Settings → Database → Connection string → URI
DATABASE_URL="postgresql://postgres:[SUA_SENHA]@db.[PROJETO].supabase.co:5432/postgres"

# Para produção (Render, Vercel...), use a POOLER (porta 6543) p/ evitar esgotar conexões:
# DATABASE_URL="postgresql://postgres.[PROJETO]:[SUA_SENHA]@aws-0-[regiao].pooler.supabase.com:6543/postgres"

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
│   └── schema.prisma          # Schema PostgreSQL (provider = "postgresql")
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

## 🗄️ Configurando o Supabase (banco de dados)

O projeto usa **Supabase** (PostgreSQL gerenciado com free tier generoso: 500MB + dashboard + backup automático).

### Passo 1: Crie a conta e o projeto

1. Acesse [supabase.com](https://supabase.com/) e cadastre-se (pode ser com GitHub)
2. Clique em **New Project**
3. Configure:
   - **Name:** `closetai` (ou o nome que preferir)
   - **Database Password:** crie uma senha forte **e guarde-a** 🔑
   - **Region:** a mais próxima de você (ex: South America — São Paulo)
   - **Plan:** Free
4. Aguarde ~2 minutos para o projeto provisionar

### Passo 2: Pegue a connection string

1. No painel do Supabase, vá em **Project Settings** (⚙️ ícone no rodapé esquerdo) → **Database**
2. Na seção **Connection String**, escolha **URI**
3. Você verá algo como:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghij.supabase.co:5432/postgres
   ```
4. Substitua `[YOUR-PASSWORD]` pela senha que criou no Passo 1

> 💡 **Duas conexões disponíveis:**
> - **Direct connection** (porta `5432`) — para migrations locais e `db:push`
> - **Connection pooler** (porta `6543`) — para produção (app web), evita esgotar conexões. Pegue na aba "Connection pooling"

### Passo 3: Configure localmente

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edite o `.env` com sua connection string **direta** (porta 5432):
   ```env
   DATABASE_URL="postgresql://postgres:SUA_SENHA@db.abcdefghij.supabase.co:5432/postgres"
   ```
3. Crie as tabelas no banco:
   ```bash
   bun run db:push
   ```
4. (Opcional) Popule com peças demo:
   ```bash
   bun run seed
   ```
5. Rode o projeto:
   ```bash
   bun run dev
   ```

### Passo 4: Verifique no painel do Supabase

Após rodar `bun run db:push`, abra o **Table Editor** no painel do Supabase — você verá as tabelas criadas:
- `Garment`, `Outfit`, `WashLog`, `ShoppingTip`, `EventItem`, `ReservedSet`, `TravelPlan`, `ModelPhoto`

Se rodou `bun run seed`, a tabela `Garment` terá 31 peças demo. Você pode editar/ver os dados direto pelo dashboard! 🎉

---

## ☁️ Deploy no Render

O Render hospeda a aplicação Next.js. O banco fica no Supabase (independente do host).

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

### Passo 3: Configure as variáveis de ambiente no Render

Na aba **Environment** do serviço, adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Connection string do Supabase — **use a POOLER (porta 6543)** |
| `NODE_ENV` | `production` |

**Exemplo de `DATABASE_URL` para o Render (pooler):**
```
postgresql://postgres.abcdefghij:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

> 💡 Pegue essa URL no painel do Supabase: **Project Settings → Database → Connection pooling → URI**

Adicione também as credenciais da IA conforme o SDK exigir.

### Passo 4: Deploy

1. Clique em **Create Web Service** (ou **Save Changes** se já existir)
2. Aguarde o build (2-5 minutos na primeira vez)
3. Quando terminar, acesse a URL: `https://closetai.onrender.com`
4. Na primeira vez, o `bun run db:push` já foi rodado no build (Build Command), então as tabelas já existem no Supabase
5. (Opcional) Se quiser peças demo em produção, rode via **Shell** no Render:
   ```bash
   bun run seed
   ```

> 🔄 **Deploy automático:** Habilite "Auto-Deploy" no Render para re-deployar a cada `git push` na `main`.
>
> 🆓 **Sem disco persistente necessário!** Como o banco é no Supabase, você **não precisa** de Disk no Render. Tudo é externo.

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

## 🗄️ Sobre o Banco de Dados (Supabase / PostgreSQL)

O projeto usa **Supabase** (PostgreSQL gerenciado) via Prisma ORM. As imagens das peças são armazenadas como **base64** em colunas `@db.Text` (text ilimitado) — funciona bem para um app pessoal e evita a necessidade de storage externo.

**Vantagens dessa abordagem:**
- ✅ Banco independente do host (troque Render por Vercel/Railway sem migrar dados)
- ✅ Dashboard web do Supabase para ver/editar dados manualmente
- ✅ Backup automático (mesmo no free tier)
- ✅ Free generoso: 500MB banco + 1GB storage + 50k requisições/mês
- ✅ Pronto para escalar (auth, storage, realtime já inclusos)

**Desvantagens:**
- ⚠️ Free tier hiberna após 1 semana inativo (mesma necessidade de UptimeRobot)
- ⚠️ Banco pode crescer (~50KB por imagem após resize para 800px) — 500MB comporta ~10.000 peças

**Para escalar (multi-usuário / muitas imagens):** Mova as imagens base64 para o **Storage do Supabase** (1GB grátis) e guarde apenas a URL no banco. Adicione NextAuth.js para auth multi-usuário.

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
As fotos são redimensionadas para no máx. 800px no cliente, convertidas para JPEG (~50KB) e armazenadas como **base64** em colunas `@db.Text` no Supabase (PostgreSQL). Não há upload para serviços externos.

### A IA funciona offline?
Não. As chamadas de VLM/LLM precisam de internet e das credenciais do SDK configuradas.

### Como fazer backup dos meus dados?
- **Via Supabase:** O Supabase faz backup automático. Para backup manual, vá em **Dashboard → Database → Backups** ou exporte via SQL Editor (`COPY ... TO ...`)
- **Via Prisma:** Use `bun run db:migrate` para ter histórico de migrations versionadas

### Posso usar com múltiplos usuários?
Atualmente é single-user (sem autenticação). Como o banco já é PostgreSQL no Supabase, para multi-usuário bastaria adicionar NextAuth.js (ou Supabase Auth) + um campo `userId` nos models. O Supabase já traz auth pronto.

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
