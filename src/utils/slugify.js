/**
 * Converts a raw problem title into the canonical folder-name format.
 *
 * Examples:
 *   "Angle Between Hands of a Clock" → "Angle-Between-Hands-of-a-Clock"
 *   "two sum"                        → "Two-Sum"
 */
export function slugify(title) {
  return title
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

/**
 * Builds the canonical DSA folder name: "<id>-<slug>"
 *
 * Example:
 *   buildFolderName(1344, "Angle Between Hands of a Clock")
 *   → "1344-Angle-Between-Hands-of-a-Clock"
 */
export function buildFolderName(id, title) {
  return `${id}-${slugify(title)}`;
}

/**
 * Derives the Java class file name from the problem title.
 *
 * Example:
 *   "Angle Between Hands of a Clock" → "AngleBetweenHandsOfAClock.java"
 */
export function javaClassName(title) {
  const pascal = title
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return `${pascal}.java`;
}
