import { z } from "zod";

// Sincronize com docs/project-instructions/model---possible-ini-games.ini
// (repositório raiz empirehub) sempre que o modelo do .ini mudar.

// A biblioteca `ini` já converte os literais true/false/null para os tipos nativos
// correspondentes — por isso o valor que chega aqui já é um boolean real, não a
// string "true"/"false".
const booleanValue = z.boolean();

const commaSeparatedList = z
  .string()
  .transform((value) =>
    value.trim().length === 0 || value.trim().toLowerCase() === "none" ? [] : value.split(",").map((item) => item.trim()),
  );

const integerFromString = z
  .string()
  .transform((value) => Number(value))
  .pipe(z.number().int());

export const gameConfigSchema = z.object({
  manifest_version: z.string(),
  engine_version_required: z.string(),
  config_last_updated: z.string(),

  id: z.string(),
  name_en: z.string(),
  name_pt_br: z.string(),

  requires_engine: booleanValue,
  client_entry_url: z.string(),
  thumbnail_url: z.string(),

  dependencies_shared_modules: commaSeparatedList,
  dependencies_external_libraries: commaSeparatedList,
  dependencies_styles: commaSeparatedList,

  platform: z.string(),
  genre: z.string(),
  network_architecture: z.string(),
  sync_mode: z.string(),
  save_state_supported: booleanValue,

  min_players: integerFromString,
  max_players: integerFromString,
  recommended_players: integerFromString,
  allow_spectators: booleanValue,
  max_spectators: integerFromString,
  ranked_matchmaking_enabled: booleanValue,

  description_en: z.string(),
  description_pt_br: z.string(),
  ui_layout_preset: z.string(),
  theme_variant: z.string(),

  turn_based: booleanValue,
  has_ai_opponents: booleanValue,
  turn_timeout_seconds: integerFromString,
  win_condition_type: z.string(),
  tie_breaker_rules: booleanValue,

  assets_required: commaSeparatedList,
  audio_bank_id: z.string(),
});

export type GameConfig = z.infer<typeof gameConfigSchema>;
