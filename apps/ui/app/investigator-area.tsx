'use client'
import { GamePhase } from '@lumos/game'
import React from 'react'
import { GameInvestigator } from './use-game'
import RevealedInvestigatorCard from './revealed-investigator-card'
import ActionButton from './action-button'

export default function InvestigatorArea({
  phase,
  investigator,
}: {
  phase: GamePhase
  investigator: GameInvestigator
}) {
  return (
    <div>
      <div className="text-purple-500">{investigator.name}</div>
      <div>Clues: {investigator.clues}</div>
      <div>
        Intelligence:{' '}
        <span className="font-semibold">
          {investigator.skills.intelligence}
        </span>{' '}
        ({investigator.baseSkills.intelligence})
        {(phase.type === 'commitInvestigationSkillCheck' ||
          phase.type === 'startInvestigationSkillCheck') &&
          ` +${phase.investigationContext.skillModifier}`}
      </div>
      <div className="flex flex-row gap-3">
        {investigator.actions.map((action, index) => (
          <ActionButton key={index} onClick={() => action.execute()}>
            {action.type}
          </ActionButton>
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-0 bg-gray-200 bg-opacity-50 flex justify-between">
        <div className="p-4 flex gap-2">Deck {investigator.deck.length}</div>
        <div className="p-4 flex gap-2">
          {investigator.cardsInHand.map((card, index) => (
            <RevealedInvestigatorCard key={index} card={card} />
          ))}
        </div>
        <div className="p-4 flex gap-2">
          {investigator.cardsInPlay.map((card, index) => (
            <RevealedInvestigatorCard key={index} card={card} />
          ))}
        </div>
        <div className="p-4 bg-gray-400">
          {investigator.discardPile.at(-1) != null && (
            <RevealedInvestigatorCard card={investigator.discardPile.at(-1)!} />
          )}
        </div>
      </div>
    </div>
  )
}
