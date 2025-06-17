"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Sun, Moon, LogOut, Menu, X, Settings, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import type { User as UserType } from "@/types/note"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user: any
  onLogout: () => void
  onNewNote: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  onMenuClick: () => void
}

export function Header({ user, onLogout, onNewNote, searchTerm, onSearchChange, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4 min-w-[240px]">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className="rounded-full hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <img src="image.png" alt="NoteVerse" className="h-8 w-8" />
            <span className="font-semibold text-lg tracking-tight">NoteVerse</span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-[750px] mx-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-accent/50 border-none rounded-full 
                focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground/70
                hover:bg-accent/70 transition-colors"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-1 my-auto h-8 w-8 rounded-full hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 min-w-[240px] justify-end">
          <Button
            onClick={onNewNote}
            size="sm"
            className="hidden md:flex items-center gap-2 rounded-full px-4"
          >
            <Plus className="h-4 w-4" />
            <span>New Note</span>
          </Button>
          <Button
            onClick={onNewNote}
            size="icon"
            className="md:hidden rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-accent"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-2" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-2" /> Dark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col px-2 py-1.5">
                <span className="text-sm font-medium">{user.displayName || "User"}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
