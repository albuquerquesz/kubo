// Envia os source maps do cliente ao PostHog (error tracking) e apaga os .map do build.
// Só envia com POSTHOG_CLI_API_KEY e POSTHOG_CLI_PROJECT_ID no ambiente; sem eles, só apaga.
import { execFileSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIRECTORY = "dist/client";
const RELEASE_NAME = "breakbot";

const sourcemapsIn = (directory) =>
	readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".map"))
		.map((entry) => join(entry.parentPath, entry.name));

const posthogCli = (...args) =>
	execFileSync("npx", ["-y", "@posthog/cli", ...args], { stdio: "inherit" });

const releaseVersion = () =>
	process.env.VITE_BUILD_SHA ??
	execFileSync("git", ["rev-parse", "--short", "HEAD"]).toString().trim();

const upload = () => {
	const release = ["--release-name", RELEASE_NAME, "--release-version", releaseVersion()];
	posthogCli("sourcemap", "inject", "--directory", CLIENT_DIRECTORY, ...release);
	posthogCli("sourcemap", "upload", "--directory", CLIENT_DIRECTORY, ...release);
};

const hasCredentials = Boolean(
	process.env.POSTHOG_CLI_API_KEY && process.env.POSTHOG_CLI_PROJECT_ID,
);

if (hasCredentials) upload();
if (!hasCredentials) console.info("[sourcemaps] sem credencial da CLI do PostHog: upload pulado");

const maps = sourcemapsIn(CLIENT_DIRECTORY);
for (const map of maps) rmSync(map);
console.info(`[sourcemaps] ${maps.length} arquivos .map removidos do build público`);
