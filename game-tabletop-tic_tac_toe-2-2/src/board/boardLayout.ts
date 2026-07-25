// Geometria fixa do canvas Phaser deste jogo. Sem lib de layout responsivo —
// canvas de tamanho fixo, ver Lacuna conhecida em README.md sobre escala.
export const BOARD_SIZE_PX = 480;
export const HUD_WIDTH_PX = 640;
export const HUD_HEIGHT_PX = 160;
export const HUD_GAP_PX = 20;

export const CANVAS_WIDTH_PX = HUD_WIDTH_PX;
export const CANVAS_HEIGHT_PX = BOARD_SIZE_PX + HUD_GAP_PX + HUD_HEIGHT_PX;

const BOARD_OFFSET_X_PX = (CANVAS_WIDTH_PX - BOARD_SIZE_PX) / 2;
const BOARD_OFFSET_Y_PX = 0;
const CELL_SIZE_PX = BOARD_SIZE_PX / 3;

export const BOARD_CENTER = {
  x: BOARD_OFFSET_X_PX + BOARD_SIZE_PX / 2,
  y: BOARD_OFFSET_Y_PX + BOARD_SIZE_PX / 2,
};

export const HUD_CENTER = {
  x: CANVAS_WIDTH_PX / 2,
  y: BOARD_SIZE_PX + HUD_GAP_PX + HUD_HEIGHT_PX / 2,
};

export function cellCenter(cellIndex: number): { x: number; y: number } {
  const col = cellIndex % 3;
  const row = Math.floor(cellIndex / 3);
  return {
    x: BOARD_OFFSET_X_PX + col * CELL_SIZE_PX + CELL_SIZE_PX / 2,
    y: BOARD_OFFSET_Y_PX + row * CELL_SIZE_PX + CELL_SIZE_PX / 2,
  };
}

/** Retângulo do overlay DOM clicável (percentual do canvas) para uma célula. */
export function cellOverlayRect(cellIndex: number): { leftPct: number; topPct: number; widthPct: number; heightPct: number } {
  const col = cellIndex % 3;
  const row = Math.floor(cellIndex / 3);
  return {
    leftPct: ((BOARD_OFFSET_X_PX + col * CELL_SIZE_PX) / CANVAS_WIDTH_PX) * 100,
    topPct: ((BOARD_OFFSET_Y_PX + row * CELL_SIZE_PX) / CANVAS_HEIGHT_PX) * 100,
    widthPct: (CELL_SIZE_PX / CANVAS_WIDTH_PX) * 100,
    heightPct: (CELL_SIZE_PX / CANVAS_HEIGHT_PX) * 100,
  };
}
