import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import CopyButton from "@/components/CopyButton";
import { Loader2, Music2, RefreshCw, Shuffle, Sparkles, ExternalLink, Mic2, Volume2, Headphones } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";

const GENRES = ["Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz", "Blues", "Country", "Reggae", "Funk", "Soul", "Metal", "Punk", "Folk", "Classical", "Trap", "Lo-fi", "Indie", "Alternative", "Samba", "Forró", "Pagode", "Sertanejo", "MPB", "Bossa Nova"];
const MOODS = ["Feliz", "Melancólico", "Energético", "Romântico", "Raivoso", "Nostálgico", "Misterioso", "Épico", "Relaxante", "Motivacional", "Sombrio", "Eufórico"];
const LANGUAGES = [{ value: "pt-BR", label: "Português (BR)" }, { value: "en", label: "English" }, { value: "es", label: "Español" }];

// Modos de voz do Suno
const VOICE_MODES = [
  { value: "instrumental", label: "🎵 Instrumental", icon: "🎸", description: "Sem voz, apenas instrumentos" },
  { value: "vocal", label: "🎤 Vocal Cantado", icon: "🎙️", description: "Voz cantada com letra" },
  { value: "acapella", label: "👥 Acapella", icon: "👥", description: "Apenas voz, sem instrumentos" },
  { value: "vocal_instrumental", label: "🎼 Vocal + Instrumental", icon: "🎵", description: "Voz + instrumentos completos" },
];

// Meta-tags estruturais do Suno
const STRUCTURAL_TAGS = ["[Intro]", "[Verse 1]", "[Verse 2]", "[Pre-Chorus]", "[Chorus]", "[Bridge]", "[Breakdown]", "[Drop]", "[Outro]", "[Solo]"];

// Instruções instrumentais
const INSTRUMENTAL_INSTRUCTIONS = [
  "[Guitar Solo]", "[Piano Interlude]", "[Heavy Synth Build]", "[Orchestral Break]",
  "[Drum Break]", "[Bass Solo]", "[String Section]", "[Synth Pad]", "[Ambient Intro]", "[Energetic Bridge]"
];

// Dinâmica
const DYNAMICS = ["[Build-up]", "[Drop intense]", "[Fade out]", "[Crescendo]", "[Diminuendo]", "[Sudden Stop]"];

