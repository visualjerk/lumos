import { InvestigatorCard, InvestigatorCardId } from './investigator-card'

export function getInvestigatorCard(cardId: string) {
  return InvestigatorCardCollection.get(cardId)!
}

export const InvestigatorCardCollection = new Map<
  InvestigatorCardId,
  InvestigatorCard
>([
  [
    '1',
    {
      id: '1',
      type: 'effect',
      name: 'Force Of Will',
      description: 'Draw 2 cards.',
      skillModifier: { intelligence: 2 },
      effect: {
        apply: (context, { investigatorId }) => {
          context.getInvestigatorState(investigatorId).draw(2)
          return context
        },
      },
    },
  ],
  [
    '2',
    {
      id: '2',
      type: 'skill',
      name: 'Lightning Strike',
      description: '',
      skillModifier: { intelligence: 2, agility: 1 },
    },
  ],
  [
    '3',
    {
      id: '3',
      type: 'skill',
      name: 'Boar Strength',
      description: '',
      skillModifier: { agility: 1, strength: 2 },
    },
  ],
  [
    '4',
    {
      id: '4',
      type: 'effect',
      name: 'Meditate',
      description: 'Heal 2 damage.',
      skillModifier: { intelligence: 1 },
      effect: {
        apply: (context, { investigatorId }) => {
          context.getInvestigatorState(investigatorId).removeDamage(2)
          return context
        },
      },
    },
  ],
  [
    '5',
    {
      id: '5',
      type: 'permanent',
      name: 'Serenity',
      description: '+1 to intelligence checks.',
      skillModifier: { intelligence: 1 },
      permanentSkillModifier: { intelligence: 1 },
    },
  ],
])
