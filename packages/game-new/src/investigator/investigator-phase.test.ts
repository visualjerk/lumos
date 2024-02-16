import { beforeEach, describe, expect, it } from 'vitest'
import { Game } from '../game'
import { createInvestigatorPhase } from '../investigator'
import { GameTestUtils, createGameTestUtils } from '../test'

describe('game', () => {
  let t: GameTestUtils
  let game: Game

  beforeEach(() => {
    t = createGameTestUtils(createInvestigatorPhase)
    game = t.game
    t.expectPhase('investigator')
  })

  it('can end phase', () => {
    t.executeAction({ type: 'end' })
    t.expectPhase('end')
  })

  it('can damage first investigator', () => {
    expect(game.context.investigatorStates.get('1')?.damage).toBe(0)

    t.executeAction({ type: 'attack' })
    t.expectPhase('target', 'investigator')

    t.executeAction({ type: 'target' })
    t.expectPhase('investigator')

    expect(game.context.investigatorStates.get('1')?.damage).toBe(1)
  })

  it('can damage second investigator', () => {
    expect(game.context.investigatorStates.get('2')?.damage).toBe(0)

    t.executeAction({ type: 'attack' })
    t.expectPhase('target', 'investigator')

    t.executeAction({ type: 'target' }, 1)
    t.expectPhase('investigator')

    expect(game.context.investigatorStates.get('2')?.damage).toBe(1)
  })

  it('ends investigator phase after 3 actions', () => {
    for (let i = 0; i < 3; i++) {
      t.executeAction({ type: 'attack' })
      t.executeAction({ type: 'target' })
    }
    t.expectPhase('investigator')
    t.expectOnlyActions({ type: 'end' })
  })
})
