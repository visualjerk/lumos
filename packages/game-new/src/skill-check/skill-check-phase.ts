import { Context } from '@lumos/game'
import { Action, PhaseBase } from '../phase'
import { EffectContext, SkillCheck, SkillCheckContext } from './skill-check'
import { spinFateWheel } from '../fate'

export function createSkillCheckPhase(
  context: Context,
  check: SkillCheck,
  effectContext: EffectContext
): SkillCheckPhase {
  return new SkillCheckPhase(context, check, effectContext)
}

export class SkillCheckPhase implements PhaseBase {
  type = 'skillCheck'

  constructor(
    public context: Context,
    public check: SkillCheck,
    public effectContext: EffectContext
  ) {}

  get actions() {
    const actions: Action[] = []

    const { check, context } = this
    const { investigatorId, locationId } = this.effectContext

    const difficulty =
      check.difficulty instanceof Function
        ? check.difficulty(context, { investigatorId, locationId })
        : check.difficulty

    actions.push({
      type: 'commitSkillCheck',
      investigatorId,
      execute: (e) => {
        const fate = spinFateWheel(context.scenario.fateWheel)
        const skills = context.getInvestigatorSkills(investigatorId)
        const totalSkill = fate.modifySkillCheck(skills[check.skill])

        e.waitFor(
          createCommitSkillCheckPhase(
            context,
            { check, difficulty, totalSkill, fate },
            this.effectContext
          )
        ).toParent()
      },
    })

    return actions
  }
}

function createCommitSkillCheckPhase(
  context: Context,
  skillCheckContext: SkillCheckContext,
  effectContext: EffectContext
): CommitSkillCheckPhase {
  return new CommitSkillCheckPhase(context, skillCheckContext, effectContext)
}

export class CommitSkillCheckPhase implements PhaseBase {
  type = 'commitSkillCheck'

  constructor(
    public context: Context,
    public skillCheckContext: SkillCheckContext,
    public effectContext: EffectContext
  ) {}

  get actions() {
    const actions: Action[] = []

    const { investigatorId } = this.effectContext

    actions.push({
      type: 'endSkillCheck',
      investigatorId,
      execute: (e) =>
        e
          .apply(() => {
            const { check, difficulty, totalSkill } = this.skillCheckContext

            if (difficulty <= totalSkill) {
              check.onSuccess.apply(this.context, this.effectContext)
              return
            }
            check.onFailure.apply(this.context, this.effectContext)
          })
          .toParent(),
    })

    return actions
  }
}
