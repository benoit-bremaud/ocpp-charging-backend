#!/bin/bash

################################################################################
# 📊 DOCUMENTATION AUDIT SCRIPT (PRODUCTION FINAL - v2)
# Purpose: Analyze markdown files in docs/ to identify empty vs filled
# Status: PRODUCTION READY - FULLY TESTED
# Usage: bash scripts/audit-docs.sh OR make audit-docs (from project root)
################################################################################

set -u

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

################################################################################
# Determine script location and project root
################################################################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Paths (absolute to avoid issues)
DOCS_PATH="$PROJECT_ROOT/docs"
AUDIT_BASE_PATH="$PROJECT_ROOT/.audits/docs-audit/reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FILE="$AUDIT_BASE_PATH/docs-audit-$TIMESTAMP.json"

# Initialize counters
TOTAL_FILES=0
EMPTY_FILES=0
FILLED_FILES=0
EMPTY_ARRAY=()
FILLED_ARRAY=()

################################################################################
# Verify project structure
################################################################################
if [ ! -d "$DOCS_PATH" ]; then
  echo -e "${RED}❌ Error: docs/ folder not found at $DOCS_PATH!${NC}"
  echo " Please run this script from the root of your project."
  exit 1
fi

# Create audit directory if needed
mkdir -p "$AUDIT_BASE_PATH"

################################################################################
# Check if a file is empty or filled
################################################################################
is_file_empty() {
  local file="$1"
  local file_size
  file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
  file_size=${file_size:-0}

  local word_count
  word_count=$(wc -w < "$file" 2>/dev/null || echo 0)
  word_count=$(echo "$word_count" | tr -d ' ')

  local sections
  sections=$(grep -c '^##' "$file" 2>/dev/null || echo 0)
  sections=$(echo "$sections" | tr -d ' ')

  local code_blocks
  code_blocks=$(grep -c '^\`\`\`' "$file" 2>/dev/null || echo 0)
  code_blocks=$(echo "$code_blocks" | tr -d ' ')

  local placeholders
  placeholders=$(grep -iE '\[TODO\]|\[FIXME\]|\[example\]' "$file" 2>/dev/null | wc -l || echo 0)
  placeholders=$(echo "$placeholders" | tr -d ' ')

  file_size=$(printf '%d' "$file_size" 2>/dev/null || echo 0)
  word_count=$(printf '%d' "$word_count" 2>/dev/null || echo 0)
  sections=$(printf '%d' "$sections" 2>/dev/null || echo 0)
  code_blocks=$(printf '%d' "$code_blocks" 2>/dev/null || echo 0)
  placeholders=$(printf '%d' "$placeholders" 2>/dev/null || echo 0)

  if [ "$file_size" -gt 800 ] && [ "$word_count" -gt 150 ]; then
    return 0
  fi

  if [ "$code_blocks" -gt 0 ] && [ "$sections" -gt 1 ]; then
    return 0
  fi

  if [ "$word_count" -gt 120 ] && [ "$sections" -gt 0 ]; then
    return 0
  fi

  if [ "$file_size" -lt 500 ] && [ "$placeholders" -gt 0 ]; then
    return 1
  fi

  if [ "$file_size" -lt 300 ]; then
    return 1
  fi

  if [ "$word_count" -lt 100 ]; then
    return 1
  fi

  return 0
}

################################################################################
# MAIN EXECUTION
################################################################################
echo ""
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║ 📚 DOCUMENTATION AUDIT REPORT ║${NC}"
echo -e "${BOLD}${BLUE}║ Analysis of docs/ folder structure ║${NC}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}🔍 Scanning documentation files...${NC}"
echo -e "${BLUE}📂 Project root: $PROJECT_ROOT${NC}"
echo ""

while IFS= read -r file; do
  ((TOTAL_FILES++))

  if is_file_empty "$file"; then
    ((FILLED_FILES++))
    FILLED_ARRAY+=("$file")
  else
    ((EMPTY_FILES++))
    EMPTY_ARRAY+=("$file")
  fi
done < <(find "$DOCS_PATH" -name "*.md" -type f 2>/dev/null | sort)

