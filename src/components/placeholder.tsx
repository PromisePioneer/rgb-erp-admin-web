/**
 * Placeholder Component
 * Shown for modules that haven't been migrated yet
 */
import { FileQuestion } from 'lucide-react'

interface PlaceholderProps {
  title: string
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground">
        This module is still being migrated from Blade to React.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Please use the Blade version for now.
      </p>
    </div>
  )
}
