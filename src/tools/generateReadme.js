import { geminiGenerate } from "../services/gemini.js";
import { logger } from "../utils/logger.js";

/**
 * Builds the Gemini prompt for README generation.
 *
 * @param {object} problem  Output of scrapeProblem
 * @param {string} javaCode The user's Java solution (used for Dry Run analysis)
 * @returns {string}
 */
function buildPrompt(problem, javaCode) {
  return `
You are a senior software engineer writing a crystal-clear educational README for a DSA problem solution repository.

Generate a complete, high-quality README.md in Markdown for the following LeetCode problem.

---

PROBLEM INFO
Title       : ${problem.title}
LeetCode ID : ${problem.id}
Difficulty  : ${problem.difficulty}
Topic       : ${problem.topic}
Tags        : ${problem.tags.join(", ") || "N/A"}

PROBLEM STATEMENT
${problem.content}

JAVA SOLUTION (for analysis only — DO NOT include in README)
\`\`\`java
${javaCode}
\`\`\`

---

README STRUCTURE (follow exactly, in this order):

# ${problem.id}. ${problem.title}

**Difficulty:** ${problem.difficulty} | **Topic:** ${problem.topic} | **Tags:** ${problem.tags.join(", ") || "N/A"}

---

## Problem

Write the original problem statement in clean prose (no HTML). Include all constraints.

## Examples

Show all input/output examples from the problem. Use code blocks where appropriate.

## Approach

Explain the intuition and algorithm step-by-step in plain English. Be thorough but concise.

## Formula (if applicable)

If a mathematical formula is central to the solution (e.g. clock angle = |30h - 11m/2|), display it clearly in a code block or LaTeX-style notation.

## Dry Run

Walk through the algorithm step-by-step using a concrete example (pick a meaningful one from the problem examples). Show variable values at each step. Use a table or numbered list.

## Time Complexity

State O(...) with a brief explanation.

## Space Complexity

State O(...) with a brief explanation.

---

STRICT RULES:
- DO NOT include any Java source code anywhere in the README.
- DO NOT include any code block containing Java.
- DO NOT add sections beyond what is listed above.
- Use proper Markdown (headers, bold, code blocks for examples/formulas).
- The README should be educational and self-contained.
- Start directly with the # heading. Do not add any preamble.
`.trim();
}

/**
 * Generates a README.md string for the given problem.
 *
 * @param {object} problem  Output of scrapeProblem
 * @param {string} javaCode The user's Java solution (not included in output)
 * @returns {Promise<string>}  The README.md content
 */
export async function generateReadme(problem, javaCode) {
  logger.step("Generating README.md via Gemini…");
  const prompt = buildPrompt(problem, javaCode);
  const readme = await geminiGenerate(prompt);

  // Strip accidental ``` fences that Gemini sometimes wraps around markdown
  const cleaned = readme
    .replace(/^```(?:markdown)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();

  logger.success("README.md generated successfully.");
  return cleaned;
}
