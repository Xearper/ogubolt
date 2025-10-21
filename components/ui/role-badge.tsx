"use client"

import { Badge } from "@/components/ui/badge"

interface RoleBadgeProps {
  role?: {
    name: string
    color: string
    text_color: string
  } | null
  roleString?: string
  className?: string
}

/**
 * Role badge with custom colors from database
 */
export function RoleBadge({ role, roleString, className = "" }: RoleBadgeProps) {
  // Fallback colors for legacy role strings
  const fallbackColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: "#ef4444", text: "#ffffff" },
    moderator: { bg: "#f59e0b", text: "#000000" },
    vip: { bg: "#8b5cf6", text: "#ffffff" },
    user: { bg: "#6366f1", text: "#ffffff" },
  }

  if (role) {
    return (
      <Badge
        className={`text-xs font-semibold ${className}`}
        style={{
          backgroundColor: role.color,
          color: role.text_color,
          borderColor: role.color,
        }}
      >
        {role.name}
      </Badge>
    )
  }

  if (roleString) {
    const colors = fallbackColors[roleString.toLowerCase()] || fallbackColors.user
    return (
      <Badge
        className={`text-xs font-semibold ${className}`}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderColor: colors.bg,
        }}
      >
        {roleString.charAt(0).toUpperCase() + roleString.slice(1)}
      </Badge>
    )
  }

  return null
}

/**
 * Colored username based on role
 */
export function ColoredUsername({
  username,
  role,
  roleString,
  className = "",
}: {
  username: string
  role?: { color: string } | null
  roleString?: string
  className?: string
}) {
  const fallbackColors: Record<string, string> = {
    admin: "#ef4444",
    moderator: "#f59e0b",
    vip: "#8b5cf6",
    user: "#6366f1",
  }

  const color =
    role?.color || (roleString ? fallbackColors[roleString.toLowerCase()] : null) || "#6366f1"

  return (
    <span
      className={`font-semibold ${className}`}
      style={{
        color: color,
      }}
    >
      {username}
    </span>
  )
}
