import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Save, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const GENRES = ["Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz", "Blues", "Country", "Reggae", "Funk", "Soul", "Metal", "Trap", "Lo-fi", "Indie", "Samba", "MPB", "Bossa Nova"];
const MOODS = ["Feliz", "Melancólico", "Energético", "Romântico", "Raivoso", "Nostálgico", "Misterioso", "Épico", "Relaxante", "Motivacional"];
const KEYS = ["C Major", "C Minor", "D Major", "D Minor", "E Major", "E Minor", "F Major", "G Major", "A Major", "A Minor"];
const LANGUAGES = [{ value: "pt-BR", label: "Português (BR)" }, { value: "en", label: "English" }, { value: "es", label: "Español" }];

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [favoriteGenre, setFavoriteGenre] = useState("");
  const [favoriteKey, setFavoriteKey] = useState("");
  const [favoriteMood, setFavoriteMood] = useState("");
  const [favoriteStyle, setFavoriteStyle] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("pt-BR");
  const [defaultBpm, setDefaultBpm] = useState(120);

  const prefsQuery = trpc.preferences.get.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    if (prefsQuery.data) {
      setFavoriteGenre(prefsQuery.data.favoriteGenre || "");
      setFavoriteKey(prefsQuery.data.favoriteKey || "");
      setFavoriteMood(prefsQuery.data.favoriteMood || "");
      setFavoriteStyle(prefsQuery.data.favoriteStyle || "");
      setDefaultLanguage(prefsQuery.data.defaultLanguage || "pt-BR");
      setDefaultBpm(prefsQuery.data.defaultBpm || 120);
    }
  }, [prefsQuery.data]);

  const saveMutation = trpc.preferences.save.useMutation({
    onSuccess: () => toast.success("Preferências salvas!"),
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-border"
          style={{ background: "oklch(0.10 0.015 270)" }}>
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">Perfil</h3>
          <p className="text-sm text-muted-foreground">Faça login para acessar seu perfil e preferências.</p>
        </div>
        <a href={getLoginUrl()}>
          <Button className="cyber-btn text-white gap-2">Fazer Login</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* User card */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-2xl font-bold"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 300), oklch(0.65 0.28 330))" }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-display font-bold text-xl gradient-text">{user?.name || "Usuário"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-muted-foreground">Conta ativa · Manus OAuth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="cyber-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Preferências Musicais</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-3">Suas preferências são salvas e usadas como padrão nos geradores.</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gênero Favorito</Label>
            <Select value={favoriteGenre} onValueChange={setFavoriteGenre}>
              <SelectTrigger className="bg-input border-border text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {GENRES.map(g => <SelectItem key={g} value={g} className="text-sm">{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tonalidade Favorita</Label>
            <Select value={favoriteKey} onValueChange={setFavoriteKey}>
              <SelectTrigger className="bg-input border-border text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {KEYS.map(k => <SelectItem key={k} value={k} className="text-sm font-mono">{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood Favorito</Label>
            <Select value={favoriteMood} onValueChange={setFavoriteMood}>
              <SelectTrigger className="bg-input border-border text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {MOODS.map(m => <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Idioma Padrão</Label>
            <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
              <SelectTrigger className="bg-input border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value} className="text-sm">{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">BPM Padrão</Label>
          <Input
            type="number" min={60} max={200} value={defaultBpm}
            onChange={e => setDefaultBpm(Number(e.target.value))}
            className="w-32 text-sm bg-input border-border"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estilo Favorito (texto livre)</Label>
          <Input
            value={favoriteStyle}
            onChange={e => setFavoriteStyle(e.target.value)}
            placeholder="Ex: dark electronic with heavy bass..."
            className="text-sm bg-input border-border"
          />
        </div>

        <Button
          onClick={() => saveMutation.mutate({ favoriteGenre, favoriteKey, favoriteMood, favoriteStyle, defaultLanguage, defaultBpm })}
          disabled={saveMutation.isPending}
          className="cyber-btn text-white gap-2">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Preferências
        </Button>
      </div>

      {/* Danger zone */}
      <div className="cyber-card p-4 border-destructive/20">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Conta</h4>
        <Button variant="outline" onClick={() => logout()} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 text-sm">
          Sair da Conta
        </Button>
      </div>
    </div>
  );
}
