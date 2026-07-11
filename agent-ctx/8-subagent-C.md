# Task ID 8 — Subagent C (Phase 2)

## Task
Criar dois componentes de seção:
1. `src/components/sections/reserve.tsx` — Gerenciar conjuntos reservados para eventos futuros
2. `src/components/sections/travel.tsx` — Planejar looks para viagens com sugestão de IA

## Work Log
- Lido `/home/z/my-project/worklog.md` para entender o trabalho do Task ID 13 (fundação: schema Prisma com ReservedSet e TravelPlan, hooks useReservedSets/useCreateReserved/useUpdateReserved/useDeleteReserved/useTravelPlans/useSuggestTravel/useCreateTravel/useUpdateTravel/useDeleteTravel, API routes /api/reserved e /api/travel, types ReservedSet e TravelPlan, constants EVENT_TYPES/TRAVEL_CONTEXTS/TRANSPORT_TYPES) e Task IDs 6/7 (subagent-A e subagent-B: padrões visuais âmbar/marrom, custom-scroll, GarmentCard compact, toast sonner).
- Lido `src/components/sections/outfits.tsx` e `shopping.tsx` para reusar os mesmos padrões (Card/CardHeader/CardTitle/CardDescription, badges de status com classes Tailwind diretas, animação `animate-fade-in-up`, empty states com Card border-dashed + ícone em rounded-full bg-primary/10, skeletons com `animate-pulse` em `bg-muted/40`).

### `src/components/sections/reserve.tsx`
- **Estrutura**: `Reserve()` com 2 partes:
  - **Part A "Reservar novo conjunto"**: Card com CardHeader (CalendarClock + title + desc) + CardContent.
    - **Multi-select garment picker**: `useAllGarments()` → filter `status === 'disponivel' || 'reusavel'`. Grid grid-cols-3 sm:4 md:5 com `max-h-80 overflow-y-auto custom-scroll`. Cada peça é `<button>` aspect-square com `img` + label inferior (gradient from-black/85) + check primary no canto quando selecionada (border-primary + ring-2 ring-primary/30). Badge "X peças selecionadas" no header da seção. `toggleSelect` usa `Set<string>` imutável (cria novo Set a cada toggle).
    - **Form fields**: Nome (Input, required, placeholder "ex: Casamento do João"), Tipo de evento (Select com EVENT_TYPES, mostra emoji + label, hint abaixo), Data (Input type=date, required) e Hora (Input type=time, opcional) lado a lado, Condições (Textarea, placeholder "ex: ao ar livre, frio à noite"). Todos com Label + asterisco rose para obrigatórios.
    - **Submit**: `canSubmit = name.trim() && eventDate && selectedIds.size > 0 && !createMut.isPending`. Chama `useCreateReserved({ name, eventType, eventDate, eventTime?, conditions?, garmentIds: Array.from(selectedIds) })`. onSuccess: toast "Conjunto reservado! Essas peças não serão sugeridas em outras combinações." + `resetForm()`. Button size="lg" full-width com Loader2 + "Reservando..." quando pending.
  - **Part B "Conjuntos reservados"**: Lista de `useReservedSets().reserved`. Separa `ativos` (status === 'reservado') e `historico` (status !== 'reservado').
    - **ReservedSetCard** (sub-componente): Card com CardHeader mostrando emoji do EVENT_TYPES + name (line-clamp-1), CardDescription com CalendarDays + formatDate pt-BR + Clock + eventTime. Badge status (reservado=amber, usado=emerald, cancelado=rose) no canto. Condições em texto muted com Cloud icon. CardContent: thumbnails (`GarmentThumb` w-12 h-12 rounded-md border) até 6 + badge "+N" quando mais, contagem "X peças:" antes. Reason em italic muted. Separator + actions quando reservado: "Usar conjunto" (primary, Check), "Cancelar reserva" (ghost, X), "Excluir" (ghost rose, Trash2). Quando histórico: só "Excluir".
    - **handleUseSet**: chama `useOutfitMut.mutate({ garmentIds, eventType: set.eventType })` primeiro (sequencial) → onSuccess chama `updateMut.mutate({ id, data: { status: 'usado' } })` → onSuccess toast "Conjunto usado! Peças liberadas e marcadas como usadas." Esse encadeamento evita marcar como usado se o `useOutfit` falhar.
    - **handleCancelSet**: `updateMut.mutate({ id, data: { status: 'cancelado' } })` → toast "Reserva cancelada — peças liberadas."
    - **handleDeleteSet**: `deleteMut.mutate(id)` → toast "Reserva excluída."
    - **Empty state**: Card border-dashed + BookmarkCheck em rounded-full bg-primary/10 + "Nenhum conjunto reservado. Reserve peças para um evento futuro acima."
    - **Histórico colapsável**: `<button>` com History icon + "Histórico (N)" + ChevronDown que rotaciona 180° quando aberto. Renderiza `historico.map(...)` só quando `historyOpen`.
    - **garmentMap**: `useMemo(() => new Map<string, Garment>())` populado a partir de `allGarments` para lookup O(1) por id.
