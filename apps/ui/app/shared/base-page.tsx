import { cn } from '@/utils'
import Artwork from './artwork'

export type BasePageProps = React.HTMLAttributes<HTMLDivElement>

export function BasePage({ children, className, ...props }: BasePageProps) {
  return (
    <div
      className={cn(
        'relative p-4 h-screen grid place-content-center overflow-hidden',
        className
      )}
      {...props}
    >
      <Artwork
        id="bg-table"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
