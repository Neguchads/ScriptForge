import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Loader2, Sparkles, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

const NICHES = [
  "Programação", "Eletrônica", "Mecatrônica", "Design", "Marketing Digital",
  "Produção de Vídeo", "Educação", "Tecnologia", "Games", "Finanças", "Saúde e Fitness",
];

interface GeneratedIdea {
  title: string;
  description: string;
  hooks: string[];
}

export default function IdeasGenerator() {
  const { isAuthenticated } = useAuth();
  const [niche, setNiche] = useState("");
  const [count, setCount] = useState(5);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);

  const generateMutation = trpc.ideas.generate.useMutation({
    onSuccess: (data) => {
      setIdeas(data);
      toast.success("Ideias geradas com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const utils = trpc.useUtils();
  const savedIdeasQuery = trpc.ideas.list.useQuery(undefined, { enabled: isAuthenticated });

  const createMutation = trpc.ideas.create.useMutation({
    onSuccess: () => {
      toast.success("Ideia salva!");
      utils.ideas.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.ideas.delete.useMutation({
    onSuccess: () => {
      toast.success("Ideia removida");
      utils.ideas.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGenerate = () => {
    if (!niche.trim()) return toast.error("Escolha ou digite um nicho.");
    generateMutation.mutate({ niche, count });
  };

  const isLoading = generateMutation.isPending;

  return (
    <div className="flex h-full">
      {/* Left panel - Controls */}
      <div
        className="w-96 flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-5"
        style={{ background: "oklch(0.08 0.01 270)" }}
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-red-400" />
          <h2 className="font-semibold text-sm text-foreground">Ideas Generator</h2>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nicho</Label>
          <Select value={niche} onValueChange={setNiche}>
            <SelectTrigger className="h-9 text-sm bg-input border-border">
              <SelectValue placeholder="Escolha um nicho..." />
            </SelectTrigger>
            <SelectContent>
              {NICHES.map((n) => (
                <SelectItem key={n} value={n} className="text-sm">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Ou digite um nicho customizado..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="h-9 text-sm bg-input border-border focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantidade de Ideias</Label>
          <div className="flex gap-2">
            {[3, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  count === n ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={isLoading} className="w-full cyber-btn text-white gap-2 h-11">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? "Gerando..." : "Gerar Ideias"}
        </Button>

        {isAuthenticated && savedIdeasQuery.data && savedIdeasQuery.data.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ideias Salvas</Label>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {savedIdeasQuery.data.map((saved) => (
                <div key={saved.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border text-xs">
                  <span className="truncate text-muted-foreground">{saved.idea}</span>
                  <button onClick={() => deleteMutation.mutate({ id: saved.id })} className="flex-shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel - Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {ideas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center border border-border"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 25 / 0.15), oklch(0.65 0.22 40 / 0.1))" }}
            >
              <Lightbulb className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Pronto para criar</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Escolha um nicho à esquerda e clique em "Gerar Ideias" para começar.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {ideas.map((idea, i) => (
              <div key={i} className="cyber-card p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">{idea.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isAuthenticated && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-border text-xs"
                        onClick={() => createMutation.mutate({ idea: `${idea.title}: ${idea.description}`, source: "ai_generated" })}
                      >
                        Salvar
                      </Button>
                    )}
                    <Link href="/scripts">
                      <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs">
                        <FileText className="w-3 h-3" />
                        Criar Roteiro
                      </Button>
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{idea.description}</p>
                {idea.hooks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {idea.hooks.map((hook, hi) => (
                      <span key={hi} className="px-2 py-1 rounded text-xs border border-border text-muted-foreground">
                        {hook}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
