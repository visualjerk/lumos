import { InvestigatorCard, InvestigatorCardId } from './investigator-card'

export function getInvestigatorCard(cardId: InvestigatorCardId) {
  return InvestigatorCardCollection.get(cardId)!
}

export const InvestigatorCardCollection = new Map<
  InvestigatorCardId,
  InvestigatorCard
>([
  [
    'ic1',
    {
      id: 'ic1',
      type: 'action',
      name: 'Force Of Will',
      description: 'Draw 2 cards.',
      skillModifier: { intelligence: 2 },
      effect: { type: 'draw', amount: 2, target: 'self' },
    },
  ],
  [
    'ic2',
    {
      id: 'ic2',
      type: 'skill',
      name: 'Lightning Strike',
      description: '',
      skillModifier: { intelligence: 2, agility: 1 },
    },
  ],
  [
    'ic3',
    {
      id: 'ic3',
      type: 'skill',
      name: 'Boar Strength',
      description: '',
      skillModifier: { agility: 1, strength: 2 },
    },
  ],
  [
    'ic4',
    {
      id: 'ic4',
      type: 'permanent',
      name: 'Serenity',
      description: '+1 to intelligence checks.',
      skillModifier: { intelligence: 1 },
      permanentSkillModifier: { intelligence: 1 },
    },
  ],
])
