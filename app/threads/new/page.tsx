import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { NewThreadForm } from "@/components/threads/new-thread-form"

export default async function NewThreadPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/threads/new")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

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

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Create New Thread</h1>
          <p className="text-muted-foreground">
            Start a new discussion with the community
          </p>
        </div>

        <NewThreadForm categories={categories || []} userId={user.id} />
      </main>
    </div>
  )
}
