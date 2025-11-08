#!/bin/bash

# ==================================
# Clean Repository Setup Script
# ==================================
# This script helps you create a clean repository for code review
# Only includes: web-frontend, backend, and build.js files
# Excludes: markdown docs, SQL files, migrations, unused folders

echo "🧹 Setting up clean repository for code review..."
echo ""

# Step 1: Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    echo "Please run this script from the jau-new directory"
    exit 1
fi

echo "✅ Git repository detected"
echo ""

# Step 2: Remove cached files that should be ignored
echo "📦 Removing cached files from git..."
git rm -r --cached src/web-backend/ 2>/dev/null || echo "web-backend already not tracked"
git rm -r --cached src/api/ 2>/dev/null || echo "api already not tracked"
git rm -r --cached src/backend/migrations/ 2>/dev/null || echo "migrations already not tracked"
git rm --cached *.md 2>/dev/null || echo "markdown files already not tracked"
git rm --cached *.sql 2>/dev/null || echo "SQL files already not tracked"
git rm --cached src/backend/run-migration.mjs 2>/dev/null || echo "migration script already not tracked"

echo ""
echo "✅ Cached files removed"
echo ""

# Step 3: Add all files (respecting .gitignore)
echo "📝 Adding files to staging area..."
git add .

echo ""
echo "✅ Files staged for commit"
echo ""

# Step 4: Show what will be committed
echo "📋 Files that will be committed:"
git status --short
echo ""

# Step 5: Instructions for next steps
echo "============================================"
echo "✅ Repository is ready for review!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Review the files above to confirm only web-frontend and backend are included"
echo "2. Commit the changes:"
echo "   git commit -m 'Prepare clean repository for code review'"
echo ""
echo "3. Create a new repository on GitHub/GitLab"
echo ""
echo "4. Add the new remote and push:"
echo "   git remote add review <new-repo-url>"
echo "   git push review main"
echo ""
echo "Or if you want to create a completely fresh repo:"
echo "   cd .."
echo "   git clone --depth 1 jau-new jau-review"
echo "   cd jau-review"
echo "   rm -rf .git"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit for code review'"
echo "   git remote add origin <new-repo-url>"
echo "   git push -u origin main"
echo ""
echo "============================================"
