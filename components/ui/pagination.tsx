"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "./button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    return `${baseUrl || pathname}?${params.toString()}`
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5 // Number of page buttons to show

    if (totalPages <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust range if at the beginning or end
      if (currentPage <= 3) {
        end = 4
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("...")
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("...")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage > 1}
        disabled={currentPage === 1}
        className="gap-1"
      >
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <Button
                key={`ellipsis-${index}`}
                variant="ghost"
                size="sm"
                disabled
                className="w-9"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <Button
              key={pageNumber}
              variant={isActive ? "default" : "outline"}
              size="sm"
              asChild={!isActive}
              disabled={isActive}
              className="w-9"
            >
              {isActive ? (
                <span>{pageNumber}</span>
              ) : (
                <Link href={createPageUrl(pageNumber)}>{pageNumber}</Link>
              )}
            </Button>
          )
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage < totalPages}
        disabled={currentPage === totalPages}
        className="gap-1"
      >
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
