import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { threadId, parentId, content } = body

    if (!threadId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        thread_id: threadId,
        parent_id: parentId || null,
        author_id: user.id,
        content,
      })
      .select(`
        *,
        profiles!comments_author_id_fkey (id, username, avatar_url, reputation),
        votes:comment_votes!comment_votes_comment_id_fkey (vote_type, user_id)
      `)
      .single()

    if (error) {
      console.error("Error creating comment:", error)
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      )
    }

    // Create notification for the recipient
    try {
      let recipientId: string | null = null
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single()

      if (parentId) {
        // Reply to a comment - notify the parent comment author
        const { data: parentComment } = await supabase
          .from("comments")
          .select("author_id")
          .eq("id", parentId)
          .single()

        recipientId = parentComment?.author_id || null
      } else {
        // Reply to a thread - notify the thread author
        const { data: thread } = await supabase
          .from("threads")
          .select("author_id")
          .eq("id", threadId)
          .single()

        recipientId = thread?.author_id || null
      }

      // Only create notification if recipient is not the comment author
      if (recipientId && recipientId !== user.id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: recipientId,
            type: "reply",
            content: `${profile?.username || "Someone"} replied to your ${parentId ? "comment" : "thread"}`,
            thread_id: threadId,
            comment_id: comment.id,
          })
      }
    } catch (notifError) {
      // Don't fail the comment creation if notification fails
      console.error("Error creating notification:", notifError)
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/comments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
