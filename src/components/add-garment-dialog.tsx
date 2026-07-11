'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAnalyzeGarment, useCreateGarment } from '@/lib/hooks';
import { resizeImage, fileToDataUrl } from '@/lib/image-utils';
import {
  CATEGORIES, CATEGORY_GROUPS, FORMALITIES, SEASONS, COLOR_PALETTE, defaultMaxReuses,
} from '@/lib/constants';
import type { AnalyzeResult } from '@/lib/types';
import { toast } from 'sonner';
import {
  Camera, Upload, Sparkles, Loader2, X, Check, RefreshCw, Wand2,
  AlertTriangle, ImagePlus,
} from 'lucide-react';

export function AddGarmentDialog({
  open,
  onOpenChange,
  defaultCategory,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: string;
}) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [backImageData, setBackImageData] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // Campos editáveis (preenchidos pela IA, ajustáveis pelo usuário)
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory ?? 'camiseta');
  const [subcategory, setSubcategory] = useState('');
  const [color, setColor] = useState('');
  const [colorHex, setColorHex] = useState('#888888');
  const [pattern, setPattern] = useState('liso');
  const [fabric, setFabric] = useState('algodao');
  const [season, setSeason] = useState('todas');
  const [formality, setFormality] = useState('casual');
  const [gender, setGender] = useState('masculino');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');

  // Cuidados & defeitos
  const [defects, setDefects] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [usageRestrictions, setUsageRestrictions] = useState('');
  const [careTips, setCareTips] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const backCameraInputRef = useRef<HTMLInputElement>(null);

  const analyzeMut = useAnalyzeGarment();
  const createMut = useCreateGarment();

  const reset = () => {
    setImageData(null);
    setBackImageData(null);
    setAnalysis(null);
    setName('');
    setCategory(defaultCategory ?? 'camiseta');
    setSubcategory('');
    setColor('');
    setColorHex('#888888');
    setPattern('liso');
    setFabric('algodao');
    setSeason('todas');
    setFormality('casual');
    setGender('masculino');
    setBrand('');
    setNotes('');
    setDefects('');
    setCareInstructions('');
    setUsageRestrictions('');
    setCareTips('');
  };

  const applyAnalysis = (a: AnalyseResult) => {
    setAnalysis(a);
    setName(a.name);
    setCategory(a.category);
    setSubcategory(a.subcategory ?? '');
    setColor(a.color ?? '');
    setColorHex(a.colorHex ?? '#888888');
    setPattern(a.pattern ?? 'liso');
    setFabric(a.fabric ?? 'algodao');
    setSeason(a.season ?? 'todas');
    setFormality(a.formality ?? 'casual');
    setGender(a.gender ?? 'masculino');
    setBrand(a.brand ?? '');
    setDefects(a.defects ?? '');
    setCareInstructions(a.careInstructions ?? '');
    setUsageRestrictions(a.usageRestrictions ?? '');
    setCareTips(a.careTips ?? '');
  };

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const resized = await resizeImage(file, 800, 0.82);
      setImageData(resized);
      setAnalysis(null);
      // auto-analisar com frente (e verso se já houver)
      setAnalyzing(true);
      analyzeMut.mutate(
        { imageData: resized, backImage: backImageData || undefined },
        {
          onSuccess: (data) => applyAnalysis(data.analysis),
          onError: (e) => {
            toast.error('Não consegui analisar a foto: ' + e.message);
          },
          onSettled: () => setAnalyzing(false),
        }
      );
    } catch (e) {
      toast.error('Erro ao processar imagem: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setUploading(false);
    }
  }, [analyzeMut, backImageData]);

  const handleBackFile = useCallback(async (file: File) => {
    setUploadingBack(true);
    try {
      const resized = await resizeImage(file, 800, 0.82);
      setBackImageData(resized);
      toast.success('Foto do verso adicionada');
    } catch (e) {
      toast.error('Erro ao processar imagem do verso: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setUploadingBack(false);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleBackFile(file);
    e.target.value = '';
  };

  const reanalyze = () => {
    if (!imageData) return;
    setAnalyzing(true);
    analyzeMut.mutate(
      { imageData, backImage: backImageData || undefined },
      {
        onSuccess: (data) => applyAnalysis(data.analysis),
        onError: (e) => toast.error('Erro: ' + e.message),
        onSettled: () => setAnalyzing(false),
      }
    );
  };

  const handleSave = () => {
    if (!imageData) {
      toast.error('Adicione uma foto da peça');
      return;
    }
    if (!name.trim()) {
      toast.error('Dê um nome para a peça');
      return;
    }
    createMut.mutate(
      {
        name: name.trim(),
        category,
        subcategory: subcategory.trim() || null,
        color: color || null,
        colorHex: colorHex || null,
        pattern,
        fabric,
        season,
        formality,
        gender,
        brand: brand.trim() || null,
        notes: notes.trim() || null,
        imageData,
        backImage: backImageData || null,
        defects: defects.trim() || null,
        careInstructions: careInstructions.trim() || null,
        usageRestrictions: usageRestrictions.trim() || null,
        careTips: careTips.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success('Peça adicionada ao guarda-roupa! 🎉');
          reset();
          onOpenChange(false);
        },
        onError: (e) => toast.error('Erro ao salvar: ' + e.message),
      }
    );
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Adicionar peça com IA
          </DialogTitle>
          <DialogDescription>
            Tire uma foto ou escolha da galeria. A IA analisa cor, tecido, estilo e sugere tudo automaticamente.
          </DialogDescription>
        </DialogHeader>

        {/* Aviso de defeito */}
        {defects.trim() !== '' && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium">⚠️ com defeito — revise os cuidados antes de salvar</span>
          </div>
        )}

        {/* Upload / Preview */}
        {!imageData ? (
          <div className="grid grid-cols-2 gap-3 py-4">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading || analyzing}
              className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors text-primary"
            >
              {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
              <span className="text-sm font-medium">Tirar foto</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || analyzing}
              className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/40 hover:bg-muted transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Galeria</span>
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFileChange}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted">
              <img src={imageData} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageData(null); setAnalysis(null); }}
                className="absolute top-2 right-2 rounded-full bg-background/90 backdrop-blur p-1.5 shadow hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="absolute top-2 left-2 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow">
                Frente
              </span>
              {analyzing && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> IA analisando a peça...
                  </p>
                </div>
              )}
              {analysis && !analyzing && (
                <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-background/95 backdrop-blur px-3 py-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    <Sparkles className="inline h-3 w-3 text-primary mr-1" />
                    {analysis.description}
                  </p>
                </div>
              )}
            </div>

            {/* Foto do verso (opcional) */}
            {backImageData ? (
              <div className="flex items-center gap-3 rounded-lg border border-muted-foreground/20 bg-muted/40 p-2">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img src={backImageData} alt="Verso" className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-semibold uppercase tracking-wide py-0.5 text-center">
                    Verso
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Foto do verso adicionada</p>
                  <p className="text-[11px] text-muted-foreground/80">A IA usa essa foto pra detectar defeitos e etiqueta de lavagem.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBackImageData(null)}
                  className="rounded-full bg-background/90 p-1.5 shadow hover:bg-background text-rose-600"
                  aria-label="Remover foto do verso"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => backCameraInputRef.current?.click()}
                  disabled={uploadingBack || analyzing}
                >
                  {uploadingBack ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Camera className="h-3.5 w-3.5 mr-1.5" />}
                  Foto do verso
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => backFileInputRef.current?.click()}
                  disabled={uploadingBack || analyzing}
                >
                  <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
                  Da galeria (opcional)
                </Button>
                <input
                  ref={backCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={onBackFileChange}
                />
                <input
                  ref={backFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onBackFileChange}
                />
              </div>
            )}

            {!analyzing && (
              <Button variant="outline" size="sm" onClick={reanalyze} className="w-full">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reanalisar com IA {backImageData ? '(frente + verso)' : ''}
              </Button>
            )}

            {/* Campos editáveis */}
            <div className="space-y-3 pt-1">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Camiseta preta lisa" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {Object.entries(CATEGORY_GROUPS).map(([gkey, gval]) => (
                        <div key={gkey}>
                          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">{gval.emoji} {gval.label}</p>
                          {Object.entries(CATEGORIES)
                            .filter(([, c]) => c.group === gkey)
                            .map(([key, c]) => (
                              <SelectItem key={key} value={key}>
                                {c.emoji} {c.label}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Input id="subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="Ex: social, slim" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_PALETTE.slice(0, 12).map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => { setColor(c.name); setColorHex(c.hex); }}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${color === c.name ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-black/10'}`}
                        style={c.hex.startsWith('#') ? { backgroundColor: c.hex } : { background: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Cor" className="mt-1.5 text-xs h-8" />
                </div>
                <div>
                  <Label htmlFor="formality">Formalidade</Label>
                  <Select value={formality} onValueChange={setFormality}>
                    <SelectTrigger id="formality"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FORMALITIES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="pattern">Padrão</Label>
                  <Select value={pattern} onValueChange={setPattern}>
                    <SelectTrigger id="pattern"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['liso', 'listrado', 'xadrez', 'estampado', 'floral', 'quadriculado'].map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fabric">Tecido</Label>
                  <Select value={fabric} onValueChange={setFabric}>
                    <SelectTrigger id="fabric"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['algodao', 'poliester', 'jeans', 'linho', 'malha', 'la', 'couro', 'caneleiro'].map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="season">Estação</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger id="season"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SEASONS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="unissex">Unissex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Hering" />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: presente da namorada, usar só em ocasiões especiais" rows={2} />
              </div>

              {/* Cuidados & defeitos */}
              <div className="space-y-2.5 rounded-lg border border-muted-foreground/20 bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h4 className="text-sm font-semibold">Cuidados & defeitos</h4>
                </div>

                <div>
                  <Label htmlFor="defects" className="flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    Defeitos encontrados
                  </Label>
                  <Textarea
                    id="defects"
                    value={defects}
                    onChange={(e) => setDefects(e.target.value)}
                    placeholder="ex: mancha amarelada perto da gola"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="careInstructions" className="text-xs">Instruções de lavagem</Label>
                  <Textarea
                    id="careInstructions"
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                    placeholder="ex: lavar à mão em água fria, não usar alvejante"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="usageRestrictions" className="text-xs">Restrições de uso</Label>
                  <Textarea
                    id="usageRestrictions"
                    value={usageRestrictions}
                    onChange={(e) => setUsageRestrictions(e.target.value)}
                    placeholder="ex: não usar em dias de chuva"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="careTips" className="text-xs">Dicas de conservar</Label>
                  <Textarea
                    id="careTips"
                    value={careTips}
                    onChange={(e) => setCareTips(e.target.value)}
                    placeholder="ex: mancha de gordura sai com detergente"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              {/* Info de reuso */}
              <div className="rounded-lg bg-muted/60 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Esta peça pode ser reusada</span>
                <Badge variant="outline" className="font-normal">
                  {defaultMaxReuses(category) === 0 ? 'Nunca (sempre suja)' : `${defaultMaxReuses(category)}x antes do cesto`}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!imageData || createMut.isPending || analyzing}>
            {createMut.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
            Salvar peça
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type AnalyseResult = AnalyzeResult;
