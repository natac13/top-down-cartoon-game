export function setupCanvas(canvas: HTMLCanvasElement) {
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

export function getGameCanvas() {
	const canvas = document.getElementById('game') as HTMLCanvasElement
	if (!canvas) {
		throw new Error('Canvas element not found')
	}
	return canvas
}
