import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.js";

/**
 * Writes the README.md and the Java solution to the problem folder.
 *
 * @param {string} folderPath   Absolute path to the problem folder (already created)
 * @param {string} readmeContent  Markdown content for README.md
 * @param {string} javaCode       Raw Java source code
 * @param {string} javaFileName   e.g. "AngleBetweenHandsOfAClock.java"
 * @returns {{ readmePath: string, javaPath: string }}
 */
export function saveFiles(folderPath, readmeContent, javaCode, javaFileName) {
  // Validate
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Cannot save files — folder does not exist: ${folderPath}`);
  }

  const readmePath = path.join(folderPath, "README.md");
  const javaPath = path.join(folderPath, javaFileName);

  // Write README
  fs.writeFileSync(readmePath, readmeContent, "utf-8");
  logger.success(`Saved: ${readmePath}`);

  // Write Java file
  fs.writeFileSync(javaPath, javaCode, "utf-8");
  logger.success(`Saved: ${javaPath}`);

  return { readmePath, javaPath };
}
