import { cn } from './utils'

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
        'bg-indigo-600 text-white p-1 px-2 rounded',
        disabled && 'opacity-50'
      )}
    >
      {children}
    </button>
  )
}
