import { execSync } from "child_process";
import { logger } from "../utils/logger.js";

/**
 * Executes a shell command synchronously inside `cwd`.
 * Throws a readable error on non-zero exit.
 *
 * @param {string} command
 * @param {string} cwd
 * @returns {string}  stdout
 */
function run(command, cwd) {
  logger.info(`  $ ${command}`);
  try {
    const output = execSync(command, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60_000,
    });
    if (output.trim()) {
      console.log("   ", output.trim());
    }
    return output;
  } catch (err) {
    const stderr = err.stderr?.toString().trim() || "";
    const stdout = err.stdout?.toString().trim() || "";
    throw new Error(
      `Command failed: ${command}\n` +
        `stdout: ${stdout}\n` +
        `stderr: ${stderr}`
    );
  }
}

/**
 * Stages all changes, commits, and pushes to origin/<branch>.
 *
 * @param {object} problem  { id, title }
 * @returns {void}
 */
export function gitPush(problem) {
  const repoPath = process.env.PLACEMENT_REPO_PATH;
  if (!repoPath) {
    throw new Error("PLACEMENT_REPO_PATH is not set in .env.");
  }

  const branch = process.env.GIT_BRANCH || "main";
  const commitMsg = `Add ${problem.id} ${problem.title}`;

  logger.step("Running git operations…");

  try {
    // Verify this is a git repo
    run("git rev-parse --is-inside-work-tree", repoPath);
  } catch {
    throw new Error(
      `${repoPath} is not a git repository. ` +
        `Run "git init" there first, or check PLACEMENT_REPO_PATH in .env.`
    );
  }

  run("git add .", repoPath);

  // Check if there's actually something to commit
  try {
    run('git diff --cached --quiet --exit-code || echo "changes"', repoPath);
  } catch {
    // diff returns non-zero when there ARE changes — that's fine
  }

  try {
    run(`git commit -m "${commitMsg}"`, repoPath);
  } catch (err) {
    if (
      err.message.includes("nothing to commit") ||
      err.message.includes("nothing added")
    ) {
      logger.warn("Nothing new to commit — files may already be tracked.");
      return;
    }
    throw err;
  }

  run(`git push origin ${branch}`, repoPath);

  logger.success(`Committed and pushed: "${commitMsg}" → origin/${branch}`);
}
