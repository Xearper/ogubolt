import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ThreadListSkeletonProps {
  count?: number
}

export function ThreadListSkeleton({ count = 5 }: ThreadListSkeletonProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-3 sm:p-4 border-l-4 border-l-muted">
          <div className="flex gap-2 sm:gap-4">
            {/* Vote Section Skeleton */}
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-[40px] sm:min-w-[60px]">
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-md" />
              <Skeleton className="h-5 w-8 sm:h-6 sm:w-10" />
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-md" />
            </div>

            {/* Content Section Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-5 sm:h-6 w-3/4" />
                <Skeleton className="h-5 sm:h-6 w-1/2 sm:hidden" />
              </div>

              {/* Preview Text Skeleton - Hidden on mobile */}
              <div className="hidden sm:block space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Meta Information Skeleton */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Skeleton className="h-5 w-16 sm:w-20 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <Skeleton className="h-4 w-24 hidden xs:block" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
