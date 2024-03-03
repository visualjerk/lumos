import { Context, Investigator, PublicPhaseAction, Skill } from '@lumos/game'
import Artwork from '@/shared/artwork'
import { AttributeItem } from '@/shared/attribute-item'
import InvestigatorDeck from './investigator-deck'
import InvestigatorDiscardPile from './investigator-discard-pile'
import InvestigatorCardsInHand from './investigator-cards-in-hand'

export type InvestigatorOverviewProps = {
  investigator: Investigator
  context: Context
  actions: PublicPhaseAction[]
}

export default function InvestigatorOverview({
  investigator,
  context,
  actions,
}: InvestigatorOverviewProps) {
  const skills = Object.entries(investigator.baseSkills).map(
    ([skill, value]) => ({
      skill: skill as Skill,
      value,
    })
  )
  const state = context.getInvestigatorState(investigator.id)
  const { health, damage, clues } = state

  return (
    <div className="p-4 flex items-center gap-6">
      <Artwork
        id={investigator.id}
        className="w-40 h-40 rounded-full object-cover border-2 border-stone-400 shadow-sm"
      />
      <div className="w-40 grid gap-2">
        <div>{investigator.name}</div>
        <div className="flex justify-between p-2 bg-stone-300 rounded-sm border border-stone-400 shadow-sm">
          {skills.map(({ skill, value }) => (
            <AttributeItem key={skill} attribute={skill} value={value} />
          ))}
        </div>
        <div className="flex justify-between">
          <div className="flex justify-between p-2 bg-stone-300 rounded-sm border border-stone-400 shadow-sm gap-2">
            <AttributeItem attribute="health" value={health} />
            <AttributeItem attribute="damage" value={damage} />
          </div>
          <div className="flex justify-between p-2 bg-stone-300 rounded-sm border border-stone-400 shadow-sm">
            <AttributeItem attribute="clues" value={clues} />
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <InvestigatorDeck
          investigator={investigator}
          context={context}
          actions={actions}
        />
        <InvestigatorDiscardPile
          investigator={investigator}
          context={context}
        />
      </div>
      <InvestigatorCardsInHand
        investigator={investigator}
        context={context}
        actions={actions}
      />
    </div>
  )
}
