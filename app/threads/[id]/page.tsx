import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { ThreadDetail } from "@/components/threads/thread-detail"
import { CommentSection } from "@/components/comments/comment-section"

export default async function ThreadPage({ params }: { params: { id: string } }) {
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

  const { data: thread, error } = await supabase
    .from("threads")
    .select(`
      *,
      profiles!threads_author_id_fkey (id, username, avatar_url, reputation),
      categories (id, name, slug, color),
      votes:votes!votes_thread_id_fkey (vote_type, user_id),
      thread_tags (
        tags (id, name)
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !thread) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("threads")
    .update({ view_count: (thread.view_count || 0) + 1 })
    .eq("id", params.id)

  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles!comments_author_id_fkey (id, username, avatar_url, reputation),
      votes:comment_votes!comment_votes_comment_id_fkey (vote_type, user_id)
    `)
    .eq("thread_id", params.id)
    .is("parent_id", null)
    .order("created_at", { ascending: true })

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header user={profile} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-5xl">
        <ThreadDetail thread={thread} currentUser={profile} />
        <div className="mt-8">
          <CommentSection
            threadId={params.id}
            comments={comments || []}
            currentUser={profile}
            isLocked={thread.is_locked}
          />
        </div>
      </main>
    </div>
  )
}
