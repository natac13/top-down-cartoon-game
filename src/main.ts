import { collisions } from './data/collisions'
import { rectangularCollision } from './rectangular-collision'
import { Sprite } from './sprite'
import './style.css'

const MAP_WIDTH_TILES = 70
const MAP_HEIGHT_TILES = 40

const BOUNDARY_ID = 1025
const OFFSET = {
	x: -735,
	y: -640,
}
const BOUNDARY_OFFSET = {
	x: 0,
	y: 0,
}
const BOUNDARY_WIDTH = 48
const BOUNDARY_HEIGHT = 48

const PLAYER_IMG = {
	width: 192,
	height: 68,
}

interface BoundaryProps {
	position: {
		x: number
		y: number
	}
}

class Boundary {
	width: number
	height: number

	position: { x: number; y: number }

	constructor({ position }: BoundaryProps) {
		this.position = position
		this.width = BOUNDARY_HEIGHT
		this.height = BOUNDARY_WIDTH
	}

	draw(c: CanvasRenderingContext2D) {
		c.fillStyle = 'rgba(255, 0, 0, 0.5)'
		c.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
}

function setupCanvas(canvas: HTMLCanvasElement) {
	canvas.width = 1024
	canvas.height = 576
	const c = canvas.getContext('2d')
	if (!c) {
		throw new Error('2D context not found')
	}
	c.fillStyle = 'white'
	c.fillRect(0, 0, canvas.width, canvas.height)
	return c
}

function getGameCanvas() {
	const canvas = document.getElementById('game') as HTMLCanvasElement
	if (!canvas) {
		throw new Error('Canvas element not found')
	}
	return canvas
}

function createCollisionsMap() {
	const collisionsMap = []
	for (let i = 0; i < collisions.length; i += MAP_WIDTH_TILES) {
		collisionsMap.push(collisions.slice(i, i + MAP_WIDTH_TILES))
	}
	return collisionsMap
}

function createBoundaries(collisionsMap: number[][]): Array<Boundary> {
	const boundaries: Boundary[] = []
	for (let i = 0; i < collisionsMap.length; i++) {
		for (let j = 0; j < collisionsMap[i].length; j++) {
			if (collisionsMap[i][j] === BOUNDARY_ID) {
				boundaries.push(
					new Boundary({
						position: {
							x: j * BOUNDARY_WIDTH + OFFSET.x + BOUNDARY_OFFSET.x,
							y: i * BOUNDARY_HEIGHT + OFFSET.y + BOUNDARY_OFFSET.y,
						},
					}),
				)
			}
		}
	}
	return boundaries
}

function main() {
	const canvas = getGameCanvas()
	const c = setupCanvas(canvas)

	const collisionsMap = createCollisionsMap()
	const boundaries = createBoundaries(collisionsMap)

	// Load player image
	const playerImage = new Image()
	playerImage.src = '/public/playerDown.png'
	const player = new Sprite({
		position: {
			x: canvas.width / 2 - PLAYER_IMG.width / 4 / 2,
			y: canvas.height / 2 - PLAYER_IMG.height / 2,
		},
		image: playerImage,
		frames: { max: 4 },
	})

	// Load background image
	const backgroundImage = new Image()
	backgroundImage.src = '/public/Pellet Town.png'
	backgroundImage.loading = 'eager'
	const backgroundSprite = new Sprite({
		position: {
			x: OFFSET.x,
			y: OFFSET.y,
		},
		image: backgroundImage,
	})

	// Set up a consistent 60 FPS loop
	const FPS = 60
	const FRAME_INTERVAL = 1000 / FPS
	let lastTime = 0

	let lastKey = ''
	const keys = {
		w: {
			pressed: false,
		},
		a: {
			pressed: false,
		},
		s: {
			pressed: false,
		},
		d: {
			pressed: false,
		},
	}

	const movables = [backgroundSprite, ...boundaries]
	// animate
	function animate(c: CanvasRenderingContext2D) {
		backgroundSprite.draw(c)

		for (const boundary of boundaries) {
			boundary.draw(c)
		}
		player.draw(c)

		let moving = true

		if (keys.w.pressed && lastKey === 'w') {
			for (let i = 0; i < boundaries.length; i++) {
				const boundary = boundaries[i]
				if (
					rectangularCollision({
						s1: player,
						s2: {
							...boundary,
							position: {
								x: boundary.position.x,
								y: boundary.position.y + 3,
							},
						},
					})
				) {
					moving = false
					break
				}
			}
			if (moving) {
				for (const movable of movables) {
					movable.position.y += 3
				}
			}
		}
		if (keys.a.pressed && lastKey === 'a') {
			for (let i = 0; i < boundaries.length; i++) {
				const boundary = boundaries[i]
				if (
					rectangularCollision({
						s1: player,
						s2: {
							...boundary,
							position: {
								x: boundary.position.x + 3,
								y: boundary.position.y,
							},
						},
					})
				) {
					moving = false
					break
				}
			}
			if (moving) {
				for (const movable of movables) {
					movable.position.x += 3
				}
			}
		}
		if (keys.s.pressed && lastKey === 's') {
			for (let i = 0; i < boundaries.length; i++) {
				const boundary = boundaries[i]
				if (
					rectangularCollision({
						s1: player,
						s2: {
							...boundary,
							position: {
								x: boundary.position.x,
								y: boundary.position.y - 3,
							},
						},
					})
				) {
					moving = false
					break
				}
			}
			if (moving) {
				for (const movable of movables) {
					movable.position.y -= 3
				}
			}
		}
		if (keys.d.pressed && lastKey === 'd') {
			for (let i = 0; i < boundaries.length; i++) {
				const boundary = boundaries[i]
				if (
					rectangularCollision({
						s1: player,
						s2: {
							...boundary,
							position: {
								x: boundary.position.x - 3,
								y: boundary.position.y,
							},
						},
					})
				) {
					moving = false
					break
				}
			}
			if (moving) {
				for (const movable of movables) {
					movable.position.x -= 3
				}
			}
		}
	}

	function gameLoop(timestamp: number) {
		if (!c) {
			throw new Error('2D context not found')
		}
		const deltaTime = timestamp - lastTime

		if (deltaTime >= FRAME_INTERVAL) {
			lastTime = timestamp - (deltaTime % FRAME_INTERVAL)

			animate(c)
		}

		requestAnimationFrame(gameLoop)
	}

	// Start the game loop once images are loaded
	backgroundImage.onload = () => {
		requestAnimationFrame(gameLoop)
	}

	window.addEventListener('keydown', (e) => {
		const key = e.key
		switch (key) {
			case 'w':
				keys.w.pressed = true
				lastKey = 'w'
				break
			case 'a':
				keys.a.pressed = true
				lastKey = 'a'
				break
			case 's':
				keys.s.pressed = true
				lastKey = 's'
				break
			case 'd':
				keys.d.pressed = true
				lastKey = 'd'
				break
		}
	})

	window.addEventListener('keyup', (e) => {
		const key = e.key

		switch (key) {
			case 'w':
				keys.w.pressed = false
				break
			case 'a':
				keys.a.pressed = false
				break
			case 's':
				keys.s.pressed = false
				break
			case 'd':
				keys.d.pressed = false
				break
		}
	})
}

main()
