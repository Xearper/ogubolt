"use client"

import { motion } from "framer-motion"
import { Calendar, Award, MapPin, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface UserProfileProps {
  profile: any
  isOwnProfile: boolean
}

export function UserProfile({ profile, isOwnProfile }: UserProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-3xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{profile.username}</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="gap-1">
              <Award className="h-3 w-3" />
              {profile.reputation} reputation
            </Badge>
            {profile.role === "moderator" && (
              <Badge variant="info">Moderator</Badge>
            )}
            {profile.role === "admin" && (
              <Badge variant="warning">Admin</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center">{profile.bio}</p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </span>
            </div>

            {profile.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground hover:underline truncate"
                >
                  {profile.website}
                </a>
              </div>
            )}
          </div>

          {isOwnProfile && (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/profile/${profile.username}/edit`}>
                Edit Profile
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Threads</span>
            <Badge variant="secondary">{profile.thread_count || 0}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Comments</span>
            <Badge variant="secondary">{profile.comment_count || 0}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Votes</span>
            <Badge variant="secondary">{profile.vote_count || 0}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
