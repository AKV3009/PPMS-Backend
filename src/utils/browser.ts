import fs from "fs";
import puppeteer from "puppeteer";
import logger from "./logger";

/**
 * Resolve a usable Chromium/Chrome executable across environments:
 *   1. PUPPETEER_EXECUTABLE_PATH (explicit override, e.g. Railway/Docker)
 *   2. Puppeteer's bundled browser — only if it was actually downloaded
 *   3. A common system Chrome/Edge install (local dev machines)
 * Returns undefined to let puppeteer fall back to its own default lookup.
 */
export function resolveChromeExecutable(): string | undefined {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  try {
    const bundled = puppeteer.executablePath();
    if (bundled && fs.existsSync(bundled)) return bundled;
  } catch {
    // puppeteer couldn't resolve a bundled browser — fall through to system.
  }

  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const found = candidates.find((c) => fs.existsSync(c));
  if (!found) {
    logger.warn(
      "[browser] No Chrome/Chromium executable found; falling back to puppeteer default. " +
        "Set PUPPETEER_EXECUTABLE_PATH or run `npx puppeteer browsers install chrome`."
    );
  }
  return found;
}

/** Launch a headless browser suitable for PDF rendering. */
export function launchPdfBrowser() {
  return puppeteer.launch({
    executablePath: resolveChromeExecutable(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}
