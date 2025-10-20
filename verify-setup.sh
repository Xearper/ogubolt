#!/bin/bash

echo "🔍 Verifying OGUBolt Setup..."
echo ""

# Check .env.local
if [ -f .env.local ]; then
    echo "✅ .env.local exists"

    if grep -q "your-project-id.supabase.co" .env.local; then
        echo "❌ .env.local has placeholder values - update with real Supabase credentials"
    else
        echo "✅ .env.local appears configured"
    fi
else
    echo "❌ .env.local missing"
fi

# Check node_modules
if [ -d node_modules ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed - run: npm install"
fi

# Check key files
echo ""
echo "📁 Checking project files..."
[ -f "app/page.tsx" ] && echo "✅ Main page" || echo "❌ Main page missing"
[ -f "middleware.ts" ] && echo "✅ Auth middleware" || echo "❌ Middleware missing"
[ -f "lib/supabase/client.ts" ] && echo "✅ Supabase client" || echo "❌ Supabase client missing"
[ -f "supabase/migrations/20250101000000_initial_schema.sql" ] && echo "✅ Database migration" || echo "❌ Migration missing"

echo ""
echo "📊 Summary:"
echo "  - Total components: $(find components -name '*.tsx' 2>/dev/null | wc -l)"
echo "  - App pages: $(find app -name '*.tsx' 2>/dev/null | wc -l)"
echo ""

if grep -q "your-project-id.supabase.co" .env.local 2>/dev/null; then
    echo "⚠️  Next step: Update .env.local with your Supabase credentials"
elif [ ! -d node_modules ]; then
    echo "⚠️  Next step: Run 'npm install'"
else
    echo "✅ Ready to test! Run: npm run dev"
fi
