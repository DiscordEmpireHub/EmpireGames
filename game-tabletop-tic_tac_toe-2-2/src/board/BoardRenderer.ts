import type { Cell } from "../../server/GameLogic";
import type { EngineService } from "../services/EngineService";
import { cellCenter } from "./boardLayout";

const markObjectId = (cellIndex: number): string => `mark-${cellIndex}`;

/**
 * Sincroniza os sprites de marca (X/O) renderizados no canvas com o board
 * autoritativo vindo do servidor. Faz diff célula a célula — só renderiza o
 * que mudou desde a última chamada, nunca redesenha o tabuleiro inteiro.
 */
export class BoardRenderer {
  private readonly renderedMarks = new Map<number, Cell>();

  constructor(
    private readonly engineService: EngineService,
    private readonly markAssetIds: { X: string; O: string },
  ) {}

  syncMarks(board: readonly Cell[]): void {
    board.forEach((cell, index) => this.syncCell(index, cell));
  }

  private syncCell(index: number, cell: Cell): void {
    const previous = this.renderedMarks.get(index) ?? null;
    if (previous === cell) return;

    if (cell === null) {
      this.engineService.destroyObject(markObjectId(index));
      this.renderedMarks.delete(index);
      return;
    }

    const { x, y } = cellCenter(index);
    this.engineService.render({ objectId: markObjectId(index), assetId: this.markAssetIds[cell], x, y });
    this.renderedMarks.set(index, cell);
  }
}
