---
name: sunoforge-style-mixer-builder
description: Build a Style Mixer system for music creation platforms. Enables mixing music genres, characteristics, influences, and eras to generate optimized AI music prompts. Use when creating music generation tools, prompt optimization systems, or music production assistants.
---

# SunoForge Style Mixer Builder

## Overview

The Style Mixer is a comprehensive system for combining multiple music elements (genres, characteristics, influences, eras, vocal styles, production techniques) into coherent, AI-optimized prompts. It enables users to create infinite style combinations and save their favorites for reuse.

This skill provides production-ready code, database schemas, validation logic, and UI components to implement a Style Mixer in any music creation application.

## Core Capabilities

### 1. Music Styles Database

A comprehensive database of music elements with 46+ genres, 100+ characteristics, 40+ influences, and 11 eras.

**Generate the database:**

```bash
python scripts/generate_music_styles.py --output shared/musicStyles.ts
```

This creates a TypeScript file with:
- `MUSIC_GENRES` - 46 music genres
- `MUSICAL_CHARACTERISTICS` - 6 categories (Mood, Texture, Production, Energy, Complexity, Dynamics)
- `INFLUENCES` - 40+ artists and producers
- `ERAS` - 11 decades from 1920s to 2020s
- `VOCAL_STYLES` - 25 vocal techniques
- `PRODUCTION_TECHNIQUES` - 30 production methods

### 2. Style Combination Validation

Validate that selected styles are compatible before generating prompts.

**Run validation:**

```bash
python scripts/validate_style_compatibility.py \
  --genres "Rock,Jazz" \
  --eras "1970s,1980s" \
  --influences "Miles Davis" \
  --moods "Sophisticated"
```

**Validation rules:**
- Era-Genre compatibility (e.g., 1980s works with Synthwave, not 1920s Jazz)
- Influence-Genre alignment (e.g., Daft Punk fits Electronic, not Classical)
- Mood coherence (e.g., "Dark" pairs with "Aggressive", not "Uplifting")

### 3. Backend Implementation

**Database Schema:**

```sql
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
```

**tRPC Procedures:**

Implement these procedures in `server/routers.ts`:

```typescript
const styleComboRouter = router({
  save: protectedProcedure.input(...).mutation(...),
  list: protectedProcedure.query(...),
  toggleFavorite: protectedProcedure.input(...).mutation(...),
  delete: protectedProcedure.input(...).mutation(...),
});
```

See `references/implementation-patterns.md` for complete code examples.

### 4. Frontend Component

Use the provided React component template (`templates/StyleMixerComponent.tsx`) as a starting point.

**Key features:**
- Multi-select genre, characteristic, influence, and era mixing
- Real-time prompt generation via LLM
- History of saved combinations with favorites
- "Surprise Me" button for random creative combinations
- Copy-to-clipboard formatted prompts for Suno AI

**Integration:**

```tsx
import StyleMixer from "@/pages/StyleMixer";

export default function App() {
  return <StyleMixer />;
}
```

### 5. Prompt Generation Strategy

**Format for Suno AI:**

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

**LLM Prompt Template:**

```
You are a music production expert. Generate a detailed Suno AI prompt based on these selections:
- Genres: {genres}
- Sub-genres: {subgenres}
- Influences: {influences}
- Eras: {eras}
- Vocal Styles: {vocalStyles}
- Production Techniques: {productionTechniques}
- Characteristics: {characteristics}

Create a coherent, detailed prompt that combines all these elements into a single, actionable instruction for music generation.
```

## Implementation Workflow

### Step 1: Setup Database

1. Create the `style_combinations` table using the schema above
2. Generate the music styles database:
   ```bash
   python scripts/generate_music_styles.py --output shared/musicStyles.ts
   ```

### Step 2: Implement Backend

1. Add database helpers in `server/db.ts`:
   - `saveStyleCombination()`
   - `listUserCombinations()`
   - `toggleFavorite()`
   - `deleteStyleCombination()`

2. Create tRPC router in `server/routers.ts`:
   - `styleCombo.save`
   - `styleCombo.list`
   - `styleCombo.toggleFavorite`
   - `styleCombo.delete`

3. Add LLM integration for prompt generation:
   - Call `invokeLLM()` with the template above
   - Return structured prompt

See `references/implementation-patterns.md` for complete code.

### Step 3: Build Frontend

1. Copy `templates/StyleMixerComponent.tsx` to `client/src/pages/StyleMixer.tsx`
2. Import and use in your routing:
   ```tsx
   <Route path="/style-mixer" component={StyleMixer} />
   ```

3. Customize styling to match your design system

### Step 4: Add Presets