- **Tipagem**: importei `Garment` e `ReservedSet` de `@/lib/types`. Sem `any`. Type guard `(g): g is Garment => !!g` no filter. `statusBadgeMap: Record<ReservedSet['status'], ...>` para tipar o mapa de cores.

### `src/components/sections/travel.tsx`
- **Estrutura**: `Travel()` com 2 partes:
  - **Part A "Planejar viagem"**: Card com form. Campos:
    - Destino (Input, required, placeholder "ex: Praia de Maresias, SP")
    - Datas ida/volta (Inputs type=date, required) em grid-cols-2
    - Clima previsto (Input com Cloud icon, placeholder "ex: frio 12°C, possibilidade de chuva")
    - Transporte (Select com TRANSPORT_TYPES — emoji + label) e Contexto (Select com TRAVEL_CONTEXTS — emoji + label) em grid sm:grid-cols-2. Hint do contexto aparece abaixo do select quando escolhido (Lightbulb icon).
    - Observações (Textarea com NotebookPen icon, placeholder "ex: vou visitar família, tem piscina, levar roupa de treino")
    - **Botão "Sugerir conjunto com IA"**: `canSuggest = destination.trim() && startDate && endDate && !suggestMut.isPending`. Chama `useSuggestTravel({ destination, startDate, endDate, weather?, transport?, context?, notes? })`. Enquanto pending: Loader2 + "A IA está montando seu conjunto de viagem...". onSuccess: setSuggestion(data) + setRemovedIds(new Set()) + toast informativo.
    - **Card de sugestão** (aparece quando `suggestion !== null`): border-2 border-primary/30 bg-primary/5 p-4 space-y-3. Razão da IA em destaque com Sparkles icon + label "Sugestão da IA" + texto leading-relaxed. Separator. Grid grid-cols-2 sm:3 md:4 das peças sugeridas (`GarmentCard compact` envolvido em `relative` com botão X (rose, absolute top-1 right-1) para remover). Badge "X peças" no header da seção. `max-h-80 overflow-y-auto custom-scroll`. Estado vazio dentro do card se todas removidas: "Todas as peças foram removidas. Adicione pelo menos uma para salvar."
    - **Botões**: "Salvar plano de viagem" (primary, disabled se `suggestedGarments.length === 0`) chama `useCreateTravel({ ...formData, garmentIds: finalGarmentIds, reason: suggestion.reason })` → onSuccess: toast "Plano de viagem salvo! As peças selecionadas ficam separadas para sua viagem." + `handleDiscardSuggestion()` + `resetForm()`. "Descartar sugestão" (outline) limpa `suggestion` e `removedIds`.
    - `removedIds: Set<string>` rastreia peças removidas pelo usuário. `suggestedGarments = useMemo(...)` recalcula quando suggestion/removedIds/garmentMap muda.
  - **Part B "Minhas viagens"**: Lista de `useTravelPlans().travels`.
    - **TravelCard** (sub-componente): Card com CardHeader mostrando emoji do TRAVEL_CONTEXTS + destination (line-clamp-1), CardDescription com CalendarDays + formatDate start → end + duração em âmmar ("X dias"). Badge status (planejada=amber, em-viagem=sky, concluida=emerald) no canto. CardContent: meta row com badges (Cloud + weather, transport emoji + label, context emoji + label), notes em muted com NotebookPen, reason em box bg-primary/5 border-primary/20, thumbnails até 6 + "+N", actions.
    - **Actions condicionais por status**:
      - `planejada` ou `em-viagem`: "Usar peças" (primary, Check, chama `useUseOutfit({ garmentIds, eventType: 'casual' })` → toast "Peças da viagem marcadas como usadas."), "Marcar em viagem" (outline, PlaneTakeoff, se planejada → `useUpdateTravel({ id, data: { status: 'em-viagem' } })` → toast "Viagem iniciada! Boa viagem ✈️"), "Concluir" (outline, Flag, se em-viagem → `useUpdateTravel({ id, data: { status: 'concluida' } })` → toast "Viagem concluída! Bem-vindo de volta 🏠"), "Excluir" (ghost rose, ml-auto)
      - `concluida`: só "Excluir" (ghost rose)
    - **calcDuration** helper: `Math.ceil((end - start) / 86400000)` com `Math.max(1, ...)` fallback. Usa `plan.duration ?? calcDuration(...)` quando duration é null.
    - **Empty state**: Card border-dashed + Plane em rounded-full bg-primary/10 + "Nenhuma viagem planejada. Use o formulário acima para a IA sugerir um conjunto."
