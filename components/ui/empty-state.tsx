"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Button } from "./button"
import { Card } from "./card"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="flex justify-center mb-4"
        >
          <div className="rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6">
            <Icon className="h-12 w-12 text-violet-500" />
          </div>
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold mb-2"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-6 max-w-md mx-auto"
        >
          {description}
        </motion.p>
        {actionLabel && onAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button onClick={onAction} className="gap-2">
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
