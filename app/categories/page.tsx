import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"

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

  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      threads:threads(count)
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

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Browse all discussion categories
          </p>
        </div>

        <div className="grid gap-4">
          {categories?.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex-shrink-0"
                    style={{
                      backgroundColor: category.color || "#8b5cf6",
                      opacity: 0.2,
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-1">{category.name}</h2>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="secondary">
                        {category.threads?.[0]?.count || 0} threads
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
