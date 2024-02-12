import { beforeEach, describe, expect, it } from 'vitest'
import { Context, Game, InvestigatorPhase } from './game'
import { Investigator, createInitialInvestigatorStates } from '@lumos/game'

const INVESTIGATOR_ONE: Investigator = {
  id: '1',
  name: 'Hans',
  health: 9,
  baseSkills: {
    intelligence: 3,
    strength: 3,
    agility: 3,
  },
  baseDeck: [],
}

const INVESTIGATOR_TWO: Investigator = {
  id: '2',
  name: 'Sepp',
  health: 9,
  baseSkills: {
    intelligence: 3,
    strength: 3,
    agility: 3,
  },
  baseDeck: [],
}

describe('game', () => {
  let game: Game

  beforeEach(() => {
    game = new Game()
    const investigatorStates = createInitialInvestigatorStates(
      [INVESTIGATOR_ONE, INVESTIGATOR_TWO],
      'hotel'
    )
    const context = new Context(investigatorStates)
    const phase = new InvestigatorPhase(game, context)
    game.init(context, phase)
  })

  it('can end phase', () => {
    expect(game.phase.type).toBe('investigator')

    game.phase.actions[2].execute()
    expect(game.phase.type).toBe('end')
    expect(game.parentPhase.type).toBe('end')
  })

  it('can damage first investigator', () => {
    expect(game.phase.type).toBe('investigator')
    expect(game.context.investigatorStates.get('1')?.damage).toBe(0)

    game.phase.actions[0].execute()
    expect(game.phase.type).toBe('target')
    expect(game.parentPhase.type).toBe('investigator')

    game.phase.actions[0].execute()
    expect(game.phase.type).toBe('investigator')

    expect(game.context.investigatorStates.get('1')?.damage).toBe(1)
  })

  it('can damage second investigator', () => {
    expect(game.phase.type).toBe('investigator')
    expect(game.context.investigatorStates.get('2')?.damage).toBe(0)

    game.phase.actions[0].execute()
    expect(game.phase.type).toBe('target')
    expect(game.parentPhase.type).toBe('investigator')

    game.phase.actions[1].execute()
    expect(game.phase.type).toBe('investigator')

    expect(game.context.investigatorStates.get('2')?.damage).toBe(1)
  })

  it('can add extra damage', () => {
    expect(game.phase.type).toBe('investigator')
    expect(game.context.investigatorStates.get('1')?.damage).toBe(0)

    game.phase.actions[1].execute()
    expect(game.phase.type).toBe('target')
    expect(game.parentPhase.type).toBe('investigator')

    game.phase.actions[0].execute()
    expect(game.phase.type).toBe('damage')
    expect(game.parentPhase.type).toBe('investigator')

    game.phase.actions[0].execute()
    expect(game.phase.type).toBe('investigator')

    expect(game.context.investigatorStates.get('1')?.damage).toBe(3)
  })

  it('can stack extra damage', () => {
    expect(game.phase.type).toBe('investigator')
    expect(game.context.investigatorStates.get('1')?.damage).toBe(0)

    game.phase.actions[1].execute()
    expect(game.phase.type).toBe('target')
    expect(game.parentPhase.type).toBe('investigator')

    game.phase.actions[0].execute()
    expect(game.phase.type).toBe('damage')
    expect(game.parentPhase.type).toBe('investigator')

    game.phase.actions[1].execute()
    expect(game.phase.type).toBe('damage')
    expect(game.parentPhase.type).toBe('investigator')

    game.phase.actions[0].execute()
    expect(game.phase.type).toBe('investigator')

    expect(game.context.investigatorStates.get('1')?.damage).toBe(4)
  })

  it('ends investigator phase after 3 actions', async () => {
    for (let i = 0; i < 3; i++) {
      game.phase.actions[0].execute()
      game.phase.actions[0].execute()
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    expect(game.phase.type).toBe('investigator')
    game.phase.actions[0].execute()
    expect(game.phase.type).toBe('end')
  })
})
