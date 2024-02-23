import { vi } from 'vitest'
import { Investigator, InvestigatorCard } from '../investigator'
import * as cardCollection from '../investigator/investigator-card-collection'

export const MOCK_INVESTIGATOR_ONE: Investigator = {
  id: '1',
  name: 'Hans',
  health: 9,
  baseSkills: {
    intelligence: 3,
    strength: 3,
    agility: 3,
  },
  baseDeck: ['ic1', 'ic1', 'ic2', 'ic2'],
}

export const MOCK_INVESTIGATOR_TWO: Investigator = {
  id: '2',
  name: 'Sepp',
  health: 9,
  baseSkills: {
    intelligence: 3,
    strength: 3,
    agility: 3,
  },
  baseDeck: ['ic1', 'ic1', 'ic2', 'ic2'],
}

export function mockGetInvestigatorCard(card: InvestigatorCard) {
  const mockGetInvestigatorCard = vi.spyOn(
    cardCollection,
    'getInvestigatorCard'
  )
  mockGetInvestigatorCard.mockReturnValue(card)
}
