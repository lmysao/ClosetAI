# Task ID 6 — Subagent A (Phase 2)

**Task:** Atualizar `src/components/add-garment-dialog.tsx` e `src/components/garment-detail-sheet.tsx` para suportar as features de garment care (foto do verso + 4 campos care + edição inline).

## Contexto (lido do worklog.md, Task ID 13)
A fundação já estava completa:
- `Garment` interface tem `backImage`, `careInstructions`, `usageRestrictions`, `defects`, `careTips` (todos `string | null`).
- `AnalyzeResult` tem os mesmos 4 campos como `string`.
- `useAnalyzeGarment` aceita `{ imageData, backImage? }`; `useCreateGarment`/`useUpdateGarment` passam fields through.
- API `/api/garments` POST + PATCH `[id]` aceitam novos campos.
- `resizeImage(source, maxSize?, quality?)` e `fileToDataUrl(file)` em `src/lib/image-utils.ts`.
- `COMMON_DEFECTS`, `CARE_TIPS_LIBRARY`, `FABRIC_CARE` em `src/lib/constants.ts`.

## O que foi feito

### `src/components/add-garment-dialog.tsx`
- Estado novo: `backImageData`, `uploadingBack`, `defects`, `careInstructions`, `usageRestrictions`, `careTips`.
- Refs novos: `backFileInputRef`, `backCameraInputRef`.
- Função `applyAnalysis(a)` extraída para reaproveitar entre `handleFile` e `reanalyze` — popula todos os 15 campos (11 antigos + 4 novos).
- `handleBackFile(file)` — resize 800x0.82, seta `backImageData`, toast sucesso.
- Ambas as chamadas de `analyzeMut.mutate` (auto e reanalyze) passam `{ imageData, backImage: backImageData || undefined }`.
- Botão de remover back image (X rose) quando thumb existe.
- Seção "Cuidados & defeitos" (card muted, 4 Textareas com Label): Defeitos (com AlertTriangle âmbar), Instruções de lavagem, Restrições de uso, Dicas de conservar.
- Badge âmbar no topo do form quando `defects.trim() !== ''`.
- `handleSave` envia `backImage: backImageData || null` + 4 campos trim() || null.
- `reset()` limpa tudo (incluindo 4 novos campos + backImageData).
- Imports novos: `AlertTriangle`, `ImagePlus` de lucide-react.
- Layout: thumbnail do verso em card horizontal com label/descrição/botão X.

### `src/components/garment-detail-sheet.tsx`
- Layout do preview: `flex gap-3` — frontal `flex-1` + verso `w-28 shrink-0` (quando `garment.backImage` existe).
- Badges "Frente"/"Verso" no canto superior esquerdo de cada imagem.
- Nova seção "Cuidados & defeitos" com Separator antes das Notes:
  - Header com título + botão "Editar cuidados" (Pencil).
  - Modo leitura: 4 CareBoxes (🧺/🚫/💡) + bloco especial para defeitos (âmbar se preenchido, esmeralda "Nenhum defeito ✅" se vazio).
  - Modo edição inline: 4 Textareas preenchidos com estado atual, botões Cancelar/Salvar. Salvar chama `updateMut.mutate({ id, data: {...4 campos} })` → toast "Cuidados atualizados".
- Componente helper `CareBox({ icon, label, children })` para os blocos read-only.
- Imports novos: `Pencil`, `Save`, `X`, `AlertTriangle` de lucide-react; `Label`, `Textarea` do shadcn/ui.
- Tudo preservado: favorite, mandar pro cesto, marcar lavada, delete com confirm.

## Validação
- `bun run lint` — sem erros.
- Dev server recompilou sem erros (`✓ Compiled in 664ms`).
- Sem `any` — usa `Garment` e `AnalyzeResult` de `@/lib/types`.
- Tema âmbar/marrom respeitado (sem indigo/azul).

## Próximos passos para Subagent B e C
- Subagent B (batch-add + visualize) pode usar a mesma abordagem do back image picker como referência.
- Subagent C (reserve + travel) pode usar o padrão CareBox como bloco de info read-only.
- Os 4 campos care já estão prontos para serem exibidos em qualquer outra UI (lavanderia, dashboard de defeitos, etc.) via `garment.defects` etc.
