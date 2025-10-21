"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Laugh, Frown, Angry, Sparkles, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"

interface ReactionBarProps {
  targetType: "thread" | "comment"
  targetId: string
  currentUser: any
  reactions: any[]
}

type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry"

const reactionConfig: Record<
  ReactionType,
  { icon: React.ComponentType<any>; label: string; color: string; emoji: string }
> = {
  like: {
    icon: ThumbsUp,
    label: "Like",
    color: "text-blue-500",
    emoji: "👍",
  },
  love: {
    icon: Heart,
    label: "Love",
    color: "text-red-500",
    emoji: "❤️",
  },
  haha: {
    icon: Laugh,
    label: "Haha",
    color: "text-yellow-500",
    emoji: "😂",
  },
  wow: {
    icon: Sparkles,
    label: "Wow",
    color: "text-purple-500",
    emoji: "😮",
  },
  sad: {
    icon: Frown,
    label: "Sad",
    color: "text-gray-500",
    emoji: "😢",
  },
  angry: {
    icon: Angry,
    label: "Angry",
    color: "text-orange-500",
    emoji: "😠",
  },
}

/**
 * XenForo-style reaction bar with emoji reactions
 */
export function ReactionBar({ targetType, targetId, currentUser, reactions }: ReactionBarProps) {
  const [localReactions, setLocalReactions] = useState(reactions || [])
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // Get current user's reaction
  const userReaction = currentUser
    ? localReactions.find((r: any) => r.user_id === currentUser.id)?.reaction_type
    : null

  // Count reactions by type
  const reactionCounts = localReactions.reduce((acc: Record<string, number>, reaction: any) => {
    acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
    return acc
  }, {})

  const handleReaction = async (reactionType: ReactionType) => {
    if (!currentUser) {
      toast.error("Please sign in to react")
      return
    }

    setIsPickerOpen(false)

    // Optimistic update
    const previousReactions = [...localReactions]
    let newReactions = [...localReactions]

    if (userReaction === reactionType) {
      // Remove reaction if clicking the same one
      newReactions = newReactions.filter((r: any) => r.user_id !== currentUser.id)
    } else {
      // Remove old reaction and add new one
      newReactions = newReactions.filter((r: any) => r.user_id !== currentUser.id)
      newReactions.push({
        user_id: currentUser.id,
        reaction_type: reactionType,
        [targetType === "thread" ? "thread_id" : "comment_id"]: targetId,
      })
    }

    setLocalReactions(newReactions)

    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [targetType === "thread" ? "threadId" : "commentId"]: targetId,
          reactionType: userReaction === reactionType ? null : reactionType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to react")
      }

      const data = await response.json()
      setLocalReactions(data.reactions || newReactions)
    } catch (error) {
      console.error("Error reacting:", error)
      toast.error("Failed to react. Please try again.")
      // Revert optimistic update
      setLocalReactions(previousReactions)
    }
  }

  // Get reactions to display (only types with at least 1 reaction)
  const displayedReactions = Object.entries(reactionCounts).filter(([_, count]) => count > 0)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Reaction Picker Dropdown */}
      <DropdownMenu open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={userReaction ? "default" : "outline"}
            size="sm"
            className="gap-2 min-w-[80px]"
          >
            {userReaction ? (
              <>
                <span className="text-lg">{reactionConfig[userReaction as ReactionType].emoji}</span>
                <span>{reactionConfig[userReaction as ReactionType].label}</span>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                <span>React</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-2">
          <div className="flex gap-1">
            {(Object.entries(reactionConfig) as [ReactionType, typeof reactionConfig[ReactionType]][]).map(
              ([type, config]) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(type)}
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${
                    userReaction === type ? "bg-muted ring-2 ring-primary" : ""
                  }`}
                  title={config.label}
                >
                  <span className="text-2xl">{config.emoji}</span>
                </motion.button>
              )
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reaction Count Pills */}
      <AnimatePresence>
        {displayedReactions.map(([type, count]) => {
          const config = reactionConfig[type as ReactionType]
          return (
            <motion.button
              key={type}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(type as ReactionType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                userReaction === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <span className="text-base">{config.emoji}</span>
              <span>{count}</span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
