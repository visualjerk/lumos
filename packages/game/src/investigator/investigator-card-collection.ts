import { InvestigatorCard, InvestigatorCardId } from './investigator-card'

export function getInvestigatorCard(cardId: InvestigatorCardId) {
  return InvestigatorCardCollection.get(cardId)!
}

export const ForceOfWill: InvestigatorCard = {
  id: 'ic-force-of-will',
  type: 'action',
  name: 'Force Of Will',
  description: 'Draw 2 cards.',
  skillModifier: { intelligence: 2 },
  effect: { type: 'draw', amount: 2, target: 'self' },
}

export const LightningStrike: InvestigatorCard = {
  id: 'ic-lightning-strike',
  type: 'action',
  name: 'Lightning Strike',
  description:
    'Attack an enemy at any location using your intelligence. Deal 2 damage.',
  skillModifier: { intelligence: 2, agility: 1 },
  effect: {
    type: 'attackEnemy',
    amount: 2,
    skill: 'intelligence',
    target: 'any',
  },
}

export const BearStrength: InvestigatorCard = {
  id: 'ic-bear-strength',
  type: 'action',
  name: 'Bear Strength',
  description: 'Deal 1 damage to an enemy at any location.',
  skillModifier: { agility: 1, strength: 2 },
  effect: { type: 'damageEnemy', amount: 1, target: 'any' },
}

export const Serenity: InvestigatorCard = {
  id: 'ic-serenity',
  type: 'action',
  name: 'Serenity',
  description:
    'Investigate at your current location. If you succeed, discover 2 clues.',
  skillModifier: { intelligence: 1 },
  effect: {
    type: 'investigate',
    clueAmount: 2,
    investigatorTarget: 'self',
    locationTarget: 'current',
  },
}

export const Scry: InvestigatorCard = {
  id: 'ic-scry',
  type: 'action',
  name: 'Scry',
  description:
    'Investigate at any revealed location. If you succeed, discover 1 clue.',
  skillModifier: { intelligence: 2 },
  effect: {
    type: 'investigate',
    clueAmount: 1,
    investigatorTarget: 'self',
    locationTarget: 'revealed',
  },
}

export const InvestigatorCardCollection = new Map<
  InvestigatorCardId,
  InvestigatorCard
>(
  [ForceOfWill, LightningStrike, BearStrength, Serenity, Scry].map((card) => [
    card.id,
    card,
  ])
)
