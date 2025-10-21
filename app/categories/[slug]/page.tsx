import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { ThreadList } from "@/components/threads/thread-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function CategoryPage({ params }: { params: { slug: string } }) {
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

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single()

  if (!category) {
    notFound()
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
    .eq("category_id", category.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50)

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header user={profile} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </div>
          {user && (
            <Button asChild className="gap-2 w-full sm:w-auto">
              <Link href="/threads/new">
                <Plus className="h-4 w-4" />
                New Thread
              </Link>
            </Button>
          )}
        </div>

        <ThreadList threads={threads || []} currentUserId={user?.id} />
      </main>
    </div>
  )
}
