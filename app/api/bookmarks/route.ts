import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { threadId } = await request.json()

    if (!threadId) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 })
    }

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from("thread_bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .eq("thread_id", threadId)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Already bookmarked" }, { status: 400 })
    }

    // Add bookmark
    const { error } = await supabase.from("thread_bookmarks").insert({
      user_id: user.id,
      thread_id: threadId,
    })

    if (error) {
      console.error("Error adding bookmark:", error)
      return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { threadId } = await request.json()

    if (!threadId) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("thread_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("thread_id", threadId)

    if (error) {
      console.error("Error removing bookmark:", error)
      return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
