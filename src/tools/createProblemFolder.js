import fs from "fs";
import path from "path";
import { buildFolderName } from "../utils/slugify.js";
import { logger } from "../utils/logger.js";
import store from "../config/store.js";

/**
 * Returns the absolute path to the problem folder.
 *
 * Layout:
 *   <PLACEMENT_REPO_PATH>/dsa/<topic>/<id>-<slug>/
 *
 * @param {object} problem  { id, title, topic }
 * @returns {string}
 */
export function resolveProblemPath(problem) {
  const repoPath = store.get("placementRepoPath") || process.env.PLACEMENT_REPO_PATH;
  if (!repoPath) {
    throw new Error(
      "PLACEMENT_REPO_PATH is not set in .env. " +
        "Please copy .env.example to .env and set the path."
    );
  }

  const folderName = buildFolderName(problem.id, problem.title);
  return path.join(repoPath, "dsa", problem.topic, folderName);
}

/**
 * Creates the problem folder (and any parent directories) on disk.
 * Throws if the folder already exists to prevent accidental overwrites.
 *
 * @param {object} problem  { id, title, topic }
 * @returns {string}  Absolute path to the newly-created folder
 */
export function createProblemFolder(problem) {
  const folderPath = resolveProblemPath(problem);

  if (fs.existsSync(folderPath)) {
    throw new Error(
      `Folder already exists: ${folderPath}\n` +
        `If you want to overwrite it, delete the folder first and re-run.`
    );
  }

  fs.mkdirSync(folderPath, { recursive: true });
  logger.success(`Created folder: ${folderPath}`);
  return folderPath;
}
