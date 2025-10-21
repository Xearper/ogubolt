import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MessageSquare, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
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

  // Fetch categories with thread counts
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      threads (id)
    `)
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Categories</h1>
            <p className="text-muted-foreground mt-2">
              Browse discussions by category
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories?.map((category) => {
              const threadCount = category.threads?.length || 0

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 h-full">
                    <div className="space-y-4">
                      {/* Category Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                        {category.color && (
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                      </div>

                      {/* Category Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" />
                          <span>
                            {threadCount} {threadCount === 1 ? 'thread' : 'threads'}
                          </span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div>
                        <Badge
                          variant="secondary"
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          View Threads
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Empty State */}
          {(!categories || categories.length === 0) && (
            <Card className="p-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground">
                Categories will appear here once they are created.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
