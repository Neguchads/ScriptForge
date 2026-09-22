import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CopyButton from "@/components/CopyButton";
import { FileText, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

const NICHES = [
  "Programação", "Eletrônica", "Mecatrônica", "Design", "Marketing Digital",
  "Produção de Vídeo", "Educação", "Tecnologia", "Games", "Finanças", "Saúde e Fitness",
];

interface GeneratedScript {
  hook: string;
  introduction: string;
  mainContent: string;
  callToAction: string;
  fullScript: string;
  seoTitle: string;
  seoDescription: string;
  tags: string;
}

export default function ScriptCreator() {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [script, setScript] = useState<GeneratedScript | null>(null);

  const generateMutation = trpc.scripts.generate.useMutation({
    onSuccess: (data) => {
      setScript(data);
      toast.success("Roteiro gerado com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.scripts.create.useMutation({
    onSuccess: () => {
      toast.success("Roteiro salvo na biblioteca!");
      utils.scripts.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGenerate = () => {
    if (!title.trim()) return toast.error("Digite um título para o vídeo.");
    if (!niche.trim()) return toast.error("Escolha ou digite um nicho.");
    generateMutation.mutate({ title, niche, targetAudience: targetAudience || undefined });
  };

  const handleSave = () => {
    if (!script) return;
    createMutation.mutate({ title, ...script });
  };

  const tagsList: string[] = script ? (() => {
    try {
      return JSON.parse(script.tags);
    } catch {
      return [];
    }
  })() : [];

  const isLoading = generateMutation.isPending;

  return (
    <div className="flex h-full">
      {/* Left panel - Controls */}
      <div
        className="w-96 flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-5"
        style={{ background: "oklch(0.08 0.01 270)" }}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-400" />
          <h2 className="font-semibold text-sm text-foreground">Script Creator</h2>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título do Vídeo</Label>
          <Input
            placeholder="Ex: Como criar um app em 10 minutos"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-sm bg-input border-border focus:border-primary"
          />
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
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Público-alvo (opcional)</Label>
          <Input
            placeholder="Ex: iniciantes em programação"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="h-9 text-sm bg-input border-border focus:border-primary"
          />
        </div>

        <Button onClick={handleGenerate} disabled={isLoading} className="w-full cyber-btn text-white gap-2 h-11">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? "Gerando..." : "Gerar Roteiro"}
        </Button>
      </div>

      {/* Right panel - Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {!script ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center border border-border"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.20 55 / 0.15), oklch(0.65 0.20 70 / 0.1))" }}
            >
              <FileText className="w-10 h-10 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Pronto para criar</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Preencha os campos à esquerda e clique em "Gerar Roteiro" para começar.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  Roteiro Completo
                </h3>
                <div className="flex items-center gap-2">
                  <CopyButton text={script.fullScript} label="Copiar Roteiro" />
                  <Link href="/thumbnails">
                    <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs">
                      <ImageIcon className="w-3 h-3" />
                      Criar Thumbnail
                    </Button>
                  </Link>
                  {isAuthenticated && (
                    <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs" onClick={handleSave}>
                      Salvar
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Hook</p>
                  <p className="text-foreground/90">{script.hook}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Introdução</p>
                  <p className="text-foreground/90 whitespace-pre-wrap">{script.introduction}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Conteúdo Principal</p>
                  <p className="text-foreground/90 whitespace-pre-wrap">{script.mainContent}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Call to Action</p>
                  <p className="text-foreground/90">{script.callToAction}</p>
                </div>
              </div>
            </div>

            <div className="cyber-card p-5">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">SEO & Metadados</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Título SEO</p>
                  <p className="text-foreground/90">{script.seoTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Descrição SEO</p>
                  <p className="text-foreground/90">{script.seoDescription}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tagsList.map((tag, i) => (
                      <span key={i} className="px-2 py-1 rounded text-xs border border-border text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
