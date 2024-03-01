import { LocationTargetPhase } from './location-target'
import { InvestigatorTargetPhase } from './investigator-target'
import { EnemyTargetPhase } from './enemy-target'

export type TargetPhase =
  | InvestigatorTargetPhase
  | LocationTargetPhase
  | EnemyTargetPhase
