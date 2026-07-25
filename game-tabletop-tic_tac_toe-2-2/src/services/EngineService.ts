import type { GameEngine } from "@empire/engine-core";
import type { AnimateParams, AssetDescriptor, PlaySoundOptions, RenderParams } from "@empire/engine-types";

// Facade fina sobre o GameEngine real (@empire/engine-phaser-adapter, instanciado
// em main.tsx). Deduplicação de loadAsset segue o mesmo padrão do template
// (EmpireGamesDevelopment/template/my-game/src/services/EngineService.ts) —
// aqui usamos os pacotes reais linkados via `file:` (ver package.json) em vez
// de tipos espelhados, já que este jogo tem link de workspace com a Engine.
export class EngineService {
  private readonly loadedAssetIds = new Set<string>();
  private readonly pendingLoads = new Map<string, Promise<void>>();

  constructor(private readonly engine: GameEngine) {}

  async loadAsset(descriptor: AssetDescriptor): Promise<void> {
    if (this.loadedAssetIds.has(descriptor.assetId)) return;

    const pending = this.pendingLoads.get(descriptor.assetId);
    if (pending) return pending;

    const loadPromise = this.engine.loadAsset(descriptor).then(() => {
      this.loadedAssetIds.add(descriptor.assetId);
    });

    this.pendingLoads.set(descriptor.assetId, loadPromise);
    return loadPromise;
  }

  render(params: RenderParams): void {
    this.engine.render(params);
  }

  play(options: PlaySoundOptions): void {
    this.engine.play(options);
  }

  animate(params: AnimateParams): void {
    this.engine.animate(params);
  }

  destroyObject(objectId: string): void {
    this.engine.destroyObject(objectId);
  }

  onSceneReady(listener: () => void): () => void {
    return this.engine.onSceneReady(listener);
  }

  onObjectClick(objectId: string, listener: () => void): () => void {
    return this.engine.onObjectClick(objectId, listener);
  }

  destroy(): void {
    this.engine.destroy();
  }
}
