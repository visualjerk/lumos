import { useGame } from '@/game'
import { LocationCard } from './location-card'
import { Layout, LocationId } from '@lumos/game'
import { useCss } from 'react-use'
import { cn } from '@/utils'

export function LocationMap() {
  const { context } = useGame()
  const { scenario } = context
  const { layout } = scenario

  const mapClasses = useMapClasses(layout)

  return (
    <div className={cn('p-4 grid gap-10', mapClasses)}>
      {scenario.locationCards.map((card) => (
        <LocationItem key={card.id} id={card.id} />
      ))}
    </div>
  )
}

function useMapClasses(layout: Layout) {
  let layoutColumns = 1
  let layoutRows = 1

  layout.forEach(([x, y]) => {
    layoutColumns = Math.max(layoutColumns, x)
    layoutRows = Math.max(layoutRows, y)
  })

  return useCss({
    gridColumns: `${layoutColumns + 1}`,
    gridRows: `${layoutColumns + 1}`,
  })
}

function LocationItem({ id }: { id: LocationId }) {
  const { layout } = useGame().context.scenario
  const [x, y] = layout.get(id)!

  const itemClasses = useCss({
    gridColumn: `${x} / span 2`,
    gridRow: `${y} / span 2`,
  })

  return (
    <div className={cn('grid justify-center', itemClasses)}>
      <LocationCard id={id} />
    </div>
  )
}
