import { animate } from 'motion'
import type { Attack } from './data/attacks'
import { audio } from './data/audio'

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
	image: { src: string }
	frames?: Partial<SpriteFrames>
	animate?: boolean
	sprites?: {
		up: HTMLImageElement
		down: HTMLImageElement
		left: HTMLImageElement
		right: HTMLImageElement
	}
	rotation?: number
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
	rotation: number

	constructor({
		position,
		image,
		frames,
		animate,
		sprites,
		rotation,
	}: SpriteProps) {
		this.position = position
		this.image = new Image()
		this.frames = {
			current: 0,
			elapsed: 0,
			max: 1,
			hold: 10,
			...frames,
		}
		this.width = 0
		this.height = 0
		this.image.onload = () => {
			this.width = this.image.width / this.frames.max
			this.height = this.image.height
		}
		this.image.src = image.src
		this.animate = animate || false
		this.sprites = sprites
		this.opacity = 1
		this.rotation = rotation || 0
	}

	draw(c: CanvasRenderingContext2D) {
		c.save()
		c.translate(
			this.position.x + this.width / 2,
			this.position.y + this.height / 2,
		)
		c.rotate(this.rotation)
		c.translate(
			-(this.position.x + this.width / 2),
			-(this.position.y + this.height / 2),
		)
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
}

interface MonsterProps extends SpriteProps {
	isEnemy: boolean
	name: string
	attacks: Attack[]
}

export class Monster extends Sprite {
	isEnemy: boolean
	name: string
	health: number
	attacks: Attack[]

	constructor({
		position,
		image,
		frames,
		animate,
		sprites,
		isEnemy,
		rotation,
		name,
		attacks,
	}: MonsterProps) {
		super({
			position,
			image,
			frames,
			animate,
			sprites,
			rotation,
		})

		this.isEnemy = isEnemy || false
		this.name = name
		this.health = 100
		this.attacks = attacks
	}

	attack({
		attack,
		recipient,
		renderedSprites,
	}: {
		attack: Attack
		recipient: Monster
		renderedSprites: Sprite[]
	}) {
		const dialogBox = document.querySelector('#dialog-box') as HTMLDivElement

		dialogBox.style.display = 'block'
		const name = this.isEnemy ? this.name || 'Enemy' : this.name || 'Player'
		dialogBox.innerHTML = `${name} used ${attack.name}`
		recipient.health -= attack.damage

		switch (attack.name) {
			case 'Tackle': {
				this.#handleTackleAnimation({ recipient })
				break
			}
			case 'Fireball': {
				this.#handleFireballAnimation({ recipient, renderedSprites })
				break
			}
			default: {
				console.log('Unknown attack type')
				break
			}
		}
	}

	#getHealthBar() {
		const healthBar = this.isEnemy ? '#player-health-bar' : '#enemy-health-bar'
		return healthBar
	}

	#handleFireballAnimation({
		recipient,
		renderedSprites,
	}: {
		recipient: Monster
		renderedSprites: Sprite[]
	}) {
		const fireballImage = new Image()
		fireballImage.src = '/public/fireball.png'
		audio.fireballInit.play()

		const fireball = new Sprite({
			position: {
				x: this.position.x,
				y: this.position.y,
			},
			image: fireballImage,
			frames: { max: 4, hold: 10 },
			animate: true,
			rotation: this.isEnemy ? -2.2 : 1,
		})

		renderedSprites.splice(1, 0, fireball)

		let complete = false

		animate(
			fireball.position,
			{
				x: recipient.position.x,
				y: recipient.position.y,
			},
			{
				duration: 0.6,
				onComplete: () => {
					if (complete) return
					complete = true
					audio.fireballHit.play()
					const healthBar = this.#getHealthBar()
					animate(fireball, { opacity: 0 }, { duration: 0.2 })
					animate(
						healthBar,
						{
							width: `${recipient.health}%`,
						},
						{
							duration: 0.2,
						},
					)
					animate(
						recipient.position,
						{ x: recipient.position.x + 10 },
						{
							repeat: 5,
							duration: 0.08,
							ease: 'anticipate',
							repeatType: 'mirror',
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
					renderedSprites.splice(1, 1)
				},
			},
		)
	}

	#handleTackleAnimation({
		recipient,
	}: {
		recipient: Monster
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
					audio.tackleHit.play()
					const healthBar = this.#getHealthBar()
					animate(
						healthBar,
						{ width: `${recipient.health}%` },
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

	faint() {
		const dialogBox = document.getElementById('dialog-box') as HTMLDivElement
		dialogBox.style.display = 'block'
		dialogBox.innerHTML = `${this.name} fainted!`
		animate(this.position, { y: this.position.y + 20 })
		animate(this, { opacity: 0 })
		audio.victory.play()
		audio.battle.stop()
	}
}
