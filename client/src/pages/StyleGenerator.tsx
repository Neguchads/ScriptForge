import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/CopyButton";
import { Loader2, Shuffle, Sparkles, X, Zap, Plus, Palette, Heart, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  MUSIC_GENRES,
  SUB_GENRES,
  MUSICAL_CHARACTERISTICS,
  INFLUENCES,
  ERAS,
  VOCAL_STYLES,
  PRODUCTION_TECHNIQUES,
  PRESET_COMBINATIONS,
  generateStyleDescription,
  type StyleMixerInput,
} from "@shared/musicStyles";

export default function StyleGenerator() {
  const { isAuthenticated, user } = useAuth();
  const [customName, setCustomName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedSubGenres, setSelectedSubGenres] = useState<string[]>([]);
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<
    Partial<Record<keyof typeof MUSICAL_CHARACTERISTICS, string[]>>
  >({});
  const [selectedInfluences, setSelectedInfluences] = useState<string[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [selectedVocalStyles, setSelectedVocalStyles] = useState<string[]>([]);
  const [selectedProductionTechniques, setSelectedProductionTechniques] = useState<string[]>([]);
  const [result, setResult] = useState<{ stylePrompt: string; tags: string[]; explanation: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"mixer" | "presets" | "history">("mixer");

  const generateMutation = trpc.style.generate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Prompt de estilo gerado!");
    },
    onError: (err) => toast.error(err.message),
  });

  const utils = trpc.useUtils();
  const saveMutation = trpc.library.save.useMutation({
    onSuccess: () => {
      toast.success("Salvo na biblioteca!");
      utils.library.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Style Combinations queries
  const styleCombosQuery = trpc.styleCombo.list.useQuery(undefined, { enabled: isAuthenticated });
  const saveComboMutation = trpc.styleCombo.save.useMutation({
    onSuccess: () => {
      toast.success("Combinação salva nos favoritos!");
      utils.styleCombo.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteComboMutation = trpc.styleCombo.delete.useMutation({
    onSuccess: () => {
      toast.success("Combinação removida!");
      utils.styleCombo.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });
  const toggleFavoriteMutation = trpc.styleCombo.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.styleCombo.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleSubGenre = (subgenre: string) => {
    setSelectedSubGenres(prev =>
      prev.includes(subgenre) ? prev.filter(s => s !== subgenre) : [...prev, subgenre]
    );
  };

  const toggleCharacteristic = (category: keyof typeof MUSICAL_CHARACTERISTICS, value: string) => {
    setSelectedCharacteristics(prev => {
      const current = prev[category] || [];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  const toggleInfluence = (influence: string) => {
    setSelectedInfluences(prev =>
      prev.includes(influence) ? prev.filter(i => i !== influence) : [...prev, influence]
    );
  };

  const toggleEra = (era: string) => {
    setSelectedEras(prev =>
      prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era]
    );
  };

  const toggleVocalStyle = (style: string) => {
    setSelectedVocalStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleProductionTechnique = (technique: string) => {
    setSelectedProductionTechniques(prev =>
      prev.includes(technique) ? prev.filter(t => t !== technique) : [...prev, technique]
    );
  };

  const handleGenerate = () => {
    if (
      selectedGenres.length === 0 &&
      selectedSubGenres.length === 0 &&
      selectedInfluences.length === 0
    ) {
      return toast.error("Selecione pelo menos um gênero, sub-gênero ou influência.");
    }

    const input: StyleMixerInput = {
      selectedGenres,
      selectedSubGenres,
      selectedCharacteristics,
      selectedInfluences,
      selectedEras,
      selectedVocalStyles,
      selectedProductionTechniques,
      customName: customName || undefined,
    };

    generateMutation.mutate({
      genre: selectedGenres.join(", "),
      subgenre: selectedSubGenres.join(", "),
      mood: selectedCharacteristics.Mood?.join(", "),
      instruments: [],
      bpm: undefined,
      era: selectedEras.join(", "),
      vocalStyle: selectedVocalStyles.join(", "),
      production: selectedProductionTechniques.join(", "),
      mode: "professional",
    });
  };

  const handlePresetClick = (preset: typeof PRESET_COMBINATIONS[0]) => {
    setCustomName(preset.name);
    setSelectedGenres([]);
    setSelectedSubGenres(preset.styles);
    setSelectedCharacteristics(preset.characteristics);
    setSelectedInfluences([]);
    setSelectedEras([]);
    setSelectedVocalStyles([]);
    setSelectedProductionTechniques([]);
    toast.info(`Preset "${preset.name}" carregado!`);
  };

  // Weighted random selection for creative combinations
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
    const randomGenres = MUSIC_GENRES
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.genre)
      .slice(0, Math.random() > 0.5 ? 2 : 3);

    if (randomGenres.length === 0) {
      randomGenres.push(MUSIC_GENRES[Math.floor(Math.random() * MUSIC_GENRES.length)]);
    }

    // Get matching sub-genres
    const randomSubgenres = randomGenres
      .flatMap(g => (SUB_GENRES[g as keyof typeof SUB_GENRES] || []))
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.subgenre)
      .slice(0, 2);

    // Select influences
    const randomInfluences = INFLUENCES
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.influence)
      .slice(0, Math.random() > 0.6 ? 1 : 2);

    // Select characteristics
    const randomMoods = MUSICAL_CHARACTERISTICS.Mood
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.mood)
      .slice(0, 1);

    const randomTexture = MUSICAL_CHARACTERISTICS.Texture
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.texture)
      .slice(0, 1);

    const randomProduction = MUSICAL_CHARACTERISTICS.Production
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.production)
      .slice(0, 1);

    const randomEras = ERAS
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.era)
      .slice(0, 1);

    // Generate descriptive name
    const newName = `${randomGenres.slice(0, 2).join("+")}+${randomInfluences.slice(0, 1).join("")}`;
    setCustomName(newName);
    setSelectedGenres(randomGenres);
    setSelectedSubGenres(randomSubgenres);
    setSelectedInfluences(randomInfluences);
    setSelectedCharacteristics({
      Mood: randomMoods,
      ...(randomTexture.length > 0 && { Texture: randomTexture }),
      Production: randomProduction,
    });
    setSelectedEras(randomEras);
    toast.info("🎲 Combinação criativa aleatória gerada!");
  };

  // Format prompt for Suno AI with complete metadata
  const formatPromptForSuno = () => {
    if (!result) return "";
    return `[STYLE COMBINATION: ${customName || "Sem nome"}]
Gêneros: ${selectedGenres.join(", ") || "—"}
Sub-gêneros: ${selectedSubGenres.join(", ") || "—"}
Influências: ${selectedInfluences.join(", ") || "—"}
Eras: ${selectedEras.join(", ") || "—"}
Estilos Vocais: ${selectedVocalStyles.join(", ") || "—"}
Produção: ${selectedProductionTechniques.join(", ") || "—"}

${result.stylePrompt}`;
  };

  const handleSaveCombo = () => {
    if (!customName.trim()) {
      return toast.error("Dê um nome à combinação!");
    }
    if (!result) {
      return toast.error("Gere um prompt primeiro!");
    }

    saveComboMutation.mutate({
      name: customName,
      genres: selectedGenres,
      subgenres: selectedSubGenres,
      characteristics: selectedCharacteristics,
      influences: selectedInfluences,
      eras: selectedEras,
      vocalStyles: selectedVocalStyles,
      productionTechniques: selectedProductionTechniques,
      generatedPrompt: result.stylePrompt,
    });
  };

  const handleLoadCombo = (combo: any) => {
    if (!combo) return;
    setCustomName(combo.name);
    setSelectedGenres(combo.genres as string[]);
    setSelectedSubGenres(combo.subgenres as string[]);
    setSelectedCharacteristics(combo.characteristics as any);
    setSelectedInfluences(combo.influences as string[]);
    setSelectedEras(combo.eras as string[]);
    setSelectedVocalStyles(combo.vocalStyles as string[]);
    setSelectedProductionTechniques(combo.productionTechniques as string[]);
    if (combo.generatedPrompt) {
      setResult({
        stylePrompt: combo.generatedPrompt,
        tags: [],
        explanation: "",
      });
    }
    toast.info(`Combinação "${combo.name}" carregada!`);
  };

  const isLoading = generateMutation.isPending;
  const totalSelections =
    selectedGenres.length +
    selectedSubGenres.length +
    selectedInfluences.length +
    selectedEras.length +
    selectedVocalStyles.length +
    selectedProductionTechniques.length +
    Object.values(selectedCharacteristics).flat().length;

  const allCombos = useMemo(
    () => styleCombosQuery.data?.items || [],
    [styleCombosQuery.data]
  );

  const favorites = useMemo(
    () => allCombos.filter(c => c.isFavorite),
    [allCombos]
  );

  return (
    <div className="flex h-full">
      {/* Left panel - Style Mixer */}
      <div className="w-96 flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-5"
        style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold text-sm text-foreground">Style Mixer</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={handleSurprise} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Shuffle className="w-3 h-3" />
            Surpresa
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("mixer")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "mixer"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Mixer
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "presets"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Presets
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === "history"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Favoritos ({favorites.length})
            </button>
          )}
        </div>

        {activeTab === "mixer" ? (
          <div className="space-y-4">
            {/* Custom Name */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome Customizado</Label>
              <Input
                placeholder="Ex: Dark Cyber Baroque"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-8 text-xs bg-input border-border focus:border-cyan-400"
              />
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gêneros</Label>
              <div className="flex flex-wrap gap-1.5">
                {MUSIC_GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-2 py-1 rounded text-xs border transition-all ${
                      selectedGenres.includes(genre)
                        ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Genres */}
            {selectedGenres.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sub-Gêneros</Label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGenres.flatMap(g => SUB_GENRES[g as keyof typeof SUB_GENRES] || []).map(subgenre => (
                    <button
                      key={subgenre}
                      onClick={() => toggleSubGenre(subgenre)}
                      className={`px-2 py-1 rounded text-xs border transition-all ${
                        selectedSubGenres.includes(subgenre)
                          ? "border-pink-500 text-pink-400 bg-pink-500/10"
                          : "border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      {subgenre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Characteristics */}
            {Object.entries(MUSICAL_CHARACTERISTICS).map(([category, values]) => (
              <div key={category} className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {values.map(value => (
                    <button
                      key={value}
                      onClick={() => toggleCharacteristic(category as keyof typeof MUSICAL_CHARACTERISTICS, value)}
                      className={`px-2 py-1 rounded text-xs border transition-all ${
                        selectedCharacteristics[category as keyof typeof MUSICAL_CHARACTERISTICS]?.includes(value)
                          ? "border-purple-500 text-purple-400 bg-purple-500/10"
                          : "border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Influences */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Influências</Label>
              <div className="flex flex-wrap gap-1.5">
                {INFLUENCES.map(influence => (
                  <button
                    key={influence}
                    onClick={() => toggleInfluence(influence)}
                    className={`px-2 py-1 rounded text-xs border transition-all ${
                      selectedInfluences.includes(influence)
                        ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {influence}
                  </button>
                ))}
              </div>
            </div>

            {/* Eras */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Eras</Label>
              <div className="flex flex-wrap gap-1.5">
                {ERAS.map(era => (
                  <button
                    key={era}
                    onClick={() => toggleEra(era)}
                    className={`px-2 py-1 rounded text-xs border transition-all ${
                      selectedEras.includes(era)
                        ? "border-green-500 text-green-400 bg-green-500/10"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {era}
                  </button>
                ))}
              </div>
            </div>

            {/* Vocal Styles */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estilos Vocais</Label>
              <div className="flex flex-wrap gap-1.5">
                {VOCAL_STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => toggleVocalStyle(style)}
                    className={`px-2 py-1 rounded text-xs border transition-all ${
                      selectedVocalStyles.includes(style)
                        ? "border-blue-500 text-blue-400 bg-blue-500/10"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Production Techniques */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Técnicas de Produção</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCTION_TECHNIQUES.map(technique => (
                  <button
                    key={technique}
                    onClick={() => toggleProductionTechnique(technique)}
                    className={`px-2 py-1 rounded text-xs border transition-all ${
                      selectedProductionTechniques.includes(technique)
                        ? "border-red-500 text-red-400 bg-red-500/10"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {technique}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full cyber-btn text-white gap-2 h-11 mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isLoading ? "Gerando..." : `Gerar Estilo (${totalSelections})`}
            </Button>
          </div>
        ) : activeTab === "history" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Todas as suas combinações salvas:</p>
            {allCombos.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-4">Nenhuma combinação salva ainda</p>
            ) : (
              allCombos.map((combo) => (
                <div key={combo.id} className="p-3 rounded-lg border border-border hover:border-cyan-400/50 transition-all group">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => handleLoadCombo(combo)}
                      className="flex-1 text-left group-hover:text-cyan-400 transition-colors"
                    >
                      <div className="font-semibold text-sm text-foreground">{combo.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {(combo.genres as string[]).slice(0, 2).join(", ")}
                      </div>
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleFavoriteMutation.mutate({ id: combo.id, isFavorite: !combo.isFavorite })}
                        className={`p-1 rounded transition-colors ${
                          combo.isFavorite
                            ? "text-red-400 hover:bg-red-500/20"
                            : "text-muted-foreground hover:text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${combo.isFavorite ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => deleteComboMutation.mutate({ id: combo.id })}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "presets" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Clique em um preset para carregá-lo no mixer:</p>
            {PRESET_COMBINATIONS.map((preset, i) => (
              <button
                key={i}
                onClick={() => handlePresetClick(preset)}
                className="w-full p-3 rounded-lg border border-border hover:border-cyan-400 hover:bg-cyan-400/5 transition-all text-left group"
              >
                <div className="font-semibold text-sm text-foreground group-hover:text-cyan-400">{preset.name}</div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                  {preset.styles.map(s => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-border/50">
                      {s}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Right panel - Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {result ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Prompt de Estilo Gerado
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <CopyButton text={formatPromptForSuno()} label="Copiar para Suno" />
                  {isAuthenticated && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs"
                        onClick={handleSaveCombo} disabled={saveComboMutation.isPending}>
                        <Heart className="w-3 h-3" />
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs"
                        onClick={() => saveMutation.mutate({ type: "style_prompt", content: result.stylePrompt, title: customName || "Estilo Customizado", metadata: { genres: selectedGenres, subgenres: selectedSubGenres } })}>
                        Biblioteca
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 p-4 rounded-lg border border-border"
                style={{ background: "oklch(0.09 0.01 270)" }}>
                {result.stylePrompt}
              </div>
            </div>

            {/* Tags */}
            {result.tags.length > 0 && (
              <div className="cyber-card p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Tags Extraídas</h4>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="border-cyan-500/50 text-cyan-400">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            {result.explanation && (
              <div className="cyber-card p-4 bg-blue-500/5 border-blue-500/20">
                <h4 className="text-sm font-medium text-blue-300 mb-2">Explicação</h4>
                <p className="text-sm text-blue-200/80">{result.explanation}</p>
              </div>
            )}

            {/* Selection Summary */}
            {totalSelections > 0 && (
              <div className="cyber-card p-4 bg-purple-500/5 border-purple-500/20">
                <h4 className="text-sm font-medium text-purple-300 mb-3">Combinação Selecionada</h4>
                <div className="space-y-2 text-xs text-purple-200/80">
                  {selectedGenres.length > 0 && <p><strong>Gêneros:</strong> {selectedGenres.join(", ")}</p>}
                  {selectedSubGenres.length > 0 && <p><strong>Sub-gêneros:</strong> {selectedSubGenres.join(", ")}</p>}
                  {selectedInfluences.length > 0 && <p><strong>Influências:</strong> {selectedInfluences.join(", ")}</p>}
                  {selectedEras.length > 0 && <p><strong>Eras:</strong> {selectedEras.join(", ")}</p>}
                  {selectedVocalStyles.length > 0 && <p><strong>Estilos Vocais:</strong> {selectedVocalStyles.join(", ")}</p>}
                  {selectedProductionTechniques.length > 0 && <p><strong>Produção:</strong> {selectedProductionTechniques.join(", ")}</p>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-border neon-glow-cyan"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.28 200 / 0.15), oklch(0.65 0.28 180 / 0.1))" }}>
              <Palette className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Crie sua combinação única</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Selecione gêneros, características e influências para gerar um prompt de estilo infinitamente customizável.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
