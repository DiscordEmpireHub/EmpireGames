import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { GameConfigMissingSectionError, GameConfigSectionMismatchError, loadGameConfig } from "./loadGameConfig";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(configDir, "__fixtures__");
const realGameIniPath = path.join(configDir, "..", "game.ini");

describe("loadGameConfig", () => {
  it("parses the game's own game.ini into a typed GameConfig", () => {
    const config = loadGameConfig(realGameIniPath);

    expect(config.id).toBe("game-tabletop-tic_tac_toe-2-2");
    expect(config.name_pt_br).toBe("Jogo da Velha");
    expect(config.min_players).toBe(2);
    expect(config.max_players).toBe(2);
    expect(config.requires_engine).toBe(true);
    expect(config.turn_based).toBe(true);
    expect(config.dependencies_shared_modules).toEqual(["core-sdk"]);
    expect(config.assets_required).toEqual([
      "grid_board_matrix_classic",
      "marker_symbol_x_classic",
      "marker_symbol_o_classic",
      "ui_hud_frame_panel_classic",
      "sfx_piece_place_wood",
      "sfx_turn_pass_classic",
      "sfx_match_win_classic",
      "sfx_match_lose_classic",
      "sfx_match_draw_classic",
      "sfx_ui_click_classic",
    ]);
  });

  it("throws GameConfigSectionMismatchError when id does not match the section name", () => {
    expect(() => loadGameConfig(path.join(fixturesDir, "mismatched-id.ini"))).toThrow(GameConfigSectionMismatchError);
  });

  it("throws GameConfigMissingSectionError when the file has no section", () => {
    expect(() => loadGameConfig(path.join(fixturesDir, "empty.ini"))).toThrow(GameConfigMissingSectionError);
  });
});
