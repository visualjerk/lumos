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
])
