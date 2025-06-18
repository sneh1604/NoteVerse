import Link from "next/link"
import { Github, Linkedin, Globe } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-4 md:flex-row md:py-6">
        <p className="text-sm text-muted-foreground">
          Built by{" "}
          <Link
            href="https://sneh-shah.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            Sneh Shah
          </Link>
        </p>
        <div className="flex gap-4">
          <Link
            href="https://github.com/sneh1604"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href="https://www.linkedin.com/in/sneh1604/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href="https://sneh-shah.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Globe className="h-5 w-5" />
            <span className="sr-only">Portfolio</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
