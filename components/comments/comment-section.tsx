"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Comment } from "@/components/comments/comment"
import { CommentForm } from "@/components/comments/comment-form"

interface CommentSectionProps {
  threadId: string
  comments: any[]
  currentUser: any
  isLocked: boolean
}

export function CommentSection({ threadId, comments, currentUser, isLocked }: CommentSectionProps) {
  const [localComments, setLocalComments] = useState(comments)

  const handleCommentAdded = (newComment: any) => {
    setLocalComments([...localComments, newComment])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          {localComments.length} {localComments.length === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      {/* Comment form */}
      {currentUser && !isLocked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <CommentForm
              threadId={threadId}
              onCommentAdded={handleCommentAdded}
              currentUser={currentUser}
            />
          </Card>
        </motion.div>
      )}

      {isLocked && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            This thread is locked. No new comments can be added.
          </p>
        </Card>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {localComments.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No comments yet"
            description="Be the first to share your thoughts on this thread!"
          />
        ) : (
          localComments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Comment
                comment={comment}
                threadId={threadId}
                currentUser={currentUser}
                isLocked={isLocked}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
