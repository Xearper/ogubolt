import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
}

interface CategorySidebarProps {
  categories: Category[]
}

export function CategorySidebar({ categories }: CategorySidebarProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors group"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color || "#6366f1" }}
              />
              <span className="text-sm font-medium group-hover:text-foreground">
                {category.name}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-200 dark:border-violet-800">
        <CardHeader>
          <CardTitle className="text-lg">About OGUBolt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The premier marketplace for digital services and premium usernames.
          </p>
          <p>
            Join our community to buy, sell, and discuss digital assets.
          </p>
          <div className="pt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span>Online</span>
              <Badge variant="secondary">1,234</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Members</span>
              <Badge variant="secondary">12,345</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
