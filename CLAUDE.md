# CLAUDE.md — Diretrizes de trabalho

Regras de trabalho do Claude neste repositório. Idioma padrão: português do Brasil.
Regras específicas deste projeto (abaixo, se houver) têm prioridade.

## Pull requests e merge

- Trabalhar em **fatias médias e inteligentes**: blocos grandes que alteram várias partes importantes. Evitar PRs minúsculos e picotados.
- Ao concluir um bloco: analisar e testar o que foi feito. Se estiver ok, **fazer o merge sozinho** logo após os testes.
- Deixar PR aberto **somente** quando houver decisão grande que dependa do usuário. Se o Claude consegue resolver sozinho, resolve e faz o merge.
- Se um merge quebrar algo: **reverter primeiro**, investigar depois.
- Branches: depois que o PR é mergeado, a branch dele pode ser apagada (o conteúdo já está na `main`, e o GitHub permite restaurar pelo PR). Nunca apagar a `main` nem branch **não mergeada** sem avisar antes.
- Nunca forçar push (`--force`) sem avisar antes.
- Se o ambiente bloquear uma ação (permissão, proxy), não contornar: avisar o usuário e dizer como ele mesmo pode fazer.
- A cada merge, relatório curto (duas ou três linhas): o que mudou e o que vem a seguir.
- Mensagens de commit padronizadas (Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).

## Roadmap e documentação

- Todo projeto começa com um `ROADMAP.md`, criado logo no início.
- Após cada merge: conferir o roadmap e adaptá-lo aos próximos passos. Manter um resumo fácil de bater o olho (feito, em andamento, planejado).
- De tempos em tempos: análise geral do projeto (andamento, o que precisa mudar, roadmap versus estado atual).
- Após vários blocos/merges: análise completa da documentação e atualização geral, além de ir atualizando aos poucos.
- Manter o `README.md` sempre atualizado, com como instalar e rodar.
- Registrar decisões grandes em `docs/DECISIONS.md`: o que foi escolhido e por quê.

## Custo e ferramentas

- Preferir ferramentas **gratuitas e open source**, principalmente APIs gratuitas. O objetivo é o mínimo de custo possível.
- Preferir instalar e configurar ferramentas prontas em vez de criar do zero.
- Se uma ferramenta gratuita for ruim, mostrar a alternativa gratuita antes de sugerir qualquer coisa paga.
- Vigiar o limite das APIs gratuitas e avisar antes de estourar a cota.
- Checar a licença de ferramentas open source **apenas para informar** o usuário. Não decidir por ele: se ele pedir para usar, usar.
- De tempos em tempos, avaliar se há conexões MCP boas para o projeto. Manter poucos MCPs ligados, para não pesar o contexto.

## Qualidade e segurança

- Em todo projeto novo, configurar testes automáticos e lint gratuitos, para o merge automático ter segurança.
- Chaves de API e segredos **sempre em variáveis de ambiente**, nunca no repositório. Manter um `.env.example` sem valores reais.
- Fixar a versão das bibliotecas, para o projeto não quebrar sozinho com atualização.
- Ativar varredura gratuita de segurança das dependências (Dependabot) nos projetos que tiverem dependências.
- **Pedir confirmação antes** de qualquer coisa que gaste dinheiro, apague dados ou mexa em produção.

## Autonomia

O Claude deve trabalhar de forma autônoma e inteligente nos projetos, parando para perguntar só nas decisões que realmente dependem do usuário.

