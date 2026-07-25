import { useEffect, useRef, useState } from "react";
import { PhaserGameEngine } from "@empire/engine-phaser-adapter";
import { BoardRenderer } from "../board/BoardRenderer";
import { buildAssetCatalog, type AssetCatalog, type Theme } from "../board/assetCatalog";
import { BOARD_CENTER, CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, HUD_CENTER } from "../board/boardLayout";
import { EngineService } from "../services/EngineService";

export type EngineStatus = "loading" | "ready" | "error";

function resolveAssetServiceBaseUrl(): string {
  const base = import.meta.env.VITE_ENGINE_ASSET_SERVICE_URL as string | undefined;
  if (!base) {
    throw new Error("VITE_ENGINE_ASSET_SERVICE_URL não configurada — obrigatória para este jogo (requires_engine=true).");
  }
  return base;
}

function assetUrl(assetId: string): string {
  return `${resolveAssetServiceBaseUrl()}/assets/${assetId}`;
}

async function initializeScene(engineService: EngineService, assets: AssetCatalog): Promise<void> {
  const visualAssets = [assets.board, assets.markX, assets.markO, assets.hud];
  const audioAssets = [assets.piecePlace, assets.turnPass, assets.matchWin, assets.matchLose, assets.matchDraw, assets.uiClick];

  await Promise.all(visualAssets.map((assetId) => engineService.loadAsset({ assetId, category: "sprite", url: assetUrl(assetId) })));
  await Promise.all(audioAssets.map((assetId) => engineService.loadAsset({ assetId, category: "audio", url: assetUrl(assetId) })));

  engineService.render({ objectId: "board-background", assetId: assets.board, x: BOARD_CENTER.x, y: BOARD_CENTER.y });
  engineService.render({ objectId: "hud-panel", assetId: assets.hud, x: HUD_CENTER.x, y: HUD_CENTER.y });
}

interface EngineLifecycle {
  containerRef: React.RefObject<HTMLDivElement>;
  status: EngineStatus;
  errorMessage: string | null;
  engineServiceRef: React.RefObject<EngineService | null>;
  boardRendererRef: React.RefObject<BoardRenderer | null>;
}

export function useEngineLifecycle(theme: Theme): EngineLifecycle {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineServiceRef = useRef<EngineService | null>(null);
  const boardRendererRef = useRef<BoardRenderer | null>(null);
  const [status, setStatus] = useState<EngineStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    const assets = buildAssetCatalog(theme);
    const engine = new PhaserGameEngine({ parent: containerRef.current, width: CANVAS_WIDTH_PX, height: CANVAS_HEIGHT_PX });
    const engineService = new EngineService(engine);

    const unsubscribe = engine.onSceneReady(() => {
      initializeScene(engineService, assets)
        .then(() => {
          if (cancelled) return;
          boardRendererRef.current = new BoardRenderer(engineService, { X: assets.markX, O: assets.markO });
          engineServiceRef.current = engineService;
          setStatus("ready");
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar assets da Engine.");
          setStatus("error");
        });
    });

    return () => {
      cancelled = true;
      unsubscribe();
      engineService.destroy();
      engineServiceRef.current = null;
      boardRendererRef.current = null;
    };
  }, [theme]);

  return { containerRef, status, errorMessage, engineServiceRef, boardRendererRef };
}
