'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  useModelPhotos,
  useAddModelPhoto,
  useDeleteModelPhoto,
  useGenerateVisualization,
} from '@/lib/hooks';
import { resizeImage } from '@/lib/image-utils';
import type { ModelPhoto } from '@/lib/types';
import { toast } from 'sonner';
import JSZip from 'jszip';
import {
  Upload,
  Loader2,
  X,
  Sparkles,
  Download,
  User,
  ImageIcon,
  Wand2,
  Lightbulb,
  Package,
} from 'lucide-react';

// ============================================================
// Helpers
// ============================================================
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // revoke after a tick so the click event has time to fire
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================
// Component
// ============================================================
export function VisualizeDialog({
  open,
  onOpenChange,
  garmentIds,
  garmentNames,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  garmentIds: string[];
  garmentNames?: string[];
}) {
  const modelPhotosQuery = useModelPhotos();
  const addModelPhotoMut = useAddModelPhoto();
  const deleteModelPhotoMut = useDeleteModelPhoto();
  const generateMut = useGenerateVisualization();

  const [prompt, setPrompt] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos: ModelPhoto[] =
    (modelPhotosQuery.data as { photos?: ModelPhoto[] } | undefined)?.photos ?? [];

  const atLimit = photos.length >= 3;

  const handleAddPhoto = useCallback(
    async (file: File) => {
      if (atLimit) {
        toast.error('Você já tem 3 fotos de modelo. Remova uma antes de adicionar.');
        return;
      }
      try {
        const resized = await resizeImage(file, 800, 0.82);
        const label = `Modelo ${photos.length + 1}`;
        await addModelPhotoMut.mutateAsync({ imageData: resized, label });
        toast.success('Foto de modelo adicionada!');
      } catch (e) {
        toast.error('Erro ao adicionar foto: ' + (e instanceof Error ? e.message : ''));
      }
    },
    [atLimit, photos.length, addModelPhotoMut],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAddPhoto(file);
    e.target.value = '';
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await deleteModelPhotoMut.mutateAsync(id);
      toast.success('Foto removida');
    } catch (e) {
      toast.error('Erro ao remover: ' + (e instanceof Error ? e.message : ''));
    }
  };

  const handleGenerateAndDownload = async () => {
    if (garmentIds.length === 0) {
      toast.error('Selecione ao menos uma peça para visualizar');
      return;
    }
    setDownloading(true);
    setPrompt(null);
    try {
      const result = await generateMut.mutateAsync(garmentIds);
      setPrompt(result.prompt);

      // Build ZIP
      const zip = new JSZip();
      zip.file('prompt.txt', result.prompt);

      const garments = result.garments ?? [];
      for (let i = 0; i < garments.length; i++) {
        const g = garments[i];
        const idx = i + 1;
        try {
          const frontBlob = await dataUrlToBlob(g.imageData);
          zip.file(`piece-${idx}.jpg`, frontBlob);
        } catch {
          // skip if can't convert
        }
        if (g.backImage) {
          try {
            const backBlob = await dataUrlToBlob(g.backImage);
            zip.file(`piece-${idx}-back.jpg`, backBlob);
          } catch {
            // skip
          }
        }
      }

      // model photo (first one)
      if (photos.length > 0) {
        try {
          const modelBlob = await dataUrlToBlob(photos[0].imageData);
          zip.file('model.jpg', modelBlob);
        } catch {
          // skip
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, 'closetai-look-visualizacao.zip');
      toast.success('Pacote baixado! Descompacte e use no Nano Banana com sua foto modelo.');
    } catch (e) {
      toast.error('Erro ao gerar: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      // reset state on close
      setPrompt(null);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Visualizar look
          </DialogTitle>
          <DialogDescription>
            Gere um pacote (prompt + imagens) para vestir a pessoa da sua foto modelo com as peças selecionadas.
          </DialogDescription>
        </DialogHeader>

        {/* Selected garments summary */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Peças no look ({garmentIds.length})
          </p>
          {garmentIds.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Nenhuma peça selecionada.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {garmentNames && garmentNames.length === garmentIds.length ? (
                garmentNames.map((n, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {n}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs font-normal">
                  {garmentIds.length} peça{garmentIds.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Section A: Model photos */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              Fotos de modelo
            </h3>
            <span className="text-xs text-muted-foreground">{photos.length}/3</span>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-4 text-center">
              <User className="h-8 w-8 mx-auto text-muted-foreground/50 mb-1.5" />
              <p className="text-xs text-muted-foreground">
                Adicione uma foto de uma pessoa (corpo inteiro) para servir de base.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, idx) => (
                <div
                  key={p.id}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border"
                >
                  <img
                    src={p.imageData}
                    alt={p.label ?? `Modelo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 rounded bg-background/90 backdrop-blur px-1.5 py-0.5 text-[10px] font-semibold">
                    {p.label ?? `Modelo ${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(p.id)}
                    disabled={deleteModelPhotoMut.isPending}
                    className="absolute top-1 right-1 rounded-full bg-background/90 backdrop-blur p-1 shadow hover:bg-background text-rose-600"
                    aria-label="Remover foto"
                  >
                    {deleteModelPhotoMut.isPending &&
                    deleteModelPhotoMut.variables === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {atLimit ? (
            <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
              Limite de 3 fotos atingido. Remova uma para adicionar outra.
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={addModelPhotoMut.isPending}
            >
              {addModelPhotoMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5 mr-1.5" />
              )}
              Adicionar foto de modelo
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </section>

        {/* Section B: Generate */}
        <section className="space-y-2.5 pt-2 border-t">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            Gerar visualização
          </h3>

          <Button
            type="button"
            onClick={handleGenerateAndDownload}
            disabled={
              garmentIds.length === 0 ||
              downloading ||
              generateMut.isPending
            }
            className="w-full"
          >
            {downloading || generateMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Gerando prompt e empacotando...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-1.5" />
                Gerar prompt e baixar pacote
              </>
            )}
          </Button>

          {prompt && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Prompt gerado
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    navigator.clipboard?.writeText(prompt);
                    toast.success('Prompt copiado!');
                  }}
                >
                  Copiar
                </Button>
              </div>
              <Textarea
                value={prompt}
                readOnly
                rows={8}
                className="text-xs font-mono resize-y max-h-72"
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Download className="h-3 w-3" />
                O pacote .zip já foi baixado — contém prompt.txt + imagens das peças
                {photos.length > 0 ? ' + sua foto modelo.' : '.'}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-800 dark:text-amber-200">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <Lightbulb className="h-3.5 w-3.5" /> Como usar
            </p>
            <ol className="list-decimal list-inside space-y-0.5 ml-1">
              <li>Descompacte o ZIP.</li>
              <li>
                No Nano Banana (ou similar), envie o <code className="font-mono">prompt.txt</code> + as
                imagens das peças + sua foto modelo.
              </li>
              <li>A IA vai vestir a pessoa da foto modelo com estas peças.</li>
            </ol>
          </div>
        </section>

        <div className="flex justify-end pt-2 border-t">
          <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
