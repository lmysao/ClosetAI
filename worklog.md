# Smart Wardrobe - Worklog

Projeto: Sistema de gestão de guarda-roupa com IA (masculino + feminino)
Stack: Next.js 16, TypeScript, Prisma/SQLite, shadcn/ui, z-ai-web-dev-sdk (VLM + LLM)

---
Task ID: 1
Agent: main
Task: Configurar Prisma schema com Garment, Outfit, WashLog, ShoppingTip, EventItem e dar push no banco

Work Log:
- Limpado schema antigo (User/Post de exemplo)
- Criado model Garment com categoria, status (disponivel/suja/reusavel/lavando), maxReuses (cuecas=0, camisetas=1, calcas=3), timesWorn, reuseCount, imageData (base64), favorite, etc
- Criado model Outfit (garmentIds JSON, eventType, reason, isUniform, favorite)
- Criado model WashLog (registro de lavagens)
- Criado model ShoppingTip (title, category, priority, kind: roupa/acessorio/perfume)
- Criado model EventItem (eventos agendados)
- Executado `bun run db:push` - banco sincronizado, Prisma Client gerado

Stage Summary:
- Schema pronto com 5 models, índices nas colunas mais consultadas
- Status de peça: disponivel → (usar) → suja OU reusavel → (limpar) → disponivel
- Regra de reuso: cuecas/maxReuses=0 (sempre suja), camisetas=1, calcas=3, bermudas=2

---
Task ID: 2-11
Agent: main
Task: Construir todo o sistema (libs IA, APIs, UI, 6 seções) e verificar com Agent Browser

Work Log:
- Criado src/lib/ai.ts: analyzeGarmentPhoto (VLM), suggestOutfits (LLM gera 3 looks), generateShoppingTips (LLM dicas de compra), analyzeRotation
- Criado src/lib/constants.ts: 21 categorias com maxReuses, paleta de 20 cores, 7 tipos de evento, perfumes preferidos (Coffee Unique/Essencial O Boticário)
- Criadas 9 API routes: garments (CRUD), analyze (VLM), seed, outfits/suggest (LLM), outfits/use, laundry (GET/POST), shopping (GET/POST), shopping/[id], stats
- Criado shell da app (page.tsx): header sticky + sidebar desktop + bottom nav mobile + footer sticky, theme toggle dark/light
- 6 seções: Dashboard (hero, alertas, métricas, favoritas, esquecidas, distribuição, perfume do dia), Guarda-Roupa (filtros + grid agrupado + detalhe em Sheet + adicionar com câmera/IA), Combinar (7 eventos + clima + horário + salvar uniforme + 3 sugestões), Lavanderia (cesto/reusáveis/lavando + lavar tudo/seleção + histórico), Compras (perfumes preferidos + dicas IA + resolvidas), Estatísticas (score rotação + bar/pie charts + mais/menos usadas + essenciais faltando)
- Tema âmbar/marrom quente (masculino sofisticado), scrollbar customizada, animações fade-in-up
- Verificação Agent Browser: dashboard carregou, seed criou 31 peças, IA gerou 3 combinações para "trabalho" (LLM ~12s), "Usar look" moveu íntimas pro cesto e outras pra reusável, "Lavar tudo" limpou o cesto, dicas de compra IA gerou 4 dicas (Malbec, tênis, cinto, cuecas), stats com gráficos, mobile responsive com bottom nav. 0 erros de console.

Stage Summary:
- Sistema completo e funcional end-to-end verificado no navegador
- Fluxo principal: foto → VLM analisa → salva → escolhe evento → LLM gera 3 looks → marcar usado → íntimas pro cesto / outras reusáveis → lavar → volta pra disponível
- Regras de reuso implementadas: cuecas/calcinhas/meias sempre sujas (maxReuses=0), camisetas 1x, camisas 2x, bermudas 2x, calças 4x, calçados/casacos 5-6x
- Perfumes Coffee Unique + Coffee Essencial (O Boticário) destacados + Malbec/Egeo/Kaiak como alternativas
- Lint passa sem erros, dev server sem erros runtime

---
Task ID: 12
Agent: main
Task: Adicionar personalização de looks — montar do zero + editar sugestão da IA

