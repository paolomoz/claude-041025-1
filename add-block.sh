#!/bin/bash
#
# Quick block installer for Adobe EDS blocks
# Usage: ./add-block.sh <blockname> [boilerplate|collection]
#
# Examples:
#   ./add-block.sh quote boilerplate
#   ./add-block.sh breadcrumbs collection
#

BLOCK_NAME=$1
SOURCE=${2:-boilerplate}

if [ -z "$BLOCK_NAME" ]; then
  echo "Usage: ./add-block.sh <blockname> [boilerplate|collection]"
  echo ""
  echo "Sources:"
  echo "  boilerplate - adobe/aem-boilerplate (default)"
  echo "  collection  - adobe/aem-block-collection"
  echo ""
  echo "Examples:"
  echo "  ./add-block.sh quote boilerplate"
  echo "  ./add-block.sh breadcrumbs collection"
  exit 1
fi

if [ "$SOURCE" = "boilerplate" ]; then
  BASE_URL="https://raw.githubusercontent.com/adobe/aem-boilerplate/main/blocks"
elif [ "$SOURCE" = "collection" ]; then
  BASE_URL="https://raw.githubusercontent.com/adobe/aem-block-collection/main/blocks"
else
  echo "Error: Source must be 'boilerplate' or 'collection'"
  exit 1
fi

echo "📦 Installing block: $BLOCK_NAME from $SOURCE"
echo ""

# Create block directory
mkdir -p "blocks/$BLOCK_NAME"

# Download JS file
echo "⬇️  Downloading ${BLOCK_NAME}.js..."
curl -sS -f "$BASE_URL/$BLOCK_NAME/${BLOCK_NAME}.js" -o "blocks/$BLOCK_NAME/${BLOCK_NAME}.js"
JS_STATUS=$?

# Download CSS file
echo "⬇️  Downloading ${BLOCK_NAME}.css..."
curl -sS -f "$BASE_URL/$BLOCK_NAME/${BLOCK_NAME}.css" -o "blocks/$BLOCK_NAME/${BLOCK_NAME}.css"
CSS_STATUS=$?

echo ""

# Check results
if [ $JS_STATUS -eq 0 ] && [ $CSS_STATUS -eq 0 ]; then
  echo "✅ Block installed successfully!"
  echo ""
  echo "Files created:"
  ls -lh "blocks/$BLOCK_NAME/"
  echo ""
  echo "Next steps:"
  echo "  1. Review the code in blocks/$BLOCK_NAME/"
  echo "  2. Test locally with: npx @adobe/aem-cli up"
  echo "  3. Commit: git add blocks/$BLOCK_NAME/ && git commit -m 'Add $BLOCK_NAME block'"
elif [ $JS_STATUS -ne 0 ]; then
  echo "❌ Error: Could not download ${BLOCK_NAME}.js"
  echo "   Block may not exist in $SOURCE repository"
  echo ""
  echo "   Check: $BASE_URL/$BLOCK_NAME/${BLOCK_NAME}.js"
  rm -rf "blocks/$BLOCK_NAME"
  exit 1
elif [ $CSS_STATUS -ne 0 ]; then
  echo "❌ Error: Could not download ${BLOCK_NAME}.css"
  echo "   Block may not exist in $SOURCE repository"
  echo ""
  echo "   Check: $BASE_URL/$BLOCK_NAME/${BLOCK_NAME}.css"
  rm -rf "blocks/$BLOCK_NAME"
  exit 1
fi
