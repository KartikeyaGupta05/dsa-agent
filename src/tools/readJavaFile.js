import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.js";

/**
 * Reads a Java source file from disk.
 *
 * @param {string} filePath  Absolute or relative path to a .java file.
 * @returns {{ code: string, fileName: string }}
 */
function readFromDisk(filePath) {
  const resolved = path.resolve(filePath.trim());

  if (!fs.existsSync(resolved)) {
    throw new Error(`Java file not found: ${resolved}`);
  }

  const ext = path.extname(resolved).toLowerCase();
  if (ext !== ".java") {
    throw new Error(`Expected a .java file, got: ${ext}`);
  }

  const code = fs.readFileSync(resolved, "utf-8");
  const fileName = path.basename(resolved);

  logger.success(`Java file read from disk: ${fileName}`);
  return { code, fileName };
}

/**
 * Parses the public class name from raw Java code to derive the file name.
 * Falls back to "Solution.java" if nothing is found.
 *
 * @param {string} code  Raw Java source code.
 * @returns {string}
 */
function deriveFileNameFromCode(code) {
  // Match: public class Foo  OR  class Foo
  const match = code.match(/(?:public\s+)?class\s+(\w+)/);
  return match ? `${match[1]}.java` : "Solution.java";
}

/**
 * Main entry-point.
 *
 * Accepts either:
 *  - An absolute/relative file path ending in .java
 *  - Raw Java source code (multi-line string)
 *
 * @param {string} input  File path OR raw Java code.
 * @returns {{ code: string, fileName: string }}
 */
export function readJavaFile(input) {
  const trimmed = input.trim();

  // Heuristic: if the input looks like a path (no newlines, ends in .java or
  // contains a path separator), try to read it from disk.
  const looksLikePath =
    !trimmed.includes("\n") &&
    (trimmed.endsWith(".java") ||
      trimmed.includes("/") ||
      trimmed.includes("\\"));

  if (looksLikePath) {
    return readFromDisk(trimmed);
  }

  // Otherwise treat as raw code
  logger.info("Input detected as raw Java code.");
  const fileName = deriveFileNameFromCode(trimmed);
  logger.success(`Derived file name from code: ${fileName}`);
  return { code: trimmed, fileName };
}
