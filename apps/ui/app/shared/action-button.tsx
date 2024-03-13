import { cn } from '@/utils'
import Artwork from './artwork'
import { ButtonHTMLAttributes } from 'react'

export type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export default function ActionButton({
  children,
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'relative bg-indigo-600 text-white p-1 px-2 border-2 border-indigo-400 shadow-sm rounded font-semibold',
        props.disabled && 'opacity-50'
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
