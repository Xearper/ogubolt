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
