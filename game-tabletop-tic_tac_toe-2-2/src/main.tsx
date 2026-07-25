import { useEffect, useMemo, useRef } from "react";
import { buildAssetCatalog } from "./board/assetCatalog";
import { CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, cellOverlayRect } from "./board/boardLayout";
import { determineSfxToPlay } from "./board/sfxSelection";
import { useEngineLifecycle } from "./hooks/useEngineLifecycle";
import { CoreService } from "./services/CoreService";
import type { Cell, TicTacToeState } from "../server/GameLogic";
import type { GameModuleProps } from "./types";
import "./tic-tac-toe.css";

// requires_engine = true (game.ini) — este jogo renderiza via PhaserGameEngine
// (canvas). GameEngine.onObjectClick() existe, mas células vazias não têm
// nenhum sprite renderizado (só marcas X/O ganham objeto ao serem colocadas),
// então continuamos usando botões DOM transparentes sobrepostos para capturar
// clique em qualquer célula, ocupada ou não.
const THEME = "classic" as const;
const ASSETS = buildAssetCatalog(THEME);

function parseGameState(gameStateJson: string): TicTacToeState | null {
  if (!gameStateJson) return null;
  try {
    return JSON.parse(gameStateJson) as TicTacToeState;
  } catch {
    return null;
  }
}

function statusText(state: TicTacToeState | null, localUserId: string): string {
  if (!state) return "Aguardando estado da partida...";
  if (state.winnerUserId) {
    const winningMark = state.marksByUserId[state.winnerUserId];
    return state.winnerUserId === localUserId ? `Você venceu (${winningMark})!` : `${winningMark} venceu.`;
  }
  if (state.isDraw) return "Empate!";
  return `Vez de ${state.currentTurn}`;
}

function isCellPlayable(state: TicTacToeState, cell: Cell, localMark: string | undefined, localUserId: string): boolean {
  const isGameOver = state.winnerUserId !== null || state.isDraw;
  return cell === null && !isGameOver && localMark === state.currentTurn && state.marksByUserId[localUserId] === localMark;
}

export default function TicTacToe({ hubContext, coreSdk, roomState, sendGameAction }: GameModuleProps) {
  const coreService = useMemo(() => new CoreService(coreSdk), [coreSdk]);
  void coreService; // TODO: reportMatchResult quando o endpoint existir no CoreSdk real

  const { containerRef, status, errorMessage, engineServiceRef, boardRendererRef } = useEngineLifecycle(THEME);
  const gameState = parseGameState(roomState.gameStateJson);
  const previousStateRef = useRef<TicTacToeState | null>(null);

  useEffect(() => {
    if (status !== "ready" || !gameState) return;
    const boardRenderer = boardRendererRef.current;
    const engineService = engineServiceRef.current;
    if (!boardRenderer || !engineService) return;

    boardRenderer.syncMarks(gameState.board);

    const sfxAssetId = determineSfxToPlay(previousStateRef.current, gameState, hubContext.user.userId, ASSETS);
    if (sfxAssetId) engineService.play({ assetId: sfxAssetId });

    previousStateRef.current = gameState;
  }, [status, gameState, hubContext.user.userId, boardRendererRef, engineServiceRef]);

  function handleCellClick(cellIndex: number): void {
    if (!gameState) return;
    const localMark = gameState.marksByUserId[hubContext.user.userId];
    if (!isCellPlayable(gameState, gameState.board[cellIndex], localMark, hubContext.user.userId)) return;

    engineServiceRef.current?.play({ assetId: ASSETS.uiClick });
    sendGameAction({ type: "PLACE_MARK", cellIndex });
  }

  if (status === "error") {
    return <div className="tic-tac-toe tic-tac-toe--error">Falha ao carregar a Engine: {errorMessage}</div>;
  }

  return (
    <div className="tic-tac-toe">
      <p>Jogando como: {hubContext.user.username}</p>
      <div className="tic-tac-toe__canvas-wrapper" style={{ width: CANVAS_WIDTH_PX, height: CANVAS_HEIGHT_PX }}>
        <div ref={containerRef} className="tic-tac-toe__canvas" />
        {status === "loading" && <p className="tic-tac-toe__loading">Carregando Engine...</p>}
        {status === "ready" && gameState && (
          <div className="tic-tac-toe__overlay">
            {gameState.board.map((_, index) => {
              const rect = cellOverlayRect(index);
              return (
                <button
                  key={index}
                  type="button"
                  className="tic-tac-toe__cell-button"
                  style={{ left: `${rect.leftPct}%`, top: `${rect.topPct}%`, width: `${rect.widthPct}%`, height: `${rect.heightPct}%` }}
                  disabled={gameState.board[index] !== null}
                  aria-label={`Célula ${index + 1}`}
                  onClick={() => handleCellClick(index)}
                />
              );
            })}
            <p className="tic-tac-toe__status">{statusText(gameState, hubContext.user.userId)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
