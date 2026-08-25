import path from "node:path";

import { isCancel, TextPrompt } from "@clack/core";
import fs from "fs-extra";
import pc from "picocolors";

import { DEFAULT_CONFIG } from "../constants";
import { ProjectNameSchema } from "../types";
import { cliColors } from "../utils/cli-colors";
import { UserCancelledError } from "../utils/errors";
import { cliConsola } from "../utils/terminal-output";

const S_BAR = "│";
const S_BAR_END = "└";
const S_STEP_ACTIVE = "◆";

function kuboText(options: {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  initialValue?: string;
  validate: (value: unknown) => string | undefined;
}) {
  return new TextPrompt({
    validate: options.validate,
    placeholder: options.placeholder,
    defaultValue: options.defaultValue,
    initialValue: options.initialValue,
    render() {
      const title = `${cliColors.signal(S_BAR)}\n${cliColors.bright(S_STEP_ACTIVE)}  ${options.message}\n`;
      const placeholder = options.placeholder ? pc.dim(options.placeholder) : pc.dim("_");
      const input = this.userInput ? this.userInputWithCursor : placeholder;
      const value = this.value ?? "";

      switch (this.state) {
        case "error": {
          const error = this.error ? `  ${pc.yellow(this.error)}` : "";
          return `${title.trim()}\n${cliColors.signal(S_BAR)}  ${input}\n${pc.yellow(S_BAR_END)}${error}\n`;
        }
        case "submit":
          return `${title}${pc.gray(S_BAR)}${value ? `  ${pc.dim(value)}` : ""}`;
        case "cancel":
          return `${title}${pc.gray(S_BAR)}${value ? `  ${pc.strikethrough(pc.dim(value))}` : ""}${value.trim() ? `\n${pc.gray(S_BAR)}` : ""}`;
        default:
          return `${title}${cliColors.signal(S_BAR)}  ${input}\n${cliColors.signal(S_BAR_END)}\n`;
      }
    },
  }).prompt();
}

function isPathWithinCwd(targetPath: string) {
  const resolved = path.resolve(targetPath);
  const rel = path.relative(process.cwd(), resolved);
  return !rel.startsWith("..") && !path.isAbsolute(rel);
}

function validateDirectoryName(name: string) {
  if (name === ".") return undefined;

  const result = ProjectNameSchema.safeParse(name);
  if (!result.success) {
    return result.error.issues[0]?.message || "Invalid project name";
  }
  return undefined;
}

export async function getProjectName(initialName?: string): Promise<string> {
  if (initialName) {
    if (initialName === ".") {
      return initialName;
    }
    const finalDirName = path.basename(initialName);
    const validationError = validateDirectoryName(finalDirName);
    if (!validationError) {
      const projectDir = path.resolve(process.cwd(), initialName);
      if (isPathWithinCwd(projectDir)) {
        return initialName;
      }
      cliConsola.error(pc.red("Project path must be within current directory"));
    }
  }

  let isValid = false;
  let projectPath = "";
  let defaultName: string = DEFAULT_CONFIG.projectName;
  let counter = 1;

  while (
    (await fs.pathExists(path.resolve(process.cwd(), defaultName))) &&
    (await fs.readdir(path.resolve(process.cwd(), defaultName))).length > 0
  ) {
    defaultName = `${DEFAULT_CONFIG.projectName}-${counter}`;
    counter++;
  }

  while (!isValid) {
    const response = await kuboText({
      message: "Enter your project name or path (relative to current directory)",
      placeholder: defaultName,
      initialValue: initialName,
      defaultValue: defaultName,
      validate: (value) => {
        const nameToUse = String(value ?? "").trim() || defaultName;

        const finalDirName = path.basename(nameToUse);
        const validationError = validateDirectoryName(finalDirName);
        if (validationError) return validationError;

        if (nameToUse !== ".") {
          const projectDir = path.resolve(process.cwd(), nameToUse);
          if (!isPathWithinCwd(projectDir)) {
            return "Project path must be within current directory";
          }
        }

        return undefined;
      },
    });

    if (isCancel(response)) {
      throw new UserCancelledError({ message: "Operation cancelled." });
    }

    projectPath = response || defaultName;
    isValid = true;
  }

  return projectPath;
}
