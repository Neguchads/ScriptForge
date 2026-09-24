import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const onSuccess = () => {
    utils.auth.me.invalidate();
    navigate("/");
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess,
    onError: (err) => toast.error(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess,
    onError: (err) => toast.error(err.message),
  });

  const pending = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate({ email, password });
    } else {
      if (!acceptTerms) {
        toast.error("Aceite os Termos de Uso e a Política de Privacidade para criar a conta.");
        return;
      }
      registerMutation.mutate({ name, email, password, acceptTerms: true });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="cyber-card w-full max-w-sm p-6 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="font-display font-bold text-xl gradient-text">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Acesse sua conta local do ScriptForge." : "Sem serviço externo, só neste app."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-input border-border text-sm"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input border-border text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 8 : undefined}
              className="bg-input border-border text-sm"
            />
          </div>

          {mode === "register" && (
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Li e aceito os <Link href="/termos" className="underline">Termos de Uso</Link> e a{" "}
                <Link href="/privacidade" className="underline">Política de Privacidade</Link>.
              </span>
            </label>
          )}

          <Button type="submit" disabled={pending} className="cyber-btn text-white gap-2 w-full">
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "login" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
