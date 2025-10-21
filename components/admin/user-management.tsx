"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Award, Search, Shield, ShieldCheck, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface UserManagementProps {
  users: any[]
}

export function UserManagement({ users }: UserManagementProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.username.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  })

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId)

    try {
      const response = await fetch("/api/admin/update-role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update role")
      }

      toast.success("User role updated successfully!")
      router.refresh()
    } catch (error: any) {
      console.error("Role update error:", error)
      toast.error(error.message || "Failed to update role")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive" className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </Badge>
        )
      case "moderator":
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Moderator
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="h-3 w-3" />
            User
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by username, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* User List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{user.username}</p>
                    {getRoleBadge(user.role || "user")}
                  </div>
                  {user.full_name && (
                    <p className="text-sm text-muted-foreground truncate">
                      {user.full_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{user.reputation || 0}</span>
                </div>
                <span className="hidden sm:inline">
                  Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Role Selector */}
              <div className="flex items-center gap-2">
                <Select
                  value={user.role || "user"}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                  disabled={updatingUserId === user.id}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "No users available"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
