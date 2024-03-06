import { Skill } from '@lumos/game'
import Artwork from '@/shared/artwork'
import { AttributeItem } from '@/shared/attribute-item'
import InvestigatorDeck from './investigator-deck'
import InvestigatorDiscardPile from './investigator-discard-pile'
import InvestigatorCardsInHand from './investigator-cards-in-hand'
import { useGame } from '@/game'
import { PhaseOverview } from '@/phase'

export default function InvestigatorOverview() {
  const { investigator, context } = useGame()

  const skills = Object.entries(investigator.baseSkills).map(
    ([skill, value]) => ({
      skill: skill as Skill,
      value,
    })
  )
  const state = context.getInvestigatorState(investigator.id)
  const { health, damage, clues } = state

  return (
    <div className="p-4 pl-12 flex items-center gap-6">
      <div className="relative flex items-center p-4 pl-44 gap-4 bg-stone-500 border-2 rounded border-stone-700 shadow-lg">
        <Artwork
          id="bg-stone"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="w-52 h-52 p-2 bg-stone-500 border-2 border-stone-700 shadow-lg rounded-full absolute -left-10 overflow-hidden">
          <Artwork
            id="bg-stone"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <Artwork
            id={investigator.id}
            className="relative w-full h-full rounded-full object-cover border-2 border-stone-800 shadow-lg"
          />
        </div>
        <div className="relative  w-40 grid gap-2 text-stone-50">
          <h2>{investigator.name}</h2>
          <div className="flex justify-between">
            {skills.map(({ skill, value }) => (
              <div className="bg-stone-700 p-1 px-2 rounded-full" key={skill}>
                <AttributeItem attribute={skill} value={value} />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <div className="flex gap-2 bg-stone-700 p-1 px-2 rounded-full">
              <AttributeItem attribute="health" value={health} />
              <AttributeItem attribute="damage" value={damage} />
            </div>
            <div className="bg-stone-700 p-1 px-2 rounded-full">
              <AttributeItem attribute="clues" value={clues} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <InvestigatorDeck />
        <InvestigatorDiscardPile />
      </div>
      <InvestigatorCardsInHand />
      <div className="ml-auto">
        <PhaseOverview />
      </div>
    </div>
  )
}
