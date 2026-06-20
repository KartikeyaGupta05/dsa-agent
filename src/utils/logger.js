const RESET = "\x1b[0m";
const COLORS = {
  info: "\x1b[36m",    // cyan
  success: "\x1b[32m", // green
  warn: "\x1b[33m",    // yellow
  error: "\x1b[31m",   // red
  agent: "\x1b[35m",   // magenta
  step: "\x1b[34m",    // blue
};

function log(level, ...args) {
  const prefix = `${COLORS[level]}[${level.toUpperCase()}]${RESET}`;
  console.log(prefix, ...args);
}

export const logger = {
  info: (...args) => log("info", ...args),
  success: (...args) => log("success", ...args),
  warn: (...args) => log("warn", ...args),
  error: (...args) => log("error", ...args),
  agent: (...args) => log("agent", ...args),
  step: (...args) => log("step", ...args),
};
