import { GamePhaseCoordinator } from './game'
import { InvestigatorId, InvestigatorPhase } from './investigator'
import { TargetPhase } from './target'
import { SkillCheckPhase, CommitSkillCheckPhase } from './skill-check'
import { EffectPhase } from './effect'
import { Context } from './context'
import { LocationId } from './location'
import { DoomPhase } from './doom'
import { EndPhase } from './end'
import { UpkeepPhase } from './upkeep'
import { ScenePhase } from './scene'
import { EncounterPhase } from './encounter'

export type Phase =
  | InvestigatorPhase
  | UpkeepPhase
  | SkillCheckPhase
  | CommitSkillCheckPhase
  | EffectPhase
  | TargetPhase
  | DoomPhase
  | EncounterPhase
  | ScenePhase
  | EndPhase

export type PhaseBase<TPhaseResult extends PhaseResult = PhaseResult> = {
  type: string
  context: Context
  onEnter?: (coordinator: GamePhaseCoordinator<[], TPhaseResult>) => void
  actions: PhaseAction<TPhaseResult>[]
}

export type GetPhaseResult<TPhase extends Phase> = TPhase extends PhaseBase<
  infer TResult
>
  ? TResult
  : never

export type PhaseActionFilterParams = {
  type: string
  investigatorId?: InvestigatorId
  locationId?: LocationId
  cardIndex?: number
}

export type PhaseAction<TPhaseResult extends PhaseResult = PhaseResult> =
  PhaseActionFilterParams & {
    execute: Execute<TPhaseResult>
  }

export type PhaseResult = Record<string, unknown> | undefined

export type Execute<TPhaseResult extends PhaseResult = PhaseResult> = (
  coordinator: GamePhaseCoordinator<[], TPhaseResult>
) => void

export function actionMatches(
  action: PhaseAction<PhaseResult>,
  filterParams: PhaseActionFilterParams
): boolean {
  return Object.entries(filterParams).every(
    ([key, value]) => action[key as keyof PhaseActionFilterParams] === value
  )
}
