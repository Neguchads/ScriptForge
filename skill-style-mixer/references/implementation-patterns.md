# Style Mixer Implementation Patterns

This document describes proven patterns for implementing a Style Mixer in music creation applications.

## Architecture Overview

A Style Mixer consists of three main components:

1. **Database Layer**: Music styles, characteristics, influences, eras
2. **Generation Engine**: Combines selections into coherent prompts
3. **UI Layer**: Interface for mixing, presets, history, and favorites

## Database Schema

### Core Tables

```sql
-- Style combinations history
CREATE TABLE style_combinations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  genres JSON NOT NULL,
  subgenres JSON NOT NULL,
  characteristics JSON NOT NULL,
  influences JSON NOT NULL,
  eras JSON NOT NULL,
  vocalStyles JSON NOT NULL,
  productionTechniques JSON NOT NULL,
  generatedPrompt TEXT NOT NULL,
  isFavorite BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Preset combinations
CREATE TABLE style_presets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  genres JSON NOT NULL,
  subgenres JSON NOT NULL,
  characteristics JSON NOT NULL,
  influences JSON NOT NULL,
  eras JSON NOT NULL,
  vocalStyles JSON NOT NULL,
  productionTechniques JSON NOT NULL,
  generatedPrompt TEXT NOT NULL,
  category VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Backend Implementation

### 1. Database Helpers

```typescript
// server/db.ts

export async function saveStyleCombination(
  userId: number,
  data: StyleCombinationInput
): Promise<StyleCombination> {
  const db = await getDb();
  const result = await db.insert(styleCombinations).values({
    userId,
    name: data.name,
    genres: JSON.stringify(data.genres),
    subgenres: JSON.stringify(data.subgenres),
    characteristics: JSON.stringify(data.characteristics),
    influences: JSON.stringify(data.influences),
    eras: JSON.stringify(data.eras),
    vocalStyles: JSON.stringify(data.vocalStyles),
    productionTechniques: JSON.stringify(data.productionTechniques),
    generatedPrompt: data.generatedPrompt,
  });
  return result;
}

export async function listUserCombinations(userId: number): Promise<StyleCombination[]> {
  const db = await getDb();
  return db.select().from(styleCombinations).where(eq(styleCombinations.userId, userId));
}

export async function toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
  const db = await getDb();
  await db.update(styleCombinations)
    .set({ isFavorite })
    .where(eq(styleCombinations.id, id));
}
```

### 2. tRPC Procedures

```typescript
// server/routers.ts

const styleComboRouter = router({
  save: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      genres: z.array(z.string()),
      subgenres: z.array(z.string()),
      characteristics: z.record(z.array(z.string())),
      influences: z.array(z.string()),
      eras: z.array(z.string()),
      vocalStyles: z.array(z.string()),
      productionTechniques: z.array(z.string()),
      generatedPrompt: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await saveStyleCombination(ctx.user.id, input);
      return { success: true };
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const items = await listUserCombinations(ctx.user.id);
      return { items };
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({
      id: z.number(),
      isFavorite: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await toggleFavorite(input.id, input.isFavorite);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(styleCombinations).where(eq(styleCombinations.id, input.id));
      return { success: true };
    }),
});
```

## Frontend Implementation

### 1. State Management

```typescript
// Use React hooks for local state
const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
const [selectedSubGenres, setSelectedSubGenres] = useState<string[]>([]);
const [selectedCharacteristics, setSelectedCharacteristics] = useState<Record<string, string[]>>({});
const [selectedInfluences, setSelectedInfluences] = useState<string[]>([]);
const [selectedEras, setSelectedEras] = useState<string[]>([]);
const [selectedVocalStyles, setSelectedVocalStyles] = useState<string[]>([]);
const [selectedProductionTechniques, setSelectedProductionTechniques] = useState<string[]>([]);
const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
const [customName, setCustomName] = useState<string>("");
```

### 2. Generation Logic

```typescript
// Weighted random selection for "Surprise Me"
const handleSurprise = () => {
  const weights = {
    genre: 0.7,
    subgenre: 0.5,
    influence: 0.6,
    mood: 0.9,
    texture: 0.4,
    production: 0.7,
    era: 0.3,
  };

  // Select genres with probability
  let randomGenres = MUSIC_GENRES
    .sort(() => Math.random() - 0.5)
    .filter(() => Math.random() < weights.genre)
    .slice(0, Math.random() > 0.5 ? 2 : 3);

  if (randomGenres.length === 0) {
    randomGenres.push(MUSIC_GENRES[Math.floor(Math.random() * MUSIC_GENRES.length)]);
  }

  // Validate era-genre compatibility
  let randomEras = ERAS
    .sort(() => Math.random() - 0.5)
    .filter(() => Math.random() < weights.era)
    .slice(0, 1);

  if (randomEras.length > 0) {
    const selectedEra = randomEras[0];
    const compatibleGenres = eraGenreCompatibility[selectedEra] || randomGenres;
    const compatibleSelected = randomGenres.filter(g => compatibleGenres.includes(g));
    if (compatibleSelected.length > 0) {
      randomGenres = compatibleSelected;
    }
  }

  // Continue with other selections...
  setSelectedGenres(randomGenres);
  setSelectedEras(randomEras);
  // ... set other selections
};
```

### 3. Copy Formatted Prompt

```typescript
// Format prompt for Suno AI with metadata
const handleCopyFormatted = () => {
  const formatted = `[STYLE COMBINATION: ${customName}]
Gêneros: ${selectedGenres.join(", ")}
Sub-gêneros: ${selectedSubGenres.join(", ")}
Influências: ${selectedInfluences.join(", ")}
Eras: ${selectedEras.join(", ")}
Estilos Vocais: ${selectedVocalStyles.join(", ")}
Produção: ${selectedProductionTechniques.join(", ")}

${generatedPrompt}`;

  navigator.clipboard.writeText(formatted);
  toast.success("Prompt copiado com metadados!");
};
```

### 4. History Management

```typescript
// Load and display saved combinations
const styleCombosQuery = trpc.styleCombo.list.useQuery();
const saveComboMutation = trpc.styleCombo.save.useMutation({
  onSuccess: () => {
    trpc.useUtils().styleCombo.list.invalidate();
    toast.success("Combinação salva!");
  },
});

