// Mirror local dos contratos publicados por EmpireCore (@empire/shared-types).
// Esses pacotes são privados (private: true) e não publicados no momento —
// sincronize manualmente com o código-fonte real se ele mudar (ver
// EmpireGamesDevelopment/GAME-DEVELOPMENT-GUIDE.md#lacunas-conhecidas).

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
}

export interface HubSessionPayload {
  userId: string;
  username: string;
}

export interface HubContext {
  user: HubSessionPayload;
  hubSessionJwt: string;
  walletBalance: number;
  equippedCosmetics: InventoryItem[];
}

export interface PlayerSlot {
  slotId: string;
  userId: string;
  username: string;
  isOccupied: boolean;
}

export interface Spectator {
  sessionId: string;
  userId: string;
  username: string;
}

export interface GameTableState {
  gameId: string;
  tableId: string;
  phase: string;
  slots: PlayerSlot[];
  spectators: Spectator[];
  /** JSON serializado do TicTacToeState autoritativo (ver server/GameLogic.ts). */
  gameStateJson: string;
}

export interface UserProfile {
  userId: string;
  username: string;
}

export interface MatchResult {
  gameId: string;
  tableId: string;
  winnerUserIds: string[];
  loserUserIds: string[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
}

export interface CoreSdk {
  getProfile(): Promise<UserProfile>;
  getInventory(): Promise<InventoryItem[]>;
  reportMatchResult(result: MatchResult): Promise<void>;
  getLeaderboard(gameId: string): Promise<LeaderboardEntry[]>;
}

export interface GameModuleProps {
  hubContext: HubContext;
  coreSdk: CoreSdk;
  roomState: GameTableState;
  /** Envia uma ação de jogo para o servidor autoritativo (GameTableRoom via Colyseus). */
  sendGameAction: (action: unknown) => void;
}
