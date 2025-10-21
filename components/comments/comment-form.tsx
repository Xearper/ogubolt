"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface CommentFormProps {
  threadId: string
  parentId?: string
  onCommentAdded: (comment: any) => void
  onCancel?: () => void
  currentUser: any
}

export function CommentForm({ threadId, parentId, onCommentAdded, onCancel, currentUser }: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error("Please write a comment")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          parentId: parentId || null,
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

      const { comment } = await response.json()

      toast.success("Comment posted successfully!")
      setContent("")
      onCommentAdded(comment)
      router.refresh()
    } catch (error) {
      console.error("Error posting comment:", error)
      toast.error("Failed to post comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={currentUser.avatar_url || ""} />
          <AvatarFallback>
            {currentUser.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentId ? "Write a reply..." : "Write a comment..."}
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          loading={isSubmitting}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  )
}
