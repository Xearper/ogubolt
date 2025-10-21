import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { threadId, commentId, reactionType } = await request.json()

    // Validate that either threadId or commentId is provided (not both, not neither)
    if ((!threadId && !commentId) || (threadId && commentId)) {
      return NextResponse.json(
        { error: "Must provide either threadId or commentId" },
        { status: 400 }
      )
    }

    // Validate reaction type
    const validReactions = ["like", "love", "haha", "wow", "sad", "angry"]
    if (reactionType && !validReactions.includes(reactionType)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 })
    }

    // If reactionType is null, remove the reaction
    if (!reactionType) {
      const { error } = await supabase
        .from("reactions")
        .delete()
        .eq("user_id", user.id)
        .eq(threadId ? "thread_id" : "comment_id", threadId || commentId)

      if (error) {
        console.error("Error removing reaction:", error)
        return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Check if user already reacted with this type
    const { data: existing } = await supabase
      .from("reactions")
      .select("*")
      .eq("user_id", user.id)
      .eq(threadId ? "thread_id" : "comment_id", threadId || commentId)
      .eq("reaction_type", reactionType)
      .single()

    if (existing) {
      // Remove reaction if clicking the same one
      const { error } = await supabase
        .from("reactions")
        .delete()
        .eq("user_id", user.id)
        .eq(threadId ? "thread_id" : "comment_id", threadId || commentId)
        .eq("reaction_type", reactionType)

      if (error) {
        console.error("Error removing reaction:", error)
        return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Remove any other reaction from this user on this target
    await supabase
      .from("reactions")
      .delete()
      .eq("user_id", user.id)
      .eq(threadId ? "thread_id" : "comment_id", threadId || commentId)

    // Add new reaction
    const { error } = await supabase.from("reactions").insert({
      user_id: user.id,
      thread_id: threadId || null,
      comment_id: commentId || null,
      reaction_type: reactionType,
    })

    if (error) {
      console.error("Error adding reaction:", error)
      return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
    }

    // Fetch updated reactions
    const { data: reactions } = await supabase
      .from("reactions")
      .select("*")
      .eq(threadId ? "thread_id" : "comment_id", threadId || commentId)

    return NextResponse.json({ success: true, reactions })
  } catch (error) {
    console.error("Error handling reaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
