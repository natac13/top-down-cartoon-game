interface SpriteFrames {
	max: number
}

interface SpriteProps {
	position: {
		x: number
		y: number
	}
	image: HTMLImageElement
	frames?: SpriteFrames
}

export class Sprite {
	position: { x: number; y: number }
	image: HTMLImageElement
	frames: SpriteFrames
	width: number
	height: number

	constructor({ position, image, frames }: SpriteProps) {
		this.position = position
		this.image = image
		this.frames = frames || { max: 1 }
		this.width = image.width / this.frames.max
		this.height = image.height
		this.image.onload = () => {
			this.width = image.width / this.frames.max
			this.height = image.height
		}
	}

	draw(c: CanvasRenderingContext2D) {
		c.drawImage(
			this.image,
			0, // sx - source x
			0, // sy - source y
			this.image.width / this.frames.max, // sWidth - source width
			this.image.height, // sHeight - source height
			this.position.x, // dx - destination x
			this.position.y, // dy - destination y
			this.image.width / this.frames.max, // dWidth - destination width
			this.image.height, // dHeight - destination height
		)
	}
}
