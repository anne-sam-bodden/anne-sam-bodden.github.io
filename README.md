# Anne Sam-Bodden's Resume

One Markdown file produces three things: a web résumé at <https://anne-sam-bodden.github.io/>, a PDF, and a Word document. The system is ported from Brian Sam-Bodden's résumé.

## Contents

- [How it fits together](#how-it-fits-together)
- [Setup](#setup)
- [Everyday commands](#everyday-commands)
- [Editing on GitHub, with no tools installed](#editing-on-github-with-no-tools-installed)
- [Editing the résumé](#editing-the-résumé)
- [Changing the look](#changing-the-look)
- [The private copy with a phone number](#the-private-copy-with-a-phone-number)
- [Tailoring a copy for one job](#tailoring-a-copy-for-one-job)
- [Publishing](#publishing)
- [What the build checks](#what-the-build-checks)
- [Troubleshooting](#troubleshooting)

## How it fits together

| File | What it is |
| --- | --- |
| `src/resume.md` | All résumé content. Edit this and nothing else for wording changes. |
| `src/pages/index.astro` | The web page around the content: top bar, portrait, the three "At a Glance" figures, page metadata, and the palette, sidebar, and light/dark controls. |
| `src/styles/global.css` | Fonts, colors, layout, and the print rules that shape the PDF. |
| `public/` | Files copied to the site as they are: the portrait (`images/anne-sam-bodden.jpg`), favicon, web manifest, `robots.txt`. |
| `scripts/build-docx.sh` | Turns the Markdown into a Word file with Pandoc. |
| `scripts/build-pdf.mjs` | Opens the built page in a headless browser and prints it to PDF. |
| `scripts/verify-build.mjs` | Checks the finished outputs (see [What the build checks](#what-the-build-checks)). |
| `astro.config.mjs` | The site address. |
| `.github/workflows/deploy.yml` | Builds and publishes to GitHub Pages on every push to `main`. |
| `dist/` | Build output. Recreated on every build; not committed. |
| `private/` | Phone number and the privately shared copies. Not committed, never published. |

The Word file is made straight from the Markdown, so it is plain and reads cleanly in applicant-tracking systems. The PDF is a print of the web page, so it carries the fonts and colors. Neither includes the portrait or sidebar.

## Setup

### In the dev container (recommended)

The folder above this repository has a `.devcontainer/` that installs everything and keeps Anne's GitHub login separate from the host machine. Open that parent folder in VS Code and choose **Dev Containers: Reopen in Container**. Dependencies are installed on first start.

The dev container is not part of this repository, so a fresh clone elsewhere needs the manual setup below.

### On your own machine

You need Node.js 20.11 or newer and [Pandoc](https://pandoc.org/installing.html). Then:

```bash
npm install
npx playwright install chromium
```

## Everyday commands

Run these from this folder.

| Command | What it does |
| --- | --- |
| `npm run dev` | Live preview that reloads as you edit. The PDF and DOCX buttons do not work here, because those files exist only after a build. |
| `npm run build` | Builds the site, the public PDF and DOCX, and verifies all of them. Output goes to `dist/`. |
| `npm run preview -- --port 4391` | Serves the last build at <http://localhost:4391/>, downloads included. It does not pick up edits; rebuild and refresh. Stop it with `npx astro preview stop`. |
| `npm run build:private` | Does a full build, then also writes a PDF and DOCX with the phone number to `private/`. |
| `npm run check` | Type-checks the page without building. |

The finished public files are `dist/downloads/anne-sam-bodden-resume.pdf` and `.docx`.

## Editing on GitHub, with no tools installed

This is the simplest way to change the résumé. Nothing needs to be installed.

1. Go to <https://github.com/anne-sam-bodden/anne-sam-bodden.github.io> and sign in.
2. Open `src/resume.md` and click the pencil icon (**Edit this file**).
3. Make the change. The **Preview** tab shows roughly how the text will read.
4. Click **Commit changes**, write a few words about what changed, and commit directly to `main`.
5. Open the **Actions** tab. A run named after your commit appears within a few seconds and takes about three minutes.
   - **Green check:** the site, PDF, and Word file are updated. Refresh <https://anne-sam-bodden.github.io/>.
   - **Red X:** nothing was published and the site still shows the previous version, so no harm is done. Click the run, then the failed step, to read the reason. The usual causes are in [Troubleshooting](#troubleshooting). Fix the file the same way and commit again, or undo the change from the commit's page with **Revert**.

Things to know when editing this way:

- **The rules in [Editing the résumé](#editing-the-résumé) still apply.** The headings and bold lines carry the layout.
- **Sidebar figures are separate.** If you change a number that appears under "At a Glance", make the same change in `src/pages/index.astro` (the `highlights` list near the top).
- **Never type the phone number into any file here.** The repository is public.
- **You cannot see the result before it is live.** For a change you want to look at first, create a branch when committing ("Create a new branch… and start a pull request"). The run on the pull request builds the PDF and Word file without publishing; download them from the run's **Artifacts** section (`resume-documents`). Merge the pull request to publish.
- **The copy with the phone number** cannot be made on GitHub. Download the public PDF or Word file and add the number by hand, or ask for a private build (see [The private copy](#the-private-copy-with-a-phone-number)).

### Asking an AI assistant to make the change

An assistant that can work in the repository (Claude Code, or one started from GitHub) should read `CLAUDE.md` in this folder first; it holds the rules for this résumé. Describe the change in plain words, for example "add a bullet under Cable One about X" or "shorten the profile to three sentences", and ask it to run `npm run build` before committing.

## Editing the résumé

Open `src/resume.md`. The structure matters, because the styling keys off it:

- The top block between `---` lines sets the browser tab title (`pageTitle`) and the search-engine description (`description`).
- `# Name` is the name. The **bold line** directly under it is the headline; the line after that is the contact line.
- `## Section` starts a section (Profile, Experience, and so on).
- `### Employer — Title` starts a role. A line of **all-bold text** directly under it becomes the small uppercase detail line (location and dates).
- `- ` starts a bullet. `**bold**` inside a bullet highlights a figure.

After editing:

1. If you changed a number that also appears in the sidebar, update the `highlights` list near the top of `src/pages/index.astro` to match. The two are not linked.
2. Run `npm run build`. If the verifier complains that required content is missing, you renamed something it looks for; update the phrase list in `scripts/verify-build.mjs`.
3. Open the PDF and confirm it is still two pages with a sensible break. The second page starts at "Selected Work"; that break is set in `global.css` under `h2#selected-work`. If you rename that section, update the rule.
4. Record where any new claim comes from in `../docs/sources.md`.

### Contact line

Keep the email as a Markdown `mailto:` link. The private build inserts the phone number just before it.

### Sidebar figures

In `src/pages/index.astro`:

```js
const highlights = [
  { figure: "$4.6M", label: "Estimated 2026 impact of AutoPay+ discount corrections" },
  ...
];
```

Add, remove, or reword entries here. Three fit best.

### Portrait

Replace `public/images/anne-sam-bodden.jpg` with a roughly square image about 640 pixels wide. It appears only on the web page, and only when the sidebar is on.

## Changing the look

### Palettes

There are three, each with a light and a dark version: **Sonoran** (default; sand and garnet), **Sage** (green), and **Slate** (blue-gray). Visitors switch with the Palette button and the choice is remembered in their browser.

Colors are defined at the top of `src/styles/global.css` as named values (`--bg`, `--surface`, `--text`, `--muted`, `--faint`, `--accent`, `--accent-strong`, `--accent-soft`). To adjust a palette, change its values there.

To add a palette called `plum`:

1. In `global.css`, copy the two `sage` blocks, rename them to `[data-palette="plum"]`, and set the colors.
2. In `index.astro`, add `"plum"` to `validPalettes` (in the `<head>` script) and to `palettes` (in the bottom script), and add `plum: "Plum"` to `paletteNames`.

To change the default palette, replace `sonoran` with the new name in the `<html data-palette=…>` tag and the fallback values in both scripts in `index.astro`, in `scripts/build-pdf.mjs`, and in `scripts/verify-build.mjs`.

The PDF always uses the print colors at the bottom of `global.css` (`@media print`), whichever palette is showing on screen.

### Fonts

Headings use Fraunces and body text uses Figtree, both installed as npm packages. To change one:

1. `npm install @fontsource-variable/<font-name>` and remove the old package.
2. Update the `import` lines at the top of `index.astro`.
3. Update `--display-font` or `--body-font` at the top of `global.css`.

### Defaults

The page opens in light mode with the sidebar on (off on phones). These defaults are set in the `<head>` script in `index.astro`, and both `build-pdf.mjs` and `verify-build.mjs` check for them, so change all three together.

## The private copy with a phone number

Anne's phone number is not on the public site or in the public downloads. For a copy to send directly to a recruiter or employer:

```bash
npm run build:private
```

This writes `private/anne-sam-bodden-resume.pdf` and `.docx` with the number on the contact line. The number is read from `private/phone.txt`, a one-line file. The whole `private/` folder is git-ignored and is never deployed.

On a fresh clone, create the file first:

```bash
mkdir -p private && echo "614-555-0100" > private/phone.txt   # use the real number
```

## Tailoring a copy for one job

Keep `src/resume.md` as the master. For a specific opening, work on a branch so the master and the public site are untouched:

```bash
git switch -c apply/company-role
# edit src/resume.md: reorder bullets, adjust the headline, echo the posting's terms
npm run build:private
cp private/anne-sam-bodden-resume.pdf ~/Desktop/anne-sam-bodden-company-role.pdf
git switch main
```

Do not push these branches unless you want them kept; pushing to `main` is what publishes.

## Publishing

The site is served by GitHub Pages from the repository `anne-sam-bodden/anne-sam-bodden.github.io`.

### One-time setup

1. In the repository on GitHub: **Settings → Pages → Source → GitHub Actions**.
2. On a free GitHub account, Pages requires the repository to be public. Nothing private lives in this repository, but keep it that way: no reviews, no phone number, no source notes.

### Each time

Pushes must be made as the GitHub user `anne-sam-bodden`. Do this from the dev container, which has its own login:

```bash
gh auth login --hostname github.com --git-protocol https --web   # first time only
gh api user --jq .login                                          # must print anne-sam-bodden

npm run build            # confirm it passes locally
git add -A
git commit -m "Describe the change"
git push origin main
```

A pre-push check refuses the push if the GitHub CLI is signed in as anyone else.

The push starts the workflow in `.github/workflows/deploy.yml`, which rebuilds everything, runs the verifier, and publishes `dist/`. Watch it under the repository's **Actions** tab, or with `gh run watch`. The site updates a minute or two after it finishes. The workflow also saves the PDF and DOCX as a downloadable artifact named `resume-documents` on each run.

To publish without a new commit, run the workflow by hand: **Actions → Build and deploy resume → Run workflow**, or `gh workflow run deploy.yml`.

### Moving to a different address

Change `site` in `astro.config.mjs`. If the site will live under a path (for example `https://someone.github.io/resume/`), also add `base: "/resume"` there, set `basePath = "/resume"` in `scripts/build-pdf.mjs`, and prefix the two paths in `public/site.webmanifest`.

## What the build checks

`npm run build` fails if any of these is not true:

- The HTML, PDF, and DOCX exist, are a plausible size, and are valid files.
- The page has exactly one main heading, both download links, and safe external links.
- The page opens in light mode, Sonoran palette, sidebar on; and with the sidebar off on a phone-sized screen.
- Key content is present (name, employers, section names, the LinkedIn address, the portrait).
- Nothing forbidden is present: placeholder text, any claim of an MBA, or leftovers from Brian's résumé.
- The phone number does not appear in the page or the public Word file.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Executable doesn't exist … chrome-headless-shell` | Run `npx playwright install chromium` (inside the dev container: `npx playwright install --with-deps chromium`). |
| `Pandoc is required to build the DOCX résumé` | Install Pandoc, or use the dev container. |
| `Built HTML is missing required content: …` | You removed or renamed something the verifier expects. Restore it, or update the list in `scripts/verify-build.mjs`. |
| The PDF runs to three pages, or page one ends awkwardly | Trim content, or adjust the print sizes and margins under `@media print` in `global.css`. |
| The preview shows old content | The preview serves the last build. Run `npm run build` and refresh. |
| `Preview server already running` | `npx astro preview stop`, then start it again. |
| PDF/DOCX buttons give "not found" | You are on `npm run dev`. Use `npm run build` and `npm run preview`. |
| `Push refused: GitHub CLI is signed in as …` | You are not signed in as `anne-sam-bodden`. Push from the dev container after `gh auth login`. |
| `npm` errors about the wrong platform after switching between the host and the container | Each side needs its own install. Run `npm ci` on the side that is failing. |
| `private/phone.txt` not found on `build:private` | Create it; see [The private copy](#the-private-copy-with-a-phone-number). |
