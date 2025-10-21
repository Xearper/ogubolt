"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { ArrowBigUp, ArrowBigDown, Pin, Lock, Eye, Share2, Flag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ModerationMenu } from "@/components/threads/moderation-menu"
import Link from "next/link"
import toast from "react-hot-toast"

interface ThreadDetailProps {
  thread: any
  currentUser: any
}

export function ThreadDetail({ thread, currentUser }: ThreadDetailProps) {
  const [voteState, setVoteState] = useState(() => {
    if (!currentUser) return null
    const userVote = thread.votes?.find((v: any) => v.user_id === currentUser.id)
    return userVote?.vote_type || null
  })

  const upvotes = thread.votes?.filter((v: any) => v.vote_type === "upvote").length || 0
  const downvotes = thread.votes?.filter((v: any) => v.vote_type === "downvote").length || 0
  const [score, setScore] = useState(upvotes - downvotes)

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!currentUser) {
      toast.error("Please sign in to vote")
      return
    }

    const previousVoteState = voteState
    const previousScore = score

    // Optimistic update
    if (voteState === voteType) {
      // Remove vote
      setVoteState(null)
      setScore(score + (voteType === "upvote" ? -1 : 1))
    } else if (voteState === null) {
      // Add vote
      setVoteState(voteType)
      setScore(score + (voteType === "upvote" ? 1 : -1))
    } else {
      // Change vote
      setVoteState(voteType)
      setScore(score + (voteType === "upvote" ? 2 : -2))
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: thread.id,
          voteType: voteState === voteType ? null : voteType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to vote")
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Failed to vote. Please try again.")
      // Revert optimistic update
      setVoteState(previousVoteState)
      setScore(previousScore)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
    } catch (error) {
      console.error("Error copying link:", error)
      toast.error("Failed to copy link")
    }
  }

  const tags = thread.thread_tags?.map((tt: any) => tt.tags) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6">
        {/* Header with voting */}
        <div className="flex gap-4">
          {/* Voting column */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVote("upvote")}
                className={`h-10 w-10 hover:bg-violet-50 dark:hover:bg-violet-950/30 ${
                  voteState === "upvote" ? "bg-violet-100 dark:bg-violet-950/50" : ""
                }`}
              >
                <ArrowBigUp
                  className={`h-6 w-6 transition-colors ${
                    voteState === "upvote"
                      ? "text-violet-600 dark:text-violet-400 fill-violet-600 dark:fill-violet-400"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            </motion.div>
            <motion.span
              className="font-bold text-lg"
              key={score}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
            >
              {score}
            </motion.span>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVote("downvote")}
                className={`h-10 w-10 hover:bg-orange-50 dark:hover:bg-orange-950/30 ${
                  voteState === "downvote" ? "bg-orange-100 dark:bg-orange-950/50" : ""
                }`}
              >
                <ArrowBigDown
                  className={`h-6 w-6 transition-colors ${
                    voteState === "downvote"
                      ? "text-orange-600 dark:text-orange-400 fill-orange-600 dark:fill-orange-400"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            </motion.div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title with icons */}
            <div className="flex items-start gap-2 mb-4">
              {thread.is_pinned && <Pin className="h-5 w-5 text-violet-500 flex-shrink-0 mt-1" />}
              {thread.is_locked && <Lock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />}
              <h1 className="text-2xl sm:text-3xl font-bold flex-1">{thread.title}</h1>
            </div>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
              <Link
                href={`/profile/${thread.profiles.username}`}
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={thread.profiles.avatar_url || ""} />
                  <AvatarFallback>
                    {thread.profiles.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{thread.profiles.username}</span>
                <span>({thread.profiles.reputation} rep)</span>
              </Link>

              <span>•</span>

              <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>

              <span>•</span>

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{thread.view_count || 0} views</span>
              </div>
            </div>

            {/* Category and tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: thread.categories?.color ? thread.categories.color + "20" : undefined,
                  borderColor: thread.categories?.color || undefined,
                }}
              >
                {thread.categories?.name}
              </Badge>
              {tags.map((tag: any) => (
                <Badge key={tag.id} variant="outline">
                  #{tag.name}
                </Badge>
              ))}
            </div>

            {/* Content */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: thread.content }}
            />

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              {currentUser && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
              )}
              {currentUser && (
                <ModerationMenu
                  threadId={thread.id}
                  isPinned={thread.is_pinned}
                  isLocked={thread.is_locked}
                  isAuthor={currentUser.id === thread.author_id}
                  isModerator={currentUser.role === "moderator" || currentUser.role === "admin"}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
