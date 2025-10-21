import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { SearchResults } from "@/components/search/search-results"
import { SearchFilters } from "@/components/search/search-filters"
import { ThreadListSkeleton } from "@/components/threads/thread-list-skeleton"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; tag?: string; sort?: string }
}) {
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SearchFilters categories={categories || []} />
          </div>
          <div className="lg:col-span-3">
            <Suspense fallback={<ThreadListSkeleton />}>
              <SearchResults
                query={searchParams.q}
                categoryId={searchParams.category}
                tag={searchParams.tag}
                sort={searchParams.sort}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
