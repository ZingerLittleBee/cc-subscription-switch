#!/usr/bin/env node

import { Command } from "commander";
import { switchCommand } from "./commands/switch.js";
import { addCommand } from "./commands/add.js";
import { removeCommand } from "./commands/remove.js";
import { listCommand } from "./commands/list.js";
import { whoamiCommand } from "./commands/whoami.js";

// Split process.argv on "--" to separate ccss args from claude pass-through args
const dashDashIndex = process.argv.indexOf("--");
const ownArgs =
  dashDashIndex === -1 ? process.argv : process.argv.slice(0, dashDashIndex);
const claudeArgs =
  dashDashIndex === -1 ? [] : process.argv.slice(dashDashIndex + 1);

const program = new Command();

program
  .name("ccss")
  .description("Claude Code Subscription Switch")
  .version("1.0.0");

program
  .option("-s, --select", "Force account selector even with single account")
  .action(async (options: { select?: boolean }) => {
    await switchCommand(claudeArgs, options.select);
  });

program
  .command("add <name>")
  .description("Add a new account")
  .action(async (name: string) => {
    await addCommand(name);
  });

program
  .command("remove <name>")
  .description("Remove an account")
  .action(async (name: string) => {
    await removeCommand(name);
  });

program
  .command("list")
  .description("List all accounts")
  .action(async () => {
    await listCommand();
  });

program
  .command("whoami")
  .description("Show current account")
  .action(async () => {
    await whoamiCommand();
  });

program.parse(ownArgs);
