"use client"

import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { Heart, MessageSquare, Calendar, MapPin, Globe, Award } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RoleBadge } from "@/components/ui/role-badge"
import Link from "next/link"

interface PostCardProps {
  author: {
    id: string
    username: string
    avatar_url?: string | null
    role?: string
    role_id?: string | null
    reputation: number
    post_count: number
    thread_count?: number
    created_at: string
    location?: string | null
    signature?: string | null
    level?: number
  }
  content: string
  createdAt: string
  children?: React.ReactNode
  className?: string
}

/**
 * XenForo-style post card with user sidebar on the left
 * and post content on the right
 */
export function PostCard({ author, content, createdAt, children, className = "" }: PostCardProps) {

  const joinDate = new Date(author.created_at)

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="flex flex-col lg:flex-row">
        {/* User Sidebar - Left side on desktop, top on mobile */}
        <div className="lg:w-48 lg:flex-shrink-0 bg-muted/30 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r">
          <div className="flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3">
            {/* Avatar */}
            <Link href={`/profile/${author.username}`}>
              <Avatar className="h-16 w-16 lg:h-24 lg:w-24 ring-2 ring-background">
                <AvatarImage src={author.avatar_url || ""} />
                <AvatarFallback className="text-xl lg:text-2xl font-bold">
                  {author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 lg:w-full lg:text-center space-y-1.5">
              {/* Username */}
              <Link
                href={`/profile/${author.username}`}
                className="font-bold text-base lg:text-lg hover:underline block"
              >
                {author.username}
              </Link>

              {/* Role Badge */}
              <RoleBadge roleString={author.role} />

              {/* Level Badge */}
              {author.level && author.level > 1 && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Award className="h-3 w-3" />
                  <span>Level {author.level}</span>
                </div>
              )}

              {/* Stats */}
              <div className="text-xs text-muted-foreground space-y-0.5 pt-2 border-t">
                <div className="flex items-center justify-between lg:justify-center gap-2">
                  <span className="font-medium">Posts:</span>
                  <span>{author.post_count || 0}</span>
                </div>
                {author.thread_count !== undefined && (
                  <div className="flex items-center justify-between lg:justify-center gap-2">
                    <span className="font-medium">Threads:</span>
                    <span>{author.thread_count}</span>
                  </div>
                )}
                <div className="flex items-center justify-between lg:justify-center gap-2">
                  <span className="font-medium">Rep:</span>
                  <span className="text-violet-600 dark:text-violet-400 font-semibold">
                    {author.reputation}
                  </span>
                </div>
              </div>

              {/* Join Date */}
              <div className="hidden lg:flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="h-3 w-3" />
                <span>
                  Joined {joinDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>

              {/* Location */}
              {author.location && (
                <div className="hidden lg:flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{author.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Content - Right side */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Post Header - Mobile Only */}
          <div className="lg:hidden mb-3 pb-2 border-b text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Post Header - Desktop */}
          <div className="hidden lg:flex items-center justify-between mb-4 pb-2 border-b">
            <div className="text-xs text-muted-foreground">
              Posted {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </div>
          </div>

          {/* Post Content */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Signature */}
          {author.signature && (
            <div className="mt-4 pt-4 border-t border-dashed">
              <div
                className="prose prose-xs dark:prose-invert max-w-none text-muted-foreground opacity-75"
                dangerouslySetInnerHTML={{ __html: author.signature }}
              />
            </div>
          )}

          {/* Additional Actions/Content */}
          {children}
        </div>
      </div>
    </Card>
  )
}
