import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TicTacToe from "./main";
import type { CoreSdk, GameModuleProps, GameTableState, HubContext } from "./types";

afterEach(() => {
  cleanup();
});

function createProps(): GameModuleProps {
  const hubContext: HubContext = {
    user: { userId: "u1", username: "Alice" },
    hubSessionJwt: "jwt-1",
    walletBalance: 100,
    equippedCosmetics: [],
  };

  const coreSdk: CoreSdk = {
    getProfile: vi.fn(),
    getInventory: vi.fn(),
    reportMatchResult: vi.fn(),
    getLeaderboard: vi.fn(),
  };

  const roomState: GameTableState = {
    gameId: "game-tabletop-tic_tac_toe-2-2",
    tableId: "table-1",
    phase: "waiting",
    slots: [],
    spectators: [],
  };

  return { hubContext, coreSdk, roomState };
}

describe("TicTacToe", () => {
  it("renders the 9-cell board and the current player's username", async () => {
    render(<TicTacToe {...createProps()} />);

    expect(screen.getByText(/Alice/)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Célula/ })).toHaveLength(9);
    expect(screen.getByText(/Vez de X/)).toBeTruthy();
  });

  it("places marks alternately as cells are clicked", async () => {
    const user = userEvent.setup();
    render(<TicTacToe {...createProps()} />);

    await user.click(screen.getByLabelText("Célula 1"));
    expect(screen.getByLabelText("Célula 1").textContent).toBe("X");
    expect(screen.getByText(/Vez de O/)).toBeTruthy();

    await user.click(screen.getByLabelText("Célula 2"));
    expect(screen.getByLabelText("Célula 2").textContent).toBe("O");
    expect(screen.getByText(/Vez de X/)).toBeTruthy();
  });

  it("does not allow clicking an already occupied cell", async () => {
    const user = userEvent.setup();
    render(<TicTacToe {...createProps()} />);

    await user.click(screen.getByLabelText("Célula 1"));
    await user.click(screen.getByLabelText("Célula 1"));

    expect(screen.getByLabelText("Célula 1").textContent).toBe("X");
    expect(screen.getByText(/Vez de O/)).toBeTruthy();
  });

  it("announces the winner and disables the board once someone wins", async () => {
    const user = userEvent.setup();
    render(<TicTacToe {...createProps()} />);

    // X: 1,2,3 (top row) | O: 4,5
    await user.click(screen.getByLabelText("Célula 1"));
    await user.click(screen.getByLabelText("Célula 4"));
    await user.click(screen.getByLabelText("Célula 2"));
    await user.click(screen.getByLabelText("Célula 5"));
    await user.click(screen.getByLabelText("Célula 3"));

    expect(screen.getByText(/Vitória de X/)).toBeTruthy();
    expect((screen.getByLabelText("Célula 6") as HTMLButtonElement).disabled).toBe(true);
  });

  it("resets the board when the restart button is clicked", async () => {
    const user = userEvent.setup();
    render(<TicTacToe {...createProps()} />);

    await user.click(screen.getByLabelText("Célula 1"));
    await user.click(screen.getByRole("button", { name: "Reiniciar" }));

    expect(screen.getByLabelText("Célula 1").textContent).toBe("");
    expect(screen.getByText(/Vez de X/)).toBeTruthy();
  });
});
