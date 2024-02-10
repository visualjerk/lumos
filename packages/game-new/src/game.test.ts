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

  it('can end phase', async () => {
    expect(game.phase.type).toBe('investigator')

    await game.phase.actions[1].execute()
    expect(game.phase.type).toBe('end')
  })

  it('can damage first investigator', async () => {
    expect(game.phase.type).toBe('investigator')
    expect(game.context.investigatorStates.get('1')?.damage).toBe(0)

    const actionPromise = game.phase.actions[0].execute()
    expect(game.phase.type).toBe('target-phase')

    await game.phase.actions[0].execute()
    expect(game.phase.type).toBe('investigator')

    await actionPromise
    expect(game.context.investigatorStates.get('1')?.damage).toBe(1)
  })

  it('can damage second investigator', async () => {
    expect(game.phase.type).toBe('investigator')
    expect(game.context.investigatorStates.get('2')?.damage).toBe(0)

    const actionPromise = game.phase.actions[0].execute()
    expect(game.phase.type).toBe('target-phase')

    await game.phase.actions[1].execute()
    expect(game.phase.type).toBe('investigator')

    await actionPromise
    expect(game.context.investigatorStates.get('2')?.damage).toBe(1)
  })
})
