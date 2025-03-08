import './style.css'

interface SpriteProps {
	position: {
		x: number
		y: number
	}
	image: HTMLImageElement
	// width: number
	// height: number
}

class Sprite {
	position: { x: number; y: number }
	image: HTMLImageElement
	// width: number
	// height: number

	constructor({ position, image }: SpriteProps) {
		this.position = position
		this.image = image
		// this.width = image.width
		// this.height = image.height
	}

	draw(c: CanvasRenderingContext2D) {
		c.drawImage(this.image, this.position.x, this.position.y)
	}
}

function main() {
	const canvas = document.getElementById('game') as HTMLCanvasElement

	if (!canvas) {
		throw new Error('Canvas element not found')
	}

	canvas.width = 1024
	canvas.height = 576

	const c = canvas.getContext('2d')

	if (!c) {
		throw new Error('2D context not found')
	}

	c.fillStyle = 'white'
	c.fillRect(0, 0, canvas.width, canvas.height)

	const playerImage = new Image()
	playerImage.src = '/public/playerDown.png'
	// const playerSprite = new Sprite({
	// 	position: {
	// 		x: canvas.width / 2 - playerImage.width / 4 / 2,
	// 		y: canvas.height / 2 - playerImage.height / 2,
	// 	},
	// 	image: playerImage,
	// })

	const backgroundImage = new Image()
	backgroundImage.src = '/public/Pellet Town.png'
	backgroundImage.loading = 'eager'
	const backgroundSprite = new Sprite({
		position: {
			x: -735,
			y: -600,
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

	// animate
	function animate(c: CanvasRenderingContext2D) {
		backgroundSprite.draw(c)
		c.drawImage(
			playerImage,
			0, // sx - source x
			0, // sy - source y
			playerImage.width / 4, // sWidth - source width
			playerImage.height, // sHeight - source height
			canvas.width / 2 - playerImage.width / 4 / 2, // dx - destination x
			canvas.height / 2 - playerImage.height / 2, // dy - destination y
			playerImage.width / 4, // dWidth - destination width
			playerImage.height, // dHeight - destination height
		)

		if (keys.w.pressed && lastKey === 'w') {
			backgroundSprite.position.y += 3
		}
		if (keys.a.pressed && lastKey === 'a') {
			backgroundSprite.position.x += 3
		}
		if (keys.s.pressed && lastKey === 's') {
			backgroundSprite.position.y -= 3
		}
		if (keys.d.pressed && lastKey === 'd') {
			backgroundSprite.position.x -= 3
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