Work Log:
- Adicionado BUILDER_SLOTS em constants.ts: 8 camadas (superior, inferior, intima, meia, calcado, casaco opcional, acessórios multi, perfume opcional)
- Criado GarmentPickerDialog: modal com busca + grid de peças filtradas por categoria e status (disponível/reusável, íntimas só disponível)
- Criado OutfitBuilder: componente reutilizável que mostra slots por camada, permite Escolher/Trocar/Remover peças, valida obrigatórios, salvar como uniforme, confirmar uso
- Modificado Outfits section: toggle "Com IA" / "Manual" no topo
  - Modo Manual: seletor de evento + OutfitBuilder do zero
  - Modo IA: formulário + 3 sugestões, cada uma com botão "Editar" que abre OutfitBuilder pré-preenchido em dialog
- Corrigido bug de timing: picker sempre montado (não condicional) para evitar perda de state update do Radix Dialog
- Verificação Agent Browser:
  - Modo manual: preencheu 5 slots obrigatórios, "Usar este look (5 peças)" habilitado, confirmou, toast "Look personalizado marcado como usado!"
  - Modo IA: gerou 3 sugestões, clicou "Editar", removeu peça (slot voltou para vazio), trocou por outra, preencheu meia, confirmou uso do look personalizado
  - Sem erros de console, lint limpo

Stage Summary:
- Funcionalidade de personalização completa: montar do zero E editar sugestão da IA
- Usuário pode tirar peças (ex: relógio), trocar por outras (ex: pulseira), adicionar acessórios
- Validação de slots obrigatórios impede usar look incompleto
- Dialog de confirmação mostra todas as peças antes de marcar como usado

---
Task ID: 13
Agent: main
Task: Fase 1 — fundação das novas funcionalidades (care/defects, batch add, visualize, reserve, travel)

Work Log:
- Schema Prisma: adicionado em Garment os campos backImage, careInstructions, usageRestrictions, defects, careTips. Criados models ReservedSet, TravelPlan, ModelPhoto. db:push OK.
- constants.ts: adicionado FABRIC_CARE (instruções por tecido), COMMON_DEFECTS, CARE_TIPS_LIBRARY, TRAVEL_CONTEXTS (10 contextos), TRANSPORT_TYPES (6 transportes), BUILDER_SLOTS mantido.
- types.ts: Garment com novos campos; AnalyzeResult com defects/careInstructions/usageRestrictions/careTips; novos tipos WornOutfitPiece, ReservedSet, TravelPlan, ModelPhoto, TravelSuggestRequest.
- ai.ts: analyzeGarmentPhoto agora aceita backImage opcional e retorna defeitos+care+restrictions+careTips (prompt enriquecido). Nova analyzeWornOutfitPhoto (VLM separa peças de foto vestida). Nova suggestTravelOutfit (LLM sugere conjunto para viagem).
- API routes criadas: /api/garments/analyze (suporta backImage), /api/garments/analyze-worn, /api/reserved (GET/POST + [id] PATCH/DELETE), /api/travel (GET/POST + [id] PATCH/DELETE), /api/travel/suggest (IA), /api/model-photos (GET/POST + [id] DELETE), /api/visualize (gera prompt + lista peças).
- /api/garments POST e PATCH [id] aceitam novos campos (backImage, careInstructions, defects, etc).
- /api/outfits/suggest agora exclui peças reservadas (status reservado) das sugestões.
- hooks.ts: useAnalyzeGarment agora recebe {imageData, backImage?}. Novos hooks: useAnalyzeWornOutfit, useReservedSets, useCreateReserved, useUpdateReserved, useDeleteReserved, useTravelPlans, useSuggestTravel, useCreateTravel, useUpdateTravel, useDeleteTravel, useModelPhotos, useAddModelPhoto, useDeleteModelPhoto, useGenerateVisualization.
- Instalado jszip@3.10.1 para download do pacote de visualização.
- Lint limpo.

Stage Summary:
- Fundação completa: schema, IA (VLM enhanced + 2 novas funções), 9 novas API routes, 14 novos hooks
- Pronto para os subagents construírem as UIs (Fase 2) em paralelo:
  - Subagent A: UI garment care (add-garment-dialog back photo + care fields; garment-detail-sheet ver/editar care)
  - Subagent B: batch-add-dialog (multi-foto + foto vestida) + visualize-dialog (model photos CRUD + prompt+zip)
  - Subagent C: reserve-section + travel-section (UIs novas)

