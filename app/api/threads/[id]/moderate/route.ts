import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
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

    // Check if user is moderator or admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.role !== "moderator" && profile.role !== "admin")) {
      return NextResponse.json(
        { error: "Forbidden: Moderator access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    let updateData: { is_pinned?: boolean; is_locked?: boolean } = {}

    switch (action) {
      case "pin":
        updateData = { is_pinned: true }
        break
      case "unpin":
        updateData = { is_pinned: false }
        break
      case "lock":
        updateData = { is_locked: true }
        break
      case "unlock":
        updateData = { is_locked: false }
        break
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    const { error } = await supabase
      .from("threads")
      .update(updateData)
      .eq("id", id)

    if (error) {
      console.error("Error moderating thread:", error)
      return NextResponse.json(
        { error: "Failed to moderate thread" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PATCH /api/threads/[id]/moderate:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
