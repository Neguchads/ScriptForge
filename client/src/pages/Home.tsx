import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen,
  Compass,
  ExternalLink,
  FlaskConical,
  Image,
  MessageSquare,
  Music2,
  Sparkles,
  Wand2,
  Zap,
  Lightbulb,
  FileText,
  Play,
} from "lucide-react";

const youtubeFeatures = [
  {
    icon: Lightbulb,
    label: "Ideas Generator",
    desc: "Gere ideias de vídeos baseadas em nichos e tendências.",
    path: "/ideas",
    color: "text-red-400",
    gradient: "from-red-500/20 to-orange-500/10",
  },
  {
    icon: FileText,
    label: "Script Creator",
    desc: "Crie roteiros profissionais otimizados para YouTube.",
    path: "/scripts",
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-yellow-500/10",
  },
  {
    icon: Image,
    label: "Thumbnails",
    desc: "Gere thumbnails atrativas com IA para seus vídeos.",
    path: "/thumbnails",
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-amber-500/10",
  },
  {
    icon: Play,
    label: "YouTube Manager",
    desc: "Gerencie uploads e analise performance de vídeos.",
    path: "/youtube",
    color: "text-red-500",
    gradient: "from-red-500/20 to-pink-500/10",
  },
];

const musicFeatures = [
  {
    icon: Music2,
    label: "Lyrics Generator",
    desc: "Gere letras completas com IA a partir de tema, gênero e mood.",
    path: "/lyrics",
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-purple-500/10",
  },
  {
    icon: Wand2,
    label: "Style & Prompt",
    desc: "Crie prompts otimizados para o Suno AI com tags detalhadas.",
    path: "/style",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  {
    icon: Zap,
    label: "Full Song Creator",
    desc: "Combine letra + estilo em um prompt completo pronto para o Suno.",
    path: "/fullsong",
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-orange-500/10",
  },
  {
    icon: Image,
    label: "Image Generator",
    desc: "Gere capas de álbum e artes visuais diretamente na plataforma.",
    path: "/image",
    color: "text-green-400",
    gradient: "from-green-500/20 to-teal-500/10",
  },
  {
    icon: FlaskConical,
    label: "Audio Lab",
    desc: "Explore parâmetros de áudio e gere variações de prompts.",
    path: "/audiolab",
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-red-500/10",
  },
];

const sharedFeatures = [
  {
    icon: MessageSquare,
    label: "AI Assistant",
    desc: "Chat especializado para refinar seus projetos.",
    path: "/chat",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: BookOpen,
    label: "My Library",
    desc: "Histórico de todas suas criações com busca e favoritos.",
    path: "/library",
    color: "text-violet-400",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  {
    icon: Compass,
    label: "Explore",
    desc: "Galeria pública com criações da comunidade para se inspirar.",
    path: "/explore",
    color: "text-teal-400",
    gradient: "from-teal-500/20 to-cyan-500/10",
  },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-full cyber-grid-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-6 pt-12 pb-8">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.28 300), transparent)" }} />
        <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.28 330), transparent)" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border mb-6 text-xs font-mono text-muted-foreground"
            style={{ background: "oklch(0.10 0.015 270)" }}>
            <Sparkles className="w-3 h-3 text-primary" />
            Powered by AI · Música + Vídeo Unificados
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="gradient-text">SCRIPTFORGE</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-muted-foreground mb-2">
            Music & Video Creation Studio
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
            Crie conteúdo YouTube e músicas com IA. Escolha por onde começar: gere ideias de vídeos ou crie músicas incríveis — tudo integrado em um único lugar.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/ideas">
                  <Button className="cyber-btn text-white gap-2 px-6">
                    <Lightbulb className="w-4 h-4" />
                    Gerar Ideias
                  </Button>
                </Link>
                <Link href="/lyrics">
                  <Button variant="outline" className="gap-2 px-6 border-border hover:border-primary">
                    <Music2 className="w-4 h-4" />
                    Gerar Letra
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button className="cyber-btn text-white gap-2 px-6">
                    <Sparkles className="w-4 h-4" />
                    Começar Grátis
                  </Button>
                </a>
                <Link href="/explore">
                  <Button variant="outline" className="gap-2 px-6 border-border hover:border-primary">
                    <Compass className="w-4 h-4" />
                    Explorar Criações
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 mb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {[
            { label: "Ferramentas", value: "20+", sub: "recursos disponíveis" },
            { label: "Criações", value: "∞", sub: "possibilidades" },
            { label: "Integração", value: "2-Way", sub: "Vídeo ↔ Música" },
          ].map((stat) => (
            <div key={stat.label} className="cyber-card p-4 text-center">
              <div className="font-display text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm font-semibold text-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube Features */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Play className="w-4 h-4 text-red-400" />
            YouTube Content Creation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {youtubeFeatures.map((f) => (
              <Link key={f.path} href={f.path}>
                <div className={`cyber-card p-4 cursor-pointer group bg-gradient-to-br ${f.gradient} hover:scale-[1.02] transition-all duration-200`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 border border-border transition-all"
                    style={{ background: "oklch(0.13 0.02 270)" }}>
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{f.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Music Features */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Music2 className="w-4 h-4 text-pink-400" />
            Music Generation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {musicFeatures.map((f) => (
              <Link key={f.path} href={f.path}>
                <div className={`cyber-card p-4 cursor-pointer group bg-gradient-to-br ${f.gradient} hover:scale-[1.02] transition-all duration-200`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 border border-border transition-all"
                    style={{ background: "oklch(0.13 0.02 270)" }}>
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{f.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Shared Features */}
      <div className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Shared Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sharedFeatures.map((f) => (
              <Link key={f.path} href={f.path}>
                <div className={`cyber-card p-4 cursor-pointer group bg-gradient-to-br ${f.gradient} hover:scale-[1.02] transition-all duration-200`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 border border-border transition-all"
                    style={{ background: "oklch(0.13 0.02 270)" }}>
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{f.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
