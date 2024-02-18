import { Context } from '@lumos/game'
import { Action, PhaseBase } from '../phase'
import { SkillCheck, SkillCheckContext } from './skill-check'
import { Fate, spinFateWheel } from '../fate'

export function createSkillCheckPhase(
  context: Context,
  check: SkillCheck
): SkillCheckPhase {
  return new SkillCheckPhase(context, check)
}

export class SkillCheckPhase implements PhaseBase {
  type = 'skillCheck'

  constructor(public context: Context, public check: SkillCheck) {}

  get actions() {
    const actions: Action[] = []

    const { check, context } = this
    const { investigatorId } = check

    actions.push({
      type: 'commitSkillCheck',
      investigatorId,
      execute: (e) =>
        e.waitFor(createCommitSkillCheckPhase(context, { check })).toParent(),
    })

    return actions
  }
}

function createCommitSkillCheckPhase(
  context: Context,
  skillCheckContext: SkillCheckContext
): CommitSkillCheckPhase {
  return new CommitSkillCheckPhase(context, skillCheckContext)
}

export class CommitSkillCheckPhase implements PhaseBase {
  type = 'commitSkillCheck'
  fate: Fate
  totalSkill: number

  constructor(
    public context: Context,
    public skillCheckContext: SkillCheckContext
  ) {
    const { check } = skillCheckContext
    const { investigatorId, skill } = check

    this.fate = spinFateWheel(context.scenario.fateWheel)
    const skills = context.getInvestigatorSkills(investigatorId)

    this.totalSkill = this.fate.modifySkillCheck(skills[skill])
  }

  get actions() {
    const actions: Action[] = []

    const { check } = this.skillCheckContext
    const { investigatorId, difficulty, onSuccess, onFailure } = check

    actions.push({
      type: 'endSkillCheck',
      investigatorId,
      execute: (e) =>
        e
          .apply(() => {
            if (difficulty <= this.totalSkill) {
              onSuccess.apply(this.context)
              return
            }
            onFailure.apply(this.context)
          })
          .toParent(),
    })

    return actions
  }
}
