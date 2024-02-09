import { TargetKind } from '../target'

export type CreateAction<Type extends string, Target extends TargetKind> = {
  type: Type
  target: Target
}

export type DrawAction = CreateAction<'draw', 'self' | 'investigator'> & {
  amount: number
}

export type MoveAction = CreateAction<'move', 'location'>

export type Action = DrawAction | MoveAction
