import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { ThreadList } from "@/components/threads/thread-list"
import { CategorySidebar } from "@/components/layout/category-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const THREADS_PER_PAGE = 20

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{ page?: string }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const searchParamsData = await searchParams
  const currentPage = Number(searchParamsData.page) || 1
  const offset = (currentPage - 1) * THREADS_PER_PAGE

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

  // Fetch the category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!category) {
    notFound()
  }

  // Get total count for pagination
  const { count: totalThreads } = await supabase
    .from("threads")
    .select("*", { count: "exact", head: true })
    .eq("category_id", category.id)

  const totalPages = Math.ceil((totalThreads || 0) / THREADS_PER_PAGE)

  // Fetch threads for this category
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
    .range(offset, offset + THREADS_PER_PAGE - 1)

  // Fetch all categories for sidebar
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
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Back Button */}
            <div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2 mb-2"
              >
                <Link href="/categories">
                  <ArrowLeft className="h-4 w-4" />
                  All Categories
                </Link>
              </Button>
            </div>

            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate">
                    {category.name}
                  </h1>
                  {category.color && (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
                {category.description && (
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <div className="mt-3">
                  <Badge variant="secondary">
                    {totalThreads || 0} {totalThreads === 1 ? 'thread' : 'threads'}
                  </Badge>
                </div>
              </div>
              {user && (
                <Button
                  asChild
                  size="default"
                  className="gap-2 w-full sm:w-auto flex-shrink-0"
                >
                  <Link href="/threads/new">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>New Thread</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Thread List */}
            <ThreadList threads={threads || []} currentUserId={user?.id} />

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <CategorySidebar categories={categories || []} currentSlug={slug} />
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
