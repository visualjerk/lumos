'use client'
import { GamePhase, Skills } from '@lumos/game'
import React from 'react'
import { GameInvestigator } from './use-game'
import RevealedInvestigatorCard from './revealed-investigator-card'
import ActionButton from './action-button'
import { SKILL_ICONS } from './skill-icons'

export default function InvestigatorArea({
  phase,
  investigator,
}: {
  phase: GamePhase
  investigator: GameInvestigator
}) {
  return (
    <div className="grid gap-1">
      <div className="text-purple-500">{investigator.name}</div>
      <div className="flex gap-3">
        <div>🔮 {investigator.clues}</div>
        <div>
          🔥 {investigator.damage} / ❤️ {investigator.health}
        </div>
      </div>
      <div className="flex gap-3">
        {Object.entries(investigator.skills).map(([skill, value]) => (
          <div key={skill} className="p-1 bg-gray-50">
            {SKILL_ICONS[skill as keyof Skills]} <strong>{value}</strong> (
            {investigator.baseSkills[skill as keyof Skills]})
          </div>
        ))}
      </div>
      <div className="flex gap-3">
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
