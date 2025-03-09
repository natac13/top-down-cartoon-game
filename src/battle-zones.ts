import { Boundary } from './boundary'
import { create2DMap } from './create-2d-map'

export function createBattleZones(
	zones: number[],
	offset: {
		x: number
		y: number
	},
	mapTiles: {
		width: number
	},
): Array<Boundary> {
	const collisionsMap = create2DMap(zones, mapTiles)

	const boundaries: Boundary[] = []
	for (let i = 0; i < collisionsMap.length; i++) {
		for (let j = 0; j < collisionsMap[i].length; j++) {
			if (collisionsMap[i][j] === Boundary.id) {
				boundaries.push(
					new Boundary({
						position: {
							x: j * Boundary.width + offset.x,
							y: i * Boundary.height + offset.y,
						},
					}),
				)
			}
		}
	}
	return boundaries
}
