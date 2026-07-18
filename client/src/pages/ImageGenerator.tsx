import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CopyButton from "@/components/CopyButton";
import { Download, Image, Loader2, Shuffle, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const GENRES = ["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Metal", "Folk", "R&B", "Ambient", "Classical"];
const MOODS = ["Dark", "Vibrant", "Dreamy", "Energetic", "Melancholic", "Mystical", "Futuristic", "Vintage", "Romantic", "Epic"];
const STYLES = [
  "Cyberpunk neon", "Watercolor painting", "Oil painting", "Digital art", "Minimalist",
  "Surrealist", "Retro 80s", "Anime style", "Photography", "Abstract", "Glitch art", "Vaporwave",
];

export default function ImageGenerator() {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [style, setStyle] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const generateMutation = trpc.image.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedUrl(data.url ?? null);
      toast.success("Imagem gerada com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const buildPromptMutation = trpc.image.buildPrompt.useMutation({
    onSuccess: (data) => {
      const rawPrompt = data.prompt;
      setPrompt(typeof rawPrompt === 'string' ? rawPrompt : '');
      setIsBuilding(false);
      toast.success("Prompt construído! Revise e gere a imagem.");
    },
    onError: (err) => { toast.error(err.message); setIsBuilding(false); },
  });

  const utils = trpc.useUtils();
  const saveMutation = trpc.library.save.useMutation({
    onSuccess: () => {
      toast.success("Salvo na biblioteca!");
      utils.library.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleBuildPrompt = () => {
    if (!genre) return toast.error("Selecione um gênero.");
    setIsBuilding(true);
    buildPromptMutation.mutate({ genre, mood, theme: style });
  };

  const handleSurprise = () => {
    setGenre(GENRES[Math.floor(Math.random() * GENRES.length)]);
    setMood(MOODS[Math.floor(Math.random() * MOODS.length)]);
    setStyle(STYLES[Math.floor(Math.random() * STYLES.length)]);
    toast.info("Parâmetros aleatórios aplicados!");
  };

  const handleDownload = async () => {
    if (!generatedUrl) return;
    try {
      const response = await fetch(generatedUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sunoforge-cover-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar imagem.");
    }
  };

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-5"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-green-400" />
            <h2 className="font-semibold text-sm text-foreground">Image Generator</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={handleSurprise} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Shuffle className="w-3 h-3" />
            Surpresa
          </Button>
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gênero Musical</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="bg-input border-border text-sm">
              <SelectValue placeholder="Selecione o gênero" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {GENRES.map(g => <SelectItem key={g} value={g} className="text-sm">{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Atmosfera</Label>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map(m => (
              <button key={m} onClick={() => setMood(m === mood ? "" : m)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${mood === m ? "border-green-500 text-green-400 bg-green-500/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estilo Visual</Label>
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s === style ? "" : s)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${style === s ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Build prompt button */}
        <Button
          onClick={handleBuildPrompt}
          disabled={isBuilding || buildPromptMutation.isPending}
          variant="outline"
          className="w-full gap-2 border-border hover:border-green-500/50 hover:text-green-400">
          {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          Construir Prompt com IA
        </Button>

        {/* Manual prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt da Imagem</Label>
          <Textarea
            placeholder="Descreva a capa do álbum que deseja gerar..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="h-32 text-sm resize-none bg-input border-border focus:border-primary"
          />
          {prompt && <CopyButton text={prompt} label="Copiar Prompt" className="w-full justify-center" />}
        </div>

        {/* Generate button */}
        <Button
          onClick={() => {
            if (!prompt.trim()) return toast.error("Digite ou construa um prompt.");
            generateMutation.mutate({ prompt, style, genre, mood });
          }}
          disabled={generateMutation.isPending}
          className="w-full gap-2 h-11 text-white"
          style={{ background: "linear-gradient(135deg, oklch(0.75 0.22 145), oklch(0.65 0.28 300))" }}>
          {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generateMutation.isPending ? "Gerando..." : "Gerar Imagem"}
        </Button>

        {generateMutation.isPending && (
          <p className="text-xs text-center text-muted-foreground">A geração pode levar 10-20 segundos...</p>
        )}
      </div>

      {/* Right panel - Image preview */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        {!generatedUrl ? (
          <div className="text-center space-y-4">
            <div className="w-64 h-64 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3"
              style={{ background: "oklch(0.09 0.01 270)" }}>
              <Image className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Sua capa aparecerá aqui</p>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">Configure os parâmetros e gere uma capa de álbum única com IA, sem sair da plataforma.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-lg w-full">
            <div className="relative group">
              <img
                src={generatedUrl}
                alt="Generated album cover"
                className="w-full rounded-2xl border border-border shadow-2xl"
                style={{ boxShadow: "0 0 40px oklch(0.65 0.28 300 / 0.2)" }}
              />
              <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button onClick={handleDownload} className="gap-2 cyber-btn text-white">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                {isAuthenticated && (
                  <Button variant="outline" className="gap-2 border-border text-white"
                    onClick={() => saveMutation.mutate({ type: "image", content: prompt, title: `Cover: ${genre} ${mood}`, imageUrl: generatedUrl, metadata: { genre, mood, style } })}>
                    Salvar
                  </Button>
                )}
              </div>
            </div>

            <div className="cyber-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">Prompt utilizado</span>
                <CopyButton text={prompt} />
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">{prompt}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => generateMutation.mutate({ prompt, style, genre, mood })}
                disabled={generateMutation.isPending}
                variant="outline"
                className="flex-1 gap-2 border-border hover:border-primary text-sm">
                {generateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Gerar Variação
              </Button>
              <Button onClick={handleDownload} className="flex-1 gap-2 cyber-btn text-white text-sm">
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
