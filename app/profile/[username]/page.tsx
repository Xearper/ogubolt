import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { UserProfile } from "@/components/profile/user-profile"
import { UserActivity } from "@/components/profile/user-activity"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let currentUserProfile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    currentUserProfile = data
  }

  // Get profile by username
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Get user's threads
  const { data: threads } = await supabase
    .from("threads")
    .select(`
      *,
      profiles!threads_author_id_fkey (username, avatar_url, reputation),
      categories (name, slug, color),
      votes:votes!votes_thread_id_fkey (vote_type),
      comments (id)
    `)
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user's comments
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      threads (id, title)
    `)
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10)

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header user={currentUserProfile} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UserProfile
              profile={profile}
              isOwnProfile={currentUserProfile?.id === profile.id}
            />
          </div>
          <div className="lg:col-span-2">
            <UserActivity
              threads={threads || []}
              comments={comments || []}
              username={params.username}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
