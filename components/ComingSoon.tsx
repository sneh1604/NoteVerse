import { RocketIcon } from "lucide-react"

interface ComingSoonProps {
  feature: string
}

export function ComingSoon({ feature }: ComingSoonProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <RocketIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{feature} Coming Soon</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          We're working hard to bring you {feature.toLowerCase()} functionality. Stay tuned for updates!
        </p>
      </div>
    </div>
  )
}
