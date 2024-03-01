import { EncounterCard, EncounterCardId } from './encounter-card'

export function getEncounterCard(cardId: EncounterCardId) {
  return EncounterCardCollection.get(cardId)!
}

export const VoidShock: EncounterCard = {
  id: 'ec-void-shock',
  type: 'trap',
  name: 'Void Shock',
  description: 'Make an intelligence check (3). On a failure, take 2 damage.',
  effect: {
    type: 'skillCheck',
    target: 'self',
    skill: 'intelligence',
    difficulty: 3,
    onFailure: { type: 'damage', amount: 2, target: 'self' },
  },
}

export const Dementor: EncounterCard = {
  id: 'ec-dementor',
  type: 'enemy',
  name: 'Dementor',
  description: 'The presence of this entitiy makes you feel cold and hopeless.',
  attackDamage: 2,
  health: 3,
  strength: 2,
}

export const EncounterCardCollection = new Map<EncounterCardId, EncounterCard>(
  [VoidShock].map((card) => [card.id, card])
)
