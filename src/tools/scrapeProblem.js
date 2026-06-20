import axios from "axios";
import * as cheerio from "cheerio";
import { geminiGenerate } from "../services/gemini.js";
import { logger } from "../utils/logger.js";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

const PROBLEM_QUERY = `
query getProblem($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId
    title
    difficulty
    content
    topicTags {
      name
    }
    exampleTestcases
  }
}
`;

/**
 * Extracts the title-slug from a LeetCode URL.
 *
 * Accepts:
 *   https://leetcode.com/problems/angle-between-hands-of-a-clock/
 *   https://leetcode.com/problems/angle-between-hands-of-a-clock/description/
 *
 * @param {string} url
 * @returns {string}
 */
function extractSlug(url) {
  const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
  if (!match) {
    throw new Error(
      `Cannot extract problem slug from URL: "${url}". ` +
        `Expected format: https://leetcode.com/problems/<slug>`
    );
  }
  return match[1];
}

/**
 * Strips HTML tags and decodes common HTML entities from a string.
 *
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  const $ = cheerio.load(html);
  return $.text().replace(/&nbsp;/g, " ").trim();
}

/**
 * Fetches raw problem data from the LeetCode GraphQL API.
 *
 * @param {string} slug
 * @returns {Promise<object>}
 */
async function fetchFromLeetCode(slug) {
  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL,
      {
        query: PROBLEM_QUERY,
        variables: { titleSlug: slug },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/problems/${slug}/`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15_000,
      }
    );

    const question = response.data?.data?.question;
    if (!question) {
      throw new Error(
        `LeetCode API returned no data for slug "${slug}". ` +
          `The problem may not exist or the API has changed.`
      );
    }
    return question;
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      throw new Error(
        `Network error while contacting LeetCode: ${err.message}`
      );
    }
    if (err.response?.status === 403) {
      throw new Error(
        `LeetCode returned 403 Forbidden. You may be rate-limited. ` +
          `Try again in a minute.`
      );
    }
    throw err;
  }
}

/**
 * Uses Gemini to determine the best DSA topic for the problem.
 *
 * @param {string} title
 * @param {string[]} tags  Tags returned by LeetCode
 * @param {string} content Plain-text problem statement
 * @returns {Promise<string>}
 */
async function classifyTopic(title, tags, content) {
  const tagList = tags.join(", ") || "none";
  const prompt = `
You are a DSA expert. Given the following LeetCode problem, choose the SINGLE most appropriate topic category from this exact list:

Arrays, Strings, LinkedList, Stack, Queue, Heap, BinarySearch, Trees, BST, Graphs, DP, Greedy, Math, Backtracking, SlidingWindow, TwoPointers, Simulation, BitManipulation, HashTable, PriorityQueue

Problem title: "${title}"
LeetCode tags: ${tagList}
Problem (first 300 chars): ${content.slice(0, 300)}

Reply with ONLY the topic name from the list above. No explanation, no punctuation.
`.trim();

  const topic = await geminiGenerate(prompt);
  // Sanitise: take first word only in case Gemini adds extras
  return topic.split(/\s+/)[0].trim();
}

/**
 * Full pipeline: validate URL → fetch from LeetCode → classify topic.
 *
 * @param {string} url  LeetCode problem URL
 * @returns {Promise<{
 *   id: string,
 *   title: string,
 *   slug: string,
 *   difficulty: string,
 *   content: string,
 *   topic: string,
 *   tags: string[]
 * }>}
 */
export async function scrapeProblem(url) {
  logger.step("Extracting slug from URL…");
  const slug = extractSlug(url.trim());
  logger.info(`Slug: ${slug}`);

  logger.step("Fetching problem from LeetCode GraphQL API…");
  const question = await fetchFromLeetCode(slug);

  const id = question.questionFrontendId;
  const title = question.title;
  const difficulty = question.difficulty;
  const rawContent = question.content || "";
  const content = stripHtml(rawContent);
  const tags = (question.topicTags || []).map((t) => t.name);

  logger.success(`Problem fetched: [${id}] ${title} (${difficulty})`);
  logger.info(`LeetCode tags: ${tags.join(", ") || "none"}`);

  logger.step("Classifying DSA topic via Gemini…");
  const topic = await classifyTopic(title, tags, content);
  logger.success(`Topic classified as: ${topic}`);

  return { id, title, slug, difficulty, content, topic, tags };
}
