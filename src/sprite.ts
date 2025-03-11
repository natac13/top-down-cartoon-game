import { animate } from 'motion'

interface SpriteFrames {
	max: number
	current: number
	elapsed: number
	hold: number
}

interface SpriteProps {
	position: {
		x: number
		y: number
	}
	image: HTMLImageElement
	frames?: Partial<SpriteFrames>
	animate?: boolean
	sprites?: {
		up: HTMLImageElement
		down: HTMLImageElement
		left: HTMLImageElement
		right: HTMLImageElement
	}
	isEnemy?: boolean
}

export class Sprite {
	position: { x: number; y: number }
	image: HTMLImageElement
	frames: SpriteFrames
	width: number
	height: number
	animate: boolean
	sprites?: {
		up: HTMLImageElement
		down: HTMLImageElement
		left: HTMLImageElement
		right: HTMLImageElement
	}
	opacity: number
	health: number
	isEnemy: boolean

	constructor({
		position,
		image,
		frames,
		animate,
		sprites,
		isEnemy,
	}: SpriteProps) {
		this.position = position
		this.image = image
		this.frames = {
			current: 0,
			elapsed: 0,
			max: 1,
			hold: 10,
			...frames,
		}
		this.width = image.width / this.frames.max
		this.height = image.height
		this.image.onload = () => {
			this.width = image.width / this.frames.max
			this.height = image.height
		}
		this.animate = animate || false
		this.sprites = sprites
		this.opacity = 1
		this.health = 100
		this.isEnemy = isEnemy || false
	}

	draw(c: CanvasRenderingContext2D) {
		c.save()
		c.globalAlpha = this.opacity
		c.drawImage(
			this.image,
			this.frames.current * this.width, // sx - source x
			0, // sy - source y
			this.image.width / this.frames.max, // sWidth - source width
			this.image.height, // sHeight - source height
			this.position.x, // dx - destination x
			this.position.y, // dy - destination y
			this.image.width / this.frames.max, // dWidth - destination width
			this.image.height, // dHeight - destination height
		)
		c.restore()
		if (!this.animate) {
			return
		}
		if (this.frames.max > 1) {
			this.frames.elapsed++
		}
		if (this.frames.elapsed % this.frames.hold === 0) {
			if (this.frames.current < this.frames.max - 1) {
				this.frames.current++
			} else {
				this.frames.current = 0
			}
		}
	}

	attack({
		attack,
		recipient,
	}: {
		attack: {
			name: string
			damage: number
			type: string
		}
		recipient: Sprite
	}) {
		let movementDistance = 15
		if (this.isEnemy) {
			movementDistance = -movementDistance
		}
		animate(
			[
				[
					this.position,
					{ x: this.position.x - movementDistance },
					{ duration: 0.2 },
				],
				[
					this.position,
					{ x: this.position.x + movementDistance * 2 },
					{ duration: 0.1, stiffness: 300, type: 'inertia', velocity: 1.1 },
				],
				[
					this.position,
					{ x: this.position.x - movementDistance },
					{ duration: 0.2 },
				],
			],
			{
				onComplete: () => {
					recipient.health -= attack.damage
					const healthBar = this.isEnemy
						? '#player-health-bar'
						: '#enemy-health-bar'
					animate(
						healthBar,
						{
							width: `${recipient.health}%`,
						},
						{ duration: 0.2 },
					)
					animate(
						recipient.position,
						{ x: recipient.position.x + 10 },
						{
							repeat: 5,
							duration: 0.08,
							ease: 'anticipate',
							repeatType: 'mirror',
							onComplete: () => {},
						},
					)
					animate(
						recipient,
						{ opacity: 0 },
						{
							duration: 0.08,
							repeat: 5,
							ease: 'linear',
							repeatType: 'mirror',
						},
					)
				},
			},
		)
	}
}
