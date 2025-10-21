"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDistanceToNow } from "date-fns"
import { ArrowBigUp, ArrowBigDown, Reply, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CommentForm } from "@/components/comments/comment-form"
import Link from "next/link"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface CommentProps {
  comment: any
  threadId: string
  currentUser: any
  isLocked: boolean
  depth?: number
}

export function Comment({ comment, threadId, currentUser, isLocked, depth = 0 }: CommentProps) {
  const router = useRouter()
  const [voteState, setVoteState] = useState(() => {
    if (!currentUser) return null
    const userVote = comment.votes?.find((v: any) => v.user_id === currentUser.id)
    return userVote?.vote_type || null
  })

  const upvotes = comment.votes?.filter((v: any) => v.vote_type === "upvote").length || 0
  const downvotes = comment.votes?.filter((v: any) => v.vote_type === "downvote").length || 0
  const [score, setScore] = useState(upvotes - downvotes)

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
          profiles!comments_author_id_fkey (id, username, avatar_url, reputation),
          votes:comment_votes!comment_votes_comment_id_fkey (vote_type, user_id)
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

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!currentUser) {
      toast.error("Please sign in to vote")
      return
    }

    const previousVoteState = voteState
    const previousScore = score

    if (voteState === voteType) {
      setVoteState(null)
      setScore(score + (voteType === "upvote" ? -1 : 1))
    } else if (voteState === null) {
      setVoteState(voteType)
      setScore(score + (voteType === "upvote" ? 1 : -1))
    } else {
      setVoteState(voteType)
      setScore(score + (voteType === "upvote" ? 2 : -2))
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          voteType: voteState === voteType ? null : voteType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to vote")
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Failed to vote. Please try again.")
      setVoteState(previousVoteState)
      setScore(previousScore)
    }
  }

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

  return (
    <Card className={`p-4 ${depth > 0 ? "ml-8 mt-3" : ""}`}>
      <div className="flex gap-3">
        {/* Voting column */}
        <div className="flex flex-col items-center gap-1">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVote("upvote")}
              className={`h-6 w-6 p-0 ${
                voteState === "upvote" ? "bg-violet-100 dark:bg-violet-950/50" : ""
              }`}
            >
              <ArrowBigUp
                className={`h-4 w-4 ${
                  voteState === "upvote"
                    ? "text-violet-600 dark:text-violet-400 fill-violet-600"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </motion.div>
          <span className="text-xs font-semibold">{score}</span>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVote("downvote")}
              className={`h-6 w-6 p-0 ${
                voteState === "downvote" ? "bg-orange-100 dark:bg-orange-950/50" : ""
              }`}
            >
              <ArrowBigDown
                className={`h-4 w-4 ${
                  voteState === "downvote"
                    ? "text-orange-600 dark:text-orange-400 fill-orange-600"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <Link href={`/profile/${comment.profiles.username}`}>
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.profiles.avatar_url || ""} />
                <AvatarFallback>
                  {comment.profiles.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href={`/profile/${comment.profiles.username}`}
                className="font-medium hover:underline"
              >
                {comment.profiles.username}
              </Link>
              <span className="text-xs text-muted-foreground">
                ({comment.profiles.reputation} rep)
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <p className="text-sm whitespace-pre-wrap mb-3">{comment.content}</p>

          <div className="flex flex-wrap gap-2">
            {!isLocked && !isMaxDepth && currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-7 text-xs gap-1"
              >
                <Reply className="h-3 w-3" />
                Reply
              </Button>
            )}
            {currentUser?.id === comment.author_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && currentUser && (
            <div className="mt-4">
              <CommentForm
                threadId={threadId}
                parentId={comment.id}
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
              className="mt-2 h-7 text-xs"
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
                replies.map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    threadId={threadId}
                    currentUser={currentUser}
                    isLocked={isLocked}
                    depth={depth + 1}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
