# CLAUDE.md

Anne Sam-Bodden's résumé. One Markdown file builds the public site at <https://anne-sam-bodden.github.io/>, a PDF, and a Word file. `README.md` explains every task in detail; read the relevant section before changing anything.

Anne owns this repository and is not a developer. She edits through the GitHub web interface or by asking an assistant. Explain what you changed in plain language, and keep changes small and easy to revert.

## Rules

- **This repository is public.** Never add a phone number, home address, pay information, performance reviews, or internal employer documents. The phone number exists only in the git-ignored `private/` folder.
- **Nothing invented.** Do not add or inflate accomplishments, figures, titles, dates, or credentials. If a request needs a fact you do not have, ask Anne. Estimates are fine when worded as estimates ("about", "an estimated").
- **The Ohio State credential is an executive-education certificate, not an MBA.** Never describe it as a degree.
- **Content lives in `src/resume.md` only.** The three "At a Glance" figures in `src/pages/index.astro` duplicate numbers from it; keep them in step.
- **Preserve the structure** described under "Editing the résumé" in the README. Headings and bold lines drive the layout, and the PDF must stay at two pages.
- **Keep the existing emphasis.** The résumé leads with data analytics and strategy, supported by finance, operations, and leadership experience. Do not narrow it to a single tool or specialty, and do not add dates or details that are not already shown without asking Anne.

## Before committing

Run `npm run build`. It must end with "Verified HTML, PDF, and DOCX outputs." If it reports missing required content because of an intended rename, update the phrase list in `scripts/verify-build.mjs` in the same commit.

Pushing to `main` publishes the site. Commit or push only when asked, and only as the GitHub user `anne-sam-bodden`.
