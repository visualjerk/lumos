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
import {
  EnemyOpportunityAttackEffect,
  EnemyOpportunityAttackEffectPhase,
  createEnemyOpportunityAttackEffectPhase,
} from './enemy-opportunity-attack-effect'
import {
  DamageEnemyEffect,
  DamageEnemyEffectPhase,
  canUseDamageEnemyEffect,
  createDamageEnemyEffectPhase,
} from './damage-enemy-effect'
import {
  AttackEnemyEffect,
  AttackEnemyEffectPhase,
  canUseAttackEnemyEffect,
  createAttackEnemyEffectPhase,
} from './attack-enemy-effect'

export type Effect =
  | InvestigateEffect
  | DrawEffect
  | CollectClueEffect
  | DamageEffect
  | SkillCheckEffect
  | DrawEncounterEffect
  | EnemyAttackEffect
  | EnemyOpportunityAttackEffect
  | DamageEnemyEffect
  | AttackEnemyEffect

export type EffectPhase =
  | InvestigateEffectPhase
  | DrawEffectPhase
  | CollectClueEffectPhase
  | DamageEffectPhase
  | SkillCheckEffectPhase
  | DrawEncounterEffectPhase
  | EnemyAttackEffectPhase
  | EnemyOpportunityAttackEffectPhase
  | DamageEnemyEffectPhase
  | AttackEnemyEffectPhase

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
    case 'enemyOpportunityAttack':
      return createEnemyOpportunityAttackEffectPhase(
        context,
        investigatorId,
        effect
      )
    case 'damageEnemy':
      return createDamageEnemyEffectPhase(context, investigatorId, effect)
    case 'attackEnemy':
      return createAttackEnemyEffectPhase(context, investigatorId, effect)
  }
}

export function canUseEffect(
  context: Context,
  investigatorId: InvestigatorId,
  effect: Effect
): boolean {
  switch (effect.type) {
    case 'attackEnemy':
      return canUseAttackEnemyEffect(context, investigatorId, effect)
    case 'damageEnemy':
      return canUseDamageEnemyEffect(context, investigatorId, effect)
    default:
      return true
  }
}
