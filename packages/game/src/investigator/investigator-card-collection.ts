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
  type: 'skill',
  name: 'Lightning Strike',
  description: '',
  skillModifier: { intelligence: 2, agility: 1 },
}

export const BearStrength: InvestigatorCard = {
  id: 'ic-bear-strength',
  type: 'skill',
  name: 'Bear Strength',
  description: '',
  skillModifier: { agility: 1, strength: 2 },
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

export const InvestigatorCardCollection = new Map<
  InvestigatorCardId,
  InvestigatorCard
>(
  [ForceOfWill, LightningStrike, BearStrength, Serenity].map((card) => [
    card.id,
    card,
  ])
)
