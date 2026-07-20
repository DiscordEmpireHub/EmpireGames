import { useState } from "react";
import {
  applyAction,
  createInitialState,
  type TicTacToeState,
} from "../server/GameLogic";
import { CoreService } from "./services/CoreService";
import type { GameModuleProps } from "./types";
import "./tic-tac-toe.css";

// IMPORTANTE: GameTableRoom (EmpireCore) ainda não tem um hook de ação de jogo
// (ver EmpireGamesDevelopment/GAME-DEVELOPMENT-GUIDE.md#lacunas-conhecidas, item 4).
// Por isso este componente roda como demonstração LOCAL (hot-seat, 2 jogadores na
// mesma tela) usando as mesmas funções puras de server/GameLogic.ts que rodariam
// no servidor — não é multiplayer autoritativo de ponta a ponta ainda.
const PLAYER_X_ID = "local-player-x";
const PLAYER_O_ID = "local-player-o";

export default function TicTacToe({ hubContext, coreSdk }: GameModuleProps) {
  const [state, setState] = useState<TicTacToeState>(() => createInitialState(PLAYER_X_ID, PLAYER_O_ID));
  const coreService = new CoreService(coreSdk);
  void coreService; // TODO: chamar coreService.reportMatchResult ao final da partida, quando o endpoint de servidor existir

  const isGameOver = state.winnerUserId !== null || state.isDraw;

  function handleCellClick(cellIndex: number) {
    const actingUserId = state.currentTurn === "X" ? PLAYER_X_ID : PLAYER_O_ID;

    try {
      setState(applyAction(state, actingUserId, { type: "PLACE_MARK", cellIndex }));
    } catch {
      // Movimento inválido (célula ocupada, fora do turno, jogo já terminou) — ignora.
    }
  }

  function handleRestart() {
    setState(createInitialState(PLAYER_X_ID, PLAYER_O_ID));
  }

  const statusText = state.winnerUserId
    ? `Vitória de ${state.winnerUserId === PLAYER_X_ID ? "X" : "O"}!`
    : state.isDraw
      ? "Empate!"
      : `Vez de ${state.currentTurn}`;

  return (
    <div className="tic-tac-toe">
      <p>Jogando como: {hubContext.user.username}</p>
      <p className="tic-tac-toe__status">{statusText}</p>
      <div className="tic-tac-toe__board">
        {state.board.map((cell, index) => (
          <button
            key={index}
            type="button"
            className="tic-tac-toe__cell"
            disabled={cell !== null || isGameOver}
            onClick={() => handleCellClick(index)}
            aria-label={`Célula ${index + 1}`}
          >
            {cell ?? ""}
          </button>
        ))}
      </div>
      <button type="button" onClick={handleRestart}>
        Reiniciar
      </button>
    </div>
  );
}
