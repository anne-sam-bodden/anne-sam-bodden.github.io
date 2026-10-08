#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_file="$repo_root/src/resume.md"
output_dir="$repo_root/dist/downloads"
phone=""

# `--private` builds the copy Anne shares directly: it carries her phone number and is
# written outside dist/ so it is never published.
if [[ "${1:-}" == "--private" ]]; then
  output_dir="$repo_root/private"
  phone="$(tr -d '\n' < "$repo_root/private/phone.txt")"
  if [[ -z "$phone" ]]; then
    echo "private/phone.txt is empty" >&2
    exit 1
  fi
fi
output_file="$output_dir/anne-sam-bodden-resume.docx"

if [[ ! -f "$source_file" ]]; then
  echo "Missing canonical resume: $source_file" >&2
  exit 1
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "Pandoc is required to build the DOCX résumé." >&2
  exit 1
fi

mkdir -p "$output_dir"

sed "s/ · \(\[[^]]*\](mailto:\)/ · ${phone:+$phone · }\1/" "$source_file" | pandoc \
  --from=markdown+yaml_metadata_block \
  --to=docx \
  --metadata=lang:en-US \
  --output="$output_file"

echo "Wrote $output_file"
