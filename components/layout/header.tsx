"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, LogOut, Zap, Menu, X, Home, Folder, User } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { NotificationsDropdown } from "./notifications-dropdown"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  user: {
    username: string
    avatar_url?: string | null
  } | null
  onSignOut: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: Folder },
    { name: "Search", href: "/search", icon: Search },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo - Mobile First */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden -ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent hidden xs:block">
                  OGUBolt
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1 ml-6">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                      pathname === item.href
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side Actions - Mobile Optimized */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search - Hidden on small mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex rounded-full h-9 w-9"
                asChild
              >
                <Link href="/search">
                  <Search className="h-4 w-4" />
                </Link>
              </Button>

              {user ? (
                <>
                  {/* Notifications - Hidden on mobile */}
                  <div className="hidden md:block">
                    <NotificationsDropdown />
                  </div>

                  {/* User Avatar */}
                  <Link href={`/profile/${user.username}`}>
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer ring-2 ring-transparent hover:ring-violet-500 transition-all">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-sm">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  {/* Sign Out - Hidden on mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex h-9 w-9"
                    onClick={onSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-background border-r shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    OGUBolt
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                        pathname === item.href
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* User Actions in Mobile Menu */}
                {user && (
                  <div className="mt-6 px-3 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Account
                    </div>
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        onSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </nav>

              {/* Mobile Menu Footer */}
              {!user && (
                <div className="p-4 border-t space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
