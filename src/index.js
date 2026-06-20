/**
 * index.js — CLI entry point for the DSA Agent
 *
 * Usage:
 *   npm start              → interactive prompts
 *   npm start -- --no-git  → skip git push (useful for dry runs)
 */

import "dotenv/config";
import readlineSync from "readline-sync";
import { runDsaAgent } from "./agent/dsaAgent.js";
import { logger } from "./utils/logger.js";

function printBanner() {
  console.clear();
  console.log("\x1b[35m");
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║        🚀  DSA Agent  v1.0.0                 ║");
  console.log("║   Automate your LeetCode DSA repository      ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("\x1b[0m");
}

function validateUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return "URL cannot be empty.";
  if (!trimmed.startsWith("http")) return "URL must start with http/https.";
  if (!trimmed.includes("leetcode.com/problems/")) {
    return "URL must be a LeetCode problem URL (e.g. https://leetcode.com/problems/two-sum).";
  }
  return true;
}

function validateJavaInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return "Java file path or code cannot be empty.";
  return true;
}

function prompt() {
  console.log(
    "Enter the LeetCode problem URL and your Java solution.\n" +
      "For the Java input you can provide:\n" +
      "  • An absolute file path  e.g.  D:/temp/TwoSum.java\n" +
      "  • Raw Java code pasted directly\n",
  );

  const leetcodeUrl = readlineSync.question("LeetCode URL: ", {
    limit: validateUrl,
    limitMessage: "\x1b[31mInvalid URL.\x1b[0m Please try again.",
  });

  console.log(
    "\nJava File Path or Java Code (paste code on one line, or enter a path):",
  );

  let javaInput = readlineSync.question("→ ", {
    limit: validateJavaInput,
    limitMessage: "\x1b[31mInput cannot be empty.\x1b[0m Please try again.",
  });

  javaInput = javaInput.trim().replace(/^"|"$/g, "");

  return { leetcodeUrl: leetcodeUrl.trim(), javaInput: javaInput.trim() };
}

async function main() {
  printBanner();

  const skipGit = process.argv.includes("--no-git");
  if (skipGit) {
    logger.warn("Running in DRY-RUN mode — git push will be skipped.\n");
  }

  const inputs = prompt();

  try {
    await runDsaAgent(inputs, { skipGit });
    process.exit(0);
  } catch (err) {
    console.error("\n");
    logger.error("Agent encountered a fatal error:");
    logger.error(err.message);

    // Print stack trace only in debug mode
    if (process.env.DEBUG === "true") {
      console.error(err.stack);
    }

    process.exit(1);
  }
}

main();
