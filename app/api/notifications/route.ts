import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
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

    // Fetch user's notifications
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select(`
        *,
        threads (id, title),
        comments (id, content)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Notifications fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      )
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
