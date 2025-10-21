import { createClient } from "@/lib/supabase/server"
import { ThreadList } from "@/components/threads/thread-list"
import { EmptyState } from "@/components/ui/empty-state"
import { Search } from "lucide-react"

interface SearchResultsProps {
  query?: string
  categoryId?: string
  tag?: string
  sort?: string
}

export async function SearchResults({ query, categoryId, tag, sort = "recent" }: SearchResultsProps) {
  const supabase = await createClient()

  let threadsQuery = supabase
    .from("threads")
    .select(`
      *,
      profiles!threads_author_id_fkey (username, avatar_url, reputation),
      categories (name, slug, color),
      votes:votes!votes_thread_id_fkey (vote_type),
      comments (id),
      thread_tags (
        tags (id, name)
      )
    `)

  // Apply filters
  if (query) {
    threadsQuery = threadsQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  }

  if (categoryId) {
    threadsQuery = threadsQuery.eq("category_id", categoryId)
  }

  // Apply sorting
  switch (sort) {
    case "popular":
      threadsQuery = threadsQuery.order("view_count", { ascending: false })
      break
    case "votes":
      // This is approximation - ideally we'd use a computed column
      threadsQuery = threadsQuery.order("created_at", { ascending: false })
      break
    case "comments":
      threadsQuery = threadsQuery.order("created_at", { ascending: false })
      break
    case "recent":
    default:
      threadsQuery = threadsQuery.order("created_at", { ascending: false })
      break
  }

  threadsQuery = threadsQuery.limit(50)

  const { data: threads } = await threadsQuery

  let filteredThreads = threads || []

  // Filter by tag if specified (client-side for now)
  if (tag && filteredThreads.length > 0) {
    filteredThreads = filteredThreads.filter((thread) => {
      const threadTags = thread.thread_tags?.map((tt: any) => tt.tags?.name.toLowerCase()) || []
      return threadTags.includes(tag.toLowerCase())
    })
  }

  if (!query && !categoryId && !tag) {
    return (
      <EmptyState
        icon={Search}
        title="Search for threads"
        description="Use the search bar above or apply filters to find threads"
      />
    )
  }

  if (filteredThreads.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description="Try adjusting your search query or filters"
      />
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Search Results</h1>
        <p className="text-sm text-muted-foreground">
          Found {filteredThreads.length} {filteredThreads.length === 1 ? "thread" : "threads"}
        </p>
      </div>
      <ThreadList threads={filteredThreads} />
    </div>
  )
}
