import Artwork from '@/shared/artwork'
import { Investigator } from '@lumos/game'

export type InvestigatorTokenProps = {
  investigator: Investigator
}

export function InvestigatorToken({ investigator }: InvestigatorTokenProps) {
  return (
    <Artwork
      id={investigator.id}
      className="w-12 h-12 rounded-full object-cover border-2 border-stone-700 shadow-sm"
    />
  )
}
