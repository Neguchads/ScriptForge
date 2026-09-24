/**
 * Seed de dados de referência (não gerados por usuário) para o ScriptForge.
 *
 * Conteúdo recuperado dos logs de desenvolvimento (.manus/db/*.json) dos
 * repositórios ScriptForge/scripttube-ai, que registram as queries SQL
 * rodadas manualmente durante a criação do banco original. Esse conteúdo
 * nunca havia sido versionado como seed reutilizável.
 *
 * Idempotente: cada bloco verifica se já existe dado antes de inserir,
 * então pode ser rodado múltiplas vezes sem duplicar registros.
 *
 * Uso: DATABASE_URL=... pnpm db:seed
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { niches, flashcardCategories, flashcards, scriptTemplates } from "./schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL não definida. Configure-a antes de rodar o seed.");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  await seedNiches(db);
  const categoryIds = await seedFlashcardCategories(db);
  await seedFlashcards(db, categoryIds);
  await seedScriptTemplates(db);

  console.log("Seed concluído.");
  process.exit(0);
}

async function seedNiches(db: ReturnType<typeof drizzle>) {
  const existing = await db.select().from(niches);
  if (existing.length > 0) {
    console.log(`niches: ${existing.length} já existentes, pulando.`);
    return;
  }

  const rows = [
    { name: "Programação", description: "Desenvolvimento de software, linguagens de programação, frameworks e ferramentas" },
    { name: "Eletrônica", description: "Projetos eletrônicos, Arduino, circuitos e componentes" },
    { name: "Mecatrônica", description: "Robótica, automação, sistemas integrados e projetos mecatrônicos" },
    { name: "Design", description: "UI/UX, design gráfico, ferramentas de design e criatividade" },
    { name: "Marketing Digital", description: "SEO, redes sociais, publicidade e estratégias de marketing" },
    { name: "Produção de Vídeo", description: "Edição, cinematografia, efeitos e produção audiovisual" },
    { name: "Educação", description: "Tutoriais, cursos, explicações educacionais e aprendizado" },
    { name: "Tecnologia", description: "Análise de produtos, reviews, tendências tech e inovação" },
  ];
  await db.insert(niches).values(rows);
  console.log(`niches: ${rows.length} inseridos.`);
}

const CATEGORY_DEFS = [
  { name: "Suno AI", description: "Guia completo sobre Suno - criação de música com IA", icon: "🎵", color: "#00FFFF" },
  { name: "Produção Musical", description: "Técnicas e conceitos de produção de música", icon: "🎚️", color: "#FF00FF" },
  { name: "Artwork & Design", description: "Criação de capas de álbum e artes visuais", icon: "🎨", color: "#00FFFF" },
  { name: "Thumbnails", description: "Design de thumbnails para vídeos musicais", icon: "📸", color: "#FF00FF" },
  { name: "SEO para Música", description: "Otimização de conteúdo musical para YouTube", icon: "🔍", color: "#00FFFF" },
  { name: "Equipamentos", description: "Microfones, interfaces e software essencial", icon: "🎙️", color: "#FF00FF" },
  { name: "Distribuição", description: "Publicar música em plataformas de streaming", icon: "🚀", color: "#00FFFF" },
  { name: "Monetização", description: "Ganhar dinheiro com conteúdo musical", icon: "💰", color: "#FF00FF" },
  { name: "Técnico", description: "Equipamentos, software, técnicas de gravação e áudio profissional", icon: "🎙️", color: "#00FFFF" },
  { name: "Estratégia", description: "Algoritmo do YouTube, viralização, análise de concorrentes, planejamento de série", icon: "📈", color: "#FF00FF" },
  { name: "Monetização YouTube", description: "Super Chat, memberships, afiliados, patrocínios e múltiplas fontes de renda", icon: "💰", color: "#00FFFF" },
  { name: "Produção", description: "Roteiros, formatos de vídeo, estruturas que convertem, storytelling", icon: "🎬", color: "#FF00FF" },
  { name: "Análise", description: "Analytics do YouTube, CTR, retenção, demográfico, otimização de dados", icon: "📊", color: "#00FFFF" },
] as const;

async function seedFlashcardCategories(db: ReturnType<typeof drizzle>) {
  const existing = await db.select().from(flashcardCategories);
  const byName = new Map(existing.map((c) => [c.name, c.id]));

  for (const cat of CATEGORY_DEFS) {
    if (byName.has(cat.name)) continue;
    const [result] = await db.insert(flashcardCategories).values(cat).$returningId();
    byName.set(cat.name, result.id);
  }
  const inserted = byName.size - existing.length;
  console.log(`flashcardCategories: ${byName.size} disponíveis (${inserted} novas).`);
  return byName;
}

type Difficulty = "beginner" | "intermediate" | "advanced";
interface FlashcardSeed {
  category: string;
  question: string;
  answer: string;
  tips?: string;
  difficulty: Difficulty;
}

const FLASHCARD_DEFS: FlashcardSeed[] = [
  // Suno AI
  { category: "Suno AI", question: "O que é Suno AI?", answer: "Suno AI é uma plataforma de inteligência artificial que permite criar músicas originais a partir de descrições de texto. Você descreve o estilo, gênero e tema, e a IA gera uma faixa musical completa.", tips: "Suno é perfeito para criadores de conteúdo que não têm experiência musical. Acesse suno.com para começar.", difficulty: "beginner" },
  { category: "Suno AI", question: "Como usar o Suno para criar uma música?", answer: "Acesse suno.com, descreva sua música em detalhes (gênero, mood, instrumentos, duração), escolha o modo (Standard ou Pro), e deixe a IA gerar. Você pode gerar múltiplas versões e escolher a melhor.", tips: "Quanto mais detalhes você fornecer na descrição, melhor será o resultado. Experimente diferentes prompts.", difficulty: "beginner" },
  { category: "Suno AI", question: "Qual é a diferença entre modo Standard e Pro no Suno?", answer: "Standard: Geração básica com limite de créditos diários. Pro: Acesso ilimitado, melhor qualidade de áudio, prioridade na fila de geração. Pro custa cerca de $10/mês.", tips: "Comece com Standard para aprender. Upgrade para Pro quando precisar de mais geração de músicas.", difficulty: "beginner" },
  { category: "Suno AI", question: "Como fazer uma música viral no Suno?", answer: "Crie músicas com hooks memoráveis, use tendências atuais, mantenha duração entre 2-3 minutos, e teste diferentes gêneros. Combine com bom marketing no YouTube/TikTok.", tips: "Estude músicas virais no seu nicho e tente replicar a estrutura com temas diferentes.", difficulty: "intermediate" },
  { category: "Suno AI", question: "Posso usar músicas do Suno comercialmente?", answer: "Sim! Com a licença Pro, você tem direitos comerciais. Pode monetizar em YouTube, Spotify e outras plataformas. Leia os termos de serviço para detalhes completos.", tips: "Sempre verifique os termos atuais no site do Suno, pois as políticas podem mudar.", difficulty: "intermediate" },
  { category: "Suno AI", question: "Como melhorar a qualidade das músicas geradas pelo Suno?", answer: "Use prompts detalhados, especifique o BPM, mencione instrumentos específicos, descreva o mood/emoção, e inclua referências de artistas similares. Experimente múltiplas versões.", tips: "Prompts bem estruturados geram resultados muito melhores. Teste e itere.", difficulty: "intermediate" },
  { category: "Suno AI", question: "Qual é o melhor estilo musical para gerar com Suno?", answer: "Todos os estilos funcionam bem: eletrônico, hip-hop, pop, rock, indie, lo-fi, etc. O segredo é ser específico na descrição. Teste diferentes gêneros para encontrar seu nicho.", tips: "Lo-fi e eletrônico tendem a ter resultados muito bons no Suno.", difficulty: "beginner" },
  { category: "Suno AI", question: "Como usar Suno para criar trilhas sonoras para vídeos?", answer: "Descreva a emoção/mood do seu vídeo, especifique a duração exata, mencione o gênero desejado. Gere múltiplas opções e escolha a que melhor combina com seu conteúdo.", tips: "Crie uma biblioteca de músicas para diferentes tipos de vídeos (intro, transição, final).", difficulty: "intermediate" },

  // Produção Musical
  { category: "Produção Musical", question: "O que é BPM e por que é importante?", answer: "BPM (Beats Per Minute) é o tempo da música. Uma música tem um ritmo base que define sua velocidade. BPM afeta o mood: 60-90 BPM é lento/relaxante, 120-140 é energético, 150+ é muito rápido.", tips: "Escolha BPM baseado no mood desejado. Lo-fi geralmente usa 80-100 BPM.", difficulty: "beginner" },
  { category: "Produção Musical", question: "Qual é a estrutura básica de uma música?", answer: "Intro (8-16 compassos) → Verso 1 → Pré-refrão → Refrão → Verso 2 → Refrão → Bridge → Refrão Final → Outro. Esta é a estrutura mais comum em pop/eletrônico.", tips: "Nem todas as músicas precisam seguir essa estrutura, mas é um bom ponto de partida.", difficulty: "beginner" },
  { category: "Produção Musical", question: "Como criar um hook memorável?", answer: "Um hook é a parte mais memorável da música. Deve ser: simples, repetitivo, melódico, e fácil de cantar. Geralmente dura 4-8 compassos e aparece no refrão.", tips: "Estude hooks de músicas populares no seu gênero.", difficulty: "intermediate" },
  { category: "Produção Musical", question: "O que é um drop em música eletrônica?", answer: "O drop é o momento em que a música volta com força total após um build-up. Geralmente ocorre no refrão. É o ponto mais energético e memorável da música.", tips: "Crie tensão antes do drop removendo elementos, depois reintroduza tudo de uma vez.", difficulty: "intermediate" },
  { category: "Produção Musical", question: "Como fazer uma música soar profissional?", answer: "Use mixing adequado (balanceie volumes), aplique EQ (equalize frequências), adicione compressão, use reverb/delay com moderação, e normalize o áudio final. Ouça em múltiplos alto-falantes.", tips: "Invista em bons fones de ouvido para mixing. Não confie apenas em alto-falantes do computador.", difficulty: "advanced" },
  { category: "Produção Musical", question: "Qual é a diferença entre mixing e mastering?", answer: "Mixing: balancear e processar cada instrumento individualmente. Mastering: processar a música final como um todo para garantir qualidade em todos os dispositivos. Mastering é o passo final.", tips: "Sempre faça uma pausa entre mixing e mastering para ter ouvidos frescos.", difficulty: "intermediate" },
  { category: "Produção Musical", question: "Como adicionar emoção a uma música?", answer: "Use dinâmica (volume varia), adicione efeitos (reverb, delay), varie a instrumentação ao longo da música, use progressões de acordes emotivas, e controle o timing dos elementos.", tips: "A emoção vem da estrutura e dos detalhes, não apenas da melodia.", difficulty: "intermediate" },
  { category: "Produção Musical", question: "Qual é o melhor software para produção musical?", answer: "Ableton Live, FL Studio, Logic Pro, Cubase, Reaper são os principais. Para iniciantes, FL Studio é mais intuitivo. Para profissionais, Ableton é padrão. Escolha baseado em seu orçamento e estilo.", tips: "Comece com versão de teste gratuita antes de comprar.", difficulty: "beginner" },

  // Artwork & Design
  { category: "Artwork & Design", question: "Qual é o tamanho ideal para uma capa de álbum?", answer: "3000x3000 pixels é o padrão para plataformas de streaming (Spotify, Apple Music). Use RGB color mode, 72 DPI para web. Certifique-se de que o texto seja legível em tamanhos pequenos.", tips: "Sempre exporte em alta resolução. Você pode redimensionar depois, mas não pode aumentar sem perder qualidade.", difficulty: "beginner" },
  { category: "Artwork & Design", question: "Como criar uma capa de álbum memorável?", answer: "Use cores vibrantes ou contrastantes, mantenha o design simples e legível, inclua o nome do artista e álbum em fonte clara, e crie algo único que se destaque em playlists.", tips: "Estude capas de álbuns populares no seu gênero. Simplicidade é força.", difficulty: "intermediate" },
  { category: "Artwork & Design", question: "Qual é a diferença entre RGB e CMYK?", answer: "RGB: para telas (web, YouTube). CMYK: para impressão. Se você vai imprimir, converta para CMYK. Para digital, use RGB. Cores podem mudar na conversão.", tips: "Sempre trabalhe em RGB para conteúdo digital.", difficulty: "beginner" },
  { category: "Artwork & Design", question: "Como escolher cores para uma capa de álbum?", answer: "Use a psicologia das cores: vermelho (energia), azul (calma), amarelo (alegria), preto (mistério). Use ferramentas como Adobe Color ou Coolors para encontrar paletas harmoniosas.", tips: "Teste sua paleta em diferentes contextos e tamanhos.", difficulty: "intermediate" },
  { category: "Artwork & Design", question: "Qual é o melhor software para design de capas?", answer: "Photoshop é o padrão profissional. Canva é ótimo para iniciantes (templates prontos). Affinity Photo é alternativa mais barata. GIMP é gratuito mas tem curva de aprendizado.", tips: "Comece com Canva se não tem experiência com design.", difficulty: "beginner" },
  { category: "Artwork & Design", question: "Como fazer um design que funciona em tamanhos pequenos?", answer: "Mantenha elementos principais no centro, use contraste alto, evite detalhes muito finos, teste em thumbnail (200x200px), e certifique-se de que o texto é legível.", tips: "Sempre visualize seu design em tamanho pequeno antes de finalizar.", difficulty: "intermediate" },
  { category: "Artwork & Design", question: "Qual é a importância da tipografia em capas de álbum?", answer: "A fonte comunica o mood da música. Fontes modernas para eletrônico, fontes clássicas para clássico, fontes graffiti para hip-hop. Escolha 1-2 fontes máximo e mantenha consistência.", tips: "Não use mais de 2 fontes diferentes. Menos é mais.", difficulty: "intermediate" },
  { category: "Artwork & Design", question: "Como usar IA para gerar artwork?", answer: "Use Midjourney, DALL-E, ou Stable Diffusion. Descreva o estilo desejado em detalhes. Gere múltiplas versões e escolha a melhor. Você pode editar depois no Photoshop.", tips: "IA é ótima para gerar ideias, mas sempre refine manualmente.", difficulty: "intermediate" },

  // Monetização
  { category: "Monetização", question: "Como ganhar dinheiro com TikTok e música?", answer: "TikTok Creator Fund: paga $0.02-0.04 por 1000 visualizações. Precisa de 10k seguidores + 100k visualizações/mês. Combine com vendas de merch, links de afiliados.", tips: "TikTok é ótimo para viralidade, não para renda direta.", difficulty: "beginner" },
  { category: "Monetização", question: "Como usar Patreon para monetizar minha música?", answer: "Crie tiers de assinatura ($1-50/mês). Ofereça: acesso antecipado, stems de música, consultoria, conteúdo exclusivo. Patreon tira 5% de comissão. Ótimo para fãs dedicados.", tips: "Patreon funciona melhor com comunidade engajada.", difficulty: "intermediate" },
  { category: "Monetização", question: "Como vender minha música diretamente?", answer: "Use Gumroad, Bandcamp, ou seu próprio site. Ofereça: MP3, WAV, stems, packs. Preços variam ($1-50). Você fica com 80-100% da venda. Melhor margem de lucro.", tips: "Vendas diretas têm melhor margem que streaming.", difficulty: "intermediate" },
  { category: "Monetização", question: "Como ganhar dinheiro com sincronização de música?", answer: "Sincronização: sua música em filmes, séries, publicidades. Use plataformas como Epidemic Sound, Artlist. Paga $100-10000+ por sincronização. Requer registro de direitos.", tips: "Sincronização é uma das maiores fontes de renda.", difficulty: "advanced" },
  { category: "Monetização", question: "Como criar múltiplas fontes de renda com música?", answer: "Combine: YouTube, Spotify, Patreon, vendas diretas, sincronização, merch, cursos. Não dependa de uma única fonte. Diversificação é chave para estabilidade.", tips: "Criadores bem-sucedidos usam 5+ fontes de renda.", difficulty: "intermediate" },
  { category: "Monetização", question: "Qual é o melhor modelo de negócio para músicos iniciantes?", answer: "Comece com YouTube + Spotify (gratuito). Adicione Patreon quando tiver comunidade. Depois, sincronização e vendas diretas. Escale gradualmente conforme crescimento.", tips: "Paciência e consistência são essenciais.", difficulty: "beginner" },

  // Técnico
  { category: "Técnico", question: "Qual é a frequência de amostragem ideal para áudio de YouTube?", answer: "48 kHz é o padrão para vídeos profissionais. 44.1 kHz é suficiente para a maioria dos casos. Evite 8 kHz ou 16 kHz pois degradam a qualidade.", tips: "YouTube recomenda 48 kHz para melhor qualidade de áudio.", difficulty: "beginner" },
  { category: "Técnico", question: "O que é bitrate de áudio e qual é o recomendado?", answer: "Bitrate é a quantidade de dados de áudio por segundo. Para YouTube, recomenda-se 128-192 kbps para mono e 256-320 kbps para estéreo. Quanto maior, melhor a qualidade.", tips: "Não exagere em bitrate muito alto pois aumenta o tamanho do arquivo sem ganho perceptível.", difficulty: "intermediate" },
  { category: "Técnico", question: "Qual é a diferença entre XLR e USB em microfones?", answer: "XLR é profissional, requer interface de áudio e oferece melhor qualidade. USB é plug-and-play, mais simples mas com menos controle. XLR é melhor para produção séria.", tips: "Comece com USB se for iniciante, evolua para XLR quando ganhar experiência.", difficulty: "beginner" },
  { category: "Técnico", question: "Como reduzir ruído de fundo em gravações?", answer: "Use isolamento acústico (espuma, cortinas), microfone com padrão cardióide, compressor e noise gate. Grave em ambiente silencioso. Pós-produção: use noise reduction em software como Audacity.", tips: "A melhor solução é evitar o ruído na fonte, não corrigir depois.", difficulty: "intermediate" },
  { category: "Técnico", question: "Qual é a resolução ideal para vídeos no YouTube?", answer: "1080p (1920x1080) é o padrão. 4K (3840x2160) é premium mas exige mais processamento. 720p é aceitável para conteúdo educacional. Evite resoluções menores.", tips: "YouTube suporta até 8K, mas 1080p é o sweet spot entre qualidade e performance.", difficulty: "beginner" },
  { category: "Técnico", question: "O que é frame rate e qual usar para YouTube?", answer: "24 fps é cinemático, 30 fps é padrão para vídeos, 60 fps é para ação/gaming. YouTube suporta até 120 fps. Escolha conforme o tipo de conteúdo.", tips: "Mantenha consistência: não misture 24fps e 60fps no mesmo vídeo.", difficulty: "intermediate" },
  { category: "Técnico", question: "Qual software de edição é melhor para iniciantes?", answer: "DaVinci Resolve (gratuito), Adobe Premiere Pro (profissional), Final Cut Pro (Mac). Para iniciantes: CapCut (mobile) ou Shotcut (desktop gratuito).", tips: "Comece com gratuito, evolua conforme sua necessidade e orçamento.", difficulty: "beginner" },
  { category: "Técnico", question: "Como otimizar vídeos para diferentes plataformas (YouTube, TikTok, Instagram)?", answer: "YouTube: 16:9 (1920x1080). TikTok/Reels: 9:16 (1080x1920). Crie versões diferentes ou use templates responsivos. Áudio: sempre em estéreo para YouTube.", tips: "Ferramentas como CapCut exportam automaticamente em múltiplos formatos.", difficulty: "advanced" },

  // Estratégia
  { category: "Estratégia", question: "Como funciona o algoritmo do YouTube?", answer: "O algoritmo prioriza: tempo de visualização, CTR (cliques), retenção, compartilhamentos e comentários. Vídeos que mantêm espectadores assistindo ganham mais views. Personalizações baseadas no histórico do usuário.", tips: "Foco em retenção é mais importante que views totais.", difficulty: "beginner" },
  { category: "Estratégia", question: "O que é CTR (Click-Through Rate) e como melhorar?", answer: "CTR é a porcentagem de pessoas que clicam no seu vídeo após ver a miniatura. Melhore com: thumbnails atraentes, títulos curiosos, A/B testing. Objetivo: 4-5% de CTR é bom.", tips: "Teste diferentes thumbnails para encontrar a que converte mais.", difficulty: "intermediate" },
  { category: "Estratégia", question: "Qual é a importância da retenção de audiência?", answer: "Retenção é o tempo médio que as pessoas assistem seu vídeo. Quanto maior, melhor o algoritmo classifica. Objetivo: manter 50%+ de retenção no primeiro minuto.", tips: "Abra forte com um hook nos primeiros 3 segundos.", difficulty: "beginner" },
  { category: "Estratégia", question: "Como analisar concorrentes para criar melhor conteúdo?", answer: "Use ferramentas como TubeBuddy, VidIQ. Analise: títulos, tags, estrutura, duração, CTR, comentários. Identifique gaps (tópicos não cobertos) e crie conteúdo melhor.", tips: "Não copie, inspire-se e crie versão superior.", difficulty: "intermediate" },
  { category: "Estratégia", question: "Qual é a melhor frequência de publicação?", answer: "Consistência > quantidade. Publique 1x por semana regularmente em vez de 3x irregular. YouTube recompensa canais consistentes. Escolha um dia/hora e mantenha.", tips: "Teste diferentes dias e horários para sua audiência.", difficulty: "beginner" },
  { category: "Estratégia", question: "Como criar uma série de vídeos que engaja?", answer: "Crie arco narrativo: episódios com cliffhangers, personagens recorrentes, progressão. Use playlists para aumentar tempo de visualização. Mencione próximo episódio no final.", tips: "Séries aumentam retenção de audiência em até 40%.", difficulty: "advanced" },
  { category: "Estratégia", question: "O que são palavras-chave e como encontrá-las?", answer: "Palavras-chave são termos que as pessoas buscam. Use: Google Trends, YouTube autocomplete, TubeBuddy. Escolha keywords com volume alto e baixa concorrência.", tips: "Long-tail keywords (3+ palavras) são mais fáceis de rankear.", difficulty: "intermediate" },
  { category: "Estratégia", question: "Como crescer de 0 a 1000 inscritos?", answer: "Foco em qualidade > quantidade. Escolha nicho específico. Publique 1 vídeo/semana. Otimize SEO. Engaje com comunidade. Colabore com criadores menores. Paciência: leva 6-12 meses.", tips: "Primeiros 1000 inscritos são os mais difíceis.", difficulty: "advanced" },

  // Monetização YouTube
  { category: "Monetização YouTube", question: "Qual é o requisito mínimo para monetizar no YouTube?", answer: "1000 inscritos + 4000 horas de visualização nos últimos 12 meses. Ou 10 milhões de views em Shorts nos últimos 90 dias. Cumpra as políticas de conteúdo.", tips: "Leva em média 6-12 meses para atingir 1000 inscritos.", difficulty: "beginner" },
  { category: "Monetização YouTube", question: "Como funciona o AdSense no YouTube?", answer: "YouTube compartilha 55% da receita de anúncios com criadores. Ganho varia por: país, tipo de conteúdo, CPM (custo por mil views). CPM varia de $0.25 a $4+ dependendo da audiência.", tips: "Conteúdo em inglês tem CPM mais alto que português.", difficulty: "beginner" },
  { category: "Monetização YouTube", question: "O que é Super Chat e como usar?", answer: "Super Chat é quando espectadores pagam $1-$500 para destacar mensagens em lives. Você recebe 70% da receita. Ative em: Monetização > Super Chat & Super Thanks.", tips: "Super Chat é ideal para lives e comunidades engajadas.", difficulty: "intermediate" },
  { category: "Monetização YouTube", question: "Como criar um programa de memberships?", answer: "Memberships permitem inscritos pagarem mensalmente por benefícios exclusivos (badges, emojis, conteúdo exclusivo). Você recebe 70% da receita. Mínimo: 30k inscritos ou 500k views em 30 dias.", tips: "Memberships geram receita mais previsível que AdSense.", difficulty: "intermediate" },
  { category: "Monetização YouTube", question: "Como monetizar com afiliados?", answer: "Recomende produtos com links de afiliado. Você ganha comissão por cada venda. Plataformas: Amazon Associates, Hotmart, Awin. Divulgue claramente que é afiliado.", tips: "Escolha produtos que você realmente usa e recomenda.", difficulty: "beginner" },
  { category: "Monetização YouTube", question: "Como conseguir patrocínios de marcas?", answer: "Crie media kit com: nicho, audiência, engagement rate, CPM estimado. Procure marcas relevantes. Comece com pequenas marcas. Negocie valores. Divulgue claramente patrocínios.", tips: "Patrocínios pagam 2-10x mais que AdSense.", difficulty: "advanced" },
  { category: "Monetização YouTube", question: "Qual é a melhor estratégia de múltiplas fontes de renda?", answer: "Combine: AdSense (base), Super Chat (lives), Memberships (comunidade), Afiliados (recomendações), Patrocínios (marcas), Cursos/Produtos (expertise). Não dependa de uma fonte.", tips: "Diversificação reduz risco e aumenta ganhos em 3-5x.", difficulty: "advanced" },
  { category: "Monetização YouTube", question: "Como calcular quanto ganho por 1 milhão de views?", answer: "Fórmula: (CPM / 1000) x Views. Exemplo: CPM $2 = $2000 por 1M views. Varia muito por nicho e país. Conteúdo educacional: $1-3. Gaming: $0.5-2. Finanças: $5-15.", tips: "Seu CPM real aparece no YouTube Studio Analytics.", difficulty: "intermediate" },

  // Produção
  { category: "Produção", question: "Qual é a estrutura ideal de um vídeo que converte?", answer: "Hook (3s): Prenda atenção. Introdução (10s): Contexto. Conteúdo (corpo): Valor. CTA (5s): Ação. Duração ideal: 8-12 minutos. Mantenha retenção acima de 50%.", tips: "Os primeiros 3 segundos definem se o usuário continua assistindo.", difficulty: "beginner" },
  { category: "Produção", question: "O que é um hook e como criar?", answer: "Hook é a abertura que prende atenção em 3 segundos. Exemplos: pergunta curiosa, afirmação polêmica, promessa de valor, visual impactante. Teste diferentes hooks.", tips: "Hooks bons aumentam retenção em 20-30%.", difficulty: "beginner" },
  { category: "Produção", question: "Qual é a diferença entre vídeo longo e short?", answer: "Longo (8+min): Aprofundado, monetizável, algoritmo favorece. Short (15-60s): Viral, engajamento rápido, descoberta. Estratégia: Crie shorts como teaser de vídeos longos.", tips: "Shorts têm 3x mais chance de viralizar que vídeos longos.", difficulty: "intermediate" },
  { category: "Produção", question: "Como estruturar um vídeo educacional?", answer: "Abertura: Promessa de valor. Problema: Identifique o problema. Solução: Passo-a-passo claro. Conclusão: Resumo. CTA: Próximo passo. Use exemplos visuais.", tips: "Vídeos educacionais têm melhor retenção e engajamento.", difficulty: "intermediate" },
  { category: "Produção", question: "Como estruturar um vídeo de review/análise?", answer: "Intro: Produto/tema. Especificações: Detalhes técnicos. Pros: Pontos positivos. Contras: Pontos negativos. Comparação: vs concorrentes. Conclusão: Recomendação final.", tips: "Reviews são conteúdo que converte afiliados.", difficulty: "intermediate" },
  { category: "Produção", question: "O que é storytelling e como usar?", answer: "Storytelling é contar histórias para engajar. Estrutura: Personagem + Conflito + Resolução. Cria conexão emocional. Use em: intros, transições, conclusões.", tips: "Histórias aumentam retenção em até 50%.", difficulty: "advanced" },
  { category: "Produção", question: "Como criar transições eficazes?", answer: "Transições mantêm ritmo. Tipos: cortes rápidos, zoom, fade, J-cut (áudio antes de vídeo). Use 1-2 transições por minuto. Evite exagerar.", tips: "Boas transições fazem vídeo parecer profissional.", difficulty: "intermediate" },
  { category: "Produção", question: "Qual é a duração ideal de um vídeo?", answer: "Depende do conteúdo. Tutoriais: 5-10min. Reviews: 10-15min. Vlogs: 15-20min. Shorts: 15-60s. Regra: Tão longo quanto necessário, tão curto quanto possível.", tips: "YouTube favorece vídeos que mantêm pessoas assistindo.", difficulty: "beginner" },

  // Análise
  { category: "Análise", question: "Como acessar e interpretar YouTube Analytics?", answer: "YouTube Studio > Analytics. Métricas principais: Views, Tempo de visualização, Retenção média, CTR, Cliques em anotações. Analise por: vídeo, período, demográfico.", tips: "Revise analytics semanalmente para otimizar conteúdo.", difficulty: "beginner" },
  { category: "Análise", question: "O que é retenção de audiência e como melhorar?", answer: "Retenção é % de vídeo que espectadores assistem. Gráfico mostra onde pessoas saem. Melhore: hook forte, ritmo rápido, transições, valor consistente.", tips: "Retenção acima de 50% no primeiro minuto é excelente.", difficulty: "intermediate" },
  { category: "Análise", question: "Como calcular e melhorar CTR (Click-Through Rate)?", answer: "CTR = (Cliques / Impressões) x 100. YouTube mostra CTR por vídeo. Melhore: teste thumbnails, títulos curiosos, A/B testing. Objetivo: 4-5% de CTR.", tips: "Melhor CTR = mais recomendações do algoritmo.", difficulty: "intermediate" },
  { category: "Análise", question: "Qual é a importância do tempo de visualização?", answer: "Tempo de visualização é métrica-chave do algoritmo. Quanto mais tempo, melhor ranking. Objetivo: 4000 horas em 12 meses para monetizar.", tips: "Foco em retenção, não apenas views.", difficulty: "beginner" },
  { category: "Análise", question: "Como analisar demográfico da audiência?", answer: "Analytics > Audiência > Demográfico. Veja: idade, gênero, localização, idioma. Use para: criar conteúdo relevante, escolher horários de publicação, direcionar anúncios.", tips: "Conhecer sua audiência melhora engajamento em 30%.", difficulty: "intermediate" },
  { category: "Análise", question: "O que são fontes de tráfego e como otimizar?", answer: "Fontes: Pesquisa YouTube, Sugestões, Direto, Playlists, Externos. Otimize: SEO (pesquisa), thumbnails (sugestões), compartilhamentos (externos).", tips: "Diversifique fontes de tráfego para crescimento estável.", difficulty: "advanced" },
  { category: "Análise", question: "Como usar A/B testing para melhorar vídeos?", answer: "Teste: thumbnails diferentes, títulos, horários de publicação, estruturas. Mude 1 variável por vez. Analise resultados por 7 dias. Implemente o vencedor.", tips: "A/B testing aumenta CTR em 15-25%.", difficulty: "advanced" },
  { category: "Análise", question: "Qual é a métrica mais importante: views ou retenção?", answer: "Retenção > Views. YouTube prioriza retenção no algoritmo. 1000 views com 50% retenção > 10000 views com 10% retenção. Foco em qualidade.", tips: "Retenção é o verdadeiro indicador de sucesso.", difficulty: "advanced" },
  // Thumbnails
  { category: "Thumbnails", question: "O que faz uma boa thumbnail para vídeo musical?", answer: "Um ponto focal claro, poucas palavras, alto contraste e uma emoção visível. Ela precisa ser entendida em menos de um segundo, mesmo pequena, na tela do celular.", tips: "Reduza a imagem para o tamanho de um selo: se ainda dá para entender, está boa.", difficulty: "beginner" },
  { category: "Thumbnails", question: "Qual é o tamanho ideal de uma thumbnail no YouTube?", answer: "1280x720 pixels, proporção 16:9, em JPG, PNG ou GIF, com até 2 MB. Use resolução mínima de 640 pixels de largura.", tips: "Deixe uma margem: o horário do vídeo aparece no canto inferior direito e cobre parte da imagem.", difficulty: "beginner" },
  { category: "Thumbnails", question: "Quanto texto devo colocar na thumbnail?", answer: "De 2 a 4 palavras grandes e legíveis. O texto deve complementar o título, não repeti-lo. Use fonte grossa e contorno ou sombra para separar do fundo.", tips: "Se o texto não é lido no celular, ele está pequeno demais.", difficulty: "beginner" },
  { category: "Thumbnails", question: "Quais cores chamam mais atenção em uma thumbnail?", answer: "Não existe cor mágica: o que funciona é o contraste. Combine cores complementares (como ciano e magenta) ou um fundo escuro com um elemento muito claro. Evite tons parecidos com a interface do YouTube.", tips: "Teste a thumbnail em preto e branco: se o assunto ainda se destaca, o contraste está bom.", difficulty: "beginner" },
  { category: "Thumbnails", question: "Devo usar rosto humano ou personagem na thumbnail?", answer: "Rostos com expressão clara costumam prender o olhar, mas em música o que importa é transmitir o clima da faixa. Um personagem, uma cena ou um objeto simbólico funciona bem quando o rosto não faz sentido.", tips: "Escolha uma expressão exagerada e coerente com o clima da música.", difficulty: "intermediate" },
  { category: "Thumbnails", question: "Como testar se minha thumbnail está funcionando?", answer: "Compare o CTR (taxa de cliques) no YouTube Studio depois de algumas centenas de impressões. O YouTube também oferece um recurso de teste de thumbnails em alguns canais. Troque uma thumbnail por vez para saber o que mudou o resultado.", tips: "Um CTR baixo com boa retenção indica que o vídeo é bom, mas a embalagem (título e thumbnail) não atrai.", difficulty: "intermediate" },
  { category: "Thumbnails", question: "Como manter uma identidade visual consistente nas thumbnails?", answer: "Defina uma paleta de cores, uma família de fontes e um layout base. Assim o público reconhece seus vídeos no feed antes de ler o título. Varie só o elemento principal de cada vídeo.", tips: "Crie um modelo reutilizável e troque apenas imagem e texto.", difficulty: "intermediate" },
  { category: "Thumbnails", question: "Como usar IA para criar thumbnails?", answer: "Gere o fundo ou o elemento principal com um gerador de imagens e adicione o texto depois em um editor. Geradores costumam errar letras, então evite pedir texto dentro da imagem gerada.", tips: "Descreva composição, cores e clima no prompt, e gere várias versões para escolher.", difficulty: "advanced" },

  // SEO para Música
  { category: "SEO para Música", question: "Como escrever um bom título para música no YouTube?", answer: "Coloque o nome do artista, o nome da faixa e uma palavra-chave que descreva o estilo ou o uso (por exemplo, lo-fi para estudar). Mantenha até cerca de 60 caracteres para não ser cortado e ponha o mais importante no início.", tips: "Escreva para pessoas primeiro; o algoritmo acompanha o que as pessoas clicam.", difficulty: "beginner" },
  { category: "SEO para Música", question: "O que colocar na descrição de um vídeo musical?", answer: "As primeiras linhas aparecem antes do 'mostrar mais', então resuma o vídeo e inclua as palavras-chave ali. Depois adicione créditos, links de streaming, redes sociais e a letra, se houver.", tips: "Coloque o link mais importante logo no início da descrição.", difficulty: "beginner" },
  { category: "SEO para Música", question: "As tags ainda ajudam no YouTube?", answer: "Têm peso pequeno hoje. Servem principalmente para corrigir grafias comuns do nome do artista ou da música. Título, thumbnail e descrição pesam muito mais.", tips: "Não gaste tempo demais com tags; use poucas e relevantes.", difficulty: "beginner" },
  { category: "SEO para Música", question: "Como descobrir palavras-chave para meus vídeos?", answer: "Use a busca do YouTube e observe as sugestões do preenchimento automático, pesquise vídeos parecidos com o seu e veja quais termos aparecem nos títulos que têm bom desempenho. O relatório de pesquisa do YouTube Studio mostra o que já leva público até você.", tips: "Prefira termos específicos, com menos concorrência, a termos muito genéricos.", difficulty: "intermediate" },
  { category: "SEO para Música", question: "Para que servem capítulos e marcações de tempo?", answer: "Capítulos dividem o vídeo em partes com título e facilitam a navegação. Em compilações e mixes longos, ajudam o público a pular para a faixa desejada e podem aparecer nos resultados de busca.", tips: "Para ativar, a primeira marcação precisa ser 0:00 e deve haver pelo menos três capítulos.", difficulty: "intermediate" },
  { category: "SEO para Música", question: "Como playlists ajudam no alcance de um canal musical?", answer: "Playlists aumentam o tempo de sessão: o público continua no seu canal ouvindo faixa após faixa. Elas também podem aparecer nas buscas. Organize por clima, estilo ou uso, como treino ou foco.", tips: "Dê nomes com palavras-chave, e não apenas nomes criativos.", difficulty: "intermediate" },
  { category: "SEO para Música", question: "Vale a pena usar hashtags nos vídeos?", answer: "Podem ajudar a categorizar o conteúdo, mas use poucas (de 3 a 5), relevantes e sem exagero. Muitas hashtags podem fazer o YouTube ignorar todas elas. As primeiras aparecem acima do título.", tips: "Use hashtags do estilo e do tema, e não hashtags genéricas como #viral.", difficulty: "beginner" },
  { category: "SEO para Música", question: "Como o YouTube entende o assunto de uma música sem letra?", answer: "Ele se apoia nos metadados (título, descrição, capítulos), na thumbnail e no comportamento do público, como quem assiste, por quanto tempo e o que assiste depois. Por isso os metadados e a embalagem precisam ser claros.", tips: "Descreva o estilo, o clima e o uso da música em palavras simples na descrição.", difficulty: "advanced" },

  // Equipamentos
  { category: "Equipamentos", question: "Qual a diferença entre microfone condensador e dinâmico?", answer: "O condensador é mais sensível e captura mais detalhe, sendo comum em vozes de estúdio, mas exige um ambiente tratado. O dinâmico é mais robusto e capta menos ruído do ambiente, ideal para salas sem tratamento acústico.", tips: "Em quarto sem tratamento, um bom microfone dinâmico costuma soar melhor que um condensador barato.", difficulty: "beginner" },
  { category: "Equipamentos", question: "Para que serve uma interface de áudio?", answer: "Ela converte o sinal analógico do microfone ou instrumento em digital para o computador e faz o caminho inverso para os fones. Também fornece pré-amplificadores e alimentação phantom (48V) para microfones condensadores.", tips: "Entradas de qualidade e baixa latência importam mais do que a quantidade de entradas.", difficulty: "beginner" },
  { category: "Equipamentos", question: "Fones comuns servem para produzir música?", answer: "Servem para começar, mas fones de monitoramento têm resposta de frequência mais neutra, o que ajuda a mixar com precisão. Fones fechados são melhores para gravar, e os abertos costumam ser melhores para mixar.", tips: "Confira a mixagem em fones, caixas de som e no celular antes de publicar.", difficulty: "beginner" },
  { category: "Equipamentos", question: "Qual DAW (software de produção) devo usar?", answer: "Existem opções gratuitas ou de baixo custo, como Cakewalk, GarageBand (Mac), Audacity (edição de áudio) e versões de avaliação de outras DAWs. A melhor é a que você domina, pois todas fazem o essencial.", tips: "Escolha uma e aprenda a fundo antes de trocar; o fluxo de trabalho vale mais que os recursos.", difficulty: "beginner" },
  { category: "Equipamentos", question: "Preciso de monitores de estúdio?", answer: "Monitores de estúdio reproduzem o som de forma mais neutra que caixas de som comuns, o que ajuda a mixar melhor. Só compensam se o ambiente for minimamente tratado; caso contrário, fones bons resolvem melhor.", tips: "Comece com bons fones e invista em monitores quando o ambiente permitir.", difficulty: "intermediate" },
  { category: "Equipamentos", question: "Por que tratar acusticamente o ambiente de gravação?", answer: "Reflexões e ecos da sala entram na gravação e atrapalham a mixagem. Painéis absorventes, cobertores pesados e estantes com livros reduzem o eco e melhoram muito o resultado, mesmo em um quarto.", tips: "Grave perto de superfícies macias, como um armário com roupas, para reduzir reverberação.", difficulty: "intermediate" },
  { category: "Equipamentos", question: "Para que serve um controlador MIDI?", answer: "É um teclado ou pad que envia notas e comandos para a DAW, sem produzir som próprio. Você toca e grava instrumentos virtuais de forma natural, em vez de desenhar cada nota com o mouse.", tips: "Um controlador de 25 a 49 teclas já atende a maioria dos produtores iniciantes.", difficulty: "beginner" },
  { category: "Equipamentos", question: "Para que servem o pop filter e o suporte de microfone?", answer: "O pop filter reduz os estouros de consoantes como P e B, e o suporte com braço articulado mantém o microfone na distância certa e reduz vibração e ruído de manuseio.", tips: "Mantenha cerca de um palmo entre a boca e o microfone e cante levemente fora do eixo.", difficulty: "beginner" },

  // Distribuição
  { category: "Distribuição", question: "Como publicar minha música no Spotify e outras plataformas?", answer: "Você precisa de uma distribuidora digital, como DistroKid, TuneCore, CD Baby ou Amuse. Ela envia a faixa e os metadados para Spotify, Apple Music, Deezer e outras lojas. Compare planos, comissões e regras antes de escolher.", tips: "Confira quanto a distribuidora cobra por ano e se ela fica com parte dos royalties.", difficulty: "beginner" },
  { category: "Distribuição", question: "O que é ISRC e para que serve?", answer: "É um código único que identifica cada gravação. Ele permite rastrear execuções e pagar royalties corretamente. A distribuidora normalmente gera o ISRC para você, e ele deve ser mantido se a faixa for republicada.", tips: "Guarde o ISRC de cada faixa; ele acompanha a gravação para sempre.", difficulty: "intermediate" },
  { category: "Distribuição", question: "Com que antecedência devo enviar um lançamento?", answer: "Envie com pelo menos 1 a 2 semanas de antecedência, para a plataforma processar e para dar tempo de divulgar. Para enviar a faixa a curadores de playlists, use o Spotify for Artists e envie com pelo menos 7 dias antes do lançamento.", tips: "Datas de lançamento seguem a sexta-feira, dia em que as playlists são atualizadas.", difficulty: "intermediate" },
  { category: "Distribuição", question: "Para que serve o Spotify for Artists?", answer: "É o painel gratuito do artista: mostra ouvintes, países e playlists onde você aparece, permite atualizar a foto e a biografia e enviar faixas não lançadas para avaliação dos curadores.", tips: "Reivindique seu perfil assim que o primeiro lançamento estiver no ar.", difficulty: "beginner" },
  { category: "Distribuição", question: "O que são metadados e por que importam?", answer: "São as informações da faixa: título, artistas, compositores, gênero, idioma e data. Metadados errados atrapalham a busca e o pagamento de royalties, e corrigi-los depois é trabalhoso.", tips: "Revise a grafia do nome do artista e dos créditos antes de enviar.", difficulty: "beginner" },
  { category: "Distribuição", question: "O que é o Content ID do YouTube?", answer: "É um sistema que identifica músicas em vídeos de terceiros e permite ao dono dos direitos monetizar, bloquear ou apenas acompanhar o uso. Você pode ativá-lo por uma distribuidora ou parceiro autorizado.", tips: "Registre apenas o que é seu: registrar música de terceiros gera disputas e pode punir seu canal.", difficulty: "advanced" },
  { category: "Distribuição", question: "Músicas geradas por IA podem ser distribuídas?", answer: "Depende das regras de cada plataforma e da licença da ferramenta usada. Algumas distribuidoras e lojas restringem ou pedem informações sobre o uso de IA. Confira os termos da ferramenta e da distribuidora antes de publicar.", tips: "Guarde o comprovante do plano usado na geração; ele pode ser exigido em caso de disputa.", difficulty: "advanced" },
  { category: "Distribuição", question: "O que é um pre-save e como ele ajuda um lançamento?", answer: "É um link que permite ao fã salvar a faixa na biblioteca antes do lançamento. No dia do lançamento, ela aparece automaticamente para essa pessoa, o que gera audições logo nas primeiras horas.", tips: "Divulgue o link do pre-save semanas antes, não apenas no dia do lançamento.", difficulty: "intermediate" },

  // Monetização (complemento)
  { category: "Monetização", question: "Como funciona o Programa de Parcerias do YouTube?", answer: "É o programa que libera a monetização por anúncios. Nas regras tradicionais, pede 1.000 inscritos e 4.000 horas de exibição nos últimos 12 meses, ou 10 milhões de visualizações de Shorts em 90 dias. Os requisitos mudam, então confira os atuais no YouTube Studio.", tips: "Antes de solicitar, revise as políticas de conteúdo original para não ser recusado.", difficulty: "beginner" },
  { category: "Monetização", question: "Como funcionam os royalties de streaming?", answer: "As plataformas pagam um valor muito pequeno por reprodução, e o total depende do país, do tipo de assinatura e do número de execuções. O dinheiro passa pela distribuidora antes de chegar a você, então o volume de audições é o que sustenta o ganho.", tips: "Não conte só com streaming: combine com outras fontes de renda.", difficulty: "intermediate" },
];

async function seedFlashcards(db: ReturnType<typeof drizzle>, categoryIds: Map<string, number>) {
  const existing = await db.select().from(flashcards);
  const existingKeys = new Set(existing.map((f) => `${f.categoryId}|${f.question}`));

  const rows = FLASHCARD_DEFS.map((f) => {
    const categoryId = categoryIds.get(f.category);
    if (!categoryId) throw new Error(`Categoria não encontrada: ${f.category}`);
    return {
      categoryId,
      question: f.question,
      answer: f.answer,
      tips: f.tips,
      difficulty: f.difficulty,
    };
  }).filter((row) => !existingKeys.has(`${row.categoryId}|${row.question}`));

  if (rows.length === 0) {
    console.log(`flashcards: ${existing.length} já existentes, nada a inserir.`);
    return;
  }
  await db.insert(flashcards).values(rows);
  console.log(`flashcards: ${rows.length} inseridos (${existing.length} já existiam).`);
}

async function seedScriptTemplates(db: ReturnType<typeof drizzle>) {
  const existing = await db.select().from(scriptTemplates);
  if (existing.length > 0) {
    console.log(`scriptTemplates: ${existing.length} já existentes, pulando.`);
    return;
  }

  const rows = [
    { name: "Tutorial Completo", description: "Guia passo a passo ensinando uma habilidade", type: "tutorial", structure: JSON.stringify({ hook: "Problema que será resolvido", intro: "O que você vai aprender", steps: ["Passo 1", "Passo 2", "Passo 3"], tips: "Dicas importantes", cta: "Inscreva-se para mais" }), tone: "educacional", estimatedDuration: 12 },
    { name: "Review Honesto", description: "Análise detalhada de um produto ou serviço", type: "review", structure: JSON.stringify({ hook: "Curiosidade sobre o produto", intro: "O que é e por que importa", pros: "Pontos positivos", cons: "Pontos negativos", verdict: "Recomendação final", cta: "Deixe seu comentário" }), tone: "casual", estimatedDuration: 10 },
    { name: "Vlog Diário", description: "Conteúdo pessoal e autêntico do dia a dia", type: "vlog", structure: JSON.stringify({ hook: "Momento interessante", intro: "O que aconteceu hoje", story: "Narrativa do dia", lesson: "O que aprendi", cta: "Me siga para mais" }), tone: "energético", estimatedDuration: 8 },
    { name: "Aula Educacional", description: "Conteúdo didático e estruturado para aprender", type: "educational", structure: JSON.stringify({ hook: "Pergunta provocadora", intro: "Contexto e importância", theory: "Conceitos principais", examples: "Exemplos práticos", summary: "Resumo do aprendizado", cta: "Faça o quiz nos comentários" }), tone: "formal", estimatedDuration: 15 },
    { name: "Storytelling Narrativo", description: "História envolvente com lição de vida", type: "storytelling", structure: JSON.stringify({ hook: "Abertura impactante", setup: "Contexto da história", conflict: "O desafio", resolution: "Como foi resolvido", lesson: "Lição aprendida", cta: "Compartilhe sua história" }), tone: "emocional", estimatedDuration: 10 },
  ];
  await db.insert(scriptTemplates).values(rows);
  console.log(`scriptTemplates: ${rows.length} inseridos.`);
}

main().catch((error) => {
  console.error("Seed falhou:", error);
  process.exit(1);
});
