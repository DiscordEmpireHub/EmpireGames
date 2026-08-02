# EmpireGames

Games application for EmpireHub.

## Visão Geral

Guarda os **cartuchos** do EmpireHub: cada jogo é praticamente só lógica/regras (`GameLogic.ts`) — quem renderiza é o `EmpireClient` usando os templates da `EmpireEngine` (veja [`ARCHITECTURE.md`](../../../docs/project-planning-and-instructions/ARCHITECTURE.md)). Um jogo pode trazer cena e/ou assets próprios quando precisar de algo fora do repertório genérico da Engine — é uma válvula de escape, não a regra. Hoje o diretório só contém a documentação/template de referência (`EmpireGamesDevelopment/`); ainda não existe uma pasta de jogo real.

## Estrutura

```
EmpireGames/
├── gamelist.ini                # registro dos jogos instalados (lido pelo gamesRegistry do EmpireServer) — vazio por enquanto
├── gamelist-project.md         # notas/planejamento de jogos — vazio por enquanto
└── EmpireGamesDevelopment/     # documentação, templates e exemplos — NÃO é código de produção, é referência viva
    ├── docs/
    │   ├── README.md
    │   ├── CORE-API-FOR-GAMES.md      # como um jogo fala com o EmpireServer
    │   ├── ENGINE-API-FOR-GAMES.md    # como um jogo consome templates/assets da EmpireEngine
    │   ├── GAME-DEVELOPMENT-GUIDE.md  # passo a passo para criar um jogo novo
    │   └── TROUBLESHOOTING.md
    └── template/
        └── my-game/                   # scaffold de referência para um jogo novo
            ├── game.ini                 # manifest do jogo
            ├── config/
            │   ├── gameConfig.ts
            │   ├── loadGameConfig.ts
            │   ├── loadGameConfig.test.ts
            │   └── __fixtures__/         # empty.ini, mismatched-id.ini — casos de teste do loader
            ├── server/
            │   └── GameLogic.ts           # contrato de lógica server-side (onPlayerAction, checkWinCondition)
            ├── src/
            │   ├── main.tsx
            │   ├── types.ts
            │   ├── scenes/
            │   │   └── GameScene.ts        # cena própria (quando o jogo não usa só templates da Engine)
            │   └── services/
            │       ├── CoreService.ts       # chamadas ao EmpireServer
            │       └── EngineService.ts     # chamadas à EmpireEngine
            └── assets/                    # assets próprios do jogo (escape hatch — vazio no template)
```

> Um jogo real (ex.: `EmpireGames/tic-tac-toe/`) ainda não foi criado nesta estrutura. Este README será ampliado com a lista de jogos publicados assim que o primeiro for codificado.
