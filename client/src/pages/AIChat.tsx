import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Music, Send, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";
import CopyButton from "@/components/CopyButton";
import { Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "Como criar um bom prompt para o Suno AI?",
  "Quais são as melhores tags para música eletrônica?",
  "Me ajude a escrever um refrão para uma música pop",
  "Explique a diferença entre verse e chorus",
  "Sugira instrumentos para uma música lo-fi",
  "Como fazer uma letra mais emocional?",
];

export default function AIChat() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const historyQuery = trpc.chat.history.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (historyQuery.data?.messages) {
      setMessages(historyQuery.data.messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })));
    }
  }, [historyQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      setIsLoading(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setIsLoading(false);
    },
  });

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    sendMutation.mutate({
      message: msg,
      history: messages.slice(-10),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center neon-glow-cyan"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 300), oklch(0.75 0.20 200))" }}>
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">SunoForge AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Especialista em música e prompts para Suno AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-xs text-green-400 font-mono"
          style={{ background: "oklch(0.10 0.015 270)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Online
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-border neon-glow-purple"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 300 / 0.2), oklch(0.75 0.20 200 / 0.1))" }}>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg gradient-text mb-2">SunoForge AI</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Seu assistente especializado em criação musical. Posso ajudar com letras, prompts para o Suno AI, teoria musical e muito mais.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => handleSend(p)}
                  className="p-3 rounded-lg border border-border text-xs text-left text-muted-foreground hover:border-primary hover:text-foreground transition-all"
                  style={{ background: "oklch(0.10 0.015 270)" }}>
                  <Music className="w-3 h-3 mb-1.5 text-primary" />
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 300), oklch(0.75 0.20 200))" }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === "user"
              ? "rounded-tr-sm text-white"
              : "rounded-tl-sm border border-border"
            }`}
              style={msg.role === "user"
                ? { background: "linear-gradient(135deg, oklch(0.65 0.28 300), oklch(0.65 0.28 330))" }
                : { background: "oklch(0.10 0.015 270)" }}>
              {msg.role === "assistant" ? (
                <div className="text-sm text-foreground/90 prose prose-invert prose-sm max-w-none">
                  <Streamdown>{msg.content}</Streamdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
              {msg.role === "assistant" && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <CopyButton text={msg.content} label="Copiar" size="sm" className="text-xs h-6" />
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 border border-border"
                style={{ background: "oklch(0.13 0.02 270)" }}>
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 300), oklch(0.75 0.20 200))" }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-border px-4 py-3"
              style={{ background: "oklch(0.10 0.015 270)" }}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4" style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre música, prompts, letras... (Enter para enviar)"
            className="flex-1 min-h-[44px] max-h-32 resize-none bg-input border-border focus:border-primary text-sm"
            rows={1}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="cyber-btn text-white h-11 px-4 flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Shift+Enter para nova linha · Enter para enviar
        </p>
      </div>
    </div>
  );
}
