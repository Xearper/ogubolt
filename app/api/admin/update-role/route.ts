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

    // Check if user is an admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, role } = body

    // Validate input
    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!["user", "moderator", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    // Prevent users from demoting themselves
    if (userId === user.id && role !== "admin") {
      return NextResponse.json(
        { error: "You cannot demote yourself" },
        { status: 400 }
      )
    }

    // Update user role
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId)

    if (updateError) {
      console.error("Role update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update role" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Role update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
