import { PublicPhaseAction } from '@lumos/game'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export type ActionTooltipProps = {
  action?: PublicPhaseAction
  children: React.ReactNode
}

export function ActionTooltip({ action, children }: ActionTooltipProps) {
  return (
    <Tooltip open>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {action && (
        <TooltipContent
          onClickCapture={action?.execute}
          className="cursor-pointer bg-blue-800 border-blue-900"
        >
          <button>{action.type}</button>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
