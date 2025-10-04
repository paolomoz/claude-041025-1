#!/bin/bash

OWNER="paolomoz"
REPO="claude-021025"
BASE_PATH="021025-1229"

# Array of URLs to process
declare -a URLS=(
  "latest-trends-young-fashion"
  "fashion-insights"
  "fashion-trends-of-the-season"
  "fashion-trends-young-adults-casual-sport"
  "fashion-trends-young-adults"
  "blog/latest-trends-young-casual-fashion"
  "blog/fashion-trends-young-culture"
  "blog/fashion-trends-young-style"
  "faq"
  "blog/fashion-blog-post"
  "blog/fashion-trends-stories"
)

echo "Starting batch import of ${#URLS[@]} pages..."

for url_path in "${URLS[@]}"; do
  echo "Processing: $url_path"
  
  # Create filename from URL path
  filename=$(echo "$url_path" | sed 's/\//-/g')
  
  # Create DA upload path
  da_path="$BASE_PATH/$url_path.html"
  
  echo "  URL: https://www.wknd-trendsetters.site/$url_path"
  echo "  DA Path: $da_path"
  echo "  Files: content-$filename.md / content-$filename.html"
  echo ""
done

echo "Batch import plan ready."
