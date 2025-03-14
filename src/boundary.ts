import { create2DMap } from './create-2d-map'

interface BoundaryProps {
	position: {
		x: number
		y: number
	}
}

export class Boundary {
	static width = 48
	static height = 48
	static id = 1025

	width: number
	height: number

	position: { x: number; y: number }

	constructor({ position }: BoundaryProps) {
		this.position = position
		this.width = Boundary.width
		this.height = Boundary.height
	}

	draw(c: CanvasRenderingContext2D) {
		c.fillStyle = 'rgba(255, 0, 0, 0.1)'
		c.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
}

export function createBoundaries(
	collisions: number[],
	offset: {
		x: number
		y: number
	},
	mapTiles: {
		width: number
	},
): Array<Boundary> {
	const collisionsMap = create2DMap(collisions, mapTiles)

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
