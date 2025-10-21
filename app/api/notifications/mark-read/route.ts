import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      // Mark all notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) {
        console.error("Mark all read error:", error)
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 }
        )
      }
    } else if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Mark read error:", error)
        return NextResponse.json(
          { error: "Failed to mark notification as read" },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "Missing notificationId or markAll parameter" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark read error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
