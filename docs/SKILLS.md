# SunoForge Skills

Este projeto inclui uma skill reutilizável para criar Style Mixers em outras aplicações.

## 🎵 sunoforge-style-mixer-builder

Uma skill completa para implementar um Sistema de Mixer de Estilos Musicais em qualquer plataforma de criação musical.

### Localização

```
skill-style-mixer/
├── SKILL.md                           # Documentação principal
├── scripts/
│   ├── generate_music_styles.py      # Gera banco de dados de estilos
│   └── validate_style_compatibility.py # Valida compatibilidade
├── references/
│   ├── implementation-patterns.md     # Padrões de implementação
│   └── preset-combinations.json       # 10 presets pré-configurados
└── templates/
    └── StyleMixerComponent.tsx        # Componente React pronto
```

### O que está incluído

#### Scripts
- **`generate_music_styles.py`**: Gera TypeScript com 46+ gêneros, 100+ características, 40+ influências, 11 eras, 25 estilos vocais, 30 técnicas de produção
- **`validate_style_compatibility.py`**: Valida compatibilidade era-gênero-influência

#### Referências
- **`implementation-patterns.md`**: Código completo para backend (database, tRPC, helpers), frontend (hooks, state, UI), e LLM integration
- **`preset-combinations.json`**: 10 combinações pré-configuradas (Dark Lo-Fi Baroque, Cyber Synthwave Noir, etc.)

#### Templates
- **`StyleMixerComponent.tsx`**: Componente React pronto para usar com todas as funcionalidades

### Como Usar em Outro Projeto

#### 1. Copie a Skill

```bash
cp -r skill-style-mixer /seu-novo-projeto/
```

#### 2. Gere o Banco de Dados de Estilos

```bash
cd /seu-novo-projeto
python skill-style-mixer/scripts/generate_music_styles.py --output shared/musicStyles.ts
```

#### 3. Implemente o Backend

Siga `skill-style-mixer/references/implementation-patterns.md` para:
- Criar tabela `style_combinations` no banco
- Adicionar helpers em `server/db.ts`
- Criar router em `server/routers.ts`

#### 4. Implemente o Frontend

1. Copie `skill-style-mixer/templates/StyleMixerComponent.tsx` para seu projeto
2. Customize conforme necessário
3. Integre ao seu routing

#### 5. Valide

```bash
python skill-style-mixer/scripts/validate_style_compatibility.py \
  --genres "Rock,Jazz" \
  --eras "1970s,1980s" \
  --influences "Miles Davis"
```

### Arquitetura

O Style Mixer consiste em três componentes principais:

**1. Database Layer**
- Tabela `style_combinations` com histórico persistente
- Suporte a favoritos e metadados

**2. Generation Engine**
- Combina seleções em prompts coerentes
- Validação de compatibilidade era-gênero
- Weighted random selection para "Surprise Me"

**3. UI Layer**
- Multi-select para gêneros, características, influências
- 3 abas: Mixer, Presets, Histórico
- Copiar formatado para Suno AI
- Favoritos e histórico persistente

### Recursos

- **Banco de dados**: 46+ gêneros, 100+ características, 40+ influências
- **Presets**: 10 combinações pré-configuradas
- **Validação**: Compatibilidade era-gênero-influência
- **UI**: Componente React completo com tRPC integration
- **Testes**: Padrões de teste inclusos

### Próximas Melhorias

1. **Marketplace de Estilos**: Usuários compartilham combinações customizadas
2. **Análise de Tendências**: Dashboard com estilos populares
3. **Histórico de Versões**: Versionamento de combinações
4. **Colaboração**: Múltiplos usuários em um estilo

### Suporte

Para dúvidas sobre a skill, veja:
- `skill-style-mixer/SKILL.md` - Documentação completa
- `skill-style-mixer/references/implementation-patterns.md` - Padrões de código
- `docs/DEVELOPMENT.md` - Histórico de desenvolvimento

---

**Desenvolvido como parte do SunoForge**
