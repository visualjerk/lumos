import type { LocationId } from './location-card'

export type Coordinate = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type Position = [x: Coordinate, y: Coordinate]

export type Layout = Map<LocationId, Position>
