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
  baseDeck: ['ic-test-card', 'ic-test-card', 'ic-test-card', 'ic-test-card'],
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
  baseDeck: ['ic-test-card', 'ic-test-card', 'ic-test-card', 'ic-test-card'],
}

export function mockGetInvestigatorCard(card: InvestigatorCard) {
  const mockGetInvestigatorCard = vi.spyOn(
    cardCollection,
    'getInvestigatorCard'
  )
  mockGetInvestigatorCard.mockReturnValue(card)
}
