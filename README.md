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
- [☁️ Deploy no Render](#-deploy-no-render)
- [⏰ Mantenha acordado com UptimeRobot](#-mantenha-acordado-com-uptimerobot)
- [🗄️ Sobre o Banco de Dados (SQLite)](#-sobre-o-banco-de-dados-sqlite)
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
| **Banco de dados** | [Prisma ORM](https://www.prisma.io/) + SQLite |
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
# Edite o .env conforme necessário (ver seção abaixo)

# 4. Crie o banco de dados e gere o client do Prisma
bun run db:push

# 5. (Opcional) Popule com peças demo para testar
#    Use o botão "Criar peças demo" no dashboard da aplicação

# 6. Rode em desenvolvimento
bun run dev
```

Abra **http://localhost:3000** no navegador. 🎉

> 💡 **Dica:** Clique em **"Criar peças demo"** no dashboard para popular com 31 peças masculinas de exemplo e testar todas as funcionalidades imediatamente.

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (use `.env.example` como base):

```env
# Banco de dados SQLite (caminho do arquivo)
DATABASE_URL="file:./db/custom.db"

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
├── .env                       # Variáveis (NÃO commitar)
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
| `bun run db:push` | Sincroniza o schema Prisma com o banco |
| `bun run db:generate` | Regenera o client do Prisma |
| `bun run db:migrate` | Cria e aplica migrations (desenvolvimento) |
| `bun run db:reset` | Reseta o banco (cuidado!) |

---

## ☁️ Deploy no Render

O Render é uma plataforma PaaS que suporta Next.js com deploy automático via GitHub.

### Passo 1: Prepare o repositório

1. **Adicione `db/` ao `.gitignore`** (para não commitar o banco SQLite local):
   ```gitignore
   # banco sqlite local
   /db/
   ```

2. **Crie um `.env.example`** (já deve existir) e confirme que `.env` está ignorado.

3. **Faça commit e push** para o GitHub:
   ```bash
   git add .
   git commit -m "feat: ClosetAI - guarda-roupa inteligente com IA"
   git push origin main
   ```

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
| **Plan** | `Free` (ou `Starter` para não hibernar) |

> ⚠️ **Importante sobre o Start Command:** O script `start` do `package.json` usa `2>&1 | tee server.log` que pode falhar no Render. Use o comando direto `bun .next/standalone/server.js` no campo de Start.

### Passo 3: Configure as variáveis de ambiente no Render

Na aba **Environment** do serviço, adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `file:./db/custom.db` (ver seção sobre disco persistente abaixo) |
| `NODE_ENV` | `production` |

Adicione também as credenciais da IA conforme o SDK exigir.

### Passo 4: Disco persistente (IMPORTANTE para SQLite)

Como o Render tem filesystem efêmero (a cada deploy o disco é resetado), você precisa de um **Disk** para o banco SQLite não ser perdido:

1. Na aba **Disks** do serviço, clique em **Add Disk**
2. Configure:
   - **Name:** `closetai-data`
   - **Mount Path:** `/opt/data` (ou outro path)
   - **Size:** `1 GB` (suficiente para SQLite + imagens base64)
3. Atualize a variável de ambiente:
   - `DATABASE_URL` = `file:/opt/data/custom.db`

> 💡 **Alternativa:** Se preferir não usar disco, migre para **PostgreSQL** (Render oferece Postgres grátis). Será necessário trocar o `provider` no `schema.prisma` de `sqlite` para `postgresql` e ajustar tipos (ex: `String` para IDs, remover `file:`). Para um app pessoal, SQLite + disco é mais simples.

### Passo 5: Deploy

1. Clique em **Create Web Service** (ou **Save Changes** se já existir)
2. Aguarde o build (pode levar 2-5 minutos na primeira vez)
3. Quando terminar, acesse a URL: `https://closetai.onrender.com`
4. Na primeira vez após o deploy, **rode a migration** via Shell:
   - Vá em **Shell** no Render
   - Execute: `bun run db:push`
   - Isso cria o banco no disco persistente

> 🔄 **Deploy automático:** Se você habilitar "Auto-Deploy" no Render, todo `git push` na `main` vai re-deployar automaticamente.

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

O projeto usa **SQLite** via Prisma por simplicidade (app pessoal, sem concorrência alta). As imagens das peças são armazenadas como **base64** diretamente no banco (data URLs), o que evita a necessidade de storage externo (S3, etc.).

**Vantagens:**
- ✅ Zero configuração de storage
- ✅ Backup = copiar o arquivo `.db`
- ✅ Funciona offline/local facilmente

**Desvantagens:**
- ⚠️ Banco pode crescer (~50KB por imagem após resize para 800px)
- ⚠️ Não recomendado para multi-usuário com alta concorrência

**Para escalar (multi-usuário):** Migre para PostgreSQL e movenha as imagens para um bucket S3/Cloudflare R2.

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
As fotos são redimensionadas para no máx. 800px no cliente, convertidas para JPEG (~50KB) e armazenadas como **base64** no banco SQLite. Não há upload para serviços externos.

### A IA funciona offline?
Não. As chamadas de VLM/LLM precisam de internet e das credenciais do SDK configuradas.

### Como fazer backup dos meus dados?
- **Local:** Copie o arquivo `db/custom.db`
- **Render:** Use a aba **Shell** ou conecte via SSH para copiar do disco persistente

### Posso usar com múltiplos usuários?
Atualmente é single-user (sem autenticação). Para multi-usuário, seria necessário adicionar NextAuth.js + migrar para Postgres + adicionar `userId` nos models.

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
