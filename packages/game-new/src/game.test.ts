import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { beforeEach, describe, expect, it } from 'vitest'
import { Game } from './game'
import { Investigator, createInitialContext } from '@lumos/game'
import { InvestigatorPhase } from './investigator'

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
    const context = createInitialContext(MisteryOfTheHogwartsExpress, [
      INVESTIGATOR_ONE,
      INVESTIGATOR_TWO,
    ])
    const phase = new InvestigatorPhase(context)
    game = new Game(context, phase)
  })

  it('can end phase', () => {
    expect(game.phase.type).toBe('investigator')

    game.phase.actions[1].execute()
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
