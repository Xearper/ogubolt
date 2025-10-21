#!/bin/bash

echo "🚀 OGUBolt Setup & Test Helper"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Check if Supabase URL is set
if grep -q "your-project-id.supabase.co" .env.local; then
    echo "⚠️  WARNING: You haven't updated .env.local yet!"
    echo ""
    echo "Please edit .env.local and add your Supabase credentials:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "Get these from: https://supabase.com/dashboard → Your Project → Settings → API"
    exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "📋 Next steps:"
echo ""
echo "1. Run the database migration:"
echo "   → Go to Supabase Dashboard → SQL Editor"
echo "   → Copy contents of: supabase/migrations/20250101000000_initial_schema.sql"
echo "   → Paste and run in SQL Editor"
echo ""
echo "2. Enable Email authentication:"
echo "   → Go to Supabase Dashboard → Authentication → Providers"
echo "   → Enable 'Email' provider"
echo "   → Set Site URL: http://localhost:3000"
echo "   → Add Redirect URL: http://localhost:3000/api/auth/callback"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "================================"
