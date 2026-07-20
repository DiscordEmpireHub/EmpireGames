// Regras autoritativas do Jogo da Velha. Funções puras e imutáveis (nunca mutam
// o estado recebido) para que a mesma lógica possa ser reutilizada tanto no
// cliente (demo local, hot-seat) quanto num futuro servidor autoritativo —
// ver README.md deste jogo para o estado real da integração multiplayer.

export type Mark = "X" | "O";
export type Cell = Mark | null;

export interface TicTacToeState {
  board: Cell[]; // length 9, índice 0-8, linha-major
  currentTurn: Mark;
  marksByUserId: Record<string, Mark>;
  winnerUserId: string | null;
  isDraw: boolean;
}

export interface PlaceMarkAction {
  type: "PLACE_MARK";
  cellIndex: number;
}

const BOARD_SIZE = 9;

const WIN_LINES: readonly [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export class InvalidActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidActionError";
  }
}

export class NotPlayerTurnError extends Error {
  constructor(userId: string) {
    super(`It is not ${userId}'s turn`);
    this.name = "NotPlayerTurnError";
  }
}

export class CellOccupiedError extends Error {
  constructor(cellIndex: number) {
    super(`Cell ${cellIndex} is already occupied`);
    this.name = "CellOccupiedError";
  }
}

export class MatchAlreadyEndedError extends Error {
  constructor() {
    super("Match has already ended");
    this.name = "MatchAlreadyEndedError";
  }
}

export function createInitialState(playerAUserId: string, playerBUserId: string): TicTacToeState {
  return {
    board: Array<Cell>(BOARD_SIZE).fill(null),
    currentTurn: "X",
    marksByUserId: {
      [playerAUserId]: "X",
      [playerBUserId]: "O",
    },
    winnerUserId: null,
    isDraw: false,
  };
}

function findWinningMark(board: readonly Cell[]): Mark | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function applyAction(state: TicTacToeState, userId: string, action: PlaceMarkAction): TicTacToeState {
  if (state.winnerUserId !== null || state.isDraw) {
    throw new MatchAlreadyEndedError();
  }

  const mark = state.marksByUserId[userId];
  if (!mark) {
    throw new InvalidActionError(`User ${userId} is not a player in this match`);
  }
  if (mark !== state.currentTurn) {
    throw new NotPlayerTurnError(userId);
  }
  if (action.cellIndex < 0 || action.cellIndex >= BOARD_SIZE) {
    throw new InvalidActionError(`Invalid cell index ${action.cellIndex}`);
  }
  if (state.board[action.cellIndex] !== null) {
    throw new CellOccupiedError(action.cellIndex);
  }

  const board = [...state.board];
  board[action.cellIndex] = mark;

  const winningMark = findWinningMark(board);
  const winnerUserId = winningMark ? userId : null;
  const isDraw = !winningMark && board.every((cell) => cell !== null);

  return {
    ...state,
    board,
    currentTurn: mark === "X" ? "O" : "X",
    winnerUserId,
    isDraw,
  };
}

// Adaptador consumido pelo carregamento dinâmico de GameTableRoom (EmpireCore) via
// gameLogicRegistry/loadServerGameLogic — o shape (createInitialState/onPlayerAction)
// é estruturalmente compatível com ServerGameLogic de @empire/shared-types. Não
// importamos o tipo diretamente pois este repositório não tem link de workspace com
// o monorepo do EmpireCore (pacotes privados/não publicados — ver Lacuna 5).
export default {
  createInitialState(playerUserIds: string[]) {
    const [playerAUserId, playerBUserId] = playerUserIds;
    if (!playerAUserId || !playerBUserId) {
      throw new InvalidActionError("Tic Tac Toe requires exactly 2 seated players to start");
    }
    return createInitialState(playerAUserId, playerBUserId);
  },
  onPlayerAction(userId: string, action: unknown, state: unknown) {
    return applyAction(state as TicTacToeState, userId, action as PlaceMarkAction);
  },
};