---
Task ID: 6
Agent: subagent-A (Phase 2)
Task: Atualizar "Add Garment" dialog e "Garment Detail" sheet para suportar as novas features de cuidados/defeitos (foto do verso + 4 campos care + edição inline)

Work Log:
- Lido worklog.md para entender o trabalho do Task ID 13 (fundação já completa: schema, types, hooks, API, constants, image-utils).
- Editado src/components/add-garment-dialog.tsx:
  - Adicionado estado backImageData + refs backFileInputRef/backCameraInputRef.
  - Botões "Foto do verso" (câmera) e "Da galeria (opcional)" abaixo do preview frontal — usam resizeImage(file, 800, 0.82).
  - Quando backImageData existe, mostra thumbnail 16x16 com label "Verso", descrição explicativa e X para remover.
  - analyzeMut.mutate agora sempre recebe { imageData, backImage: backImageData || undefined } (auto e reanalyze).
  - Refatorado onSuccess do analyze para função applyAnalysis(a) reusada por handleFile e reanalyze — popula 4 novos campos (defects, careInstructions, usageRestrictions, careTips) além dos antigos.
  - Adicionada seção "Cuidados & defeitos" (card com borda + fundo muted) com 4 Textareas: Defeitos encontrados (placeholder mancha amarelada, com ícone AlertTriangle), Instruções de lavagem, Restrições de uso, Dicas de conservar.
  - Badge âmbar "⚠️ com defeito" no topo do form quando defects não vazio.
  - handleSave inclui no payload: backImage (null se vazio), defects, careInstructions, usageRestrictions, careTips (todos trim() || null).
  - reset() limpa backImageData + 4 novos campos. handleClose continua chamando reset.
  - Label "Frente" no canto superior esquerdo da imagem principal. Reanalyze mostra "(frente + verso)" quando há back image.
  - Importado AlertTriangle e ImagePlus do lucide-react. Mantido 'use client' e todos os imports/components existentes.
- Editado src/components/garment-detail-sheet.tsx:
  - Layout da imagem mudou para flex row: imagem frontal (flex-1) + thumbnail do verso (w-28) quando garment.backImage existe — ambos aspect-square com badges "Frente"/"Verso".
  - Nova seção "Cuidados & defeitos" após Atributos e antes de Notes, com Separator. Contém botão "Editar cuidados" (Pencil) à direita.
  - Modo leitura: 4 CareBoxes (🧺 Instruções de lavagem / 🚫 Restrições / 💡 Dicas) + bloco especial para defeitos (âmbar/rose quando tem, esmeralda "Nenhum defeito ✅" quando vazio).
  - Modo edição inline: 4 Textareas preenchidos com valores atuais do garment; botões Cancelar (X) e Salvar (Save, com spinner). Salvar chama useUpdateGarment({ id, data: {defects, careInstructions, usageRestrictions, careTips} }) e toasta "Cuidados atualizados".
  - Quando não há nenhuma info de cuidado, mostra dica "Toque em Editar cuidados...".
  - Mantidas todas as funções existentes: toggleFavorite, moveToDirty, markWashed, handleDelete com confirm dialog, etc.
  - Importados Pencil, Save, X, AlertTriangle do lucide-react (Sparkles já vinha). Label e Textarea do shadcn/ui.
- Lint: `bun run lint` passou sem erros. Dev server recompilou sem erros (✓ Compiled in 664ms).

Stage Summary:
- Diálogo de adicionar peça agora suporta foto do verso opcional + 4 campos de cuidados editáveis preenchidos pela IA.
- Sheet de detalhe mostra foto do verso ao lado da frontal + seção Cuidados & defeitos completa + edição inline dos 4 campos via useUpdateGarment.
- Tema âmbar/marrom mantido (badge âmbar para defeitos, esmeralda para "sem defeito", rose para delete). Nenhum azul/indigo.
- Tipos preservados (Garment, AnalyzeResult) — sem any. 'use client' em ambos. Responsivo (grid-cols-2, max-w-md).
- Pronto para integração com Subagent B (batch-add, visualize) e Subagent C (reserve, travel).

