import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CopyButton from "@/components/CopyButton";
import {
  BookOpen, FlaskConical, Globe, Heart, Image, Loader2, Music2,
  Search, Star, StarOff, Trash2, Wand2, Zap, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_ICONS = {
  lyrics: { icon: Music2, color: "text-pink-400", label: "Letra" },
  style_prompt: { icon: Wand2, color: "text-cyan-400", label: "Style" },
  full_song: { icon: Zap, color: "text-yellow-400", label: "Full Song" },
  image: { icon: Image, color: "text-green-400", label: "Imagem" },
  audio_lab: { icon: FlaskConical, color: "text-orange-400", label: "Audio Lab" },
  chat: { icon: MessageSquare, color: "text-blue-400", label: "Chat" },
};

type FilterType = "all" | "lyrics" | "style_prompt" | "full_song" | "image" | "audio_lab" | "chat";

export default function Library() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const listQuery = trpc.library.list.useQuery(
    { type: filterType, search: search || undefined, favoritesOnly },
    { enabled: isAuthenticated }
  );

  const toggleFavMutation = trpc.library.toggleFavorite.useMutation({
    onSuccess: () => listQuery.refetch(),
    onError: (err) => toast.error(err.message),
  });

  const togglePublicMutation = trpc.library.togglePublic.useMutation({
    onSuccess: () => { listQuery.refetch(); toast.success("Visibilidade atualizada!"); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => { listQuery.refetch(); toast.success("Item removido."); },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-border"
          style={{ background: "oklch(0.10 0.015 270)" }}>
          <BookOpen className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">Biblioteca Pessoal</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Faça login para salvar e acessar todas as suas criações.</p>
        </div>
        <a href={getLoginUrl()}>
          <Button className="cyber-btn text-white gap-2">Fazer Login</Button>
        </a>
      </div>
    );
  }

  const items = listQuery.data?.items || [];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-wrap"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar na biblioteca..."
            className="pl-9 bg-input border-border text-sm h-9"
          />
        </div>
        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${favoritesOnly ? "border-yellow-500 text-yellow-400 bg-yellow-500/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
          <Heart className="w-3 h-3" />
          Favoritos
        </button>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 px-6 py-3 border-b border-border overflow-x-auto"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <button onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${filterType === "all" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-border/80"}`}>
          Todos
        </button>
        {Object.entries(TYPE_ICONS).map(([type, { label, color }]) => (
          <button key={type} onClick={() => setFilterType(type as FilterType)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${filterType === type ? `border-current ${color} bg-current/10` : "border-border text-muted-foreground hover:border-border/80"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Biblioteca vazia</h3>
              <p className="text-sm text-muted-foreground">
                {search ? "Nenhum resultado encontrado." : "Comece gerando letras, prompts ou imagens para salvá-los aqui."}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            {items.map((item) => {
              const typeInfo = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS];
              const TypeIcon = typeInfo?.icon || BookOpen;
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className="cyber-card p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-border`}
                      style={{ background: "oklch(0.13 0.02 270)" }}>
                      <TypeIcon className={`w-4 h-4 ${typeInfo?.color || "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {item.title || `${typeInfo?.label || "Item"} sem título`}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs border-border h-4 px-1.5">
                              {typeInfo?.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(item.createdAt), "dd MMM yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggleFavMutation.mutate({ id: item.id, isFavorite: !item.isFavorite })}
                            className={`p-1.5 rounded-lg transition-all hover:bg-yellow-500/10 ${item.isFavorite ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}>
                            {item.isFavorite ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => togglePublicMutation.mutate({ id: item.id, isPublic: !item.isPublic })}
                            className={`p-1.5 rounded-lg transition-all hover:bg-primary/10 ${item.isPublic ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                            title={item.isPublic ? "Tornar privado" : "Compartilhar no Explore"}>
                            <Globe className="w-3.5 h-3.5" />
                          </button>
                          <CopyButton text={item.content} size="sm" className="h-7 text-xs" />
                          <button
                            onClick={() => deleteMutation.mutate({ id: item.id })}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Preview */}
                      {item.type === "image" && item.imageUrl ? (
                        <div className="mt-3">
                          <img src={item.imageUrl} alt="Generated" className="w-24 h-24 rounded-lg object-cover border border-border" />
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className={`text-xs text-muted-foreground font-mono leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}>
                            {item.content}
                          </p>
                          {item.content.length > 150 && (
                            <button onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="text-xs text-primary hover:underline mt-1">
                              {isExpanded ? "Ver menos" : "Ver mais"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
