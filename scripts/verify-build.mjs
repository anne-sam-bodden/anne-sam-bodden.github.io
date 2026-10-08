import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const targets = {
  html: join(repoRoot, "dist/index.html"),
  pdf: join(repoRoot, "dist/downloads/anne-sam-bodden-resume.pdf"),
  docx: join(repoRoot, "dist/downloads/anne-sam-bodden-resume.docx"),
};

for (const [kind, path] of Object.entries(targets)) {
  const fileStat = await stat(path);
  const minimum = kind === "html" ? 12_000 : kind === "pdf" ? 40_000 : 8_000;
  if (fileStat.size < minimum) throw new Error(`${kind} output is unexpectedly small: ${fileStat.size} bytes`);
}

const html = await readFile(targets.html, "utf8");
if (!html.includes('data-theme="light" data-palette="sonoran" data-images="on"')) {
  throw new Error("Built HTML is missing the expected Sonoran/Light/Sidebar On defaults");
}

for (const phrase of ["Anne Sam-Bodden", "Data Analytics &amp; Strategy", "At a Glance", "Cable One (Sparklight)", "Data Analyst II", "Arizona Tuition Connection", "Integrallis Software", "Qwest Communications", "Selected Work", "Recognition", "Associate of the Month", "146,000 customers", "AutoPay+ discount integrity", "Ohio Wesleyan University", "Fisher College of Business", "Core Capabilities", "https://www.linkedin.com/in/annesambodden", "anne-sam-bodden.jpg"]) {
  if (!html.includes(phrase)) throw new Error(`Built HTML is missing required content: ${phrase}`);
}

// The Ohio State credential is an executive-education certificate, never an MBA.
for (const forbidden of ["TODO", "example.com", "[confirm", "lorem ipsum", "Master of Business Administration", "MBA degree", "Brian Sam-Bodden", "bsbodden"]) {
  if (html.toLowerCase().includes(forbidden.toLowerCase())) throw new Error(`Built HTML contains placeholder or forbidden content: ${forbidden}`);
}

// The phone number belongs only in the privately shared copies under private/.
const phone = (await readFile(join(repoRoot, "private/phone.txt"), "utf8").catch(() => "")).trim();
if (phone) {
  const publicDocx = await readFile(targets.docx);
  if (html.includes(phone)) throw new Error("Built HTML exposes the phone number");
  if (publicDocx.includes(phone)) throw new Error("Public DOCX exposes the phone number");
}

const pdfHeader = (await readFile(targets.pdf)).subarray(0, 5).toString("ascii");
if (pdfHeader !== "%PDF-") throw new Error("PDF output has an invalid header");

const docxHeader = (await readFile(targets.docx)).subarray(0, 2).toString("ascii");
if (docxHeader !== "PK") throw new Error("DOCX output has an invalid ZIP header");

console.log("Verified HTML, PDF, and DOCX outputs.");