---
Task ID: 7
Agent: subagent-B (Phase 2)
Task: Criar batch-add-dialog.tsx (adicionar várias peças: multi-foto + foto vestida) e visualize-dialog.tsx (CRUD fotos modelo + gerar prompt e baixar ZIP)

Work Log:
- Lido worklog.md para entender o trabalho da Task ID 13 (fundação completa: schema, hooks, API routes, jszip instalado) e Task ID 6 (subagent-A: add-garment-dialog com back photo + care fields, garment-detail-sheet com edição inline). Reutilizado os mesmos padrões visuais (tema âmbar/marrom, badges amber para defeitos, custom-scroll, max-h-[55vh] com overflow-y-auto).
- Criado src/components/batch-add-dialog.tsx:
  - Estrutura: Dialog (max-w-2xl, max-h-[92vh], flex col) com Tabs (defaultValue="multi") e 2 TabsContent.
  - Tab 1 "Múltiplas fotos": input multiple + botão "Selecionar fotos". Cada File é resizeImage(file, 800, 0.82), cria MultiItem com status='analyzing'. Análise em paralelo via Promise.allSettled(analyzeMut.mutateAsync para cada item). Map de resultados por índice (newItems[i] <-> results[i]) atualiza status para 'analyzed' ou 'error' com mensagem. Grid sm:grid-cols-2 de MultiItemCard: aspect-square com img + overlay analyzing (Loader2 + Sparkles "Analisando...") / saved (Check emerald) / error (AlertTriangle rose com mensagem). Após analyzed: Input nome editável, Select categoria (agrupada por CATEGORY_GROUPS), Select formalidade, swatch color + label cor, botão "Salvar" individual. Badge âmbar "com defeito" sobre a imagem quando analysis.defects não vazio. Botão "Salvar todas" no footer dispara saveAll sequencial (for...of + await createMut.mutateAsync) — Progress bar + contador "Salvando... X/Y" durante. Toast final "N peças adicionadas! 🎉" e fecha dialog quando todas ok. Helper buildPayload reaproveitado para saveOne e saveAll — envia TODOS os campos do AnalyzeResult (subcategory, pattern, fabric, season, gender, brand, defects, careInstructions, usageRestrictions, careTips) + imageData como backImage=null.
  - Tab 2 "Foto vestida": input single + botão "Selecionar foto vestida". resizeImage(file, 1000, 0.82) (maior para detalhe). analyzeMut.useAnalyzeWornOutfit — onSuccess mapeia WornOutfitPiece[] para WornPieceItem (id, region, analysis, name=analysis.name, selected=true, status='pending'). Layout grid md:grid-cols-2: foto aspect-[3/4] com overlay "Detectando peças..." + lista de WornPieceCard. Cada card: Checkbox (default checked) + badges (region capitalize, category, formality, defeito amber, salva emerald, erro rose, spinner quando saving) + Input nome editável + swatch color + label cor/fabric + reuso N vezes + texto defeitos line-clamp-2 quando houver. Botão "Salvar peças selecionadas" salva SEQUENCIALMENTE via createMut.mutateAsync — passa mesma imageData (foto vestida original) para TODAS as peças como imageData (sem crop), notes=`Região detectada: ${region}`. Progress bar + contador. Toast final + fecha dialog quando todas as selecionadas ok.
  - Estado local via useState arrays (MultiItem[] e WornPieceItem[]). newId() com crypto.randomUUID() fallback. Erros por item mostrados no card sem abortar as outras. Funções updateItem/removeItem/updatePiece isoladas.
  - Imports: Dialog/Header/Title/Description (sem DialogFooter), Button, Input, Badge, Progress, Select/SelectContent/SelectItem/SelectTrigger/SelectValue, Tabs/TabsList/TabsTrigger/TabsContent, Checkbox. Hooks: useAnalyzeGarment, useAnalyzeWornOutfit, useCreateGarment. Icons: Upload, Loader2, X, Check, Camera, Sparkles, Layers, Shirt, AlertTriangle.
