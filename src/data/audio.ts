import { Howl } from 'howler'

export const audio = {
	map: new Howl({
		src: '/public/audio/map.wav',
		volume: 0.5,
		html5: true,
	}),
	battleInit: new Howl({
		src: '/public/audio/initBattle.wav',
		volume: 0.05,
		html5: true,
	}),
	battle: new Howl({
		src: '/public/audio/battle.mp3',
		volume: 0.05,
		html5: true,
	}),
	tackleHit: new Howl({
		src: '/public/audio/tackleHit.wav',
		volume: 0.05,
		html5: true,
	}),
	fireballHit: new Howl({
		src: '/public/audio/fireballHit.wav',
		volume: 0.05,
		html5: true,
	}),
	fireballInit: new Howl({
		src: '/public/audio/initFireball.wav',
		volume: 0.05,
		html5: true,
	}),
	victory: new Howl({
		src: '/public/audio/victory.wav',
	}),
}
