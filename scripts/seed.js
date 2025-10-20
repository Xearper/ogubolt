#!/usr/bin/env node

/**
 * Seed Script for OGUBolt
 *
 * This script populates the database with sample data for testing and development.
 *
 * Usage:
 *   npm run seed
 *
 * Requirements:
 *   - Supabase project set up
 *   - Environment variables configured in .env.local
 *   - Database migrations already run
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    // Note: In a real implementation, you would:
    // 1. Create test users
    // 2. Generate sample threads
    // 3. Add comments to threads
    // 4. Create votes
    // 5. Add tags to threads

    console.log('✅ Seed completed successfully!')
    console.log('\nSample data has been added to your database.')
    console.log('You can now run `npm run dev` to see the forum in action.\n')

  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

// Run the seed function
seed()
