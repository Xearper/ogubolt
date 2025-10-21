import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Heart, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function LeaderboardPage() {
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

  // Get top users by reputation
  const { data: topByReputation } = await supabase
    .from("profiles")
    .select("*")
    .order("reputation", { ascending: false })
    .limit(10)

  // Get top users by post count
  const { data: topByPosts } = await supabase
    .from("profiles")
    .select("*")
    .order("post_count", { ascending: false })
    .limit(10)

  // Get top users by level
  const { data: topByLevel } = await supabase
    .from("profiles")
    .select("*")
    .order("level", { ascending: false })
    .limit(10)

  // Get top users by likes received
  const { data: topByLikes } = await supabase
    .from("profiles")
    .select("*")
    .order("likes_received", { ascending: false })
    .limit(10)

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  function LeaderboardCard({
    title,
    icon: Icon,
    users,
    getValue,
    label,
  }: {
    title: string
    icon: any
    users: any[]
    getValue: (user: any) => number
    label: string
  }) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Icon className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="space-y-3">
          {users?.map((user, index) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex-shrink-0 w-8 text-center">
                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />}
                {index === 1 && <Trophy className="h-5 w-5 text-gray-400 mx-auto" />}
                {index === 2 && <Trophy className="h-5 w-5 text-orange-600 mx-auto" />}
                {index > 2 && <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || ""} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{user.username}</div>
                <div className="text-xs text-muted-foreground">Level {user.level}</div>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {getValue(user)} {label}
              </Badge>
            </Link>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header user={profile} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top contributors and active members</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeaderboardCard
            title="Top by Reputation"
            icon={Trophy}
            users={topByReputation || []}
            getValue={(user) => user.reputation}
            label="rep"
          />

          <LeaderboardCard
            title="Top by Posts"
            icon={MessageSquare}
            users={topByPosts || []}
            getValue={(user) => user.post_count}
            label="posts"
          />

          <LeaderboardCard
            title="Top by Level"
            icon={TrendingUp}
            users={topByLevel || []}
            getValue={(user) => user.level}
            label="lvl"
          />

          <LeaderboardCard
            title="Most Liked"
            icon={Heart}
            users={topByLikes || []}
            getValue={(user) => user.likes_received}
            label="likes"
          />
        </div>
      </main>
    </div>
  )
}
