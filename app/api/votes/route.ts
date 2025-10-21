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
    const { threadId, commentId, voteType } = body

    if (!threadId && !commentId) {
      return NextResponse.json(
        { error: "Either threadId or commentId is required" },
        { status: 400 }
      )
    }

    if (threadId && commentId) {
      return NextResponse.json(
        { error: "Cannot vote on both thread and comment" },
        { status: 400 }
      )
    }

    if (threadId) {
      // Thread vote
      if (voteType === null) {
        // Remove vote
        await supabase
          .from("votes")
          .delete()
          .eq("thread_id", threadId)
          .eq("user_id", user.id)
      } else {
        // Upsert vote
        await supabase
          .from("votes")
          .upsert({
            thread_id: threadId,
            user_id: user.id,
            vote_type: voteType,
          }, {
            onConflict: "thread_id,user_id",
          })

        // Create notification for upvotes only
        if (voteType === "upvote") {
          try {
            const { data: thread } = await supabase
              .from("threads")
              .select("author_id")
              .eq("id", threadId)
              .single()

            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", user.id)
              .single()

            if (thread?.author_id && thread.author_id !== user.id) {
              await supabase
                .from("notifications")
                .insert({
                  user_id: thread.author_id,
                  type: "vote",
                  content: `${profile?.username || "Someone"} upvoted your thread`,
                  thread_id: threadId,
                })
            }
          } catch (notifError) {
            console.error("Error creating vote notification:", notifError)
          }
        }
      }
    } else if (commentId) {
      // Comment vote
      if (voteType === null) {
        // Remove vote
        await supabase
          .from("comment_votes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id)
      } else {
        // Upsert vote
        await supabase
          .from("comment_votes")
          .upsert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType,
          }, {
            onConflict: "comment_id,user_id",
          })

        // Create notification for upvotes only
        if (voteType === "upvote") {
          try {
            const { data: comment } = await supabase
              .from("comments")
              .select("author_id, thread_id")
              .eq("id", commentId)
              .single()

            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", user.id)
              .single()

            if (comment?.author_id && comment.author_id !== user.id) {
              await supabase
                .from("notifications")
                .insert({
                  user_id: comment.author_id,
                  type: "vote",
                  content: `${profile?.username || "Someone"} upvoted your comment`,
                  thread_id: comment.thread_id,
                  comment_id: commentId,
                })
            }
          } catch (notifError) {
            console.error("Error creating vote notification:", notifError)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/votes:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