Load preset combinations from `references/preset-combinations.json`:

```typescript
import presets from "@/references/preset-combinations.json";

const PRESET_COMBINATIONS = presets.presets;
```

Displays 10 pre-configured combinations for quick setup.

### Step 5: Validate & Test

Run validation script to ensure compatibility rules work:

```bash
python scripts/validate_style_compatibility.py \
  --genres "Synthwave,Cyberpunk" \
  --eras "1980s,2020s" \
  --influences "Vangelis,Daft Punk" \
  --json
```

Write unit tests for:
- Saving and retrieving combinations
- Toggling favorites
- Deleting combinations
- Weighted random selection ("Surprise Me")
- Era-genre compatibility validation

## Advanced Features

### Weighted Random Selection

The "Surprise Me" feature uses probability weights to generate creative combinations:

```typescript
const weights = {
  genre: 0.7,      // 70% chance to include
  influence: 0.6,  // 60% chance to include
  mood: 0.9,       // 90% chance to include
  production: 0.7, // 70% chance to include
};
```

Adjust weights to control randomness and coherence.

### Compatibility Validation

Validate combinations before generation to prevent incoherent results:

- **Era-Genre**: Ensure selected genres match the era (e.g., 1980s + Synthwave ✓, 1920s + EDM ✗)
- **Influence-Genre**: Verify influences align with genres (e.g., Daft Punk + Electronic ✓)
- **Mood-Characteristic**: Check mood pairs logically (e.g., Dark + Aggressive ✓, Dark + Uplifting ✗)

### Preset Management

Pre-configured combinations for common styles:
- Dark Lo-Fi Baroque
- Cyber Synthwave Noir
- Techno Industrial Experimental
- Jazz Funk Soul Groove
- And 6 more...

Load from `references/preset-combinations.json`.

## Resources

### scripts/

- **`generate_music_styles.py`** - Generate TypeScript database of music elements
- **`validate_style_compatibility.py`** - Validate style combinations for coherence

### references/

- **`implementation-patterns.md`** - Complete code examples for backend, frontend, and database
- **`preset-combinations.json`** - 10 pre-configured style combinations

### templates/

- **`StyleMixerComponent.tsx`** - Production-ready React component with all features

## Performance Considerations

1. **Caching**: Cache music styles on the client to avoid repeated fetches
2. **Pagination**: Implement pagination for large history lists (100+ combinations)
3. **Debouncing**: Debounce generation requests when user rapidly changes selections
4. **Lazy Loading**: Load presets and history on-demand

## Security Considerations

1. **Input Validation**: Validate all user inputs on the backend
2. **Rate Limiting**: Limit generation requests per user (e.g., 10/minute)
3. **Authorization**: Ensure users can only access their own combinations
4. **SQL Injection Prevention**: Use parameterized queries (Drizzle ORM handles this)

## Troubleshooting

**Problem**: Combinations feel incoherent
- **Solution**: Adjust validation rules in `validate_style_compatibility.py` or increase compatibility weights

**Problem**: "Surprise Me" generates too similar combinations
- **Solution**: Increase probability weights in `handleSurprise()` to 0.8-0.9

**Problem**: Prompt generation is slow
- **Solution**: Implement caching for LLM responses or use simpler template-based generation

**Problem**: Database queries are slow with large history
- **Solution**: Add indexes on `userId` and `isFavorite` columns, implement pagination

## Example Usage

```typescript
// User selects genres and characteristics
const selections = {
  genres: ["Synthwave", "Cyberpunk"],
  influences: ["Vangelis", "Daft Punk"],
  eras: ["1980s", "2020s"],
  vocalStyles: ["Robotic"],
  productionTechniques: ["Heavy Synth", "Reverb"],
};

// Validate compatibility
const validation = await validateStyleCompatibility(selections);
if (!validation.valid) {
  console.warn("Warnings:", validation.warnings);
}

// Generate prompt
const result = await generateStylePrompt(selections);
console.log(result.stylePrompt);

// Save combination
await saveStyleCombination({
  name: "Cyber Synthwave Noir",
  ...selections,
  generatedPrompt: result.stylePrompt,
});

// Copy formatted for Suno AI
const formatted = formatForSunoAI({
  name: "Cyber Synthwave Noir",
  ...selections,
  generatedPrompt: result.stylePrompt,
});
navigator.clipboard.writeText(formatted);
```

## Next Steps

1. **Extend Genres**: Add more genres specific to your platform
2. **Add Mood Presets**: Create mood-based preset combinations
3. **Collaborative Mixing**: Allow users to remix others' combinations
4. **Export Formats**: Support exporting combinations as JSON/CSV
5. **Analytics**: Track which combinations are most popular
