import pc from "picocolors";

import type { ProjectConfig } from "../types";
import { cliColors } from "./cli-colors";

export function displayConfig(config: Partial<ProjectConfig>) {
  const configDisplay: string[] = [];

  if (config.projectName) {
    configDisplay.push(`${cliColors.signal("Project Name:")} ${config.projectName}`);
  }

  if (config.frontend !== undefined) {
    const frontend = Array.isArray(config.frontend) ? config.frontend : [config.frontend];
    const frontendText =
      frontend.length > 0 && frontend[0] !== undefined ? frontend.join(", ") : "none";
    configDisplay.push(`${cliColors.signal("Frontend:")} ${frontendText}`);
  }

  if (config.backend !== undefined) {
    configDisplay.push(`${cliColors.signal("Backend:")} ${String(config.backend)}`);
  }

  if (config.runtime !== undefined) {
    configDisplay.push(`${cliColors.signal("Runtime:")} ${String(config.runtime)}`);
  }

  if (config.api !== undefined) {
    configDisplay.push(`${cliColors.signal("API:")} ${String(config.api)}`);
  }

  if (config.database !== undefined) {
    configDisplay.push(`${cliColors.signal("Database:")} ${String(config.database)}`);
  }

  if (config.orm !== undefined) {
    configDisplay.push(`${cliColors.signal("ORM:")} ${String(config.orm)}`);
  }

  if (config.auth !== undefined) {
    configDisplay.push(`${cliColors.signal("Auth:")} ${String(config.auth)}`);
  }

  if (config.payments !== undefined) {
    configDisplay.push(`${cliColors.signal("Payments:")} ${config.payments.join(", ") || "none"}`);
  }
  if (config.communication !== undefined) {
    configDisplay.push(`${cliColors.signal("Communication:")} ${String(config.communication)}`);
  }

  if (config.observability !== undefined) {
    configDisplay.push(
      `${cliColors.signal("Observability:")} ${config.observability.join(", ") || "none"}`,
    );
  }

  if (config.addons !== undefined) {
    const addons = Array.isArray(config.addons) ? config.addons : [config.addons];
    const addonsText = addons.length > 0 && addons[0] !== undefined ? addons.join(", ") : "none";
    configDisplay.push(`${cliColors.signal("Addons:")} ${addonsText}`);
  }

  if (config.examples !== undefined) {
    const examples = Array.isArray(config.examples) ? config.examples : [config.examples];
    const examplesText =
      examples.length > 0 && examples[0] !== undefined ? examples.join(", ") : "none";
    configDisplay.push(`${cliColors.signal("Examples:")} ${examplesText}`);
  }

  if (config.testing !== undefined) {
    const testing = Array.isArray(config.testing) ? config.testing : [config.testing];
    const testingText =
      testing.length > 0 && testing[0] !== undefined ? testing.join(", ") : "none";
    configDisplay.push(`${cliColors.signal("Testing:")} ${testingText}`);
  }

  if (config.git !== undefined) {
    const gitText =
      typeof config.git === "boolean" ? (config.git ? "Yes" : "No") : String(config.git);
    configDisplay.push(`${cliColors.signal("Git Init:")} ${gitText}`);
  }

  if (config.packageManager !== undefined) {
    configDisplay.push(`${cliColors.signal("Package Manager:")} ${String(config.packageManager)}`);
  }

  if (config.install !== undefined) {
    const installText =
      typeof config.install === "boolean"
        ? config.install
          ? "Yes"
          : "No"
        : String(config.install);
    configDisplay.push(`${cliColors.signal("Install Dependencies:")} ${installText}`);
  }

  if (config.dbSetup !== undefined) {
    configDisplay.push(`${cliColors.signal("Database Setup:")} ${String(config.dbSetup)}`);
  }

  if (config.webDeploy !== undefined) {
    configDisplay.push(`${cliColors.signal("Web Deployment:")} ${String(config.webDeploy)}`);
  }

  if (config.serverDeploy !== undefined) {
    configDisplay.push(`${cliColors.signal("Server Deployment:")} ${String(config.serverDeploy)}`);
  }

  if (configDisplay.length === 0) {
    return pc.yellow("No configuration selected.");
  }

  return configDisplay.join("\n");
}