export default function LyricsGenerator() {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [creativity, setCreativity] = useState([0.7]);
  const [variations, setVariations] = useState(1);
  
  // Novo: Modo de voz
  const [voiceMode, setVoiceMode] = useState<"instrumental" | "vocal" | "acapella" | "vocal_instrumental">("vocal");
  
  // Novo: Meta-tags e instruções
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedDynamics, setSelectedDynamics] = useState<string[]>([]);
  const [customLyrics, setCustomLyrics] = useState("");
  
  const [results, setResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const generateMutation = trpc.lyrics.generate.useMutation({
    onSuccess: (data) => {
      setResults(data.lyrics);
      setActiveTab(0);
      toast.success("Estrutura gerada com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const refineMutation = trpc.lyrics.refine.useMutation({
    onSuccess: (data) => {
      const newResults = [...results];
      newResults[activeTab] = typeof data.lyrics === 'string' ? data.lyrics : '';
      setResults(newResults);
      toast.success("Estrutura refinada!");
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

  const handleGenerate = () => {
    if (!theme.trim() && !customLyrics.trim()) {
      return toast.error("Digite um tema ou adicione letra/estrutura customizada.");
    }
    
    generateMutation.mutate({
      theme,
      genre,
      mood,
      language,
      creativity: creativity[0],
      variations,
      voiceMode,
      structuralTags: selectedTags,
      instrumentalInstructions: selectedInstruments,
      dynamics: selectedDynamics,
      customLyrics,
    });
  };

  const handleSurprise = () => {
    const randomTheme = ["Uma viagem ao espaço", "Amor perdido na cidade", "Revolução digital", "Saudade da infância", "Festa na chuva"][Math.floor(Math.random() * 5)];
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
    const randomMood = MOODS[Math.floor(Math.random() * MOODS.length)];
    const randomVoice = VOICE_MODES[Math.floor(Math.random() * VOICE_MODES.length)].value as "instrumental" | "vocal" | "acapella" | "vocal_instrumental";
    
    setTheme(randomTheme);
    setGenre(randomGenre);
    setMood(randomMood);
    setVoiceMode(randomVoice);
    
    // Adicionar tags aleatórias
    const randomTags = STRUCTURAL_TAGS.sort(() => 0.5 - Math.random()).slice(0, 3);
    setSelectedTags(randomTags);
    
    toast.info("Parâmetros aleatórios aplicados!");
  };

  const handleRefine = (instruction: string) => {
    if (!results[activeTab]) return;
    refineMutation.mutate({ lyrics: results[activeTab], instruction });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleInstrument = (inst: string) => {
    setSelectedInstruments(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);
  };

  const toggleDynamic = (dyn: string) => {
    setSelectedDynamics(prev => prev.includes(dyn) ? prev.filter(d => d !== dyn) : [...prev, dyn]);
  };

  const isLoading = generateMutation.isPending;

  return (
    <div className="flex h-full">
      {/* Left panel - Controls */}
      <div className="w-96 flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-5"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-pink-400" />
            <h2 className="font-semibold text-sm text-foreground">Lyrics Generator</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={handleSurprise} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Shuffle className="w-3 h-3" />
            Surpresa
          </Button>
        </div>

        {/* Voice Mode Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modo de Voz</Label>
          <div className="grid grid-cols-2 gap-2">
            {VOICE_MODES.map(mode => (
              <button
                key={mode.value}
                onClick={() => setVoiceMode(mode.value as "instrumental" | "vocal" | "acapella" | "vocal_instrumental")}
                className={`p-2 rounded-lg text-xs border transition-all ${
                  voiceMode === mode.value
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                <div className="text-lg mb-1">{mode.icon}</div>
                <div className="font-medium">{mode.label.split(" ")[1]}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {VOICE_MODES.find(m => m.value === voiceMode)?.description}
          </p>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tema / História</Label>
          <Textarea
            placeholder="Ex: Uma astronauta que se apaixona por uma estrela distante..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="h-20 text-sm resize-none bg-input border-border focus:border-primary"
          />
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gênero</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="h-9 text-sm bg-input border-border">
              <SelectValue placeholder="Escolha um gênero..." />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map(g => <SelectItem key={g} value={g} className="text-sm">{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood</Label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger className="h-9 text-sm bg-input border-border">
              <SelectValue placeholder="Escolha um mood..." />
            </SelectTrigger>
            <SelectContent>
              {MOODS.map(m => <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Idioma</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-9 text-sm bg-input border-border">
              <SelectValue placeholder="Escolha um idioma..." />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value} className="text-sm">{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Structural Tags */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estrutura [Meta-tags]</Label>
          <div className="flex flex-wrap gap-1.5">
            {STRUCTURAL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 rounded text-xs border transition-all ${
                  selectedTags.includes(tag)
                    ? "border-pink-500 text-pink-400 bg-pink-500/10"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Instrumental Instructions */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Instruções Instrumentais</Label>
          <div className="flex flex-wrap gap-1.5">
            {INSTRUMENTAL_INSTRUCTIONS.map(inst => (
              <button
                key={inst}
                onClick={() => toggleInstrument(inst)}
                className={`px-2 py-1 rounded text-xs border transition-all ${
                  selectedInstruments.includes(inst)
                    ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                {inst}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamics */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dinâmica</Label>
          <div className="flex flex-wrap gap-1.5">
            {DYNAMICS.map(dyn => (
              <button
                key={dyn}
                onClick={() => toggleDynamic(dyn)}
                className={`px-2 py-1 rounded text-xs border transition-all ${
                  selectedDynamics.includes(dyn)
                    ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                {dyn}
              </button>
            ))}
          </div>
        </div>

        {/* Creativity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Criatividade</Label>
            <span className="text-xs font-mono text-primary">{Math.round(creativity[0] * 100)}%</span>
          </div>
          <Slider value={creativity} onValueChange={setCreativity} min={0.1} max={1} step={0.1} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Conservador</span>
            <span>Criativo</span>
          </div>
        </div>

        {/* Variations */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Variações</Label>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setVariations(n)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${variations === n ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
                {n}x
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full cyber-btn text-white gap-2 h-11">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? "Gerando..." : "Gerar Estrutura"}
        </Button>
      </div>

      {/* Right panel - Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {results.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-border neon-glow-magenta"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 330 / 0.15), oklch(0.65 0.28 300 / 0.1))" }}>
              <Music2 className="w-10 h-10 text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Pronto para criar</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Configure os parâmetros à esquerda e clique em "Gerar Estrutura" para começar.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Tabs for variations */}
            {results.length > 1 && (
              <div className="flex gap-2">
                {results.map((_, i) => (
                  <button key={i} onClick={() => setActiveTab(i)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${activeTab === i ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
                    Variação {i + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Structure display */}
            <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-pink-400" />
                  Estrutura Gerada para Suno
                </h3>
                <div className="flex items-center gap-2">
                  <CopyButton text={results[activeTab]} label="Copiar para Suno" />
                  <a href="https://suno.com/create" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs">
                      <ExternalLink className="w-3 h-3" />
                      Abrir Suno
                    </Button>
                  </a>
                  {isAuthenticated && (
                    <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs"
                      onClick={() => saveMutation.mutate({ type: "lyrics", content: results[activeTab], title: `Estrutura: ${theme.slice(0, 40)}`, metadata: { genre, mood, language, voiceMode } })}>
                      Salvar
                    </Button>
                  )}
                </div>
              </div>
              <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 p-4 rounded-lg border border-border"
                style={{ background: "oklch(0.09 0.01 270)" }}>
                {results[activeTab]}
              </div>
              <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">💡 <strong>Dica:</strong> Cole este conteúdo no campo "Lyrics" do Suno. O texto dentro de [colchetes] será interpretado como instruções, não como letra cantada.</p>
              </div>
            </div>

            {/* Refine options */}
            <div className="cyber-card p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Refinar Estrutura
              </h4>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 border-border"
                  onClick={() => handleRefine("Adicione mais seções e variação")}>
                  Expandir
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 border-border"
                  onClick={() => handleRefine("Simplifique e torne mais conciso")}>
                  Simplificar
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 border-border"
                  onClick={() => handleRefine("Adicione mais dinâmica e transições")}>
                  Mais Dinâmica
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