- Criado src/components/visualize-dialog.tsx:
  - Props: { open, onOpenChange, garmentIds: string[], garmentNames?: string[] }. Dialog (max-w-2xl, max-h-[92vh], overflow-y-auto custom-scroll).
  - Sumário no topo: badges com nomes das peças (ou "{N} peças" quando garmentNames ausente).
  - Section A "Fotos de modelo": useModelPhotos() (typed via cast `{ photos?: ModelPhoto[] }`). Grid grid-cols-3 de thumbnails aspect-[3/4] com img + label "Modelo N" (ou p.label) no canto superior esquerdo + botão X (rose) no canto superior direito para delete via useDeleteModelPhoto(id) — spinner no botão quando a variável da mutação === p.id. Empty state com User icon + mensagem "Adicione uma foto de uma pessoa (corpo inteiro)". Botão "Adicionar foto de modelo" → file input hidden, resizeImage(file, 800, 0.82), useAddModelPhoto({ imageData, label: `Modelo ${photos.length + 1}` }). Mensagem âmbar "Limite de 3 fotos atingido..." quando atLimit (photos.length >= 3) — backend também bloqueia. Contador "{photos.length}/3" no header da seção.
  - Section B "Gerar visualização": botão full-width "Gerar prompt e baixar pacote" → useGenerateVisualization(garmentIds). Spinner + texto "Gerando prompt e empacotando..." durante. Em sucesso: setPrompt(result.prompt), mostra Textarea read-only (rows=8, font-mono, max-h-72) com o prompt + botão "Copiar" (navigator.clipboard.writeText + toast). Constrói ZIP com JSZip: prompt.txt + piece-{i}.jpg (dataUrlToBlob de g.imageData) + piece-{i}-back.jpg quando g.backImage + model.jpg quando photos.length > 0 (primeira foto). dataUrlToBlob via `fetch(dataUrl).then(r => r.blob())`. zip.generateAsync({ type: 'blob' }) → downloadBlob (cria <a> temporário, href=URL.createObjectURL(blob), download='closetai-look-visualizacao.zip', click, revoke após 1s). Toast success "Pacote baixado! Descompacte e use no Nano Banana com sua foto modelo." Caixa âmbar de instrução "💡 Como usar: 1) Descompacte o ZIP. 2) No Nano Banana (ou similar), envie o prompt.txt + as imagens das peças + sua foto modelo. 3) A IA vai vestir a pessoa da foto modelo com estas peças."
  - handleClose reseta prompt ao fechar. Botão "Fechar" no rodapé.
  - Imports: Dialog/Header/Title/Description, Button, Textarea, Badge, Label. Hooks: useModelPhotos, useAddModelPhoto, useDeleteModelPhoto, useGenerateVisualization. Icons: Upload, Loader2, X, Sparkles, Download, User, ImageIcon, Wand2, Lightbulb, Package. JSZip import 'jszip'.
  - Tipagem ModelPhoto importada de @/lib/types. Sem `any`. Strict TypeScript.
- Lint: `bun run lint` passou sem erros após a limpeza (removidos imports não usados: Trash2, fileToDataUrl, COLOR_PALETTE, RefreshCw; removida função Label local e substituída por import de @/components/ui/label). Dev server recompilou sem erros.

Stage Summary:
- batch-add-dialog.tsx: 2 modos funcionais (multi-foto com análise paralela Promise.allSettled + foto vestida com analysis por região). Edição inline por item (nome, categoria, formality). Save individual + save em lote sequencial. Progress bar + toast. Erros por item isolados. Tema âmbar/marrom (badges defeito amber, badges salva emerald, erros rose). Responsivo (grid-cols-1 mobile, sm:grid-cols-2 / md:grid-cols-2 desktop).
- visualize-dialog.tsx: CRUD de até 3 fotos de modelo + geração de prompt + download de pacote ZIP (prompt.txt + peças frontais + versos + model.jpg). Caixa de instrução âmbar com 3 passos para Nano Banana. Botão copiar prompt. Tipagem estrita, sem any.
- Pronto para integração com a página principal (wardrobe.tsx ou outfits.tsx) — Task ID 7 entrega os 2 componentes conforme spec, sem dependência de UI externa além de shadcn/ui + hooks existentes.

