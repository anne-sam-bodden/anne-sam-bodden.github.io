import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = join(repoRoot, "dist");
// `--private` builds the copy Anne shares directly: it carries her phone number and is
// written outside dist/ so it is never published.
const privateBuild = process.argv.includes("--private");
const outputDir = privateBuild ? join(repoRoot, "private") : join(distRoot, "downloads");
const outputFile = join(outputDir, "anne-sam-bodden-resume.pdf");
const basePath = "";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    let pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname === basePath) pathname = `${basePath}/`;
    if (!pathname.startsWith(`${basePath}/`)) {
      response.writeHead(404).end("Not found");
      return;
    }

    let relativePath = pathname.slice(basePath.length + 1);
    let filePath = resolve(distRoot, relativePath || "index.html");
    if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const fileStat = await stat(filePath).catch(() => null);
    if (fileStat?.isDirectory()) filePath = join(filePath, "index.html");
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await mkdir(outputDir, { recursive: true });
await new Promise((accept) => server.listen(0, "127.0.0.1", accept));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Unable to start preview server");

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto(`http://127.0.0.1:${address.port}${basePath}/`, { waitUntil: "networkidle" });

  const diagnostics = await page.evaluate(() => {
    const externalLinks = [...document.querySelectorAll('a[href^="http://"], a[href^="https://"]')];
    const unsafeExternalLinks = externalLinks.filter(
      (link) => link.target !== "_blank" || !link.relList.contains("noopener") || !link.relList.contains("noreferrer"),
    );

    return {
      headingCount: document.querySelectorAll("h1").length,
      mainPresent: Boolean(document.querySelector("main")),
      pdfLinkPresent: Boolean(document.querySelector('a[href$=".pdf"]')),
      docxLinkPresent: Boolean(document.querySelector('a[href$=".docx"]')),
      theme: document.documentElement.dataset.theme,
      palette: document.documentElement.dataset.palette,
      images: document.documentElement.dataset.images,
      externalLinkCount: externalLinks.length,
      unsafeExternalLinkCount: unsafeExternalLinks.length,
      title: document.title,
    };
  });

  if (
    diagnostics.headingCount !== 1 ||
    !diagnostics.mainPresent ||
    !diagnostics.pdfLinkPresent ||
    !diagnostics.docxLinkPresent ||
    diagnostics.theme !== "light" ||
    diagnostics.palette !== "sonoran" ||
    diagnostics.images !== "on" ||
    diagnostics.externalLinkCount === 0 ||
    diagnostics.unsafeExternalLinkCount !== 0
  ) {
    throw new Error(`Rendered résumé failed structural checks: ${JSON.stringify(diagnostics)}`);
  }

  if (privateBuild) {
    const phone = (await readFile(join(repoRoot, "private/phone.txt"), "utf8")).trim();
    if (!phone) throw new Error("private/phone.txt is empty");
    await page.evaluate((value) => {
      const email = document.querySelector('.resume-content h1 + p + p a[href^="mailto:"]');
      email?.before(`${value} · `);
    }, phone);
  }

  await page.emulateMedia({ media: "print", colorScheme: "light" });
  await page.pdf({
    path: outputFile,
    format: "Letter",
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
    tagged: true,
    outline: true,
  });

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await mobilePage.goto(`http://127.0.0.1:${address.port}${basePath}/`, { waitUntil: "networkidle" });
    const mobileDefaults = await mobilePage.evaluate(() => ({
      images: document.documentElement.dataset.images,
      imagesLabel: document.querySelector("#images-label")?.textContent,
      railDisplay: getComputedStyle(document.querySelector(".visual-rail")).display,
    }));

    if (mobileDefaults.images !== "off" || mobileDefaults.imagesLabel !== "Off" || mobileDefaults.railDisplay !== "none") {
      throw new Error(`Mobile image defaults failed: ${JSON.stringify(mobileDefaults)}`);
    }
  } finally {
    await mobilePage.close();
  }

  console.log(`Wrote ${outputFile}`);
} finally {
  await browser.close();
  await new Promise((accept, reject) => server.close((error) => (error ? reject(error) : accept())));
}
