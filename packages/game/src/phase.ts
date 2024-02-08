import { Context } from './context'
import { LocationId } from './location'
import {
  InvestigatorId,
  CleanupPhase,
  InvestigatorPhase,
  AdvanceScenePhase,
  createInvestigatorPhase,
} from './investigator'
import { SkillCheckPhase, CommitSkillCheckPhase } from './skill-check'
import { EncounterPhase, HandleEncounterPhase } from './encounter'
import { AdvanceDoomPhase, DoomPhase } from './doom'
import { EnemyPhase } from './enemy'

export type PhaseAction = {
  type: string
  locationId?: LocationId
  investigatorId?: InvestigatorId
  handCardIndex?: number
  execute: () => Phase
}

export type Phase =
  | DoomPhase
  | AdvanceDoomPhase
  | AdvanceScenePhase
  | EncounterPhase
  | HandleEncounterPhase
  | InvestigatorPhase
  | EnemyPhase
  | CleanupPhase
  | EndGamePhase
  | WinGamePhase
  | SkillCheckPhase
  | CommitSkillCheckPhase

export type CreatePhase<Type extends string> = {
  type: Type
  actions: PhaseAction[]
  context: Context
}

export function createInitialPhase(context: Context): Phase {
  return createInvestigatorPhase(context)
}

export type EndGamePhase = CreatePhase<'endGame'>

export function createEndGamePhase(context: Context): EndGamePhase {
  return {
    type: 'endGame',
    actions: [],
    context,
  }
}

export type WinGamePhase = CreatePhase<'winGame'>

export function createWinGamePhase(context: Context): WinGamePhase {
  return {
    type: 'winGame',
    actions: [],
    context,
  }
}
