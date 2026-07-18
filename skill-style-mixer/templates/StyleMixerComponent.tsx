import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles, Copy, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { MUSIC_GENRES, MUSICAL_CHARACTERISTICS, INFLUENCES, ERAS, VOCAL_STYLES, PRODUCTION_TECHNIQUES } from "@/shared/musicStyles";

/**
 * Style Mixer Component
 * 
 * A comprehensive interface for mixing music styles, genres, characteristics,
 * and influences to generate optimized prompts for music generation AI.
 * 
 * Features:
 * - Multi-select genre, characteristic, influence, and era mixing
 * - Preset combinations for quick setup
 * - History of saved combinations with favorites
 * - "Surprise Me" for random creative combinations
 * - Copy-to-clipboard formatted prompts for Suno AI
 */

export default function StyleMixer() {
  // State for selections
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<Record<string, string[]>>({});
  const [selectedInfluences, setSelectedInfluences] = useState<string[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [selectedVocalStyles, setSelectedVocalStyles] = useState<string[]>([]);
  const [selectedProductionTechniques, setSelectedProductionTechniques] = useState<string[]>([]);
  
  // UI state
  const [customName, setCustomName] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("mixer");

  // tRPC queries and mutations
  const generateStyleMutation = trpc.style.generate.useMutation();
  const saveComboMutation = trpc.styleCombo.save.useMutation({
    onSuccess: () => {
      trpc.useUtils().styleCombo.list.invalidate();
      toast.success("Combinação salva!");
    },
  });
  const styleCombosQuery = trpc.styleCombo.list.useQuery();
  const deleteComboMutation = trpc.styleCombo.delete.useMutation({
    onSuccess: () => {
      trpc.useUtils().styleCombo.list.invalidate();
      toast.success("Combinação removida");
    },
  });
  const toggleFavoriteMutation = trpc.styleCombo.toggleFavorite.useMutation({
    onSuccess: () => {
      trpc.useUtils().styleCombo.list.invalidate();
    },
  });

  // Memoized values
  const allCombos = useMemo(() => styleCombosQuery.data?.items || [], [styleCombosQuery.data]);
  const favorites = useMemo(() => allCombos.filter(c => c.isFavorite), [allCombos]);

  const totalSelections = useMemo(
    () =>
      selectedGenres.length +
      selectedInfluences.length +
      selectedEras.length +
      selectedVocalStyles.length +
      selectedProductionTechniques.length +
      Object.values(selectedCharacteristics).flat().length,
    [selectedGenres, selectedCharacteristics, selectedInfluences, selectedEras, selectedVocalStyles, selectedProductionTechniques]
  );

  // Handlers
  const handleGenerateStyle = async () => {
    if (selectedGenres.length === 0) {
      toast.error("Selecione pelo menos um gênero");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateStyleMutation.mutateAsync({
        genres: selectedGenres,
        characteristics: selectedCharacteristics,
        influences: selectedInfluences,
        eras: selectedEras,
        vocalStyles: selectedVocalStyles,
        productionTechniques: selectedProductionTechniques,
      });
      setGeneratedPrompt(result.stylePrompt);
      setCustomName(`${selectedGenres.slice(0, 2).join("+")}+${selectedInfluences.slice(0, 1).join("")}`);
    } catch (error) {
      toast.error("Erro ao gerar estilo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCombo = async () => {
    if (!customName.trim()) {
      toast.error("Digite um nome para a combinação");
      return;
    }

    await saveComboMutation.mutateAsync({
      name: customName,
      genres: selectedGenres,
      subgenres: [],
      characteristics: selectedCharacteristics,
      influences: selectedInfluences,
      eras: selectedEras,
      vocalStyles: selectedVocalStyles,
      productionTechniques: selectedProductionTechniques,
      generatedPrompt: String(generatedPrompt),
    });
  };

  const handleCopyFormatted = () => {
    const formatted = `[STYLE COMBINATION: ${customName}]
Gêneros: ${selectedGenres.join(", ")}
Influências: ${selectedInfluences.join(", ")}
Eras: ${selectedEras.join(", ")}
Estilos Vocais: ${selectedVocalStyles.join(", ")}
Produção: ${selectedProductionTechniques.join(", ")}

${generatedPrompt}`;

    navigator.clipboard.writeText(formatted);
    toast.success("Prompt copiado com metadados!");
  };

  const handleLoadCombo = (combo: any) => {
    if (!combo) return;
    setCustomName(combo.name);
    setSelectedGenres(combo.genres as string[]);
    setSelectedCharacteristics(combo.characteristics as any);
    setSelectedInfluences(combo.influences as string[]);
    setSelectedEras(combo.eras as string[]);
    setSelectedVocalStyles(combo.vocalStyles as string[]);
    setSelectedProductionTechniques(combo.productionTechniques as string[]);
    setGeneratedPrompt(combo.generatedPrompt as string);
    setActiveTab("mixer");
  };

  const handleSurprise = () => {
    const weights = {
      genre: 0.7,
      influence: 0.6,
      mood: 0.9,
      production: 0.7,
    };

    const randomGenres = MUSIC_GENRES
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.genre)
      .slice(0, 2);

    const randomInfluences = INFLUENCES
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.influence)
      .slice(0, 2);

    const randomMoods = MUSICAL_CHARACTERISTICS.Mood
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.mood)
      .slice(0, 1);

    const randomProduction = MUSICAL_CHARACTERISTICS.Production
      .sort(() => Math.random() - 0.5)
      .filter(() => Math.random() < weights.production)
      .slice(0, 1);

    setSelectedGenres(randomGenres);
    setSelectedInfluences(randomInfluences);
    setSelectedCharacteristics({
      Mood: randomMoods,
      Production: randomProduction,
    });
    setCustomName(`${randomGenres.slice(0, 2).join("+")}+${randomInfluences.slice(0, 1).join("")}`);
    toast.info("🎲 Combinação criativa aleatória gerada!");
  };

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Left Panel - Mixer */}
      <div className="w-80 overflow-y-auto space-y-4 border-r border-border pr-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Nome da Combinação</label>
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ex: Dark Cyber Baroque"
            className="text-sm"
          />
        </div>

        {/* Genres */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Gêneros</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {MUSIC_GENRES.map((genre) => (
              <label key={genre} className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={selectedGenres.includes(genre)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedGenres([...selectedGenres, genre]);
                    } else {
                      setSelectedGenres(selectedGenres.filter(g => g !== genre));
                    }
                  }}
                />
                {genre}
              </label>
            ))}
          </div>
        </div>

        {/* Influences */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Influências</label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {INFLUENCES.map((influence) => (
              <label key={influence} className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={selectedInfluences.includes(influence)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedInfluences([...selectedInfluences, influence]);
                    } else {
                      setSelectedInfluences(selectedInfluences.filter(i => i !== influence));
                    }
                  }}
                />
                {influence}
              </label>
            ))}
          </div>
        </div>

        {/* Eras */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Eras</label>
          <div className="space-y-1">
            {ERAS.map((era) => (
              <label key={era} className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={selectedEras.includes(era)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEras([...selectedEras, era]);
                    } else {
                      setSelectedEras(selectedEras.filter(e => e !== era));
                    }
                  }}
                />
                {era}
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            onClick={handleGenerateStyle}
            disabled={isLoading || selectedGenres.length === 0}
            className="w-full"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Gerar Estilo ({totalSelections})
          </Button>
          <Button onClick={handleSurprise} variant="outline" className="w-full">
            🎲 Surpreenda-me
          </Button>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mixer">Resultado</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          </TabsList>

          <TabsContent value="mixer" className="space-y-4">
            {generatedPrompt ? (
              <Card className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Prompt Gerado</label>
                  <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{generatedPrompt}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopyFormatted} className="flex-1" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar com Metadados
                  </Button>
                  <Button onClick={handleSaveCombo} variant="outline" className="flex-1" size="sm">
                    Salvar Combinação
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                Selecione gêneros e clique em "Gerar Estilo"
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {allCombos.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma combinação salva</p>
            ) : (
              allCombos.map((combo) => (
                <Card key={combo.id} className="p-3 hover:border-cyan-400/50">
                  <button
                    onClick={() => handleLoadCombo(combo)}
                    className="w-full text-left hover:text-cyan-400 transition-colors"
                  >
                    <div className="font-semibold text-sm">{combo.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(combo.genres as string[]).slice(0, 2).join(", ")}
                    </div>
                  </button>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavoriteMutation.mutate({ id: combo.id, isFavorite: !combo.isFavorite })}
                    >
                      <Heart className={`w-3 h-3 ${combo.isFavorite ? "fill-current text-red-400" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteComboMutation.mutate({ id: combo.id })}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-3">
            {favorites.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum favorito</p>
            ) : (
              favorites.map((combo) => (
                <Card key={combo.id} className="p-3 border-red-400/50">
                  <button
                    onClick={() => handleLoadCombo(combo)}
                    className="w-full text-left hover:text-cyan-400 transition-colors"
                  >
                    <div className="font-semibold text-sm">{combo.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(combo.genres as string[]).slice(0, 2).join(", ")}
                    </div>
                  </button>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
