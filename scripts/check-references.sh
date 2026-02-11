#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR=".claude/skills/nelson"
REF_DIR="$SKILL_DIR/references"
errors=0

error() {
  echo "ERROR: $1" >&2
  errors=$((errors + 1))
}

# ---------- 1. SKILL.md → references ----------
# Every backtick-quoted path in MUST read/consult/use directives
echo "Checking SKILL.md → reference files..."
while IFS= read -r path; do
  if [ ! -f "$SKILL_DIR/$path" ]; then
    error "SKILL.md references '$path' but $SKILL_DIR/$path does not exist"
  fi
done < <(grep -Ei 'MUST (read|consult|use|read and apply)' "$SKILL_DIR/SKILL.md" \
  | grep -oE '`references/[^`]+`' \
  | tr -d '`' \
  | sort -u)

# ---------- 2. Index → sub-files ----------
# Each index file's backtick-quoted .md paths must resolve
for index in admiralty-templates standing-orders damage-control; do
  index_file="$REF_DIR/$index.md"
  if [ ! -f "$index_file" ]; then
    error "Index file $index_file does not exist"
    continue
  fi

  echo "Checking $index.md → sub-files..."
  while IFS= read -r path; do
    if [ ! -f "$REF_DIR/$path" ]; then
      error "$index.md references '$path' but $REF_DIR/$path does not exist"
    fi
  done < <(grep -oE "\`${index}/[^\`]+\.md\`" "$index_file" \
    | tr -d '`' \
    | sort -u)
done

# ---------- 3. Sub-file → index (orphan check) ----------
# Every .md in a sub-directory must be listed in its parent index
for index in admiralty-templates standing-orders damage-control; do
  index_file="$REF_DIR/$index.md"
  subdir="$REF_DIR/$index"
  [ -d "$subdir" ] || continue

  echo "Checking for orphans in $index/..."
  for file in "$subdir"/*.md; do
    [ -f "$file" ] || continue
    basename=$(basename "$file")
    if ! grep -q "$index/$basename" "$index_file"; then
      error "$index/$basename exists on disk but is not listed in $index.md"
    fi
  done
done

# ---------- 4. Reference file cross-refs ----------
# Backtick-quoted paths in non-index reference files
echo "Checking cross-references in reference files..."
for ref_file in "$REF_DIR"/crew-roles.md "$REF_DIR"/commendations.md "$REF_DIR"/squadron-composition.md; do
  [ -f "$ref_file" ] || continue
  basename=$(basename "$ref_file")

  # Paths like `references/foo.md` (relative to skill root)
  while IFS= read -r path; do
    if [ ! -f "$SKILL_DIR/$path" ]; then
      error "$basename references '$path' but $SKILL_DIR/$path does not exist"
    fi
  done < <(grep -oE '`references/[^`]+\.md`' "$ref_file" \
    | tr -d '`' \
    | sort -u)

  # Paths like `standing-orders/foo.md` (relative to references/)
  while IFS= read -r path; do
    if [ ! -f "$REF_DIR/$path" ]; then
      error "$basename references '$path' but $REF_DIR/$path does not exist"
    fi
  done < <(grep -oE '`(standing-orders|admiralty-templates|damage-control)/[^`]+\.md`' "$ref_file" \
    | tr -d '`' \
    | sort -u)
done

# ---------- Summary ----------
if [ "$errors" -gt 0 ]; then
  echo ""
  echo "FAILED: $errors broken reference(s) found"
  exit 1
else
  echo ""
  echo "OK: All cross-references are valid"
  exit 0
fi
