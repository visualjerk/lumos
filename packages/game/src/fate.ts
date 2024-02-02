export type FateSymbol = 'skull' | 'cultist' | 'autoFail' | 'autoSuccess'

export type Fate = {
  symbol: FateSymbol | number
  modifySkillCheck: (skill: number) => number
}

function createNumberFate(symbol: number): Fate {
  return {
    symbol,
    modifySkillCheck: (skill) => skill + symbol,
  }
}

export const MinusFour = createNumberFate(-4)
export const MinusThree = createNumberFate(-3)
export const MinusTwo = createNumberFate(-2)
export const MinusOne = createNumberFate(-1)
export const Zero = createNumberFate(0)
export const PlusOne = createNumberFate(1)

export type FateWheel = Fate[]

export function spinFateWheel(fateWheel: FateWheel): Fate {
  const index = Math.floor(Math.random() * fateWheel.length)
  return fateWheel[index]
}
