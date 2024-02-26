import { beforeEach, describe, expect, it } from 'vitest'
import {
  FIRST_DOOM_CARD,
  GameTestUtils,
  SECOND_DOOM_CARD,
  createGameTestUtils,
} from '../test'
import { DoomState, createDoomPhase } from '.'

describe('DoomPhase', () => {
  let t: GameTestUtils
  let doomState: DoomState

  beforeEach(() => {
    t = createGameTestUtils(createDoomPhase)
    doomState = t.game.context.doomState
  })

  it('starts at first doom card', () => {
    expect(doomState.doom).toBe(0)
    expect(doomState.doomCard.id).toEqual(FIRST_DOOM_CARD.id)
  })

  it('can increase doom', () => {
    t.expectPhase('doom')
    t.executeAction({ type: 'increaseDoom' })

    expect(doomState.doom).toBe(1)
    t.expectPhase('investigator')
  })

  it('advances doom card after treshold is reached', () => {
    for (let i = 0; i < FIRST_DOOM_CARD.treshold - 1; i++) {
      doomState.increaseDoom()
    }

    t.executeAction({ type: 'increaseDoom' })
    t.expectPhase('advanceDoomPhase')

    t.executeAction({ type: 'advanceDoom' })
    t.expectPhase('investigator')
  })

  it('ends game after last doom card treshold is reached', () => {
    doomState.advanceDoomCards()
    for (let i = 0; i < SECOND_DOOM_CARD.treshold - 1; i++) {
      doomState.increaseDoom()
    }

    t.executeAction({ type: 'increaseDoom' })
    t.expectPhase('advanceDoomPhase')

    t.executeAction({ type: 'advanceDoom' })
    t.expectPhase('end')
  })
})
