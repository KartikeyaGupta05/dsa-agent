import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger.js";

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      throw new Error(
        "GEMINI_API_KEY is not set. Copy .env.example → .env and add your key."
      );
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

/**
 * Sends a single prompt to Gemini and returns the text response.
 * Retries up to `retries` times on transient failures.
 *
 * @param {string} prompt
 * @param {number} retries
 * @returns {Promise<string>}
 */
export async function geminiGenerate(prompt, retries = 3) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Gemini request (attempt ${attempt}/${retries})…`);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text || text.trim().length === 0) {
        throw new Error("Gemini returned an empty response.");
      }
      return text.trim();
    } catch (err) {
      lastError = err;
      const isRateLimit =
        err.message?.includes("429") ||
        err.message?.toLowerCase().includes("quota") ||
        err.message?.toLowerCase().includes("rate");

      if (isRateLimit && attempt < retries) {
        const wait = attempt * 15_000; // back-off: 15s, 30s
        logger.warn(`Rate-limit hit. Waiting ${wait / 1000}s before retry…`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (attempt < retries) {
        const wait = attempt * 3_000;
        logger.warn(`Gemini error: ${err.message}. Retrying in ${wait / 1000}s…`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
    }
  }
  throw new Error(`Gemini API failed after ${retries} attempts: ${lastError?.message}`);
}
