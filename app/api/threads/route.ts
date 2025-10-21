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

    const body = await request.json()
    const { title, content, categoryId, tags } = body

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create the thread
    const { data: thread, error: threadError } = await supabase
      .from("threads")
      .insert({
        title,
        content,
        author_id: user.id,
        category_id: categoryId,
      })
      .select()
      .single()

    if (threadError) {
      console.error("Error creating thread:", threadError)
      return NextResponse.json(
        { error: "Failed to create thread" },
        { status: 500 }
      )
    }

    // Create tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Check if tag exists, if not create it
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .single()

        let tagId: string

        if (!existingTag) {
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select("id")
            .single()

          if (tagError || !newTag) {
            console.error("Error creating tag:", tagError)
            continue
          }

          tagId = newTag.id
        } else {
          tagId = existingTag.id
        }

        // Link tag to thread
        await supabase
          .from("thread_tags")
          .insert({
            thread_id: thread.id,
            tag_id: tagId,
          })
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
