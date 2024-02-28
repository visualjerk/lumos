import { EncounterCard, EncounterCardId } from './encounter-card'

export function getEncounterCard(cardId: EncounterCardId) {
  return EncounterCardCollection.get(cardId)!
}

export const EncounterCardCollection = new Map<EncounterCardId, EncounterCard>([
  [
    'ec-void-shock',
    {
      id: 'ec-void-shock',
      type: 'trap',
      name: 'Void Shock',
      description:
        'Make an intelligence check (3). On a failure, take 2 damage.',
      effect: {
        type: 'skillCheck',
        target: 'self',
        skill: 'intelligence',
        difficulty: 3,
        onFailure: { type: 'damage', amount: 2, target: 'self' },
      },
    },
  ],
])
