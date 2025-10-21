import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CategorySidebarSkeleton() {
  return (
    <aside className="hidden lg:block space-y-4">
      {/* About Card Skeleton */}
      <Card className="p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </Card>

      {/* Categories Card Skeleton */}
      <Card className="p-4">
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </Card>
    </aside>
  )
}
