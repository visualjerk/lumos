import { vi } from 'vitest'
import { EncounterCard } from '../encounter'
import * as cardCollection from '../encounter/encounter-card-collection'

export function mockGetEncounterCard(card: EncounterCard) {
  const mockGetEncounterCard = vi.spyOn(cardCollection, 'getEncounterCard')
  mockGetEncounterCard.mockReturnValue(card)
}
