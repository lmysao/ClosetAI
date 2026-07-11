# Task ID 7 — Subagent B (Phase 2)

## Task
Criar dois componentes:
1. `src/components/batch-add-dialog.tsx` — Adicionar várias peças (multi-foto + foto vestida) usando Tabs
2. `src/components/visualize-dialog.tsx` — CRUD fotos de modelo + gerar prompt e baixar ZIP para Nano Banana

## Work Log
- Lido `/home/z/my-project/worklog.md` para entender o trabalho do Task ID 13 (fundação: schema Prisma com Garment.careInstructions/defects/etc, hooks useAnalyzeGarment/useAnalyzeWornOutfit/useCreateGarment/useModelPhotos/useAddModelPhoto/useDeleteModelPhoto/useGenerateVisualization, API routes /api/garments/analyze[-worn], /api/model-photos, /api/visualize, jszip instalado) e Task ID 6 (subagent-A: add-garment-dialog com back photo + 4 care fields, garment-detail-sheet com edição inline).

### `batch-add-dialog.tsx`
- **Estrutura**: `Dialog` (max-w-2xl, max-h-[92vh], flex col) + `Tabs` com 2 TabsContent.
- **Tab 1 "Múltiplas fotos"**: input `multiple` + botão "Selecionar fotos". Cada File → `resizeImage(file, 800, 0.82)` → `MultiItem` (status='analyzing'). Análise em **paralelo via `Promise.allSettled`** mapeando resultados por índice (newItems[i] ↔ results[i]). Grid sm:grid-cols-2 de cards:
  - Aspect-square com img + overlay "Analisando..." (Loader2 + Sparkles) / "Salva!" (Check emerald) / erro (AlertTriangle rose + msg).
  - Após analyzed: Input nome editável, Select categoria (agrupada por `CATEGORY_GROUPS`), Select formalidade, swatch color + label, botão "Salvar" individual.
  - Badge âmbar "com defeito" quando `analysis.defects` não vazio.
  - Botão "Salvar todas" no footer: `for...of` + `await createMut.mutateAsync` sequencial + `Progress` bar + contador "Salvando... X/Y". Toast final + fecha dialog quando todas ok.
  - Helper `buildPayload` reaproveitado em saveOne e saveAll — envia TODOS os campos do `AnalyzeResult` (subcategory, pattern, fabric, season, gender, brand, defects, careInstructions, usageRestrictions, careTips) + imageData, backImage=null.
- **Tab 2 "Foto vestida"**: input single → `resizeImage(file, 1000, 0.82)` (maior p/ detalhe) → `useAnalyzeWornOutfit`. Layout grid md:grid-cols-2: foto aspect-[3/4] + lista de `WornPieceCard`. Cada card: Checkbox (default checked) + badges (region, category, formality, defeito, salva, erro) + Input nome editável + swatch + cor/fabric + reuso + defeitos line-clamp-2. Botão "Salvar peças selecionadas" salva SEQUENCIALMENTE passando a MESMA `imageData` (foto vestida original) para todas as peças como imageData (sem crop). notes=`Região detectada: ${region}`.
- **Tipagem**: `MultiItem`, `WornPieceItem`, status unions. `newId()` com crypto.randomUUID() fallback. Sem `any`. Imports: Dialog/Header/Title/Description (sem Footer), Button, Input, Badge, Progress, Select*, Tabs*, Checkbox. Hooks: useAnalyzeGarment, useAnalyzeWornOutfit, useCreateGarment. Icons: Upload, Loader2, X, Check, Camera, Sparkles, Layers, Shirt, AlertTriangle.

### `visualize-dialog.tsx`
- **Props**: `{ open, onOpenChange, garmentIds: string[]; garmentNames?: string[] }`.
- **Sumário** no topo: badges com nomes das peças (ou "{N} peças" fallback).
- **Section A "Fotos de modelo"**: `useModelPhotos()` (typed via cast `{ photos?: ModelPhoto[] }`). Grid grid-cols-3 aspect-[3/4] com img + label "Modelo N" (ou `p.label`) + X (rose) para `useDeleteModelPhoto(id)` — spinner no botão quando variável da mutação === p.id. Empty state com User icon. Botão "Adicionar foto de modelo" → `resizeImage(file, 800, 0.82)` → `useAddModelPhoto({ imageData, label: 'Modelo N' })`. Limite 3 (backend também bloqueia) — mostra mensagem âmbar quando atingido. Contador `{photos.length}/3`.
- **Section B "Gerar visualização"**: botão full-width "Gerar prompt e baixar pacote" → `useGenerateVisualization(garmentIds)`. Em sucesso:
  - Mostra prompt em `Textarea` read-only (rows=8, font-mono) + botão "Copiar".
  - Constrói ZIP com `JSZip`: `prompt.txt` + `piece-{i}.jpg` (dataUrlToBlob de `g.imageData`) + `piece-{i}-back.jpg` quando `g.backImage` + `model.jpg` quando `photos.length > 0` (primeira foto).
  - `dataUrlToBlob` via `fetch(dataUrl).then(r => r.blob())`. `zip.generateAsync({ type: 'blob' })` → `downloadBlob` (cria `<a>` temporário, `href=URL.createObjectURL(blob)`, `download='closetai-look-visualizacao.zip'`, click, revoke após 1s).
  - Toast "Pacote baixado! Descompacte e use no Nano Banana com sua foto modelo."
  - Caixa âmbar "💡 Como usar: 1) Descompacte o ZIP. 2) No Nano Banana (ou similar), envie o prompt.txt + as imagens das peças + sua foto modelo. 3) A IA vai vestir a pessoa da foto modelo com estas peças."
- **Tipagem**: `ModelPhoto` de `@/lib/types`. Sem `any`. Imports: Dialog/Header/Title/Description, Button, Textarea, Badge, Label. Hooks: useModelPhotos, useAddModelPhoto, useDeleteModelPhoto, useGenerateVisualization. Icons: Upload, Loader2, X, Sparkles, Download, User, ImageIcon, Wand2, Lightbulb, Package. JSZip import 'jszip'.

## Lint
`bun run lint` passou sem erros após limpeza (removidos imports não usados: Trash2, fileToDataUrl, COLOR_PALETTE, RefreshCw; removida função Label local, substituída por import de `@/components/ui/label`).

## Stage Summary
- Dois componentes criados conforme spec, prontos para integração com a página principal (`wardrobe.tsx` ou `outfits.tsx`).
- Tema âmbar/marrom preservado (badges defeito amber, salva emerald, erro rose; caixa de instrução amber). Sem indigo/blue.
- TypeScript estrito, sem `any`. Responsivo (grid-cols-1 mobile, sm/md:grid-cols-2 desktop).
- Análise paralela com Promise.allSettled no Tab 1; saves sequenciais em ambos os Tabs para evitar DB contention.
- ZIP download com helper dataUrlToBlob + downloadBlob (anchor temporário + revoke).
