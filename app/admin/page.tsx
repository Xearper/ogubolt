import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { UserManagement } from "@/components/admin/user-management"
import { Card } from "@/components/ui/card"
import { Users, MessageSquare, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get current user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Only allow admins to access this page
  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  // Fetch all users
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch statistics
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: threadCount } = await supabase
    .from("threads")
    .select("*", { count: "exact", head: true })

  const { count: commentCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header user={profile} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">
              Manage users, roles, and platform settings
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{userCount || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-violet-500/10">
                  <MessageSquare className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Threads</p>
                  <p className="text-2xl font-bold">{threadCount || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-fuchsia-500/10">
                  <TrendingUp className="h-6 w-6 text-fuchsia-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Comments</p>
                  <p className="text-2xl font-bold">{commentCount || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* User Management */}
          <UserManagement users={users || []} />
        </div>
      </main>
    </div>
  )
}
