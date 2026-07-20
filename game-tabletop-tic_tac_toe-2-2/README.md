# Tic Tac Toe / Jogo da Velha

Primeiro jogo real do ecossistema EmpireHub, construído a partir do template em `EmpireGamesDevelopment/template/my-game`. `requiresEngine: false` — React puro, sem EmpireEngine/Phaser.

## Estado real (leia antes de jogar)

- **Regras**: implementadas e testadas de ponta a ponta em `server/GameLogic.ts` (`server/GameLogic.test.ts`, 15 testes — vitória em linha/coluna/diagonal, empate, todos os erros de ação inválida, imutabilidade, adaptador `ServerGameLogic`).
- **`game.ini`**: metadados completos na raiz, validados por `config/loadGameConfig.ts` (`config/loadGameConfig.test.ts`, 3 testes).
- **UI**: jogável, testada via React Testing Library + `user-event` simulando cliques reais (`src/main.test.tsx`, 5 testes) — **não foi verificada visualmente em um navegador real**, pois este ambiente de desenvolvimento não tem uma ferramenta de automação de browser disponível. A cobertura via RTL + jsdom simula os mesmos eventos DOM que um browser real dispararia (clique, re-render), mas não substitui uma inspeção visual.
- **Modo de jogo**: a UI atual (`src/main.tsx`) roda como **demonstração local (hot-seat)** — os dois jogadores (X e O) se revezam na mesma tela/mesmo `hubContext`. `server/GameLogic.ts` já exporta um `default` compatível com `ServerGameLogic` (carregável dinamicamente por `GameTableRoom`), e o Core já tem o canal `GAME_ACTION` implementado (ver "Lacuna 4" abaixo) — mas **o cliente deste jogo ainda não se conecta à sala Colyseus real** para enviar `GAME_ACTION` em vez de aplicar o movimento localmente. Essa é a última peça para multiplayer autoritativo de ponta a ponta.

## Rodando localmente

```bash
npm install
npm run test        # 23 testes: 15 regras + 3 config + 5 UI
npm run typecheck
npm run dev          # abre um dev server Vite — carregue via um harness próprio, já que não há host GameLoader real disponível fora do EmpireCore
```

## Lacuna 4 — `GAME_ACTION` em `GameTableRoom`: RESOLVIDA (lado servidor)

Decisão tomada: **carregamento dinâmico** (espelhando `clientEntryUrl`/`import()` que o `GameLoader` já faz no cliente), porque o Core não pode depender de jogos específicos (jogos podem ser adicionados/removidos livremente) — a alternativa de registro estático violaria essa regra.

Implementado em EmpireCore:
- `GameManifest.serverEntryUrl` — declarado, mas **nunca lido do cliente**.
- `apps/core-server/src/games/gameLogicRegistry.ts` — allowlist administrativa `gameId → serverEntryUrl`, populada apenas no bootstrap do servidor (`registerGames.ts`, via env var), nunca a partir de dados do jogador nem do `game.ini` do jogo automaticamente (registrar um jogo é um passo humano deliberado, não automático).
- `apps/core-server/src/games/loadServerGameLogic.ts` — importa dinamicamente (local ou http(s), com cache por `gameId`) e valida o shape do módulo carregado.
- `apps/core-server/src/rooms/gameActionHandling.ts` + `GameTableRoom.onMessage("GAME_ACTION", ...)` — delega para a `ServerGameLogic` carregada, nunca deixa um erro de lógica de jogo (código não confiável) derrubar a sala.
- `GameTableStateSchema.gameStateJson` — novo campo genérico (JSON opaco) para sincronizar o estado específico de cada jogo, já que Colyseus schema não suporta forma arbitrária por jogo sem codegen.

**Risco aceito conscientemente**: não há sandboxing (vm2, worker isolado) do código carregado — um jogo aprovado com bug ou malicioso tem o mesmo nível de acesso do próprio `core-server`. Ver comentário em `loadServerGameLogic.ts`.

**O que falta para este jogo especificamente**: `src/main.tsx` ainda não se conecta a uma sala Colyseus real via `colyseus.js` para enviar `{ type: "GAME_ACTION", action }` — hoje ele só chama `applyAction` localmente (hot-seat). Isso exige expor um objeto de conexão de sala em `GameModuleProps` (hoje só expõe o snapshot `roomState`, não um canal de envio) — outra pequena lacuna a resolver antes do multiplayer real funcionar de ponta a ponta.
