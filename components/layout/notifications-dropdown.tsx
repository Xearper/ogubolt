"use client"

import { useEffect, useState } from "react"
import { Bell, Check, MessageSquare, ThumbsUp, AtSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import toast from "react-hot-toast"

interface Notification {
  id: string
  type: "reply" | "mention" | "vote"
  content: string
  is_read: boolean
  created_at: string
  thread_id: string | null
  comment_id: string | null
  threads?: { id: string; title: string } | null
  comments?: { id: string; content: string } | null
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications")
      if (!response.ok) throw new Error("Failed to fetch notifications")
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Fetch notifications error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })

      if (!response.ok) throw new Error("Failed to mark as read")

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
    } catch (error) {
      console.error("Mark as read error:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })

      if (!response.ok) throw new Error("Failed to mark all as read")

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Mark all as read error:", error)
      toast.error("Failed to mark all as read")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reply":
        return <MessageSquare className="h-4 w-4" />
      case "mention":
        return <AtSign className="h-4 w-4" />
      case "vote":
        return <ThumbsUp className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.thread_id) {
      return `/threads/${notification.thread_id}${
        notification.comment_id ? `#comment-${notification.comment_id}` : ""
      }`
    }
    return "#"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                asChild
                className={`flex flex-col items-start gap-2 p-3 cursor-pointer ${
                  !notification.is_read ? "bg-accent/50" : ""
                }`}
              >
                <Link
                  href={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id)
                    }
                    setIsOpen(false)
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">
                        {notification.content}
                      </p>
                      {notification.threads && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          in &ldquo;{notification.threads.title}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
