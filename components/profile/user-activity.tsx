"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, FileText, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface UserActivityProps {
  threads: any[]
  comments: any[]
  username: string
}

export function UserActivity({ threads, comments, username }: UserActivityProps) {
  const [activeTab, setActiveTab] = useState<"threads" | "comments">("threads")

  return (
    <div className="space-y-6">
      <Card className="p-1">
        <div className="flex gap-1">
          <Button
            variant={activeTab === "threads" ? "default" : "ghost"}
            onClick={() => setActiveTab("threads")}
            className="flex-1 gap-2"
          >
            <FileText className="h-4 w-4" />
            Threads ({threads.length})
          </Button>
          <Button
            variant={activeTab === "comments" ? "default" : "ghost"}
            onClick={() => setActiveTab("comments")}
            className="flex-1 gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.length})
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {activeTab === "threads" && (
          <>
            {threads.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No threads yet"
                description={`${username} hasn't created any threads yet.`}
              />
            ) : (
              threads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-all duration-200">
                    <Link href={`/threads/${thread.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        {thread.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                      {thread.categories && (
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: thread.categories.color ? thread.categories.color + "20" : undefined,
                            borderColor: thread.categories.color || undefined,
                          }}
                        >
                          {thread.categories.name}
                        </Badge>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{thread.comments?.length || 0} comments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {thread.votes?.filter((v: any) => v.vote_type === "upvote").length || 0} upvotes
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </>
        )}

        {activeTab === "comments" && (
          <>
            {comments.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No comments yet"
                description={`${username} hasn't commented on any threads yet.`}
              />
            ) : (
              comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-all duration-200">
                    <div className="mb-2">
                      <span className="text-sm text-muted-foreground">
                        Commented on{" "}
                        <Link
                          href={`/threads/${comment.threads.id}`}
                          className="font-medium text-foreground hover:text-violet-600 dark:hover:text-violet-400"
                        >
                          {comment.threads.title}
                        </Link>
                      </span>
                    </div>
                    <p className="text-sm mb-2 line-clamp-3">{comment.content}</p>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
