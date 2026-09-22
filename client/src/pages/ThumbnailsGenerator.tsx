import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Loader2, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";

export default function ThumbnailsGenerator() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState<{ url: string } | null>(null);

  const generateMutation = trpc.thumbnails.generate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Thumbnail gerada com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGenerate = () => {
    if (!title.trim()) return toast.error("Digite o título do vídeo.");
    if (!theme.trim()) return toast.error("Descreva o tema/conteúdo do vídeo.");
    generateMutation.mutate({ title, theme, style: style || undefined });
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
          <ImageIcon className="w-4 h-4 text-yellow-400" />
          <h2 className="font-semibold text-sm text-foreground">Thumbnails Generator</h2>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título do Vídeo</Label>
          <Input
            placeholder="Ex: 10 Dicas de Produtividade"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-sm bg-input border-border focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tema / Conteúdo</Label>
          <Textarea
            placeholder="Descreva o assunto do vídeo para orientar o visual da thumbnail..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="h-24 text-sm resize-none bg-input border-border focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estilo Visual (opcional)</Label>
          <Input
            placeholder="Ex: minimalista, cyberpunk, vibrante..."
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="h-9 text-sm bg-input border-border focus:border-primary"
          />
        </div>

        <Button onClick={handleGenerate} disabled={isLoading} className="w-full cyber-btn text-white gap-2 h-11">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? "Gerando..." : "Gerar Thumbnail"}
        </Button>
      </div>

      {/* Right panel - Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {!result ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center border border-border"
              style={{ background: "linear-gradient(135deg, oklch(0.75 0.20 90 / 0.15), oklch(0.75 0.20 60 / 0.1))" }}
            >
              <ImageIcon className="w-10 h-10 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Pronto para criar</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Preencha os campos à esquerda e clique em "Gerar Thumbnail" para começar.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="cyber-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-sm">Thumbnail Gerada</h3>
                <a href={result.url} download target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs">
                    <Download className="w-3 h-3" />
                    Baixar
                  </Button>
                </a>
              </div>
              <img src={result.url} alt="Thumbnail gerada" className="w-full rounded-lg border border-border" style={{ aspectRatio: "16/9", objectFit: "cover" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
