# CLAUDE.md — Diretrizes de trabalho

Regras de trabalho do Claude neste repositório. Idioma padrão: português do Brasil.
Fonte das regras gerais: `Neguchads/claude-config`. Regras específicas deste projeto (seção "Este projeto") têm prioridade.

## Este projeto

Verificação local (rodar na branch do PR antes de qualquer merge):

```powershell
pnpm install --frozen-lockfile
pnpm check   # tsc --noEmit
pnpm test    # vitest run
pnpm build
```

O CI (`.github/workflows/ci.yml`) roda `check` e `build` em todo PR; repositório público, então o GitHub Actions é grátis aqui.

## Pull requests e merge

- Fluxo autônomo: branch → commits → push da branch → PR → verificação → merge. Nunca commitar direto na `main`.
- Trabalhar em **fatias médias**: blocos coerentes que entregam algo inteiro. Evitar PRs minúsculos e picotados.
- **Portão do merge (testes reais).** Só fazer merge sozinho se TUDO for verdade:
  1. A verificação local acima passou na branch do PR.
  2. Existem testes que exercitam a mudança: código novo ou alterado ganhou teste novo ou atualizado.
  3. Mudança de interface: verificada rodando de verdade (preview ou Playwright), não só por teste unitário.
  4. Nenhum teste foi apagado, pulado (`skip`, `.only`) ou afrouxado para passar. Se precisar mudar um teste existente, explicar no PR e deixar aberto.
  5. O CI do PR está verde.
  6. A descrição do PR registra os comandos rodados, o resultado e o que **não** foi testado.
- Deixar o PR aberto e chamar o usuário quando houver decisão grande, migração ou drop de banco, mudança em autenticação, pagamento ou dados pessoais, algo que gere custo, ou deploy de produção.
- Merge com squash. Se um merge quebrar algo: **reverter primeiro**, investigar depois.
- Depois do merge, apagar a branch do PR. Nunca apagar a `main` nem branch **não mergeada** sem avisar.
- Nunca `git push --force` nem `git reset --hard` sem confirmação.
- Se o ambiente bloquear uma ação (permissão, hook, proxy), não contornar: avisar e dizer como o usuário pode fazer.
- A cada merge, relatório curto (duas ou três linhas): o que mudou e o que vem a seguir.
- Mensagens de commit em inglês, Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).

## Roadmap e documentação

- Manter `ROADMAP.md` curto (feito, em andamento, planejado) e atualizá-lo após cada merge.
- Manter o `README.md` atualizado: problema que resolve, tecnologias e por quê, como instalar e rodar.
- Registrar decisões técnicas em `docs/DECISIONS.md`: o que foi escolhido e por quê.

## Custo e ferramentas

- Preferir ferramentas **gratuitas e open source**. Se a gratuita for ruim, mostrar outra gratuita antes de sugerir algo pago.
- Poucas dependências: antes de adicionar uma, justificar (resolve dor real? custo de manter? dá para fazer sem?).
- Vigiar o limite das APIs gratuitas e avisar antes de estourar a cota.

## Qualidade e segurança

- Segredos **sempre em variáveis de ambiente**, nunca no repositório. Manter `.env.example` sem valores reais.
- Fixar a versão das bibliotecas. Dependabot ligado para as dependências.
- **Pedir confirmação antes** de qualquer coisa que gaste dinheiro, apague dados ou mexa em produção.

## Autonomia

Trabalhar de forma autônoma, parando para perguntar só nas decisões que realmente dependem do usuário.
