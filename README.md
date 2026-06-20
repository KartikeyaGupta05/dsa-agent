# 🤖 DSA Agent

An AI-powered Node.js agent that fully automates maintaining your LeetCode DSA repository.

## What it does

1. Accepts a LeetCode URL and your Java solution (file path or raw code)
2. Fetches the problem details from LeetCode's GraphQL API
3. Classifies the DSA topic automatically (Math, DP, Graphs, etc.) via Gemini
4. Generates a detailed README.md (problem statement, approach, dry run, complexity)
5. Creates the correct folder structure inside your repo
6. Saves the README.md and Java file
7. Commits and pushes everything to GitHub

## Output structure

```
D:/placement_journey/
└── dsa/
    └── 1344-Angle-Between-Hands-of-a-Clock/
            ├── README.md
            └── AngleBetweenHandsOfAClock.java
```

## Prerequisites

- Node.js ≥ 18
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)
- Git configured on your machine (`git config --global user.name/email`)
- The `D:/placement_journey` repo already cloned locally

## Installation

```bash
# 1. Clone / copy this project
cd dsa-agent

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set GEMINI_API_KEY and PLACEMENT_REPO_PATH
```

## Usage

```bash
# Interactive mode (prompts for URL and Java input)
npm start

# Dry-run — skips the git push
npm start -- --no-git

# Debug mode — prints full stack traces on error
DEBUG=true npm start
```

## Example session

```
LeetCode URL: https://leetcode.com/problems/angle-between-hands-of-a-clock

Java File Path or Java Code: D:/temp/AngleBetweenHandsOfAClock.java
```

The agent then:
- Fetches problem [1344] Angle Between Hands of a Clock (Medium)
- Classifies topic → Math
- Creates `D:/placement_journey/dsa/Math/1344-Angle-Between-Hands-of-a-Clock/`
- Writes README.md and AngleBetweenHandsOfAClock.java
- Commits: `Add 1344 Angle Between Hands of a Clock`
- Pushes to `origin/main`

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Your Google Gemini API key |
| `PLACEMENT_REPO_PATH` | ✅ | Absolute path to your placement_journey repo |
| `GIT_BRANCH` | optional | Branch to push to (default: `main`) |
| `DEBUG` | optional | Set to `true` to print stack traces |

## Error handling

| Scenario | Behaviour |
|---|---|
| Invalid LeetCode URL | Validation error before any API call |
| Problem not found on LeetCode | Clear error with the slug that failed |
| LeetCode 403 rate-limit | Descriptive message, prompt to retry |
| Gemini API failure | Auto-retry up to 3 times with backoff |
| Java file not found | Error with the resolved absolute path |
| Folder already exists | Error — delete folder manually to re-run |
| Git not initialised | Error pointing to PLACEMENT_REPO_PATH |
| Git push failure | Full stdout/stderr shown |
| Network failure | Descriptive error (ENOTFOUND / ECONNREFUSED) |

## Project structure

```
dsa-agent/
├── src/
│   ├── index.js              ← CLI entry point
│   ├── agent/
│   │   └── dsaAgent.js       ← Orchestration (the "brain")
│   ├── tools/
│   │   ├── readJavaFile.js   ← Read file or accept raw code
│   │   ├── scrapeProblem.js  ← LeetCode GraphQL + topic classification
│   │   ├── generateReadme.js ← README generation via Gemini
│   │   ├── createProblemFolder.js  ← Folder creation
│   │   ├── saveFiles.js      ← Write README + Java to disk
│   │   └── gitPush.js        ← git add / commit / push
│   ├── services/
│   │   └── gemini.js         ← Gemini API wrapper with retry logic
│   └── utils/
│       ├── slugify.js        ← Folder/class name helpers
│       └── logger.js         ← Coloured console logger
├── .env.example
├── package.json
└── README.md
```

## Future improvements

- **Batch mode**: accept a text file with multiple URLs and process them all
- **Language support**: extend to Python/C++ solutions alongside Java
- **Offline fallback**: if LeetCode API is unavailable, parse the URL and prompt Gemini to generate a stub problem statement
- **Web UI**: wrap the agent in an Express server with a simple form
- **Duplicate detection**: scan the repo before running to detect if the problem is already solved
- **Stats dashboard**: generate a `PROGRESS.md` summarising solved problems by topic
