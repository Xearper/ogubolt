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

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/comments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
