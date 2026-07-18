# SunoForge Frontend Documentation

## Arquitetura

O frontend é construído com **React 19** + **Tailwind CSS 4** + **tRPC** + **Vite**.

### Fluxo de Dados

```
User Interaction (Click, Input)
    ↓
React Component State
    ↓
tRPC Mutation/Query Hook
    ↓
Backend tRPC Router
    ↓
Response → React Query Cache
    ↓
Component Re-render
```

## Estrutura de Pastas

```
client/
├── src/
│   ├── pages/
│   │   ├── Home.tsx              # Dashboard principal
│   │   ├── LyricsGenerator.tsx    # Gerador de letras
│   │   ├── StyleGenerator.tsx     # Mixer de estilos
│   │   ├── FullSongCreator.tsx    # Criador de música completa
│   │   ├── ImageGenerator.tsx     # Gerador de imagens
│   │   ├── AudioLab.tsx           # Lab de áudio
│   │   ├── AIChat.tsx             # Chat com IA
│   │   ├── Library.tsx            # Biblioteca de gerações
│   │   ├── Explore.tsx            # Galeria comunitária
│   │   ├── Profile.tsx            # Perfil do usuário
│   │   └── NotFound.tsx           # 404
│   ├── components/
│   │   ├── AppLayout.tsx          # Layout principal com sidebar
│   │   ├── CopyButton.tsx         # Botão de copiar
│   │   ├── DashboardLayout.tsx    # Layout do dashboard
│   │   ├── AIChatBox.tsx          # Chat box reutilizável
│   │   ├── Map.tsx                # Google Maps integration
│   │   └── ui/                    # shadcn/ui components
│   ├── contexts/
│   │   ├── ThemeContext.tsx       # Dark/Light theme
│   │   └── AuthContext.tsx        # Auth state (opcional)
│   ├── hooks/
│   │   ├── useAuth.ts             # Auth hook
│   │   └── useTheme.ts            # Theme hook
│   ├── lib/
│   │   ├── trpc.ts                # tRPC client setup
│   │   └── utils.ts               # Utilidades
│   ├── App.tsx                    # Routing principal
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globais
├── public/
│   ├── favicon.ico
│   └── robots.txt
└── index.html
```

## Componentes Principais

### AppLayout

Layout principal com sidebar de navegação.

```tsx
import AppLayout from "@/components/AppLayout";

export default function App() {
  return (
    <AppLayout>
      <Router />
    </AppLayout>
  );
}
```

**Funcionalidades:**
- Sidebar com navegação
- Perfil do usuário
- Logout
- Indicador de status online

### CopyButton

Botão reutilizável para copiar texto.

```tsx
import { CopyButton } from "@/components/CopyButton";

<CopyButton text={generatedPrompt} label="Copiar Prompt" />
```

### AIChatBox

Chat box completo com histórico e streaming.

```tsx
import { AIChatBox } from "@/components/AIChatBox";

<AIChatBox 
  title="Music Assistant"
  systemPrompt="You are a music expert..."
  onMessage={(msg) => console.log(msg)}
/>
```

## Páginas

### Home (Dashboard)

Página inicial com estatísticas e acesso rápido às funcionalidades.

```tsx
// client/src/pages/Home.tsx
- Cards com estatísticas (gerações, favoritos, etc.)
- Botões de acesso rápido às funcionalidades
- Últimas gerações
```

### LyricsGenerator

Gera letras com suporte a 4 modos de voz.

```tsx
// client/src/pages/LyricsGenerator.tsx
- Seletor de tema, gênero, humor
- 4 botões de modo de voz (Instrumental, Vocal, Acapella, Vocal+Instrumental)
- Seletor de meta-tags estruturais ([Intro], [Verse], [Chorus], etc.)
- Seletor de instruções instrumentais
- Seletor de dinâmica
- Botão gerar
- Preview e copiar
- Salvar na biblioteca
```

### StyleGenerator

Mixer visual para combinar estilos.

```tsx
// client/src/pages/StyleGenerator.tsx
- Checkboxes para gêneros (46+)
- Checkboxes para influências (40+)
- Checkboxes para eras (11)
- Checkboxes para características
- 3 abas: Mixer, Presets, Histórico
- Botão "Surpreenda-me"
- Preview do prompt
- Copiar com metadados
- Salvar combinação
```

### FullSongCreator

Combina letra e estilo em um único prompt.

```tsx
// client/src/pages/FullSongCreator.tsx
- Seletor de letra (do histórico)
- Seletor de estilo (do histórico)
- Preview combinado
- Copiar formatado para Suno
- Salvar combinação
```

### ImageGenerator

Gera imagens com IA.

```tsx
// client/src/pages/ImageGenerator.tsx
- Input de prompt
- Seletor de estilo (opcional)
- Botão gerar
- Preview da imagem
- Copiar URL
- Salvar na biblioteca
```

