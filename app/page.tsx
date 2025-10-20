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

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Latest Threads</h1>
                <p className="text-muted-foreground mt-1">
                  Discover the latest discussions and opportunities
                </p>
              </div>
              {user && (
                <Button asChild size="lg" className="gap-2">
                  <Link href="/threads/new">
                    <Plus className="h-5 w-5" />
                    New Thread
                  </Link>
                </Button>
              )}
            </div>

            <ThreadList threads={threads || []} currentUserId={user?.id} />
          </div>

          <div className="space-y-6">
            <CategorySidebar categories={categories || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
