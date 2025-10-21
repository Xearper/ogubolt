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

    // Check if already watching
    const { data: existing } = await supabase
      .from("thread_watchers")
      .select("*")
      .eq("user_id", user.id)
      .eq("thread_id", threadId)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Already watching" }, { status: 400 })
    }

    // Add watcher
    const { error } = await supabase.from("thread_watchers").insert({
      user_id: user.id,
      thread_id: threadId,
    })

    if (error) {
      console.error("Error adding watcher:", error)
      return NextResponse.json({ error: "Failed to add watcher" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling watcher:", error)
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
      .from("thread_watchers")
      .delete()
      .eq("user_id", user.id)
      .eq("thread_id", threadId)

    if (error) {
      console.error("Error removing watcher:", error)
      return NextResponse.json({ error: "Failed to remove watcher" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling watcher:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