---
Task ID: 8
Agent: subagent-C (Phase 2)
Task: Criar dois componentes de seção — reserve.tsx (gerenciar conjuntos reservados para eventos) e travel.tsx (planejar looks para viagens com IA)

Work Log:
- Lido worklog.md para entender o trabalho do Task ID 13 (fundação: schema ReservedSet/TravelPlan, hooks useReservedSets/useCreateReserved/useUpdateReserved/useDeleteReserved/useTravelPlans/useSuggestTravel/useCreateTravel/useUpdateTravel/useDeleteTravel, API routes /api/reserved e /api/travel, types ReservedSet/TravelPlan, constants EVENT_TYPES/TRAVEL_CONTEXTS/TRANSPORT_TYPES). Lidos outfits.tsx e shopping.tsx para reusar padrões visuais (Card/CardHeader/CardTitle/CardDescription, badges com classes Tailwind, animate-fade-in-up, empty states border-dashed, skeletons animate-pulse).
- Criado src/components/sections/reserve.tsx:
  - Export `Reserve()` com 2 partes:
    - **Part A "Reservar novo conjunto"**: Card com multi-select garment picker (useAllGarments filter status 'disponivel'/'reusavel', grid grid-cols-3 sm:4 md:5 max-h-80 custom-scroll, cada peça é button aspect-square com img + label gradient + Check primary quando selecionada via Set<string> imutável, Badge "X peças selecionadas"). Form fields: Nome (Input required), Tipo de evento (Select EVENT_TYPES com hint), Data (Input type=date required) + Hora (Input type=time opcional) grid-cols-2, Condições (Textarea). Submit "Reservar conjunto" (size=lg, full-width, disabled se !name || !date || !selectedIds). useCreateReserved → toast "Conjunto reservado! Essas peças não serão sugeridas em outras combinações." + resetForm().
    - **Part B "Conjuntos reservados"**: Lista de useReservedSets().reserved separada em ativos (status='reservado') e historico (status!=='reservado'). Sub-componente ReservedSetCard: CardHeader com emoji EVENT_TYPES + name + formatDate pt-BR + eventTime, Badge status (reservado=amber, usado=emerald, cancelado=rose), condições em muted com Cloud icon. CardContent: thumbnails GarmentThumb (w-12 h-12) até 6 + "+N", reason italic muted, Separator + actions. "Usar conjunto" (primary Check) → useOutfitMut.mutate({ garmentIds, eventType }) → onSuccess updateMut.mutate({ id, data: { status: 'usado' } }) → toast "Conjunto usado! Peças liberadas e marcadas como usadas." Encadeamento evita marcar como usado se useOutfit falhar. "Cancelar reserva" (ghost X) → status='cancelado' + toast "Reserva cancelada — peças liberadas." "Excluir" (ghost rose Trash2) → deleteMut → toast. Histórico colapsável com History icon + ChevronDown rotate-180. Empty state Card border-dashed com BookmarkCheck em rounded-full bg-primary/10. garmentMap via useMemo(new Map) para lookup O(1).
