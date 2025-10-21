"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { CommentPost } from "@/components/xenforo/comment-post"
import { CommentForm } from "@/components/comments/comment-form"

interface XenforoCommentSectionProps {
  threadId: string
  comments: any[]
  currentUser: any
  isLocked: boolean
}

/**
 * XenForo-style comment section
 */
export function XenforoCommentSection({
  threadId,
  comments,
  currentUser,
  isLocked,
}: XenforoCommentSectionProps) {
  const [localComments, setLocalComments] = useState(comments)
  const [quotedComment, setQuotedComment] = useState<any>(null)

  const handleCommentAdded = (newComment: any) => {
    setLocalComments([...localComments, newComment])
    setQuotedComment(null)
  }

  const handleQuote = (comment: any) => {
    setQuotedComment(comment)
    // Scroll to comment form
    const formElement = document.getElementById("comment-form")
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          {localComments.length} {localComments.length === 1 ? "Reply" : "Replies"}
        </h2>
      </div>

      {/* Comment form */}
      {currentUser && !isLocked && (
        <motion.div
          id="comment-form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            {quotedComment && (
              <div className="mb-3 p-3 bg-muted rounded-lg border-l-4 border-primary">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">
                    Quoting: {quotedComment.profiles?.username || "Unknown"}
                  </span>
                  <button
                    onClick={() => setQuotedComment(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {quotedComment.content}
                </div>
              </div>
            )}
            <CommentForm
              threadId={threadId}
              quotedCommentId={quotedComment?.id}
              onCommentAdded={handleCommentAdded}
              currentUser={currentUser}
            />
          </Card>
        </motion.div>
      )}

      {isLocked && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            This thread is locked. No new replies can be added.
          </p>
        </Card>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {localComments.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No replies yet"
            description="Be the first to reply to this thread!"
          />
        ) : (
          localComments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CommentPost
                comment={comment}
                threadId={threadId}
                currentUser={currentUser}
                isLocked={isLocked}
                onQuote={handleQuote}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
