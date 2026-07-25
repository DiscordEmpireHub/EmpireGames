import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
// EmpireGames/game-tabletop-tic_tac_toe-2-2 -> EmpireGames -> empirehub (raiz do monorepo),
// mesmo padrão de apps/core-client/vite.config.ts — expõe VITE_ENGINE_ASSET_SERVICE_URL
// de empirehub/.env via import.meta.env.
const rootDir = path.resolve(currentDir, "..", "..");

export default defineConfig({
  envDir: rootDir,
  plugins: [react()],
  build: {
    // GameLoader (EmpireCore) faz `import(clientEntryUrl)` nativo do browser —
    // este jogo precisa compilar como um módulo ES único com `default` export
    // (o componente), não como uma app com index.html.
    lib: {
      entry: path.resolve(currentDir, "src/main.tsx"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      // React não é bundlado — assume-se a mesma instância do host (EmpireCore).
      // Compartilhamento real de instância entre o bundle do Core e o bundle
      // deste jogo (ambos carregados via <script type="module"> separados)
      // ainda não tem uma solução de import-map/externals resolvida neste
      // projeto — lacuna conhecida, fora do escopo desta tarefa (E1-E4 trata
      // da integração jogo<->Engine, não do transporte Core<->jogo).
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
  test: {
    environment: "jsdom",
  },
});
