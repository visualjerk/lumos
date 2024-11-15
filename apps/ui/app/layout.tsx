import type { Metadata } from 'next'
import { Aleo } from 'next/font/google'
import './globals.css'
import { cn } from '@/utils'
import { TooltipProvider } from '@/shared/ui/tooltip'

const aleo = Aleo({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lumos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <TooltipProvider>
        <body className={cn(aleo.className, 'bg-stone-200 text-stone-900')}>
          {children}
        </body>
      </TooltipProvider>
    </html>
  )
}
