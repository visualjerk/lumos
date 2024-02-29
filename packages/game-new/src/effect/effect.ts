import {
  InvestigateEffect,
  InvestigateEffectPhase,
  createInvestigateEffectPhase,
} from './investigate-effect'
import {
  DrawEffect,
  DrawEffectPhase,
  createDrawEffectPhase,
} from './draw-effect'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'
import {
  CollectClueEffect,
  CollectClueEffectPhase,
  createCollectClueEffectPhase,
} from './collect-clue-effect'
import {
  DamageEffect,
  DamageEffectPhase,
  createDamageEffectPhase,
} from './damage-effect'
import {
  SkillCheckEffect,
  SkillCheckEffectPhase,
  createSkillCheckEffectPhase,
} from './skill-check-effect'
import {
  DrawEncounterEffect,
  DrawEncounterEffectPhase,
  createDrawEncounterEffectPhase,
} from './draw-encounter-effect'
import {
  EnemyAttackEffect,
  EnemyAttackEffectPhase,
  createEnemyAttackEffectPhase,
} from './enemy-attack-effect'

export type Effect =
  | InvestigateEffect
  | DrawEffect
  | CollectClueEffect
  | DamageEffect
  | SkillCheckEffect
  | DrawEncounterEffect
  | EnemyAttackEffect

export type EffectPhase =
  | InvestigateEffectPhase
  | DrawEffectPhase
  | CollectClueEffectPhase
  | DamageEffectPhase
  | SkillCheckEffectPhase
  | DrawEncounterEffectPhase
  | EnemyAttackEffectPhase

export type CreateEffect<Type extends string> = {
  type: Type
}

export function createEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: Effect
): EffectPhase {
  switch (effect.type) {
    case 'investigate':
      return createInvestigateEffectPhase(context, investigatorId, effect)
    case 'draw':
      return createDrawEffectPhase(context, investigatorId, effect)
    case 'collectClue':
      return createCollectClueEffectPhase(context, investigatorId, effect)
    case 'damage':
      return createDamageEffectPhase(context, investigatorId, effect)
    case 'skillCheck':
      return createSkillCheckEffectPhase(context, investigatorId, effect)
    case 'drawEncounter':
      return createDrawEncounterEffectPhase(context, investigatorId, effect)
    case 'enemyAttack':
      return createEnemyAttackEffectPhase(context, investigatorId, effect)
  }
}
