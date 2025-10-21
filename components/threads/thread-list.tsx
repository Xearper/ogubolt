"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, ArrowBigUp, ArrowBigDown, Pin, Lock, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

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

// Animation variants for stagger effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
}

export function ThreadList({ threads }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No threads yet"
        description="Be the first to start a discussion! Share your thoughts, ask questions, or start a conversation with the community."
      />
    )
  }

  return (
    <motion.div
      className="space-y-2 sm:space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {threads.map((thread) => {
        const upvotes = thread.votes.filter((v) => v.vote_type === "upvote").length
        const downvotes = thread.votes.filter((v) => v.vote_type === "downvote").length
        const score = upvotes - downvotes

        return (
          <motion.div key={thread.id} variants={itemVariants}>
            <Card
              className="p-3 sm:p-4 hover:shadow-lg transition-all duration-200 border-l-4"
              style={{
                borderLeftColor: thread.is_pinned
                  ? "#8b5cf6"
                  : thread.categories?.color || "transparent",
              }}
            >
            <div className="flex gap-2 sm:gap-4">
              {/* Vote Section - Responsive with Enhanced Animations */}
              <div className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-[40px] sm:min-w-[60px]">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-violet-50 dark:hover:bg-violet-950/30 group"
                  >
                    <ArrowBigUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200" />
                  </Button>
                </motion.div>
                <motion.span
                  className="font-bold text-sm sm:text-lg"
                  initial={{ scale: 1 }}
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
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-orange-50 dark:hover:bg-orange-950/30 group"
                  >
                    <ArrowBigDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" />
                  </Button>
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title with Icons */}
                <div className="flex items-start gap-2">
                  <Link
                    href={`/threads/${thread.id}`}
                    className="group flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      {thread.is_pinned && (
                        <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-500 flex-shrink-0" />
                      )}
                      {thread.is_locked && (
                        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                      )}
                      <h3 className="text-base sm:text-lg font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                        {thread.title}
                      </h3>
                    </div>
                  </Link>
                </div>

                {/* Preview Text - Hidden on small mobile */}
                <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2">
                  {thread.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                </p>

                {/* Meta Information - Mobile Optimized */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                  {/* Category Badge */}
                  {thread.categories && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5"
                      style={{
                        backgroundColor: thread.categories.color ? thread.categories.color + "20" : undefined,
                        borderColor: thread.categories.color || undefined,
                      }}
                    >
                      {thread.categories.name}
                    </Badge>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                      <AvatarImage src={thread.profiles.avatar_url || ""} />
                      <AvatarFallback className="text-[10px] sm:text-xs">
                        {thread.profiles.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/profile/${thread.profiles.username}`}
                      className="hover:underline truncate max-w-[100px] sm:max-w-none"
                    >
                      {thread.profiles.username}
                    </Link>
                    <span className="hidden sm:inline text-xs">
                      ({thread.profiles.reputation} rep)
                    </span>
                  </div>

                  {/* Comment Count */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{thread.comments.length}</span>
                  </div>

                  {/* Time - Abbreviated on mobile */}
                  <span className="text-muted-foreground hidden xs:inline">
                    {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
