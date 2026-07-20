import type { CoreSdk, InventoryItem, LeaderboardEntry, MatchResult, UserProfile } from "../types";

// Facade fina sobre o CoreSdk injetado pelo GameLoader do EmpireCore. Nunca chame a API
// do Core diretamente daqui — o coreSdk já resolve autenticação (hubSessionJwt) e endpoints.
export class CoreService {
  constructor(private readonly coreSdk: CoreSdk) {}

  getProfile(): Promise<UserProfile> {
    return this.coreSdk.getProfile();
  }

  getInventory(): Promise<InventoryItem[]> {
    return this.coreSdk.getInventory();
  }

  reportMatchResult(result: MatchResult): Promise<void> {
    return this.coreSdk.reportMatchResult(result);
  }

  getLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
    return this.coreSdk.getLeaderboard(gameId);
  }
}
