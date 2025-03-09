import { createBattleZones } from './battle-zones'
import { createBoundaries } from './boundary'
import { battleZonesData } from './data/battleZones'
import { collisions } from './data/collisions'
import { rectangularCollision } from './rectangular-collision'
import { getGameCanvas, setupCanvas } from './setup-canvas'
import { Sprite } from './sprite'
import './style.css'

const MAP_WIDTH_TILES = 70
const MAP_HEIGHT_TILES = 40
const BATTLE_RATE = 0.1
const OFFSET = {
	x: -735,
	y: -640,
}
const PLAYER_IMG = {
	width: 192,
	height: 68,
}

function main() {
	const canvas = getGameCanvas()
	const c = setupCanvas(canvas)

	const boundaries = createBoundaries(collisions, OFFSET, {
		width: MAP_WIDTH_TILES,
	})
	const battleZones = createBattleZones(battleZonesData, OFFSET, {
		width: MAP_WIDTH_TILES,
	})

	// Load player image
	const playerDownImage = new Image()
	playerDownImage.src = '/public/playerDown.png'
	const playerUpImage = new Image()
	playerUpImage.src = '/public/playerUp.png'
	const playerLeftImage = new Image()
	playerLeftImage.src = '/public/playerLeft.png'
	const playerRightImage = new Image()
	playerRightImage.src = '/public/playerRight.png'
	const player = new Sprite({
		position: {
			x: canvas.width / 2 - PLAYER_IMG.width / 4 / 2,
			y: canvas.height / 2 - PLAYER_IMG.height / 2,
		},
		image: playerDownImage,
		frames: { max: 4 },
		sprites: {
			up: playerUpImage,
			down: playerDownImage,
			left: playerLeftImage,
			right: playerRightImage,
		},
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

	// Load foreground image
	const foregroundImage = new Image()
	foregroundImage.src = '/public/foregroundObjects.png'
	const foregroundSprite = new Sprite({
		image: foregroundImage,
		position: {
			x: OFFSET.x,
			y: OFFSET.y,
		},
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

	const movables = [
		backgroundSprite,
		foregroundSprite,
		...boundaries,
		...battleZones,
	]
	// animate
	function animate(c: CanvasRenderingContext2D) {
		// rendering
		backgroundSprite.draw(c)
		for (const boundary of boundaries) {
			boundary.draw(c)
		}
		for (const battleZone of battleZones) {
			battleZone.draw(c)
		}
		player.draw(c)
		foregroundSprite.draw(c)

		// battle zone detection
		if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
			for (let i = 0; i < battleZones.length; i++) {
				const battleZone = battleZones[i]

				const overlappingArea =
					(Math.min(
						player.position.x + player.width,
						battleZone.position.x + battleZone.width,
					) -
						Math.max(player.position.x, battleZone.position.x)) *
					(Math.min(
						player.position.y + player.height,
						battleZone.position.y + battleZone.height,
					) -
						Math.max(player.position.y, battleZone.position.y))
				if (
					rectangularCollision({
						s1: player,
						s2: battleZone,
					}) &&
					overlappingArea > (player.width * player.height) / 2 &&
					Math.random() < BATTLE_RATE
				) {
					console.log('battleZone')
					break
				}
			}
		}

		// collision detection
		let moving = true
		player.moving = false

		if (keys.w.pressed && lastKey === 'w') {
			player.moving = true
			player.image = player.sprites?.up || player.image
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
			player.moving = true
			player.image = player.sprites?.left || player.image
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
			player.moving = true
			player.image = player.sprites?.down || player.image
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
			player.moving = true
			player.image = player.sprites?.right || player.image
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
