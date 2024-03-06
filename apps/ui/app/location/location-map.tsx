'use client'

import { useGame } from '@/game'
import { LocationCard } from './location-card'
import { Layout, LocationId } from '@lumos/game'

export function LocationMap() {
  const { context } = useGame()
  const { scenario } = context
  const { layout } = scenario

  const { cols, rows } = getMapValues(layout)

  return (
    <div
      className="p-4 grid gap-10 grid-cols-[--map-cols] grid-rows-[--map-rows]"
      style={{
        // @ts-expect-error - css variables not typed in react
        '--map-cols': `${cols}`,
        '--map-rows': `${rows}`,
      }}
    >
      {scenario.locationCards.map((card) => (
        <LocationItem key={card.id} id={card.id} />
      ))}
    </div>
  )
}

function getMapValues(layout: Layout): { cols: number; rows: number } {
  let cols = 1
  let rows = 1

  layout.forEach(([x, y]) => {
    cols = Math.max(cols, x)
    rows = Math.max(rows, y)
  })

  return {
    cols: cols + 1,
    rows: rows + 1,
  }
}

function LocationItem({ id }: { id: LocationId }) {
  const { layout } = useGame().context.scenario
  const [x, y] = layout.get(id)!

  return (
    <div
      className="grid justify-center col-start-[--card-col-start] col-span-2 row-start-[--card-row-start] row-span-2"
      style={{
        // @ts-expect-error - css variables not typed in react
        '--card-col-start': `${x}`,
        '--card-row-start': `${y}`,
      }}
    >
      <LocationCard id={id} />
    </div>
  )
}
