import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"

export default async function ProfileEditPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  let currentUserProfile = null
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  currentUserProfile = data

  // Get profile by username
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Only allow users to edit their own profile
  if (profile.id !== user.id) {
    redirect(`/profile/${username}`)
  }

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header user={currentUserProfile} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-3xl">
        <ProfileEditForm profile={profile} />
      </main>
    </div>
  )
}
