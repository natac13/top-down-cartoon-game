import { attacks } from './attacks'

// const embyImage = new Image()
// embyImage.src = '/public/embySprite.png'
// const draggleImage = new Image()
// draggleImage.src = '/public/draggleSprite.png'

export const monsters = {
	emby: {
		image: {
			src: '/public/embySprite.png',
		},
		position: {
			x: 280,
			y: 325,
		},
		frames: { max: 4, hold: 15 },
		animate: true,
		isEnemy: false,
		name: 'Emby',
		attacks: [attacks.tackle, attacks.fireball],
	},
	draggle: {
		image: {
			src: '/public/draggleSprite.png',
		},
		position: {
			x: 800,
			y: 100,
		},
		frames: { max: 4, hold: 15 },
		animate: true,
		isEnemy: true,
		name: 'Draggle',
		attacks: [attacks.tackle, attacks.fireball],
	},
}