### AudioLab

Experimenta com parâmetros de áudio.

```tsx
// client/src/pages/AudioLab.tsx
- Sliders para tempo, tonalidade, estrutura
- Gerador de variações
- Preview
```

### AIChat

Chat especializado em música.

```tsx
// client/src/pages/AIChat.tsx
- Chat box com histórico
- System prompt especializado em música
- Streaming de respostas
- Markdown rendering
```

### Library

Histórico de gerações com busca e favoritos.

```tsx
// client/src/pages/Library.tsx
- Filtro por tipo (lyrics, style, image)
- Busca por título
- Ordenação (recente, favoritos)
- Cards com preview
- Botão carregar/remixar
```

### Explore

Galeria pública da comunidade.

```tsx
// client/src/pages/Explore.tsx
- Grid de criações públicas
- Filtro por gênero
- Busca
- Botão remixar
- Botão favoritar
```

### Profile

Perfil do usuário com preferências.

```tsx
// client/src/pages/Profile.tsx
- Informações do usuário
- Preferências (gênero favorito, tom, estilo)
- Histórico de atividades
- Configurações
```

## Hooks Customizados

### useAuth

```typescript
const { user, loading, error, isAuthenticated, logout } = useAuth();

// user: User object or null
// loading: boolean
// error: Error or null
// isAuthenticated: boolean
// logout: () => void
```

### useTheme

```typescript
const { theme, toggleTheme } = useTheme();

// theme: 'light' | 'dark'
// toggleTheme: () => void
```

## tRPC Hooks

### Queries

```typescript
// Buscar dados
const { data, isLoading, error } = trpc.library.list.useQuery();

// Com parâmetros
const { data } = trpc.library.list.useQuery({ type: 'lyrics' });
```

### Mutations

```typescript
// Atualizar dados
const mutation = trpc.library.save.useMutation({
  onSuccess: () => {
    // Invalidar cache
    trpc.useUtils().library.list.invalidate();
    toast.success("Salvo!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Executar
await mutation.mutateAsync({ title: "...", content: "..." });
```

## Padrões de UI

### Loading State

```tsx
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    Carregando...
  </div>
) : (
  // Conteúdo
)}
```

### Empty State

```tsx
{items.length === 0 ? (
  <div className="text-center py-8 text-muted-foreground">
    Nenhum item encontrado
  </div>
) : (
  // Lista
)}
```

### Error State

```tsx
{error ? (
  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
    {error.message}
  </div>
) : null}
```

### Toast Notifications

```typescript
import { toast } from "sonner";

toast.success("Sucesso!");
toast.error("Erro!");
toast.info("Informação");
toast.loading("Carregando...");
```

## Styling

### Tailwind CSS 4

```tsx
// Cores semânticas
className="bg-background text-foreground"
className="bg-card text-card-foreground"
className="bg-primary text-primary-foreground"

// Spacing
className="p-4 m-2 gap-3"

// Responsive
className="md:grid-cols-2 lg:grid-cols-3"

// Dark mode
className="dark:bg-slate-900"
```

### CSS Variables

Definidas em `index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.6%;
  --primary: 280 100% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 180 100% 50%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 280 100% 50%;
  --radius: 0.75rem;
}

.dark {
  --background: 0 0% 3.6%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const LyricsGenerator = lazy(() => import('./pages/LyricsGenerator'));

<Suspense fallback={<Loading />}>
  <LyricsGenerator />
</Suspense>
```

### Memoization

```tsx
const MemoizedComponent = memo(Component, (prev, next) => {
  return prev.id === next.id;
});
```

### useCallback

```tsx
const handleGenerate = useCallback(() => {
  // Evita re-render desnecessário
}, [dependency]);
```

## Accessibility

### Keyboard Navigation

```tsx
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</button>
```

### ARIA Labels

```tsx
<button aria-label="Copiar prompt">
  <Copy className="w-4 h-4" />
</button>
```

### Focus Management

```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

<input ref={inputRef} />
```

## Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('LyricsGenerator', () => {
  it('should generate lyrics on button click', async () => {
    render(<LyricsGenerator />);
    
    const button = screen.getByText('Gerar Letra');
    fireEvent.click(button);
    
    expect(screen.getByText(/Gerando/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

**Problema: Componente não re-renderiza após mutação**
- Solução: Use `invalidate()` para limpar cache do tRPC

**Problema: Imagens não carregam**
- Solução: Verifique URL do S3 e permissões CORS

**Problema: Tema não persiste**
- Solução: Verifique localStorage e ThemeProvider

**Problema: Lentidão ao renderizar listas grandes**
- Solução: Use `react-window` para virtualização

---

Para mais detalhes, veja [DEVELOPMENT.md](./DEVELOPMENT.md)
