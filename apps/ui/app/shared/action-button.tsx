import { cn } from '@/utils'
import Artwork from './artwork'

export default function ActionButton({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative bg-indigo-600 text-white p-1 px-2 border-2 border-indigo-400 shadow-sm rounded font-semibold',
        disabled && 'opacity-50'
      )}
    >
      <Artwork
        id="bg-stone"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div className="relative">{children}</div>
    </button>
  )
}
