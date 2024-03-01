import { vi } from 'vitest'
import * as fateModule from '../fate'
import { Fate } from '../fate'

export function mockSpinFateWheel(fate: Fate) {
  const mockSpinFateWheel = vi.spyOn(fateModule, 'spinFateWheel')
  mockSpinFateWheel.mockReturnValue(fate)
}
