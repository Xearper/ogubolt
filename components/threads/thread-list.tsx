"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, ArrowBigUp, Pin, Lock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Thread {
  id: string
  title: string
  content: string
  created_at: string
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  profiles: {
    username: string
    avatar_url: string | null
    reputation: number
  }
  categories: {
    name: string
    slug: string
    color: string | null
  } | null
  votes: Array<{ vote_type: string }>
  comments: Array<{ id: string }>
}

interface ThreadListProps {
  threads: Thread[]
  currentUserId?: string
}

export function ThreadList({ threads, currentUserId }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No threads yet. Be the first to start a discussion!
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => {
        const upvotes = thread.votes.filter((v) => v.vote_type === "upvote").length
        const downvotes = thread.votes.filter((v) => v.vote_type === "downvote").length
        const score = upvotes - downvotes

        return (
          <Card
            key={thread.id}
            className="p-4 hover:shadow-lg transition-all duration-200 border-l-4"
            style={{
              borderLeftColor: thread.is_pinned
                ? "#8b5cf6"
                : thread.categories?.color || "transparent",
            }}
          >
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="flex flex-col items-center">
                  <ArrowBigUp className="h-6 w-6 text-muted-foreground" />
                  <span className="font-bold text-lg">{score}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/threads/${thread.id}`}
                      className="group inline-flex items-center gap-2"
                    >
                      {thread.is_pinned && (
                        <Pin className="h-4 w-4 text-violet-500" />
                      )}
                      {thread.is_locked && (
                        <Lock className="h-4 w-4 text-orange-500" />
                      )}
                      <h3 className="text-lg font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {thread.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {thread.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {thread.categories && (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: thread.categories.color + "20",
                        borderColor: thread.categories.color,
                      }}
                    >
                      {thread.categories.name}
                    </Badge>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={thread.profiles.avatar_url || ""} />
                      <AvatarFallback className="text-xs">
                        {thread.profiles.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/profile/${thread.profiles.username}`}
                      className="hover:underline"
                    >
                      {thread.profiles.username}
                    </Link>
                    <span className="text-xs">({thread.profiles.reputation} rep)</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{thread.comments.length}</span>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
