import { ThreadListSkeleton } from "@/components/threads/thread-list-skeleton"
import { CategorySidebarSkeleton } from "@/components/layout/category-sidebar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Skeleton className="h-8 w-32" />
              <div className="hidden md:flex gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-8 sm:h-9 w-48" />
                <Skeleton className="h-4 w-64 hidden sm:block" />
              </div>
              <Skeleton className="h-10 w-full sm:w-32" />
            </div>

            {/* Thread List Skeleton */}
            <ThreadListSkeleton count={5} />
          </div>

          {/* Sidebar Skeleton - Hidden on mobile */}
          <CategorySidebarSkeleton />
        </div>
      </main>

      {/* Floating Action Button Skeleton - Mobile Only */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  )
}
