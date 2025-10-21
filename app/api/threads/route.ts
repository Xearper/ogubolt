import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }
    const { title, content, categoryId, tags } = body

    // Validate required fields
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json(
        { error: "Category ID is required and must be a valid string" },
        { status: 400 }
      )
    }

    // Validate title length
    if (title.trim().length > 200) {
      return NextResponse.json(
        { error: "Title must not exceed 200 characters" },
        { status: 400 }
      )
    }

    // Create the thread
    const { data: thread, error: threadError } = await supabase
      .from("threads")
      .insert({
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        category_id: categoryId,
      })
      .select()
      .single()

    if (threadError) {
      console.error("Error creating thread:", {
        error: threadError,
        message: threadError.message,
        details: threadError.details,
        hint: threadError.hint,
        code: threadError.code,
      })

      // Return specific error message based on error code
      if (threadError.code === '23503') {
        return NextResponse.json(
          { error: "Invalid category ID. The selected category does not exist." },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Failed to create thread", details: threadError.message },
        { status: 500 }
      )
    }

    // Create tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        try {
          // Validate tag name
          if (!tagName || typeof tagName !== 'string' || !tagName.trim()) {
            console.warn("Skipping invalid tag:", tagName)
            continue
          }

          const normalizedTagName = tagName.trim().toLowerCase()

          // Check if tag exists, if not create it
          const { data: existingTag, error: fetchError } = await supabase
            .from("tags")
            .select("id")
            .eq("name", normalizedTagName)
            .maybeSingle()

          if (fetchError) {
            console.error("Error fetching tag:", fetchError)
            continue
          }

          let tagId: string

          if (!existingTag) {
            const { data: newTag, error: tagError } = await supabase
              .from("tags")
              .insert({ name: normalizedTagName })
              .select("id")
              .single()

            if (tagError) {
              console.error("Error creating tag:", tagError)
              // If tag already exists due to race condition, try fetching it again
              const { data: retryTag } = await supabase
                .from("tags")
                .select("id")
                .eq("name", normalizedTagName)
                .maybeSingle()

              if (retryTag) {
                tagId = retryTag.id
              } else {
                continue
              }
            } else if (newTag) {
              tagId = newTag.id
            } else {
              continue
            }
          } else {
            tagId = existingTag.id
          }

          // Link tag to thread
          const { error: linkError } = await supabase
            .from("thread_tags")
            .insert({
              thread_id: thread.id,
              tag_id: tagId,
            })

          if (linkError) {
            console.error("Error linking tag to thread:", linkError)
            // Don't fail the entire request if tag linking fails
          }
        } catch (tagError) {
          console.error("Unexpected error processing tag:", tagName, tagError)
          // Continue processing other tags
        }
      }
    }

    return NextResponse.json({ thread }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/threads:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
