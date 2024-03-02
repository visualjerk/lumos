'use client'

import { Attribute } from './attribute'
import GameIcon from './game-icon'

export type AttributeItemProps = {
  attribute: Attribute
  value: number
} & React.HTMLAttributes<HTMLDivElement>

export function AttributeItem({ attribute, value }: AttributeItemProps) {
  return (
    <div className="flex items-center gap-1">
      <GameIcon kind={attribute} />
      <span className=" font-semibold">{value}</span>
    </div>
  )
}