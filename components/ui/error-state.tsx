"use client"

import { motion } from "framer-motion"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "./button"
import { Card } from "./card"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-12 text-center border-destructive/20">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="flex justify-center mb-4"
        >
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
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
        {showRetry && onRetry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
