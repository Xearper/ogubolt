import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user owns the thread or is moderator/admin
    const { data: thread } = await supabase
      .from("threads")
      .select("author_id")
      .eq("id", id)
      .single()

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isModerator = profile?.role === "moderator" || profile?.role === "admin"
    const isAuthor = thread.author_id === user.id

    if (!isAuthor && !isModerator) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete the thread
    const { error } = await supabase
      .from("threads")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting thread:", error)
      return NextResponse.json(
        { error: "Failed to delete thread" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/threads/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
