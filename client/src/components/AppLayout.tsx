import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  FlaskConical,
  Image,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  Music,
  Music2,
  Settings,
  Sparkles,
  User,
  Wand2,
  Zap,
  Lightbulb,
  FileText,
  Play,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface NavItem {
  path?: string;
  icon?: any;
  label?: string;
  color?: string;
  section?: string;
}

const navItems: NavItem[] = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", color: "text-purple-400" },
  
  // YouTube Content Creation
  { section: "YouTube" },
  { path: "/ideas", icon: Lightbulb, label: "Ideas Generator", color: "text-red-400" },
  { path: "/scripts", icon: FileText, label: "Script Creator", color: "text-orange-400" },
  { path: "/thumbnails", icon: Image, label: "Thumbnails", color: "text-yellow-400" },
  { path: "/youtube", icon: Play, label: "YouTube Manager", color: "text-red-500" },
  
  // Music Generation
  { section: "Music" },
  { path: "/lyrics", icon: Music2, label: "Lyrics Generator", color: "text-pink-400" },
  { path: "/style", icon: Wand2, label: "Style & Prompt", color: "text-cyan-400" },
  { path: "/fullsong", icon: Zap, label: "Full Song Creator", color: "text-yellow-400" },
  { path: "/image", icon: Image, label: "Image Generator", color: "text-green-400" },
  { path: "/audiolab", icon: FlaskConical, label: "Audio Lab", color: "text-orange-400" },
  
  // Shared
  { section: "Shared" },
  { path: "/chat", icon: MessageSquare, label: "AI Assistant", color: "text-blue-400" },
  { path: "/library", icon: BookOpen, label: "My Library", color: "text-violet-400" },
  { path: "/explore", icon: Compass, label: "Explore", color: "text-teal-400" },
  { path: "/export", icon: Download, label: "Export & Share", color: "text-red-400" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getCurrentPageLabel = () => {
    for (const item of navItems) {
      if (item.path === location || (item.path && item.path !== "/" && location.startsWith(item.path))) {
        return item.label || "Dashboard";
      }
    }
    return "Dashboard";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border transition-all duration-300 ease-in-out relative z-20",
          "bg-sidebar",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ background: "oklch(0.08 0.015 270)" }}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-3 p-4 border-b border-border", collapsed && "justify-center")}>
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center neon-glow-purple"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 300), oklch(0.65 0.28 330))" }}>
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse-neon"
              style={{ background: "oklch(0.75 0.20 200)" }} />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-sm tracking-widest gradient-text">SCRIPTFORGE</h1>
              <p className="text-xs text-muted-foreground font-mono">Music & Video Studio</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            // Render section headers
            if (item.section) {
              return (
                <div key={`section-${idx}`} className={cn("px-3 py-2 mt-2 mb-1", collapsed && "hidden")}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.section}</p>
                </div>
              );
            }

            // Render navigation items
            if (!item.path || !item.icon) return null;

            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={item.path}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
                        "hover:bg-sidebar-accent group",
                        isActive
                          ? "bg-sidebar-accent border border-border"
                          : "border border-transparent",
                        collapsed && "justify-center px-2"
                      )}
                      style={isActive ? {
                        borderColor: "oklch(0.45 0.15 300 / 0.5)",
                        background: "oklch(0.13 0.025 270)"
                      } : {}}
                    >
                      <Icon
                        className={cn("w-4 h-4 flex-shrink-0 transition-all", item.color, isActive && "drop-shadow-[0_0_6px_currentColor]")}
                      />
                      {!collapsed && (
                        <span className={cn("text-sm font-medium truncate", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                          {item.label}
                        </span>
                      )}
                      {isActive && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "oklch(0.65 0.28 300)" }} />
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-card border-border text-foreground">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-2 border-t border-border space-y-1">
          {isAuthenticated ? (
            <>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href="/profile">
                    <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-all", collapsed && "justify-center px-2")}>
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarFallback className="text-xs font-bold" style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 300), oklch(0.65 0.28 330))" }}>
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {!collapsed && (
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate text-foreground">{user?.name || "User"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Profile</TooltipContent>}
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => logout()}
                    className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all", collapsed && "justify-center px-2")}
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="text-sm">Sign Out</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Sign Out</TooltipContent>}
              </Tooltip>
            </>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <a href={getLoginUrl()}>
                  <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all cyber-btn text-white", collapsed && "justify-center px-2")}>
                    <LogIn className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-semibold">Sign In</span>}
                  </div>
                </a>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Sign In</TooltipContent>}
            </Tooltip>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border flex items-center justify-center transition-all hover:border-primary z-30"
          style={{ background: "oklch(0.10 0.015 270)" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-muted-foreground" /> : <ChevronLeft className="w-3 h-3 text-muted-foreground" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0"
          style={{ background: "oklch(0.08 0.01 270)" }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-mono">
              {getCurrentPageLabel()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button size="sm" className="cyber-btn text-white text-xs gap-1.5">
                  <LogIn className="w-3 h-3" />
                  Sign In to Save
                </Button>
              </a>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground font-mono"
              style={{ background: "oklch(0.10 0.015 270)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AI Online
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
