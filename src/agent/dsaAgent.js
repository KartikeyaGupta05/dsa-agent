/**
 * dsaAgent.js
 *
 * The brain of the operation. It coordinates all tools in the correct order
 * and provides structured logging so the user can follow every step.
 *
 * Pipeline:
 *  1. readJavaFile    – read / validate the Java solution
 *  2. scrapeProblem   – fetch problem data from LeetCode + classify topic
 *  3. createProblemFolder – create directory inside the repo
 *  4. generateReadme  – produce README.md via Gemini
 *  5. saveFiles       – write README.md and .java to disk
 *  6. gitPush         – git add → commit → push
 */

import { readJavaFile } from "../tools/readJavaFile.js";
import { scrapeProblem } from "../tools/scrapeProblem.js";
import { generateReadme } from "../tools/generateReadme.js";
import { createProblemFolder } from "../tools/createProblemFolder.js";
import { saveFiles } from "../tools/saveFiles.js";
import { gitPush } from "../tools/gitPush.js";
import { logger } from "../utils/logger.js";

/**
 * Pretty-prints a summary box at the end of the run.
 *
 * @param {object} problem
 * @param {string} folderPath
 */
function printSummary(problem, folderPath) {
  console.log("\n" + "=".repeat(60));
  logger.success("🎉  DSA Agent completed successfully!");
  console.log("=".repeat(60));
  console.log(`  Problem  : [${problem.id}] ${problem.title}`);
  console.log(`  Difficulty: ${problem.difficulty}`);
  console.log(`  Topic    : ${problem.topic}`);
  console.log(`  Folder   : ${folderPath}`);
  console.log("=".repeat(60) + "\n");
}

/**
 * Main agent function.
 *
 * @param {object} inputs
 * @param {string} inputs.leetcodeUrl  The LeetCode problem URL
 * @param {string} inputs.javaInput    File path or raw Java code
 * @param {object} [options]
 * @param {boolean} [options.skipGit]  If true, skips the git push step
 */
export async function runDsaAgent(inputs, options = {}) {
  const { leetcodeUrl, javaInput } = inputs;
  const { skipGit = false } = options;

  console.log("\n" + "=".repeat(60));
  logger.agent("🤖  DSA Agent starting…");
  console.log("=".repeat(60) + "\n");

  // ──────────────────────────────────────────────
  // STEP 1 — Read Java file / code
  // ──────────────────────────────────────────────
  logger.step("[1/6] Reading Java solution…");
  const { code: javaCode, fileName: javaFileName } = readJavaFile(javaInput);
  logger.success(`Java file ready: ${javaFileName}`);

  // ──────────────────────────────────────────────
  // STEP 2 — Scrape problem + classify topic
  // ──────────────────────────────────────────────
  logger.step("[2/6] Fetching problem from LeetCode…");
  const problem = await scrapeProblem(leetcodeUrl);

  // ──────────────────────────────────────────────
  // STEP 3 — Create folder
  // ──────────────────────────────────────────────
  logger.step("[3/6] Creating problem folder…");
  const folderPath = createProblemFolder(problem);

  // ──────────────────────────────────────────────
  // STEP 4 — Generate README
  // ──────────────────────────────────────────────
  logger.step("[4/6] Generating README.md…");
  const readmeContent = await generateReadme(problem, javaCode);

  // ──────────────────────────────────────────────
  // STEP 5 — Save files
  // ──────────────────────────────────────────────
  logger.step("[5/6] Saving files to disk…");
  saveFiles(folderPath, readmeContent, javaCode, javaFileName);

  // ──────────────────────────────────────────────
  // STEP 6 — Git push
  // ──────────────────────────────────────────────
  if (skipGit) {
    logger.warn("[6/6] Git push skipped (--no-git flag).");
  } else {
    logger.step("[6/6] Committing and pushing to GitHub…");
    gitPush(problem);
  }

  printSummary(problem, folderPath);
}
