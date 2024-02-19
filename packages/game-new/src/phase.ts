import { InvestigatorId, LocationId } from '@lumos/game'
import { GameExecute } from './game'
import { EndPhase, InvestigatorPhase } from './investigator'
import { TargetPhase } from './target'
import { SkillCheckPhase, CommitSkillCheckPhase } from './skill-check'

export type Phase =
  | InvestigatorPhase
  | EndPhase
  | SkillCheckPhase
  | CommitSkillCheckPhase
  | TargetPhase

export type PhaseBase<TPhaseResult extends PhaseResult = PhaseResult> = {
  type: string
  actions: PhaseAction<TPhaseResult>[]
}

export type GetPhaseResult<TPhase extends Phase> = TPhase extends PhaseBase<
  infer TResult
>
  ? TResult
  : never

export type PhaseAction<TPhaseResult extends PhaseResult = PhaseResult> = {
  type: string
  investigatorId?: InvestigatorId
  locationId?: LocationId
  execute: Execute<TPhaseResult>
}

export type PhaseResult = Record<string, unknown> | undefined

export type Execute<TPhaseResult extends PhaseResult = PhaseResult> = (
  e: GameExecute<[], TPhaseResult, []>
) => void