# Display filled files
echo -e "${GREEN}✅ FILLED FILES (${FILLED_FILES})${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ ${#FILLED_ARRAY[@]} -eq 0 ]; then
  echo -e "${YELLOW} No filled files found yet.${NC}"
else
  current_folder=""
  for file in "${FILLED_ARRAY[@]}"; do
    folder=$(dirname "$file" | sed "s|$DOCS_PATH/||")
    if [ "$folder" != "$current_folder" ]; then
      current_folder="$folder"
      echo -e "${BOLD}📁 $folder/${NC}"
    fi

    filename=$(basename "$file")
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)

    if [ "$size" -gt 10000 ]; then
      echo " ✅ $filename [🟢 $(printf '%6d' $size) bytes]"
    elif [ "$size" -gt 5000 ]; then
      echo " ✅ $filename [🟡 $(printf '%6d' $size) bytes]"
    else
      echo " ✅ $filename [🟠 $(printf '%6d' $size) bytes]"
    fi
  done
fi

echo ""
echo ""

# Display empty files
echo -e "${RED}❌ EMPTY FILES (${EMPTY_FILES})${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}(These files need to be filled with content)${NC}"
echo ""

if [ ${#EMPTY_ARRAY[@]} -eq 0 ]; then
  echo -e "${GREEN} 🎉 All files are filled! No empty files found.${NC}"
else
  current_folder=""
  for file in "${EMPTY_ARRAY[@]}"; do
    folder=$(dirname "$file" | sed "s|$DOCS_PATH/||")
    if [ "$folder" != "$current_folder" ]; then
      current_folder="$folder"
      echo -e "${BOLD}📁 $folder/${NC}"
    fi

    filename=$(basename "$file")
    echo " ❌ $filename"
  done
fi

echo ""
echo ""

# Summary statistics
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║ 📊 SUMMARY STATISTICS ║${NC}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

FILLED_PERCENT=0
if [ "$TOTAL_FILES" -gt 0 ]; then
  FILLED_PERCENT=$(( (FILLED_FILES * 100) / TOTAL_FILES ))
fi

echo "Total Markdown Files: $TOTAL_FILES"
echo -e "Filled Files: ${GREEN}$FILLED_FILES${NC} ($FILLED_PERCENT%)"
echo -e "Empty Files: ${RED}$EMPTY_FILES${NC} ($(( 100 - FILLED_PERCENT ))%)"
echo ""

# Progress bar
echo -n "Progress: ["
for ((i=0; i<FILLED_PERCENT; i+=10)); do
  echo -n "▓"
done
for ((i=FILLED_PERCENT; i<100; i+=10)); do
  echo -n "░"
done
echo "] $FILLED_PERCENT%"
echo ""

# Generate JSON report
{
  echo "{"
  echo "  \"generated\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"summary\": {"
  echo "    \"total_files\": $TOTAL_FILES,"
  echo "    \"filled_files\": $FILLED_FILES,"
  echo "    \"empty_files\": $EMPTY_FILES,"
  echo "    \"completion_percent\": $FILLED_PERCENT"
  echo "  },"
  echo "  \"filled\": ["
  for file in "${FILLED_ARRAY[@]}"; do
    echo "    \"$(echo "$file" | sed "s|$PROJECT_ROOT/||")\","
  done | sed '$ s/,$//'
  echo "  ],"
  echo "  \"empty\": ["
  for file in "${EMPTY_ARRAY[@]}"; do
    echo "    \"$(echo "$file" | sed "s|$PROJECT_ROOT/||")\","
  done | sed '$ s/,$//'
  echo "  ]"
  echo "}"
} > "$REPORT_FILE"

echo -e "${GREEN}✅ Report saved to: ${BOLD}$REPORT_FILE${NC}"
echo ""

# Final summary
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
if [ "$EMPTY_FILES" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✅ ALL DOCUMENTATION IS COMPLETE! 🎉${NC}"
else
  echo -e "${YELLOW}${BOLD}⚠️ $EMPTY_FILES files need attention${NC}"
fi
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}💡 View the full report:${NC}"
echo " ${YELLOW}cat $REPORT_FILE${NC}"
echo ""
