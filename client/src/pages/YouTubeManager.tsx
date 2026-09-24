import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Play, Loader2, LogIn, LogOut, Users, Eye, Video, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function YouTubeManager() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const statusQuery = trpc.youtube.status.useQuery(undefined, { enabled: isAuthenticated });
  const isConnected = !!statusQuery.data?.connected;

  const authUrlQuery = trpc.youtube.getAuthUrl.useQuery(
    { redirectUri: `${window.location.origin}/api/youtube/oauth/callback` },
    { enabled: isAuthenticated && !isConnected }
  );

  const statsQuery = trpc.youtube.channelStats.useQuery(undefined, { enabled: isConnected });
  const videosQuery = trpc.youtube.videos.useQuery(undefined, { enabled: isConnected });

  const disconnectMutation = trpc.youtube.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Conta do YouTube desconectada");
      utils.youtube.status.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-4 p-6">
        <Play className="w-10 h-10 text-red-400" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">Faça login para continuar</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Você precisa estar autenticado para conectar sua conta do YouTube.</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-4 p-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center border border-border"
          style={{ background: "linear-gradient(135deg, oklch(0.60 0.24 25 / 0.15), oklch(0.60 0.24 10 / 0.1))" }}
        >
          <Play className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">Conecte sua conta do YouTube</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Autorize o acesso para ver estatísticas do seu canal, listar seus vídeos e futuramente publicar diretamente pelo ScriptForge.
          </p>
        </div>
        <Button
          disabled={authUrlQuery.isLoading || !authUrlQuery.data}
          onClick={() => {
            if (authUrlQuery.data?.url) window.location.href = authUrlQuery.data.url;
          }}
          className="cyber-btn text-white gap-2"
        >
          {authUrlQuery.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Conectar com Google
        </Button>
        <p className="text-xs text-muted-foreground max-w-sm">
          Requer YOUTUBE_CLIENT_ID/YOUTUBE_CLIENT_SECRET configurados no servidor.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="cyber-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20">
            <Play className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{statusQuery.data?.channelName || "Canal conectado"}</p>
            <p className="text-xs text-muted-foreground">Conta do YouTube conectada</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-border text-xs"
          onClick={() => disconnectMutation.mutate()}
          disabled={disconnectMutation.isPending}
        >
          <LogOut className="w-3 h-3" />
          Desconectar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="cyber-card p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-xs text-muted-foreground">Inscritos</p>
            <p className="text-lg font-semibold text-foreground">
              {statsQuery.isLoading ? "..." : (statsQuery.data?.subscribers ?? 0).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="cyber-card p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-xs text-muted-foreground">Visualizações</p>
            <p className="text-lg font-semibold text-foreground">
              {statsQuery.isLoading ? "..." : (statsQuery.data?.views ?? 0).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="cyber-card p-4 flex items-center gap-3">
          <Video className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xs text-muted-foreground">Vídeos</p>
            <p className="text-lg font-semibold text-foreground">
              {statsQuery.isLoading ? "..." : (statsQuery.data?.videos ?? 0).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      <div className="cyber-card p-5">
        <h3 className="font-semibold text-foreground mb-3 text-sm">Vídeos Recentes</h3>
        {videosQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando vídeos...
          </div>
        ) : !videosQuery.data || videosQuery.data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nenhum vídeo encontrado no canal.</p>
        ) : (
          <div className="space-y-2">
            {videosQuery.data.map((video) => (
              <a
                key={video.videoId}
                href={`https://youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg border border-border hover:border-border/80 transition-all"
              >
                {video.thumbnailUrl && <img src={video.thumbnailUrl} alt={video.title} className="w-20 h-11 rounded object-cover flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(video.publishedAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-blue-300">
          💡 <strong>Em breve:</strong> upload direto de vídeos a partir dos roteiros criados no Script Creator. Por enquanto, esta tela mostra estatísticas e vídeos existentes do seu canal.
        </p>
      </div>
    </div>
  );
}
