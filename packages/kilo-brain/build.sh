#!/bin/bash

# Build script for Claude Code Integration plugin
# Author: David Alcalá
# Repository: https://github.com/deivid11/obsidian-claude-code-plugin

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Building Claude Code Integration Plugin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Run TypeScript compilation and build
echo "🔧 Running TypeScript compilation..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Build Successful!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📦 Build artifacts:"

    # Show file sizes
    if [ -f "main.js" ]; then
        main_size=$(du -h main.js | cut -f1)
        echo "   ✓ main.js         ($main_size)"
    fi

    if [ -f "manifest.json" ]; then
        manifest_size=$(du -h manifest.json | cut -f1)
        echo "   ✓ manifest.json   ($manifest_size)"
    fi

    if [ -f "styles.css" ]; then
        styles_size=$(du -h styles.css | cut -f1)
        echo "   ✓ styles.css      ($styles_size)"
    fi

    echo ""
    echo "🚀 Ready for:"
    echo "   • Local testing"
    echo "   • GitHub release"
    echo "   • Obsidian submission"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Build Failed"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi
