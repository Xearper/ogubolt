"use client"

import { useState } from "react"
import { Pin, Lock, Eye, Share2, Flag, Bookmark, Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/xenforo/post-card"
import { ReactionBar } from "@/components/xenforo/reaction-bar"
import { ModerationMenu } from "@/components/threads/moderation-menu"
import toast from "react-hot-toast"

interface ThreadPostProps {
  thread: any
  currentUser: any
}

/**
 * XenForo-style thread post (original post)
 */
export function ThreadPost({ thread, currentUser }: ThreadPostProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isWatching, setIsWatching] = useState(false)

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

  const handleBookmark = async () => {
    if (!currentUser) {
      toast.error("Please sign in to bookmark")
      return
    }

    try {
      const response = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id }),
      })

      if (!response.ok) throw new Error("Failed to bookmark")

      setIsBookmarked(!isBookmarked)
      toast.success(isBookmarked ? "Bookmark removed" : "Thread bookmarked!")
    } catch (error) {
      console.error("Error bookmarking:", error)
      toast.error("Failed to bookmark thread")
    }
  }

  const handleWatch = async () => {
    if (!currentUser) {
      toast.error("Please sign in to watch")
      return
    }

    try {
      const response = await fetch("/api/watchers", {
        method: isWatching ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id }),
      })

      if (!response.ok) throw new Error("Failed to watch")

      setIsWatching(!isWatching)
      toast.success(isWatching ? "No longer watching" : "Now watching this thread!")
    } catch (error) {
      console.error("Error watching:", error)
      toast.error("Failed to watch thread")
    }
  }

  const tags = thread.thread_tags?.map((tt: any) => tt.tags) || []

  return (
    <div className="space-y-4">
      {/* Thread Header */}
      <div className="space-y-3">
        {/* Title with icons */}
        <div className="flex items-start gap-2">
          {thread.is_pinned && <Pin className="h-6 w-6 text-violet-500 flex-shrink-0 mt-1" />}
          {thread.is_locked && <Lock className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex-1">{thread.title}</h1>
        </div>

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {/* Category */}
          <Badge
            variant="secondary"
            style={{
              backgroundColor: thread.categories?.color ? thread.categories.color + "20" : undefined,
              borderColor: thread.categories?.color || undefined,
            }}
          >
            {thread.categories?.name}
          </Badge>

          {/* Tags */}
          {tags.map((tag: any) => (
            <Badge key={tag.id} variant="outline">
              #{tag.name}
            </Badge>
          ))}

          <span>•</span>

          {/* View count */}
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{thread.view_count || 0} views</span>
          </div>
        </div>
      </div>

      {/* Thread Post */}
      <PostCard
        author={{
          ...thread.profiles,
          thread_count: thread.profiles.thread_count,
        }}
        content={thread.content}
        createdAt={thread.created_at}
      >
        {/* Reactions */}
        <div className="mt-6 pt-4 border-t">
          <ReactionBar
            targetType="thread"
            targetId={thread.id}
            currentUser={currentUser}
            reactions={thread.reactions || []}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          {currentUser && (
            <>
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className="gap-2"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>

              <Button
                variant={isWatching ? "default" : "outline"}
                size="sm"
                onClick={handleWatch}
                className="gap-2"
              >
                {isWatching ? <Bell className="h-4 w-4 fill-current" /> : <BellOff className="h-4 w-4" />}
                {isWatching ? "Watching" : "Watch"}
              </Button>

              <Button variant="outline" size="sm" className="gap-2">
                <Flag className="h-4 w-4" />
                Report
              </Button>

              <ModerationMenu
                threadId={thread.id}
                isPinned={thread.is_pinned}
                isLocked={thread.is_locked}
                isAuthor={currentUser.id === thread.author_id}
                isModerator={currentUser.role === "moderator" || currentUser.role === "admin"}
              />
            </>
          )}
        </div>
      </PostCard>
    </div>
  )
}
