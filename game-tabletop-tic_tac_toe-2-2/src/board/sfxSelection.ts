import type { TicTacToeState } from "../../server/GameLogic";
import type { AssetCatalog } from "./assetCatalog";

const wasMatchOver = (state: TicTacToeState): boolean => state.winnerUserId !== null || state.isDraw;

/**
 * Compara o estado autoritativo anterior com o atual e decide qual efeito
 * sonoro tocar nesta transição (no máximo um por render). Função pura —
 * sem side-effects, testável isoladamente.
 */
export function determineSfxToPlay(
  previous: TicTacToeState | null,
  current: TicTacToeState,
  localUserId: string,
  assets: AssetCatalog,
): string | null {
  if (!previous) return null;

  const justEnded = wasMatchOver(current) && !wasMatchOver(previous);
  if (justEnded) {
    if (current.isDraw) return assets.matchDraw;
    return current.winnerUserId === localUserId ? assets.matchWin : assets.matchLose;
  }

  const newlyPlaced = current.board.some((cell, index) => cell !== null && previous.board[index] === null);
  if (newlyPlaced) return assets.piecePlace;

  const turnChanged = previous.currentTurn !== current.currentTurn && !wasMatchOver(current);
  if (turnChanged) return assets.turnPass;

  return null;
}
