import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { followingId } = await request.json()

    if (!followingId) {
      return NextResponse.json({ error: "Following ID is required" }, { status: 400 })
    }

    if (followingId === user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    // Check if already following
    const { data: existing } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", followingId)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Already following" }, { status: 400 })
    }

    // Add follower
    const { error } = await supabase.from("followers").insert({
      follower_id: user.id,
      following_id: followingId,
    })

    if (error) {
      console.error("Error following user:", error)
      return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling follower:", error)
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

    const { followingId } = await request.json()

    if (!followingId) {
      return NextResponse.json({ error: "Following ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("followers")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", followingId)

    if (error) {
      console.error("Error unfollowing user:", error)
      return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling follower:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