- Criado src/components/sections/travel.tsx:
  - Export `Travel()` com 2 partes:
    - **Part A "Planejar viagem"**: Card com form (Destino Input required, Datas ida/volta Input type=date required grid-cols-2, Clima previsto Input com Cloud icon, Transporte Select TRANSPORT_TYPES, Contexto Select TRAVEL_CONTEXTS com hint abaixo quando escolhido, Observações Textarea com NotebookPen). Botão "Sugerir conjunto com IA" (useSuggestTravel, Loader2 + "A IA está montando seu conjunto de viagem..." enquanto pending). Card de sugestão (border-2 border-primary/30 bg-primary/5): Sparkles + reason em destaque, Separator, grid grid-cols-2 sm:3 md:4 de GarmentCard compact envolvido em relative com botão X (rose absolute top-1 right-1) para remover, Badge "X peças", max-h-80 custom-scroll. Botões "Salvar plano de viagem" (useCreateTravel com formData + finalGarmentIds = suggestion.garmentIds.filter(id => !removedIds.has(id)) + reason → toast "Plano de viagem salvo! As peças selecionadas ficam separadas para sua viagem." + discard + resetForm) e "Descartar sugestão". removedIds: Set<string>, suggestedGarments = useMemo recalcula.
    - **Part B "Minhas viagens"**: Lista de useTravelPlans().travels. Sub-componente TravelCard: CardHeader com emoji TRAVEL_CONTEXTS + destination + CalendarDays + formatDate start → end + duração amber ("X dias"). Badge status (planejada=amber, em-viagem=sky, concluida=emerald). CardContent: meta badges (weather, transport, context), notes muted NotebookPen, reason em box bg-primary/5 border-primary/20, thumbnails até 6 + "+N". Actions condicionais: "Usar peças" (primary Check → useUseOutfit({ garmentIds, eventType: 'casual' }) → toast "Peças da viagem marcadas como usadas."), "Marcar em viagem" (outline PlaneTakeoff se planejada → status='em-viagem' → toast "Viagem iniciada! Boa viagem ✈️"), "Concluir" (outline Flag se em-viagem → status='concluida' → toast "Viagem concluída! Bem-vindo de volta 🏠"), "Excluir" (ghost rose Trash2 ml-auto). calcDuration helper com Math.max(1, ...). Empty state Card border-dashed com Plane em rounded-full bg-primary/10.
- Padrões em ambos: 'use client', cn() de @/lib/utils, toast sonner, Loader2 em todos os botões pending, animate-fade-in-up, aria-live="polite" sr-only quando mutação pending, tema âmbar/marrom (text-primary, bg-primary/10, border-primary/30, bg-primary/5). Status colors: amber/emerald/rose/sky (sky só para em-viagem, não é theme). Responsivo grid-cols-2/3 mobile, sm:/md: para 3/4/5 colunas. Tipagem estrita sem any: type guard (g): g is Garment => !!g, statusBadgeMap: Record<ReservedSet['status'], ...> e Record<TravelPlan['status'], ...>. Sem eslint-disable.
- Lint: `bun run lint` ✓ exit code 0, sem erros nem warnings. `npx tsc --noEmit` não reporta erros nos meus arquivos (reserve.tsx, travel.tsx) — erros pré-existentes em outras partes (outfits.tsx, batch-add-dialog.tsx, ai.ts, etc.) não foram introduzidos por mim. Dev server recompila com sucesso.

Stage Summary:
- 2 componentes de seção completos e funcionais: Reserve() e Travel().
- Reserve: multi-select de peças com toggle visual, form completo com EVENT_TYPES, listagem ativos/histórico colapsável, ações Usar/Cancelar/Excluir com encadeamento correto (useOutfit → updateReserved).
- Travel: form completo com TRAVEL_CONTEXTS/TRANSPORT_TYPES, sugestão de IA com grid de GarmentCard compact removíveis, save/discard, listagem com status badges condicionais (planejada/em-viagem/concluida), ações Marcar em viagem/Concluir/Usar peças/Excluir.
- Lint limpo, tipagem estrita, responsivo, tema âmbar/marrom mantido. Pronto para integração na src/app/page.tsx pelo main agent (importar Reserve e Travel).

---
Task ID: 9-10
Agent: main
Task: Fase 3 (integração) + Fase 4 (verificação) das novas funcionalidades

Work Log:
- page.tsx: adicionadas seções 'reserve' e 'travel' ao NAV (8 itens total), imports de Reserve/Travel/BatchAddDialog, badge de reservas ativas, botão "Em lote" no header, bottom nav grid-cols-8.
- store.ts: Section type agora inclui 'reserve' e 'travel'.
- outfit-builder.tsx: adicionado botão "Visualizar" (Eye icon) que abre VisualizeDialog com as peças selecionadas.
- outfits.tsx (sugestões IA): adicionado botão "Visualizar" (Eye) em cada sugestão + estado visualizingSuggestion.
- wardrobe.tsx: adicionado botão "Em lote" que abre BatchAddDialog.
- Corrigido bug de parsing em batch-add-dialog.tsx (mistura || com ?? sem parênteses).
- Regenerado Prisma Client (bun run db:generate) e reiniciado dev server para carregar novos models.
- Verificação Agent Browser:
  - Navegação: 8 seções visíveis (Início, Guarda-Roupa, Combinar, Lavanderia, Reservas, Viagens, Compras, Stats)
  - Botão "Em lote" no header abre dialog com tabs "Múltiplas fotos" e "Foto vestida"
  - Seção Reservas: formulário funcional, selecionou 3 peças, preencheu nome+data, reservou com sucesso, badge "1" na nav, botões Usar/Cancelar conjunto
  - Seção Viagens: formulário funcional, IA sugeriu 15 peças para viagem de 4 dias à praia com explicação detalhada
  - Combinar IA: 3 sugestões geradas, cada uma com botões Usar/Editar/Visualizar
  - Visualizar: gerou prompt + baixou ZIP com sucesso, toast "Pacote baixado! Descompacte e use no Nano Banana"
  - Lint limpo, sem erros de console

