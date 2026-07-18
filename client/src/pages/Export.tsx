import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CopyButton from "@/components/CopyButton";
import { toast } from "sonner";
import { Download, Share2, Code2, Music, FileJson, Eye, Trash2, Link as LinkIcon } from "lucide-react";

export default function Export() {
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [expiresInDays, setExpiresInDays] = useState(30);

  // Get all generations
  const { data: generationsData, isLoading: generationsLoading } = trpc.library.list.useQuery({});
  const generations = generationsData?.items || [];

  // Get all exports
  const { data: exports, refetch: refetchExports } = trpc.export.listExports.useQuery();

  // Export mutations
  const exportPDF = trpc.export.exportPDF.useMutation({
    onSuccess: () => {
      toast.success("PDF exportado com sucesso!");
      refetchExports();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const exportMIDI = trpc.export.exportMIDI.useMutation({
    onSuccess: () => {
      toast.success("MIDI exportado com sucesso!");
      refetchExports();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const exportJSON = trpc.export.exportJSON.useMutation({
    onSuccess: () => {
      toast.success("JSON exportado com sucesso!");
      refetchExports();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const createShareLink = trpc.export.createShareLink.useMutation({
    onSuccess: () => {
      toast.success("Link compartilhável criado!");
      refetchExports();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteExport = trpc.export.deleteExport.useMutation({
    onSuccess: () => {
      toast.success("Export deletado!");
      refetchExports();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const handleExportPDF = () => {
    if (!selectedGeneration) {
      toast.error("Selecione uma geração primeiro");
      return;
    }
    exportPDF.mutate({ generationId: selectedGeneration });
  };

  const handleExportMIDI = () => {
    if (!selectedGeneration) {
      toast.error("Selecione uma geração primeiro");
      return;
    }
    exportMIDI.mutate({ generationId: selectedGeneration });
  };

  const handleExportJSON = () => {
    if (!selectedGeneration) {
      toast.error("Selecione uma geração primeiro");
      return;
    }
    exportJSON.mutate({ generationId: selectedGeneration });
  };

  const handleCreateShareLink = () => {
    if (!selectedGeneration) {
      toast.error("Selecione uma geração primeiro");
      return;
    }
    createShareLink.mutate({ generationId: selectedGeneration, expiresInDays });
  };

  const handleDeleteExport = (exportId: number) => {
    if (confirm("Tem certeza que deseja deletar este export?")) {
      deleteExport.mutate({ exportId });
    }
  };

  const getShareUrl = (shareToken: string) => {
    return `${window.location.origin}/share/${shareToken}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2">
            Exportação Avançada
          </h1>
          <p className="text-slate-400">
            Exporte suas criações em múltiplos formatos e compartilhe com o mundo
          </p>
        </div>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-purple-500/20">
            <TabsTrigger value="export" className="data-[state=active]:bg-purple-600">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </TabsTrigger>
            <TabsTrigger value="shared" className="data-[state=active]:bg-purple-600">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhados
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            {/* Selection */}
            <Card className="bg-slate-900/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Selecione uma Geração</CardTitle>
                <CardDescription>Escolha o que deseja exportar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {generationsLoading ? (
                      <p className="text-slate-400">Carregando gerações...</p>
                    ) : !generations.length ? (
                      <p className="text-slate-400">Nenhuma geração encontrada</p>
                    ) : (
                      generations.map((gen: any) => (
                        <button
                          key={gen.id}
                          onClick={() => setSelectedGeneration(gen.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedGeneration === gen.id
                              ? "border-cyan-400 bg-cyan-400/10"
                              : "border-purple-500/20 bg-slate-800/50 hover:border-purple-500/40"
                          }`}
                        >
                          <div className="font-semibold text-cyan-400">{gen.title || "Untitled"}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {gen.type} • {new Date(gen.createdAt).toLocaleDateString()}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDF Export */}
              <Card className="bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="w-5 h-5 text-red-400" />
                    Exportar como PDF
                  </CardTitle>
                  <CardDescription>Documento formatado com metadados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExportPDF}
                    disabled={!selectedGeneration || exportPDF.isPending}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  >
                    {exportPDF.isPending ? "Gerando..." : "Exportar PDF"}
                  </Button>
                </CardContent>
              </Card>

              {/* MIDI Export */}
              <Card className="bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Music className="w-5 h-5 text-yellow-400" />
                    Exportar como MIDI
                  </CardTitle>
                  <CardDescription>Estrutura musical em formato MIDI</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExportMIDI}
                    disabled={!selectedGeneration || exportMIDI.isPending}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                  >
                    {exportMIDI.isPending ? "Gerando..." : "Exportar MIDI"}
                  </Button>
                </CardContent>
              </Card>

              {/* JSON Export */}
              <Card className="bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-green-400" />
                    Exportar como JSON
                  </CardTitle>
                  <CardDescription>Dados completos em formato JSON</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExportJSON}
                    disabled={!selectedGeneration || exportJSON.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {exportJSON.isPending ? "Gerando..." : "Exportar JSON"}
                  </Button>
                </CardContent>
              </Card>

              {/* Share Link */}
              <Card className="bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                    Criar Link Compartilhável
                  </CardTitle>
                  <CardDescription>Compartilhe com expiração</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Expira em (dias)</label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                      className="bg-slate-800 border-purple-500/20 text-cyan-400"
                    />
                  </div>
                  <Button
                    onClick={handleCreateShareLink}
                    disabled={!selectedGeneration || createShareLink.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {createShareLink.isPending ? "Criando..." : "Criar Link"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Shared Tab */}
          <TabsContent value="shared" className="space-y-4">
            <Card className="bg-slate-900/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Seus Exports Compartilhados</CardTitle>
                <CardDescription>Gerencie seus links e exports públicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!exports?.length ? (
                    <p className="text-slate-400 text-center py-8">Nenhum export compartilhado ainda</p>
                  ) : (
                    exports.map((exp: any) => (
                      <div
                        key={exp.id}
                        className="p-4 rounded-lg bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-cyan-400 flex items-center gap-2">
                              {exp.exportType === "pdf" && <Download className="w-4 h-4 text-red-400" />}
                              {exp.exportType === "midi" && <Music className="w-4 h-4 text-yellow-400" />}
                              {exp.exportType === "json" && <FileJson className="w-4 h-4 text-green-400" />}
                              {exp.exportType === "embed" && <Code2 className="w-4 h-4 text-blue-400" />}
                              {exp.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {exp.description}
                            </div>
                            <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                              <Eye className="w-3 h-3" />
                              {exp.viewCount} visualizações
                            </div>
                            {exp.expiresAt && (
                              <div className="text-xs text-orange-400 mt-1">
                                Expira em: {new Date(exp.expiresAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <CopyButton
                              text={getShareUrl(exp.shareToken)}
                              label="URL"
                              className="bg-purple-600 hover:bg-purple-700"
                            />
                            {exp.exportType === "embed" && (
                              <CopyButton
                                text={`<iframe src="${getShareUrl(exp.shareToken)}" width="100%" height="600" frameborder="0"></iframe>`}
                                label="Embed"
                                className="bg-blue-600 hover:bg-blue-700"
                              />
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteExport(exp.id)}
                              disabled={deleteExport.isPending}
                              className="bg-red-600/20 hover:bg-red-600/40 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