const handleSaveCombo = async () => {
  if (!customName.trim()) {
    toast.error("Digite um nome para a combinação");
    return;
  }

  await saveComboMutation.mutateAsync({
    name: customName,
    genres: selectedGenres,
    subgenres: selectedSubGenres,
    characteristics: selectedCharacteristics,
    influences: selectedInfluences,
    eras: selectedEras,
    vocalStyles: selectedVocalStyles,
    productionTechniques: selectedProductionTechniques,
    generatedPrompt: String(generatedPrompt),
  });
};
```

## Prompt Generation Strategy

### Structure Template

```
[STYLE COMBINATION: {name}]
Gêneros: {genres}
Sub-gêneros: {subgenres}
Influências: {influences}
Eras: {eras}
Estilos Vocais: {vocalStyles}
Produção: {productionTechniques}

{generatedPrompt}
```

### LLM Prompt for Generation

```
You are a music production expert. Generate a detailed Suno AI prompt based on these selections:
- Genres: {genres}
- Sub-genres: {subgenres}
- Influences: {influences}
- Eras: {eras}
- Vocal Styles: {vocalStyles}
- Production Techniques: {productionTechniques}
- Characteristics: {characteristics}

Create a coherent, detailed prompt that combines all these elements into a single, actionable instruction for music generation. The prompt should be specific, creative, and optimized for Suno AI.
```

## Testing Strategy

### Unit Tests

```typescript
describe("Style Mixer", () => {
  it("should save a combination", async () => {
    const result = await trpc.styleCombo.save.mutate({
      name: "Test Combo",
      genres: ["Rock", "Jazz"],
      // ... other fields
    });
    expect(result.success).toBe(true);
  });

  it("should list user combinations", async () => {
    const result = await trpc.styleCombo.list.query();
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("should validate era-genre compatibility", () => {
    const isValid = validateEraGenreCompatibility(["1980s"], ["Synthwave"]);
    expect(isValid).toBe(true);
  });
});
```

## Performance Considerations

1. **Caching**: Cache music styles data on the client to avoid repeated fetches
2. **Pagination**: For large history lists, implement pagination
3. **Debouncing**: Debounce generation requests when user is rapidly changing selections
4. **Lazy Loading**: Load presets and history on-demand

## Security Considerations

1. **Input Validation**: Validate all user inputs on the backend
2. **Rate Limiting**: Limit generation requests per user
3. **Authorization**: Ensure users can only access their own combinations
4. **SQL Injection Prevention**: Use parameterized queries (Drizzle ORM handles this)
