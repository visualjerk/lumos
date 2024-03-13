import prand from 'pure-rand'

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomNumber(0, i)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

let rng = prand.xoroshiro128plus(createSeed())

export function createSeed(): number {
  return Date.now()
}

export function setRngSeed(seed: number) {
  rng = prand.xoroshiro128plus(seed)
}

export function randomNumber(min: number, max: number): number {
  return prand.unsafeUniformIntDistribution(min, max, rng)
}
