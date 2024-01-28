import { LocationId } from '../card/location-card'

export const MAX_COORDINATE = 6

export type Coordinate = 1 | 2 | 3 | 4 | 5 | 6

export type Position = [x: Coordinate, y: Coordinate]

export type Layout = Map<LocationId, Position>
