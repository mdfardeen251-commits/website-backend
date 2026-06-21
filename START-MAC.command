#!/bin/bash
# Website Dashboard launcher for macOS
# Double-click this file to start

cd "$(dirname "$0")"

echo ""
echo "============================================"
echo "      WEBSITE DASHBOARD - STARTING UP"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[!] Node.js is NOT installed on your Mac."
    echo ""
    echo "    Please install it first from:"
    echo "    https://nodejs.org"
    echo ""
    echo "    Download the 'LTS' version and install it."
    echo "    Then double-click THIS file again."
    echo ""
    read -p "Press Enter to close..."
    exit 1
fi

echo "Node.js found! ✓"
echo ""
echo "Installing required files (first time only)..."
npm install

echo ""
echo "============================================"
echo " DONE! Your dashboard is opening now."
echo ""
echo " Login details:"
echo "   Email:    admin@example.com"
echo "   Password: admin123"
echo ""
echo " (Keep this window open while you use it)"
echo "============================================"
echo ""

# Open browser
open http://localhost:3000

npm start

read -p "Press Enter to close..."
