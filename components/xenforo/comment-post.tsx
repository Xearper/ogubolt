"use client"

import { useState, useEffect, useCallback } from "react"
import { Reply, Trash2, Quote, Edit } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/xenforo/post-card"
import { ReactionBar } from "@/components/xenforo/reaction-bar"
import { CommentForm } from "@/components/comments/comment-form"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface CommentPostProps {
  comment: any
  threadId: string
  currentUser: any
  isLocked: boolean
  depth?: number
  onQuote?: (comment: any) => void
}

/**
 * XenForo-style comment/reply post
 */
export function CommentPost({
  comment,
  threadId,
  currentUser,
  isLocked,
  depth = 0,
  onQuote,
}: CommentPostProps) {
  const router = useRouter()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replies, setReplies] = useState<any[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const maxDepth = 3
  const isMaxDepth = depth >= maxDepth

  const loadReplies = useCallback(async () => {
    setLoadingReplies(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles!comments_author_id_fkey (*),
          reactions (*)
        `)
        .eq("parent_id", comment.id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading replies:", error)
        return
      }

      setReplies(data || [])
    } finally {
      setLoadingReplies(false)
    }
  }, [comment.id])

  useEffect(() => {
    if (showReplies && replies.length === 0) {
      loadReplies()
    }
  }, [showReplies, replies.length, loadReplies])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      toast.success("Comment deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const handleReplyAdded = (newReply: any) => {
    setReplies([...replies, newReply])
    setShowReplyForm(false)
    setShowReplies(true)
  }

  const handleQuote = () => {
    if (onQuote) {
      onQuote(comment)
    }
    setShowReplyForm(true)
  }

  // Build content with quoted comment if present
  let displayContent = comment.content
  if (comment.quoted_comment_id && comment.quoted_comment) {
    const quotedAuthor = comment.quoted_comment.profiles?.username || "Unknown"
    const quotedContent = comment.quoted_comment.content
    displayContent = `
      <div class="border-l-4 border-muted pl-4 mb-4 text-muted-foreground italic">
        <div class="font-semibold not-italic mb-1">${quotedAuthor} said:</div>
        ${quotedContent}
      </div>
      ${comment.content}
    `
  }

  return (
    <div className={`${depth > 0 ? "ml-8 mt-3" : ""}`}>
      <PostCard
        author={comment.profiles}
        content={displayContent}
        createdAt={comment.created_at}
      >
        {/* Reactions */}
        <div className="mt-4 pt-3 border-t">
          <ReactionBar
            targetType="comment"
            targetId={comment.id}
            currentUser={currentUser}
            reactions={comment.reactions || []}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {!isLocked && !isMaxDepth && currentUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="gap-1.5"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </Button>
              <Button variant="ghost" size="sm" onClick={handleQuote} className="gap-1.5">
                <Quote className="h-3.5 w-3.5" />
                Quote
              </Button>
            </>
          )}
          {currentUser?.id === comment.author_id && (
            <>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && currentUser && (
          <div className="mt-4 pt-4 border-t">
            <CommentForm
              threadId={threadId}
              parentId={comment.id}
              quotedCommentId={onQuote ? comment.id : undefined}
              onCommentAdded={handleReplyAdded}
              onCancel={() => setShowReplyForm(false)}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* Show replies button */}
        {!showReplies && comment.reply_count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(true)}
            className="mt-3"
          >
            Show {comment.reply_count} {comment.reply_count === 1 ? "reply" : "replies"}
          </Button>
        )}

        {/* Replies */}
        {showReplies && (
          <div className="mt-4">
            {loadingReplies ? (
              <p className="text-sm text-muted-foreground">Loading replies...</p>
            ) : (
              <div className="space-y-3">
                {replies.map((reply) => (
                  <CommentPost
                    key={reply.id}
                    comment={reply}
                    threadId={threadId}
                    currentUser={currentUser}
                    isLocked={isLocked}
                    depth={depth + 1}
                    onQuote={onQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </PostCard>
    </div>
  )
}
