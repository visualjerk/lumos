import { cn } from '@/utils'
import Artwork from './artwork'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative p-4 rounded border-2 shadow text-stone-800 bg-stone-300 border-stone-600',
        className
      )}
      {...props}
    >
      <Artwork
        id="bg-card"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
