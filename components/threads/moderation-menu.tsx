"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pin, Lock, Trash2, MoreHorizontal, Unlock, PinOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"

interface ModerationMenuProps {
  threadId: string
  isPinned: boolean
  isLocked: boolean
  isAuthor: boolean
  isModerator: boolean
}

export function ModerationMenu({
  threadId,
  isPinned,
  isLocked,
  isAuthor,
  isModerator,
}: ModerationMenuProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleModerate = async (action: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/threads/${threadId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error("Failed to moderate thread")
      }

      toast.success(`Thread ${action}ned successfully`)
      router.refresh()
    } catch (error) {
      console.error("Error moderating thread:", error)
      toast.error("Failed to moderate thread")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this thread? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete thread")
      }

      toast.success("Thread deleted successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error deleting thread:", error)
      toast.error("Failed to delete thread")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthor && !isModerator) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading} className="gap-2">
          <MoreHorizontal className="h-4 w-4" />
          Manage
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isModerator && (
          <>
            <DropdownMenuItem onClick={() => handleModerate(isPinned ? "unpin" : "pin")}>
              {isPinned ? (
                <>
                  <PinOff className="h-4 w-4 mr-2" />
                  Unpin Thread
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin Thread
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModerate(isLocked ? "unlock" : "lock")}>
              {isLocked ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Thread
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Lock Thread
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {(isAuthor || isModerator) && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Thread
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
