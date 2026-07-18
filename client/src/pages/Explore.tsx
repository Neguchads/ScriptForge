import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/CopyButton";
import { Compass, FlaskConical, Image, Loader2, Music2, Search, Wand2, Zap, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

const TYPE_ICONS = {
  lyrics: { icon: Music2, color: "text-pink-400", label: "Letra" },
  style_prompt: { icon: Wand2, color: "text-cyan-400", label: "Style" },
  full_song: { icon: Zap, color: "text-yellow-400", label: "Full Song" },
  image: { icon: Image, color: "text-green-400", label: "Imagem" },
  audio_lab: { icon: FlaskConical, color: "text-orange-400", label: "Audio Lab" },
  chat: { icon: MessageSquare, color: "text-blue-400", label: "Chat" },
};

export default function Explore() {
  const [search, setSearch] = useState("");

  const exploreQuery = trpc.explore.list.useQuery({
    search: search || undefined,
    limit: 30,
  });

  const items = exploreQuery.data?.items || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border"
            style={{ background: "oklch(0.13 0.02 270)" }}>
            <Compass className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Explore</h2>
            <p className="text-xs text-muted-foreground">Criações compartilhadas pela comunidade</p>
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar criações..."
            className="pl-9 bg-input border-border text-sm h-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {exploreQuery.isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-border"
              style={{ background: "oklch(0.10 0.015 270)" }}>
              <Compass className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Comunidade em construção</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Seja o primeiro a compartilhar suas criações! Vá para a Biblioteca e torne suas gerações públicas.
              </p>
            </div>
            <Link href="/library">
              <Button className="cyber-btn text-white gap-2">
                <Compass className="w-4 h-4" />
                Ir para Biblioteca
              </Button>
            </Link>

            {/* Placeholder cards */}
            <div className="w-full max-w-3xl mt-4">
              <p className="text-xs text-muted-foreground mb-3 text-left">Exemplos de criações que aparecerão aqui:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { type: "lyrics", title: "Neon Dreams", content: "[Verse 1]\nLuzes da cidade brilham\nNo asfalto molhado da noite...", genre: "Synthpop" },
                  { type: "style_prompt", title: "Dark Electronic", content: "dark electronic, heavy bass, 140 BPM, dystopian atmosphere, synthesizers, industrial beats", genre: "Electronic" },
                  { type: "full_song", title: "Revolução Digital", content: "Style: cyberpunk, electronic, aggressive\n\n[Verse 1]\nCódigo corre nas veias...", genre: "Cyberpunk" },
                ].map((ex, i) => {
                  const typeInfo = TYPE_ICONS[ex.type as keyof typeof TYPE_ICONS];
                  const TypeIcon = typeInfo?.icon || Music2;
                  return (
                    <div key={i} className="cyber-card p-4 opacity-50">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className={`w-3.5 h-3.5 ${typeInfo?.color}`} />
                        <span className="text-xs font-medium text-foreground">{ex.title}</span>
                        <Badge variant="outline" className="text-xs border-border ml-auto">{ex.genre}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono line-clamp-3 leading-relaxed">{ex.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-muted-foreground mb-4">{items.length} criação{items.length !== 1 ? "ões" : ""} compartilhada{items.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const typeInfo = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS];
                const TypeIcon = typeInfo?.icon || Music2;
                return (
                  <div key={item.id} className="cyber-card p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border border-border"
                          style={{ background: "oklch(0.13 0.02 270)" }}>
                          <TypeIcon className={`w-3.5 h-3.5 ${typeInfo?.color}`} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {item.title || `${typeInfo?.label}`}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.createdAt), "dd MMM", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-border flex-shrink-0">{typeInfo?.label}</Badge>
                    </div>

                    {item.type === "image" && item.imageUrl ? (
                      <img src={item.imageUrl} alt="Cover" className="w-full h-32 rounded-lg object-cover border border-border" />
                    ) : (
                      <p className="text-xs text-muted-foreground font-mono line-clamp-4 leading-relaxed flex-1">
                        {item.content}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-border">
                      <CopyButton text={item.content} label="Usar como base" size="sm" className="flex-1 justify-center text-xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
