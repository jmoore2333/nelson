#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="skills/nelson"
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
# Case-insensitive: match "MUST" regardless of markdown emphasis
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
    # Skip if glob matched no files (bash returns literal pattern)
    [ -f "$file" ] || continue
    basename=$(basename "$file")
    if ! grep -qE "\`${index}/${basename}\`" "$index_file"; then
      error "$index/$basename exists on disk but is not listed in $index.md"
    fi
  done
done

# ---------- 4. Reference file cross-refs ----------
# Backtick-quoted paths in non-index reference files
echo "Checking cross-references in reference files..."
for ref_file in "$REF_DIR"/*.md; do
  [ -f "$ref_file" ] || continue
  basename=$(basename "$ref_file")
  # Skip index files (they are validated in Section 2)
  case "$basename" in
    admiralty-templates.md|standing-orders.md|damage-control.md) continue ;;
  esac

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

# ---------- 5. Subdirectory file cross-refs ----------
# Backtick-quoted paths in subdirectory files
echo "Checking cross-references in subdirectory files..."
for subdir in admiralty-templates standing-orders damage-control; do
  [ -d "$REF_DIR/$subdir" ] || continue
  for ref_file in "$REF_DIR/$subdir"/*.md; do
    [ -f "$ref_file" ] || continue
    basename=$(basename "$ref_file")

    # Paths like `references/foo.md` (relative to skill root)
    while IFS= read -r path; do
      if [ ! -f "$SKILL_DIR/$path" ]; then
        error "$subdir/$basename references '$path' but $SKILL_DIR/$path does not exist"
      fi
    done < <(grep -oE '`references/[^`]+\.md`' "$ref_file" \
      | tr -d '`' \
      | sort -u)

    # Paths like `standing-orders/foo.md` (relative to references/)
    while IFS= read -r path; do
      if [ ! -f "$REF_DIR/$path" ]; then
        error "$subdir/$basename references '$path' but $REF_DIR/$path does not exist"
      fi
    done < <(grep -oE '`(standing-orders|admiralty-templates|damage-control)/[^`]+\.md`' "$ref_file" \
      | tr -d '`' \
      | sort -u)
  done
done

# ---------- 6. Reverse orphan check ----------
# Every top-level .md in references/ should be referenced by a MUST directive in SKILL.md
echo "Checking for unreferenced top-level reference files..."
for ref_file in "$REF_DIR"/*.md; do
  [ -f "$ref_file" ] || continue
  basename=$(basename "$ref_file")
  # Skip index files (their sub-files are already checked in Section 2)
  case "$basename" in
    admiralty-templates.md|standing-orders.md|damage-control.md) continue ;;
  esac

  if ! grep -qE "\`references/${basename}\`" "$SKILL_DIR/SKILL.md"; then
    error "$basename exists in references/ but is not referenced by any MUST directive in SKILL.md"
  fi
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
