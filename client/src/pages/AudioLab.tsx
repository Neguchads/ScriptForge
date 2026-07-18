import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import CopyButton from "@/components/CopyButton";
import { FlaskConical, Loader2, Shuffle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const KEYS = ["C Major", "C Minor", "D Major", "D Minor", "E Major", "E Minor", "F Major", "F Minor", "G Major", "G Minor", "A Major", "A Minor", "B Major", "B Minor", "C# Major", "F# Major", "Bb Major", "Eb Major"];

type Variation = { name: string; prompt: string; description: string };

export default function AudioLab() {
  const { isAuthenticated } = useAuth();
  const [basePrompt, setBasePrompt] = useState("");
  const [tempo, setTempo] = useState([120]);
  const [key, setKey] = useState("C Major");
  const [energy, setEnergy] = useState([6]);
  const [complexity, setComplexity] = useState([5]);
  const [count, setCount] = useState(3);
  const [variations, setVariations] = useState<Variation[]>([]);

  const generateMutation = trpc.audioLab.generateVariations.useMutation({
    onSuccess: (data) => {
      setVariations(data.variations);
      toast.success(`${data.variations.length} variações geradas!`);
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
    const prompts = [
      "dark electronic beat with heavy bass",
      "acoustic guitar folk melody",
      "jazz piano with smooth saxophone",
      "energetic hip-hop with trap elements",
      "ambient synth pads with reverb",
    ];
    setBasePrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    setTempo([Math.floor(Math.random() * 80) + 80]);
    setEnergy([Math.floor(Math.random() * 8) + 2]);
    setComplexity([Math.floor(Math.random() * 7) + 2]);
    toast.info("Parâmetros aleatórios aplicados!");
  };

  const getTempoLabel = (bpm: number) => {
    if (bpm < 70) return "Largo";
    if (bpm < 90) return "Andante";
    if (bpm < 110) return "Moderato";
    if (bpm < 130) return "Allegretto";
    if (bpm < 160) return "Allegro";
    if (bpm < 180) return "Vivace";
    return "Presto";
  };

  const getEnergyLabel = (e: number) => {
    if (e <= 2) return "Suave";
    if (e <= 4) return "Relaxado";
    if (e <= 6) return "Moderado";
    if (e <= 8) return "Intenso";
    return "Explosivo";
  };

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-5"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-orange-400" />
            <h2 className="font-semibold text-sm text-foreground">Audio Lab</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={handleSurprise} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Shuffle className="w-3 h-3" />
            Surpresa
          </Button>
        </div>

        {/* Base prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt Base</Label>
          <Textarea
            placeholder="Descreva o estilo musical base..."
            value={basePrompt}
            onChange={e => setBasePrompt(e.target.value)}
            className="h-20 text-sm resize-none bg-input border-border focus:border-primary"
          />
        </div>

        {/* Tempo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tempo</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-orange-400">{tempo[0]} BPM</span>
              <span className="text-xs text-muted-foreground">· {getTempoLabel(tempo[0])}</span>
            </div>
          </div>
          <Slider value={tempo} onValueChange={setTempo} min={60} max={200} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>60</span>
            <span>130</span>
            <span>200</span>
          </div>
        </div>

        {/* Key */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tonalidade</Label>
          <Select value={key} onValueChange={setKey}>
            <SelectTrigger className="bg-input border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-48">
              {KEYS.map(k => <SelectItem key={k} value={k} className="text-sm font-mono">{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Energy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Energia</Label>
            <span className="text-xs font-mono text-orange-400">{energy[0]}/10 · {getEnergyLabel(energy[0])}</span>
          </div>
          <Slider value={energy} onValueChange={setEnergy} min={1} max={10} step={1} />
        </div>

        {/* Complexity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complexidade</Label>
            <span className="text-xs font-mono text-orange-400">{complexity[0]}/10</span>
          </div>
          <Slider value={complexity} onValueChange={setComplexity} min={1} max={10} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Simples</span>
            <span>Complexo</span>
          </div>
        </div>

        {/* Count */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Variações</Label>
          <div className="flex gap-2">
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${count === n ? "border-orange-500 text-orange-400 bg-orange-500/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
                {n}x
              </button>
            ))}
          </div>
        </div>

        {/* Visual params summary */}
        <div className="cyber-card p-3 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Parâmetros Ativos</p>
          {[
            { label: "BPM", value: `${tempo[0]} (${getTempoLabel(tempo[0])})` },
            { label: "Key", value: key },
            { label: "Energy", value: `${energy[0]}/10` },
            { label: "Complexity", value: `${complexity[0]}/10` },
          ].map(p => (
            <div key={p.label} className="flex justify-between">
              <span className="text-xs text-muted-foreground">{p.label}</span>
              <span className="text-xs font-mono text-foreground">{p.value}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => {
            if (!basePrompt.trim()) return toast.error("Digite um prompt base.");
            generateMutation.mutate({ basePrompt, tempo: tempo[0], key, energy: energy[0], complexity: complexity[0], count });
          }}
          disabled={generateMutation.isPending}
          className="w-full gap-2 h-11 text-white"
          style={{ background: "linear-gradient(135deg, oklch(0.72 0.22 55), oklch(0.60 0.22 25))" }}>
          {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generateMutation.isPending ? "Gerando..." : "Gerar Variações"}
        </Button>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {variations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-border"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.22 55 / 0.15), oklch(0.60 0.22 25 / 0.1))", borderColor: "oklch(0.72 0.22 55 / 0.3)" }}>
              <FlaskConical className="w-10 h-10 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Audio Lab Experimental</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Ajuste os parâmetros de áudio e gere variações de prompts para explorar diferentes sonoridades.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-orange-400" />
              {variations.length} Variações Geradas
            </h3>
            <div className="grid gap-4">
              {variations.map((v, i) => (
                <div key={i} className="cyber-card p-5" style={{ borderColor: `oklch(0.72 0.22 ${55 + i * 20} / 0.3)` }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{v.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <CopyButton text={v.prompt} />
                      {isAuthenticated && (
                        <Button size="sm" variant="outline" className="gap-1 border-border text-xs"
                          onClick={() => saveMutation.mutate({ type: "audio_lab", content: v.prompt, title: v.name, metadata: { tempo: tempo[0], key, energy: energy[0], complexity: complexity[0] } })}>
                          Salvar
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="font-mono text-xs p-3 rounded-lg border border-border text-foreground/80 leading-relaxed"
                    style={{ background: "oklch(0.09 0.01 270)" }}>
                    {v.prompt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
