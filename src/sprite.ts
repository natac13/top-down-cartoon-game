interface SpriteFrames {
	max: number
	current: number
	elapsed: number
}

interface SpriteProps {
	position: {
		x: number
		y: number
	}
	image: HTMLImageElement
	frames?: Partial<SpriteFrames>
	moving?: boolean
	sprites?: {
		up: HTMLImageElement
		down: HTMLImageElement
		left: HTMLImageElement
		right: HTMLImageElement
	}
}

export class Sprite {
	position: { x: number; y: number }
	image: HTMLImageElement
	frames: SpriteFrames
	width: number
	height: number
	moving: boolean
	sprites?: {
		up: HTMLImageElement
		down: HTMLImageElement
		left: HTMLImageElement
		right: HTMLImageElement
	}

	constructor({ position, image, frames, moving, sprites }: SpriteProps) {
		this.position = position
		this.image = image
		this.frames = {
			current: 0,
			elapsed: 0,
			max: 1,
			...frames,
		}
		this.width = image.width / this.frames.max
		this.height = image.height
		this.image.onload = () => {
			this.width = image.width / this.frames.max
			this.height = image.height
		}
		this.moving = moving || false
		this.sprites = sprites
	}

	draw(c: CanvasRenderingContext2D) {
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
		if (!this.moving) {
			return
		}
		if (this.frames.max > 1) {
			this.frames.elapsed++
		}
		if (this.frames.elapsed % 10 === 0) {
			if (this.frames.current < this.frames.max - 1) {
				this.frames.current++
			} else {
				this.frames.current = 0
			}
		}
	}
}
