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
    const { full_name, bio, location, website, avatar_url } = body

    // Validate input
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: "Bio must be 500 characters or less" },
        { status: 400 }
      )
    }

    if (full_name && full_name.length > 100) {
      return NextResponse.json(
        { error: "Full name must be 100 characters or less" },
        { status: 400 }
      )
    }

    if (location && location.length > 100) {
      return NextResponse.json(
        { error: "Location must be 100 characters or less" },
        { status: 400 }
      )
    }

    if (website && website.length > 200) {
      return NextResponse.json(
        { error: "Website must be 200 characters or less" },
        { status: 400 }
      )
    }

    // Validate website URL format if provided
    if (website) {
      try {
        new URL(website)
      } catch {
        return NextResponse.json(
          { error: "Website must be a valid URL" },
          { status: 400 }
        )
      }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: full_name || null,
        bio: bio || null,
        location: location || null,
        website: website || null,
        avatar_url: avatar_url || null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
