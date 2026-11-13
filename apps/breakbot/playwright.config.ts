import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 60_000,
	use: {
		baseURL: "http://localhost:3000",
		viewport: { width: 400, height: 780 },
		launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
	},
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: true,
		timeout: 120_000,
	},
});