Stage Summary:
- TODAS as 8 funcionalidades pedidas implementadas e verificadas:
  1. ✅ Dicas de lavagem por peça (careInstructions + editing no detalhe)
  2. ✅ Detecção de defeitos pela IA (defects field + badge de alerta)
  3. ✅ Dicas de salvar roupa (careTips — manchas, mangas, cores)
  4. ✅ Restrições de uso (usageRestrictions)
  5. ✅ Foto do verso opcional (backImage — para estampas/logos)
  6. ✅ Adição em lote: múltiplas fotos + foto vestida (IA separa peças)
  7. ✅ Visualização: CRUD de fotos modelo + gera prompt + baixa ZIP para Nano Banana
  8. ✅ Reserva de conjunto para evento futuro (exclui peças de outras combinações)
  9. ✅ Modo viagem/longe de casa (IA sugere conjunto por destino/clima/contexto/dias)
- Sistema completo e funcional end-to-end

---
Task ID: 11
Agent: main
Task: Corrigir scroll do dialog de adicionar em lote (botões escondidos/cortados)

Work Log:
- Problema: DialogContent tinha overflow-hidden + grid interna com max-h-[55vh] fixo → o rodapé (botão Salvar) ficava depois da grid e era cortado em telas menores, especialmente na aba "Foto vestida" onde não dava pra salvar.
- Solução: reestruturação do layout com flexbox adequado:
  - DialogContent: max-h-[92vh] flex flex-col overflow-hidden (header fixo no topo)
  - DialogHeader: shrink-0 (não comprime)
  - Tabs: flex-1 min-h-0 flex flex-col (preenche espaço restante)
  - TabsContent: flex-1 min-h-0 overflow-hidden flex flex-col + data-[state=inactive]:hidden (esconde tab inativa corretamente)
  - Cada tab (MultiPhotosTab/WornOutfitTab): flex flex-col gap-3 min-h-0 flex-1
    - Toolbar: shrink-0 (fixa no topo)
    - Grid de cards: flex-1 min-h-0 overflow-y-auto (scrolla no espaço disponível, sem max-h fixo)
    - Rodapé com botão Salvar: shrink-0 bg-background border-t (fixo no fundo, sempre visível)
  - Na aba Foto vestida: foto usa md:sticky md:top-0 md:self-start (fica visível enquanto rola a lista de peças ao lado)
- Removido max-h-[55vh] que causava o corte. Agora a grid usa flex-1 e o rodapé é sempre visível.
- Verificação Agent Browser (viewport mobile 390x844):
  - Aba Foto vestida: upload de imagem de teste → IA detectou 2 peças → botão "Salvar peças selecionadas (2)" visível (bottom=761px em viewport 844px) ✓
  - Aba Múltiplas fotos: upload de 3 imagens → 2 analisadas com sucesso, 1 erro 429 (rate limit) tratado graciosamente → botão "Salvar todas (2)" visível e habilitado ✓
  - Scroll na lista de cards funciona e o botão Salvar permanece fixo/visível (bottom=761 não muda com scroll) ✓
  - Sem erros de console, lint limpo

Stage Summary:
- Problema de scroll/responsividade do batch-add-dialog resolvido
- Botões de salvar agora SEMPRE visíveis no rodapé do dialog (shrink-0 + bg-background)
- Lista de peças/cards scrolla independentemente no espaço disponível (flex-1 + overflow-y-auto)
- Funciona em mobile (390px) e desktop
