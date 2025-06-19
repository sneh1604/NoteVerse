"use client"

import { cn } from "@/lib/utils"
import { LightbulbIcon, ArchiveIcon, TrashIcon, Settings2Icon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  {
    icon: LightbulbIcon,
    label: "Notes",
    href: "/",
  },
  {
    icon: ArchiveIcon,
    label: "Archive",
    href: "/archive",
  }
]

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-300 ease-in-out",
        !isOpen && "w-[72px]"
      )}
    >
      <div className="space-y-1 p-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              "transition-all duration-200",
              pathname === item.href && "bg-accent/50 font-medium text-foreground",
              !isOpen && "justify-center"
            )}
          >
            <item.icon className="h-5 w-5" />
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
    </aside>
  )
}
