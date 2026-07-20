import { readFileSync } from "node:fs";
import ini from "ini";
import { gameConfigSchema, type GameConfig } from "./gameConfig";

export class GameConfigMissingSectionError extends Error {
  constructor(path: string) {
    super(`game.ini at ${path} has no top-level section`);
    this.name = "GameConfigMissingSectionError";
  }
}

export class GameConfigSectionMismatchError extends Error {
  constructor(sectionName: string, id: string) {
    super(`game.ini section "${sectionName}" does not match id "${id}"`);
    this.name = "GameConfigSectionMismatchError";
  }
}

// Le e valida o game.ini obrigatorio na raiz do jogo. O nome da secao deve bater
// exatamente com o campo `id` dentro dela.
export function loadGameConfig(path: string): GameConfig {
  const raw = readFileSync(path, "utf-8");
  const parsed = ini.parse(raw) as Record<string, unknown>;
  const entries = Object.entries(parsed);

  const [sectionName, sectionValue] = entries[0] ?? [];
  if (!sectionName || !sectionValue) {
    throw new GameConfigMissingSectionError(path);
  }

  const config = gameConfigSchema.parse(sectionValue);

  if (config.id !== sectionName) {
    throw new GameConfigSectionMismatchError(sectionName, config.id);
  }

  return config;
}
