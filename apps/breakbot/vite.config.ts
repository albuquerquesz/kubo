import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// O hash do commit vira a propriedade `build` dos eventos e a release dos source maps.
const readBuildSha = () => {
	try {
		return execSync("git rev-parse --short HEAD").toString().trim();
	} catch {
		return "dev";
	}
};

process.env.VITE_BUILD_SHA ??= readBuildSha();
process.env.VITE_APP_VERSION ??= JSON.parse(readFileSync("package.json", "utf8")).version;

export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [tailwindcss(), tanstackStart(), viteReact()],
	// Mapas gerados sem referência no bundle; o passo de upload envia ao PostHog e apaga.
	build: { sourcemap: "hidden" },
});
