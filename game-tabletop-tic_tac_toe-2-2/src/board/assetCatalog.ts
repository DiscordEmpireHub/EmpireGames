// Mapeia o tema visual escolhido para os assetIds reais registrados no
// asset-service (ver EmpireEngine/docs/ASSET-DEVELOPMENT-PLAN.md, Fase 0+1).
export type Theme = "classic" | "modern_minimal" | "cyber_neon";

// sfx_turn_pass/match_win/match_lose/match_draw/ui_click usam variantes
// _classic/_modern/_cyber, enquanto sfx_piece_place usa variantes de material
// físico (_wood/_metal/_neon) — ver example-assets.md Seção 3.
const SFX_THEME_VARIANT: Record<Theme, "classic" | "modern" | "cyber"> = {
  classic: "classic",
  modern_minimal: "modern",
  cyber_neon: "cyber",
};

const PIECE_PLACE_VARIANT: Record<Theme, "wood" | "metal" | "neon"> = {
  classic: "wood",
  modern_minimal: "metal",
  cyber_neon: "neon",
};

export interface AssetCatalog {
  board: string;
  markX: string;
  markO: string;
  hud: string;
  piecePlace: string;
  turnPass: string;
  matchWin: string;
  matchLose: string;
  matchDraw: string;
  uiClick: string;
}

export function buildAssetCatalog(theme: Theme): AssetCatalog {
  const sfxVariant = SFX_THEME_VARIANT[theme];
  return {
    board: `grid_board_matrix_${theme}`,
    markX: `marker_symbol_x_${theme}`,
    markO: `marker_symbol_o_${theme}`,
    hud: `ui_hud_frame_panel_${theme}`,
    piecePlace: `sfx_piece_place_${PIECE_PLACE_VARIANT[theme]}`,
    turnPass: `sfx_turn_pass_${sfxVariant}`,
    matchWin: `sfx_match_win_${sfxVariant}`,
    matchLose: `sfx_match_lose_${sfxVariant}`,
    matchDraw: `sfx_match_draw_${sfxVariant}`,
    uiClick: `sfx_ui_click_${sfxVariant}`,
  };
}
