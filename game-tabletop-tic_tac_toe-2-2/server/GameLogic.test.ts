import { describe, expect, it } from "vitest";
import serverGameLogic, {
  applyAction,
  CellOccupiedError,
  createInitialState,
  InvalidActionError,
  MatchAlreadyEndedError,
  NotPlayerTurnError,
} from "./GameLogic";

const PLAYER_A = "user-a";
const PLAYER_B = "user-b";

describe("createInitialState", () => {
  it("creates an empty 9-cell board with player A as X and player B as O", () => {
    const state = createInitialState(PLAYER_A, PLAYER_B);

    expect(state.board).toEqual(Array(9).fill(null));
    expect(state.marksByUserId).toEqual({ [PLAYER_A]: "X", [PLAYER_B]: "O" });
    expect(state.currentTurn).toBe("X");
    expect(state.winnerUserId).toBeNull();
    expect(state.isDraw).toBe(false);
  });
});

describe("applyAction", () => {
  it("places the mark and switches the turn on a valid move", () => {
    const state = createInitialState(PLAYER_A, PLAYER_B);

    const next = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 });

    expect(next.board[0]).toBe("X");
    expect(next.currentTurn).toBe("O");
    expect(next.winnerUserId).toBeNull();
    expect(next.isDraw).toBe(false);
  });

  it("does not mutate the original state (immutability)", () => {
    const state = createInitialState(PLAYER_A, PLAYER_B);

    applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 });

    expect(state.board[0]).toBeNull();
    expect(state.currentTurn).toBe("X");
  });

  it("throws NotPlayerTurnError when it is not the acting player's turn", () => {
    const state = createInitialState(PLAYER_A, PLAYER_B);

    expect(() => applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 0 })).toThrow(NotPlayerTurnError);
  });

  it("throws InvalidActionError when the user is not a player in the match", () => {
    const state = createInitialState(PLAYER_A, PLAYER_B);

    expect(() => applyAction(state, "stranger", { type: "PLACE_MARK", cellIndex: 0 })).toThrow(InvalidActionError);
  });

  it("throws InvalidActionError for an out-of-range cell index", () => {
    const state = createInitialState(PLAYER_A, PLAYER_B);

    expect(() => applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 9 })).toThrow(InvalidActionError);
    expect(() => applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: -1 })).toThrow(InvalidActionError);
  });

  it("throws CellOccupiedError when the cell is already marked", () => {
    let state = createInitialState(PLAYER_A, PLAYER_B);
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 });

    expect(() => applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 0 })).toThrow(CellOccupiedError);
  });

  it("declares a winner on three in a row (top row)", () => {
    let state = createInitialState(PLAYER_A, PLAYER_B);
    // X: 0,1,2 (top row) | O: 3,4
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 });
    state = applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 3 });
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 1 });
    state = applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 4 });
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 2 });

    expect(state.winnerUserId).toBe(PLAYER_A);
    expect(state.isDraw).toBe(false);
  });

  it("declares a winner on three in a column", () => {
    let state = createInitialState(PLAYER_A, PLAYER_B);
    // X: 0,3,6 (left column) | O: 1,2
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 });
    state = applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 1 });
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 3 });
    state = applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 2 });
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 6 });

    expect(state.winnerUserId).toBe(PLAYER_A);
  });

  it("declares a winner on a diagonal", () => {
    let state = createInitialState(PLAYER_A, PLAYER_B);
    // X: 0,4,8 (diagonal) | O: 1,2
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 });
    state = applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 1 });
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 4 });
    state = applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 2 });
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 8 });

    expect(state.winnerUserId).toBe(PLAYER_A);
  });

  it("declares a draw when the board fills with no winner", () => {
    // Board:
    // X O X
    // X O O
    // O X X
    let state = createInitialState(PLAYER_A, PLAYER_B);
    const moves: [string, number][] = [
      [PLAYER_A, 0],
      [PLAYER_B, 1],
      [PLAYER_A, 2],
      [PLAYER_B, 4],
      [PLAYER_A, 3],
      [PLAYER_B, 5],
      [PLAYER_A, 7],
      [PLAYER_B, 6],
      [PLAYER_A, 8],
    ];

    for (const [userId, cellIndex] of moves) {
      state = applyAction(state, userId, { type: "PLACE_MARK", cellIndex });
    }

    expect(state.winnerUserId).toBeNull();
    expect(state.isDraw).toBe(true);
  });

  it("throws MatchAlreadyEndedError when acting after the match has ended", () => {
    let state = createInitialState(PLAYER_A, PLAYER_B);
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 });
    state = applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 3 });
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 1 });
    state = applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 4 });
    state = applyAction(state, PLAYER_A, { type: "PLACE_MARK", cellIndex: 2 }); // X wins

    expect(() => applyAction(state, PLAYER_B, { type: "PLACE_MARK", cellIndex: 5 })).toThrow(MatchAlreadyEndedError);
  });
});

describe("default export (ServerGameLogic adapter for dynamic loading)", () => {
  it("creates the initial state from exactly two player user ids", () => {
    const state = serverGameLogic.createInitialState([PLAYER_A, PLAYER_B]);

    expect(state).toEqual(createInitialState(PLAYER_A, PLAYER_B));
  });

  it("throws when fewer than 2 players are provided", () => {
    expect(() => serverGameLogic.createInitialState([PLAYER_A])).toThrow(InvalidActionError);
  });

  it("delegates onPlayerAction to applyAction", () => {
    const initial = serverGameLogic.createInitialState([PLAYER_A, PLAYER_B]);

    const next = serverGameLogic.onPlayerAction(PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 }, initial);

    expect(next).toEqual(applyAction(createInitialState(PLAYER_A, PLAYER_B), PLAYER_A, { type: "PLACE_MARK", cellIndex: 0 }));
  });
});
