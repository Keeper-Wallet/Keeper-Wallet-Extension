#!/bin/bash

# Script to test vault migration from last release tag to current branch
# This mimics the GitHub CI workflow

set -e  # Exit on error

echo "🔧 Starting migration test setup (using last tag)..."

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Step 1: Build NEW version (current branch)
echo ""
echo "📦 Step 1: Building NEW version (current branch)..."
yarn build

# Step 2: Save as dist.new
echo ""
echo "💾 Step 2: Saving NEW version as dist.new..."
if [ -d "dist.new" ]; then
  echo "   Removing existing dist.new..."
  rm -rf dist.new
fi
mv dist dist.new
echo "   ✅ dist.new created"

# Step 3: Find last tag
echo ""
echo "🔍 Step 3: Finding last release tag..."
LAST_TAG=$(git describe --abbrev=0 --tags $(git rev-list --tags --skip=0 --max-count=1) 2>/dev/null || echo "")

if [ -z "$LAST_TAG" ]; then
  echo "   ⚠️  No tags found, falling back to master branch"
  LAST_TAG="master"
fi

echo "   📌 Using: $LAST_TAG"

# Step 4: Checkout last tag
echo ""
echo "🔀 Step 4: Checking out $LAST_TAG..."
git checkout "$LAST_TAG"

# Step 5: Build OLD version
echo ""
echo "📦 Step 5: Building OLD version ($LAST_TAG)..."
echo "   Cleaning node_modules..."
rm -rf node_modules
echo "   Installing dependencies for $LAST_TAG..."
yarn install
echo "   Building..."
yarn build
echo "   ✅ dist created from $LAST_TAG"

# Step 6: Go back to original branch
echo ""
echo "🔀 Step 6: Returning to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

# Step 7: Verify both folders exist
echo ""
echo "✅ Verification:"
if [ -d "dist" ] && [ -d "dist.new" ]; then
  echo "   ✓ dist/ (OLD version from $LAST_TAG)"
  echo "   ✓ dist.new/ (NEW version from $CURRENT_BRANCH)"
else
  echo "   ❌ Error: Missing dist folders"
  exit 1
fi

# Step 8: Run the migration test
echo ""
echo "🧪 Step 7: Running migration test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
yarn test:update

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Migration test complete!"
