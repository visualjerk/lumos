import { InvestigatorCard, InvestigatorCardId } from './investigator-card'

export const InvestigatorCardCollection = new Map<
  InvestigatorCardId,
  InvestigatorCard
>([
  [
    '1',
    {
      id: '1',
      name: 'Force Of Will',
      skillModifier: { intelligence: 2 },
    },
  ],
  [
    '2',
    {
      id: '2',
      name: 'Lightning Strike',
      skillModifier: { intelligence: 2, agility: 1 },
    },
  ],
  [
    '3',
    {
      id: '3',
      name: 'Boar Strength',
      skillModifier: { agility: 1, strength: 2 },
    },
  ],
  [
    '4',
    {
      id: '4',
      name: 'Meditate',
      skillModifier: { intelligence: 1 },
    },
  ],
  [
    '5',
    {
      id: '5',
      name: 'Serenity',
      skillModifier: { intelligence: 1 },
      permanentSkillModifier: { intelligence: 1 },
    },
  ],
])
