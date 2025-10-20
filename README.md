# OGUBolt - Modern Community Forum

A state-of-the-art community forum web application built with Next.js 14+, Supabase, and Tailwind CSS. Perfect for digital services marketplaces, username trading, and community discussions.

## Features

### Core Functionality
- 🔐 **Authentication** - Email/password + OAuth with Supabase Auth
- 📝 **Rich Text Editor** - Tiptap-powered editor for threads and comments
- 💬 **Nested Comments** - Infinite comment threading with replies
- ⬆️ **Voting System** - Upvote/downvote with reputation tracking
- 👤 **User Profiles** - Avatars, bio, activity history, and reputation
- 🏷️ **Categories & Tags** - Organize content efficiently
- 🔔 **Real-time Notifications** - Instant updates for replies and mentions
- 🔍 **Search** - Find threads, comments, and users
- 🛡️ **Moderation Tools** - Pin, lock, and delete content
- 🌓 **Dark/Light Theme** - Beautiful themes with smooth transitions

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel-ready

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- A GitHub account (for deployment and OAuth)
- Git installed on your machine

## Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd ogubolt
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: ogubolt (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for the project to be provisioned (~2 minutes)

#### Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

#### Configure Environment Variables

1. Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Edit \`.env.local\` and add your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of \`supabase/migrations/20250101000000_initial_schema.sql\`
4. Paste into the SQL editor
5. Click "Run" or press Ctrl+Enter

#### Option B: Using Supabase CLI

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
\`\`\`

### 5. Configure Authentication

#### Email/Password Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable "Email" provider
3. Configure email settings:
   - Enable "Confirm email"
   - Set "Site URL" to \`http://localhost:3000\`
   - Set "Redirect URLs" to \`http://localhost:3000/api/auth/callback\`

#### OAuth Providers (Optional)

**GitHub OAuth:**
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App:
   - **Application name**: OGUBolt
   - **Homepage URL**: \`http://localhost:3000\`
   - **Authorization callback URL**: \`https://your-project.supabase.co/auth/v1/callback\`
3. Copy Client ID and Client Secret
4. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub provider
   - Paste Client ID and Client Secret
   - Save

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add to Supabase (same as GitHub process)

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
ogubolt/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, signup)
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/              # Main app pages
│   │   ├── threads/
│   │   ├── profile/
│   │   ├── categories/
│   │   └── search/
│   ├── api/                 # API routes
│   │   └── auth/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   ├── threads/             # Thread components
│   ├── comments/            # Comment components
│   ├── auth/                # Auth components
│   └── profile/             # Profile components
├── lib/                     # Utilities
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
├── supabase/               # Supabase files
│   └── migrations/         # Database migrations
├── public/                 # Static files
└── hooks/                  # Custom React hooks
\`\`\`

## Database Schema

The application uses the following main tables:

- **profiles** - User profiles with reputation
- **threads** - Discussion threads
- **comments** - Nested comments
- **votes** - Upvotes/downvotes
- **categories** - Thread categories
- **tags** - Thread tags
- **thread_tags** - Many-to-many relationship
- **notifications** - User notifications

All tables have Row Level Security (RLS) enabled for security.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - Add all variables from \`.env.local\`
   - Set \`NEXT_PUBLIC_APP_URL\` to your Vercel domain
6. Deploy!

### Update Supabase Settings

After deployment:
1. In Supabase Dashboard → Authentication → URL Configuration:
   - Add your Vercel URL to "Site URL"
   - Add \`https://your-domain.vercel.app/api/auth/callback\` to "Redirect URLs"

### Update OAuth Providers

Update callback URLs in GitHub/Google OAuth settings to use your production domain.

## Customization

### Branding

1. Update logo and favicon in \`/public\`
2. Change colors in \`app/globals.css\` (CSS variables)
3. Update metadata in \`app/layout.tsx\`

### Categories

Default categories are created in the migration. To add more:
1. Go to Supabase Dashboard → Table Editor → categories
2. Insert new rows with name, slug, description, and color

## Features Guide

### Creating Threads

1. Sign in to your account
2. Click "New Thread" button
3. Select a category
4. Write your content using the rich text editor
5. Add tags (optional)
6. Click "Post Thread"

### Voting

- Click up arrow to upvote (gives author +10 reputation)
- Click down arrow to downvote (gives author -5 reputation)
- Your vote can be changed or removed

### Comments

- Reply to threads or other comments
- Supports infinite nesting
- Real-time updates
- Rich text formatting

### Moderation

Moderators can:
- Pin important threads (appears at top)
- Lock threads (prevent new comments)
- Delete inappropriate content

## Troubleshooting

### "Invalid API key" error
- Check that your Supabase URL and keys are correct in \`.env.local\`
- Ensure no trailing spaces in environment variables

### Database errors
- Verify migrations were run successfully
- Check RLS policies in Supabase Dashboard

### Authentication not working
- Confirm email provider is enabled in Supabase
- Check redirect URLs are configured correctly
- Verify middleware.ts is not blocking auth routes

### Build errors
- Clear \`.next\` folder: \`rm -rf .next\`
- Reinstall dependencies: \`rm -rf node_modules package-lock.json && npm install\`

## Performance Optimization

- **Images**: Use Next.js Image component for optimization
- **Caching**: API routes use Supabase caching
- **Pagination**: Threads limited to 20 per page
- **Real-time**: Only subscribe to relevant channels
- **Indexes**: Database indexes on frequently queried columns

## Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Server-side authentication validation
- ✅ Protected API routes
- ✅ SQL injection prevention (Supabase)
- ✅ XSS protection (React)
- ✅ CSRF protection (Next.js)

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## Roadmap

- [ ] Private messaging
- [ ] Image uploads for threads
- [ ] Advanced search with filters
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Badges and achievements
- [ ] Thread bookmarking
- [ ] User blocking
- [ ] Content reporting system

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS
