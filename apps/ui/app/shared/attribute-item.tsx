'use client'

import { Attribute } from './attribute'
import GameIcon from './game-icon'

export type AttributeItemProps = {
  attribute: Attribute
  value: number
} & React.HTMLAttributes<HTMLDivElement>

export function AttributeItem({ attribute, value }: AttributeItemProps) {
  return (
    <span className="inline-flex items-center gap-1 not-italic">
      <GameIcon kind={attribute} />
      <span className=" font-semibold">{value}</span>
    </span>
  )
}
