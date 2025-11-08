#!/bin/bash

# ==================================
# Verification Script
# ==================================
# Check what will be included in the new repository

echo "🔍 Verifying what will be shared with IT Expert..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FOLDERS THAT WILL BE INCLUDED:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -d src/web-frontend src/backend 2>/dev/null || echo "Folders found!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ FOLDERS THAT WILL BE EXCLUDED:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "- src/web-backend/"
echo "- src/api/"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ FILES THAT WILL BE EXCLUDED:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "All .md files:"
ls *.md 2>/dev/null | sed 's/^/  - /'
echo ""
echo "All .sql files:"
ls *.sql 2>/dev/null | sed 's/^/  - /' || echo "  (none found at root)"
echo ""
echo "Migration files:"
ls src/backend/*migration* 2>/dev/null | sed 's/^/  - /' || echo "  - src/backend/migrations/ (folder)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ IMPORTANT: build.js WILL BE INCLUDED:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find src/backend -name "build.js" 2>/dev/null | sed 's/^/  ✓ /'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count files in web-frontend
FRONTEND_COUNT=$(find src/web-frontend -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | wc -l)
echo "Frontend files (.ts, .tsx, .js): $FRONTEND_COUNT"

# Count files in backend
BACKEND_COUNT=$(find src/backend -type f \( -name "*.ts" -o -name "*.js" \) ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null | wc -l)
echo "Backend files (.ts, .js): $BACKEND_COUNT"

echo ""
echo "✅ Ready to share with IT Expert!"
echo ""
