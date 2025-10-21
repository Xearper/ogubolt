import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { ThreadList } from "@/components/threads/thread-list"
import { CategorySidebar } from "@/components/layout/category-sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  const { data: threads } = await supabase
    .from("threads")
    .select(`
      *,
      profiles!threads_author_id_fkey (username, avatar_url, reputation),
      categories (name, slug, color),
      votes:votes!votes_thread_id_fkey (vote_type),
      comments (id)
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header user={profile} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content - Mobile First */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Header Section - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold truncate">Latest Threads</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 hidden sm:block">
                  Discover the latest discussions and opportunities
                </p>
              </div>
              {user && (
                <Button
                  asChild
                  size="default"
                  className="gap-2 w-full sm:w-auto flex-shrink-0"
                >
                  <Link href="/threads/new">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sm:inline">New Thread</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Thread List */}
            <ThreadList threads={threads || []} currentUserId={user?.id} />
          </div>

          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block space-y-6">
            <CategorySidebar categories={categories || []} />
          </div>
        </div>
      </main>

      {/* Floating Action Button - Mobile Only */}
      {user && (
        <div className="fixed bottom-6 right-6 lg:hidden">
          <Button
            asChild
            size="lg"
            className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          >
            <Link href="/threads/new">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
