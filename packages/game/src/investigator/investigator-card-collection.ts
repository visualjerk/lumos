import { InvestigatorCard, InvestigatorCardId } from './investigator-card'

export function getInvestigatorCard(cardId: InvestigatorCardId) {
  return InvestigatorCardCollection.get(cardId)!
}

// TODO: create common actions

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
      description: 'An investigator of your choice draws 2 cards.',
      skillModifier: { intelligence: 2 },
      action: { type: 'draw', amount: 2, target: 'investigator' },
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
    'ic5',
    {
      id: 'ic5',
      type: 'permanent',
      name: 'Serenity',
      description: '+1 to intelligence checks.',
      skillModifier: { intelligence: 1 },
      permanentSkillModifier: { intelligence: 1 },
    },
  ],
  [
    'ic6',
    {
      id: 'ic6',
      type: 'effect',
      name: 'Lumos',
      description:
        'Make an investigation check. If you succeed, discover 2 clues.',
      skillModifier: { intelligence: 1 },
      skillCheck: {
        skill: 'intelligence',
        difficulty: (context, { locationId }) =>
          context.getLocation(locationId).shroud,
        onSuccess: {
          apply: (context, { investigatorId, locationId }) => {
            context.collectClue(investigatorId, locationId)
            context.collectClue(investigatorId, locationId)
            return context
          },
        },
        onFailure: {
          apply: (context) => context,
        },
      },
    },
  ],
])
