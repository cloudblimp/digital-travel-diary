#!/bin/bash

# Quick start script for Digital Travel Diary
# This script helps you get up and running quickly

echo "🚀 Digital Travel Diary - Quick Start"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found"
    echo ""
    echo "Choose your setup option:"
    echo "1. Use Firebase Emulator (Local Development) - Requires Java"
    echo "2. Use Real Firebase (Cloud)"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo "📝 Setting up Firebase Emulator..."
        
        # Check if Java is installed
        if ! command -v java &> /dev/null; then
            echo "❌ Java is not installed."
            echo "Firebase Emulator requires Java Runtime Environment (JRE)"
            echo "Download from: https://www.java.com/"
            exit 1
        fi
        
        echo "✅ Java found: $(java -version 2>&1 | head -n 1)"
        echo ""
        
        # Copy .env.local.example
        cp .env.local.example .env.local
        
        # Update for emulator
        sed -i '' 's/VITE_USE_FIREBASE_EMULATOR=.*/VITE_USE_FIREBASE_EMULATOR=true/' .env.local
        
        echo "✅ .env.local created with emulator configuration"
        echo ""
        echo "Next steps:"
        echo "1. Make sure Firebase emulator is running in another terminal:"
        echo "   firebase emulators:start --only storage,firestore,auth"
        echo ""
        echo "2. Then start the dev server:"
        echo "   npm run dev"
        echo ""
        
    elif [ "$choice" = "2" ]; then
        echo "📝 Setting up Real Firebase..."
        echo ""
        echo "Follow these steps:"
        echo "1. Go to https://console.firebase.google.com/"
        echo "2. Create a new project named 'digital-travel-diary'"
        echo "3. Set up Firestore Database (Test Mode)"
        echo "4. Set up Cloud Storage"
        echo "5. Copy your Firebase credentials"
        echo "6. Update .env.local with your credentials"
        echo ""
        echo "For detailed instructions, see: FIREBASE_SETUP.md"
        echo ""
        exit 0
    else
        echo "❌ Invalid choice"
        exit 1
    fi
fi

echo ""
echo "✅ Configuration complete!"
echo ""
echo "To start development:"
echo ""

if grep -q "VITE_USE_FIREBASE_EMULATOR=true" .env.local; then
    echo "1. Start Firebase Emulator in one terminal:"
    echo "   firebase emulators:start --only storage,firestore,auth"
    echo ""
    echo "2. Start the dev server in another terminal:"
    echo "   npm run dev"
else
    echo "Start the dev server:"
    echo "   npm run dev"
fi

echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
