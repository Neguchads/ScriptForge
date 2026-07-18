import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CopyButton from "@/components/CopyButton";
import { ExternalLink, Loader2, Music, Shuffle, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const GENRES = ["Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz", "Blues", "Country", "Reggae", "Funk", "Soul", "Metal", "Punk", "Folk", "Trap", "Lo-fi", "Indie", "Samba", "Forró", "MPB", "Bossa Nova"];
const MOODS = ["Feliz", "Melancólico", "Energético", "Romântico", "Raivoso", "Nostálgico", "Misterioso", "Épico", "Relaxante", "Motivacional", "Sombrio", "Eufórico"];
const LANGUAGES = [{ value: "pt-BR", label: "Português (BR)" }, { value: "en", label: "English" }, { value: "es", label: "Español" }];

type SongResult = {
  title: string;
  stylePrompt: string;
  lyrics: string;
  fullPrompt: string;
  description: string;
};

export default function FullSongCreator() {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [result, setResult] = useState<SongResult | null>(null);
  const [activeSection, setActiveSection] = useState<"full" | "style" | "lyrics">("full");

  const generateMutation = trpc.fullSong.generate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setActiveSection("full");
      toast.success("Música completa gerada!");
    },
    onError: (err) => toast.error(err.message),
  });

  const utils = trpc.useUtils();
  const saveMutation = trpc.library.save.useMutation({
    onSuccess: () => {
      toast.success("Salvo na biblioteca!");
      utils.library.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSurprise = () => {
    const themes = [
      "Uma dançarina de ballet que sonha em ir para o espaço",
      "Um hacker apaixonado pela cidade neon",
      "Saudade de uma praia de infância",
      "Uma revolução liderada por músicos",
      "Amor impossível entre dois mundos paralelos",
    ];
    setTheme(themes[Math.floor(Math.random() * themes.length)]);
    setGenre(GENRES[Math.floor(Math.random() * GENRES.length)]);
    setMood(MOODS[Math.floor(Math.random() * MOODS.length)]);
    toast.info("Parâmetros aleatórios aplicados!");
  };

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-5"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h2 className="font-semibold text-sm text-foreground">Full Song Creator</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={handleSurprise} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Shuffle className="w-3 h-3" />
            Surpresa
          </Button>
        </div>

        <div className="cyber-card p-3 border-yellow-500/20" style={{ borderColor: "oklch(0.72 0.22 55 / 0.3)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400">Magic Mode</span>
          </div>
          <p className="text-xs text-muted-foreground">Gera letra + estilo + título em um único prompt completo, pronto para colar no Suno AI.</p>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tema / Conceito *</Label>
          <Textarea
            placeholder="Descreva o conceito da música..."
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="h-24 text-sm resize-none bg-input border-border focus:border-primary"
          />
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gênero *</Label>
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
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood</Label>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.slice(0, 8).map(m => (
              <button key={m} onClick={() => setMood(m === mood ? "" : m)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${mood === m ? "border-yellow-500 text-yellow-400 bg-yellow-500/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Idioma da Letra</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-input border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value} className="text-sm">{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notas Adicionais</Label>
          <Textarea
            placeholder="Instruções extras para a IA..."
            value={additionalNotes}
            onChange={e => setAdditionalNotes(e.target.value)}
            className="h-16 text-sm resize-none bg-input border-border"
          />
        </div>

        <Button
          onClick={() => {
            if (!theme.trim() || !genre) return toast.error("Preencha o tema e o gênero.");
            generateMutation.mutate({ theme, genre, mood, language, additionalNotes });
          }}
          disabled={generateMutation.isPending}
          className="w-full gap-2 h-11 font-semibold text-white"
          style={{ background: "linear-gradient(135deg, oklch(0.72 0.22 55), oklch(0.65 0.28 330))" }}>
          {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {generateMutation.isPending ? "Criando..." : "Criar Música Completa"}
        </Button>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {!result ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-border"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.22 55 / 0.15), oklch(0.65 0.28 330 / 0.1))", borderColor: "oklch(0.72 0.22 55 / 0.3)" }}>
              <Zap className="w-10 h-10 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Full Song Creator</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Preencha o tema e gênero para gerar uma música completa com letra, estilo e prompt pronto para o Suno AI.</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {["Pop romântico", "Hip-hop urbano", "Rock épico", "Lo-fi relaxante"].map(ex => (
                <button key={ex} onClick={() => {
                  const [g, t] = ex.split(" ");
                  setGenre(g === "Lo-fi" ? "Lo-fi" : g === "Hip-hop" ? "Hip-Hop" : g === "Rock" ? "Rock" : "Pop");
                  setTheme(ex);
                }}
                  className="px-3 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Song header */}
            <div className="cyber-card p-5" style={{ borderColor: "oklch(0.72 0.22 55 / 0.3)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-yellow-400" />
                    <h2 className="font-display font-bold text-xl gradient-text">{result.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs border-border">{genre}</Badge>
                    {mood && <Badge variant="outline" className="text-xs border-border">{mood}</Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <a href="https://suno.com/create" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1.5 text-xs cyber-btn text-white whitespace-nowrap">
                      <ExternalLink className="w-3 h-3" />
                      Abrir Suno AI
                    </Button>
                  </a>
                  {isAuthenticated && (
                    <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs"
                      onClick={() => saveMutation.mutate({ type: "full_song", content: result.fullPrompt, title: result.title, metadata: { genre, mood, language } })}>
                      Salvar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex gap-2">
              {(["full", "style", "lyrics"] as const).map(s => (
                <button key={s} onClick={() => setActiveSection(s)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${activeSection === s ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
                  {s === "full" ? "Prompt Completo" : s === "style" ? "Style Tags" : "Letra"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="cyber-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {activeSection === "full" ? "Prompt Completo (cole no Suno AI)" : activeSection === "style" ? "Style Prompt" : "Letra da Música"}
                </h3>
                <CopyButton
                  text={activeSection === "full" ? result.fullPrompt : activeSection === "style" ? result.stylePrompt : result.lyrics}
                  label={activeSection === "full" ? "Copiar Tudo" : "Copiar"}
                />
              </div>
              <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 p-4 rounded-lg border border-border"
                style={{ background: "oklch(0.09 0.01 270)" }}>
                {activeSection === "full" ? result.fullPrompt : activeSection === "style" ? result.stylePrompt : result.lyrics}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
