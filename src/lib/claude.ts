import { execSync, spawn } from "node:child_process";

/**
 * Check if the `claude` CLI command is installed and available in PATH.
 */
export function checkClaudeInstalled(): Promise<boolean> {
  try {
    execSync("which claude", { stdio: "ignore" });
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

/**
 * Spawn the `claude` CLI with a custom config directory and pass-through args.
 * stdio is inherited so that Claude's TUI works in the terminal.
 * Returns a Promise that resolves with the child process exit code.
 */
export function spawnClaude(configDir: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, {
      env: {
        ...process.env,
        CLAUDE_CONFIG_DIR: configDir,
      },
      stdio: "inherit",
    });

    const forwardSignal = (signal: NodeJS.Signals) => {
      child.kill(signal);
    };

    process.on("SIGINT", forwardSignal);
    process.on("SIGTERM", forwardSignal);

    child.on("close", (code) => {
      process.removeListener("SIGINT", forwardSignal);
      process.removeListener("SIGTERM", forwardSignal);
      resolve(code ?? 1);
    });

    child.on("error", (err) => {
      process.removeListener("SIGINT", forwardSignal);
      process.removeListener("SIGTERM", forwardSignal);
      reject(err);
    });
  });
}

/**
 * Spawn `claude login` with the given config directory.
 */
export function spawnClaudeLogin(configDir: string): Promise<number> {
  return spawnClaude(configDir, ["login"]);
}

/**
 * Spawn `claude auth whoami` with the given config directory.
 */
export function spawnClaudeWhoami(configDir: string): Promise<number> {
  return spawnClaude(configDir, ["auth", "whoami"]);
}