- **Tipagem**: importei `Garment`, `TravelPlan` de `@/lib/types`. Sem `any`. Type guard `(g): g is Garment => !!g`. `statusBadgeMap: Record<TravelPlan['status'], ...>`.

### Padrões seguidos em ambos
- `'use client'` no topo.
- `cn()` de `@/lib/utils` para classes condicionais (selected state, opacity-80 em histórico/concluida).
- `toast` de 'sonner' para feedback.
- `Loader2` do lucide-react em todos os botões com mutate pending.
- Animação `animate-fade-in-up` no container raiz.
- `aria-live="polite"` em `<p className="sr-only">` quando há mutação pendente.
- Tema âmbar/marrom: `text-primary`, `bg-primary/10`, `border-primary/30`, `bg-primary/5`. Status colors: amber (reservado/planejada), emerald (usado/concluida), rose (cancelado/delete/excluir), sky (em-viagem). Nenhum azul/indigo fora o sky (que é status, não theme).
- Responsivo: grids grid-cols-2/3 no mobile, sm:/md: para 3/4/5 colunas no desktop. Form fields em grid sm:grid-cols-2.
- Sem `eslint-disable` para `@/next/next/no-img-element` (usamos `<img>` com `alt` descritivo e `loading="lazy"`).

### Verificação
- `bun run lint`: ✓ exit code 0, sem erros nem warnings.
- `npx tsc --noEmit`: nenhum erro nos meus arquivos (reserve.tsx, travel.tsx). Erros pré-existentes em outras partes do projeto (outfits.tsx, batch-add-dialog.tsx, ai.ts, etc.) não foram introduzidos por mim.
- Dev server recompilou com sucesso (✓ Compiled) — arquivos novos prontos para integração com a página principal (Task ID futura do main agent).

## Stage Summary
- Dois componentes de seção completos e funcionais: `Reserve()` e `Travel()`.
- Reserve: multi-select de peças com toggle visual, form completo com EVENT_TYPES, listagem separada ativos/histórico colapsável, ações Usar/Cancelar/Excluir com encadeamento correto (useOutfit → updateReserved).
- Travel: form completo com TRAVEL_CONTEXTS/TRANSPORT_TYPES, sugestão de IA com grid de GarmentCard compact removíveis, save/discard, listagem com status badges condicionais (planejada/em-viagem/concluida), ações Marcar em viagem/Concluir/Usar peças/Excluir.
- Lint limpo, tipagem estrita (sem any), responsivo, tema âmbar/marrom mantido, sem azul/indigo fora o sky para status em-viagem.
- Pronto para integração na `src/app/page.tsx` pelo main agent (importar `Reserve` e `Travel` de `@/components/sections/reserve` e `@/components/sections/travel`).
