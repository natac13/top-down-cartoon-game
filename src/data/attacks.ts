export interface Attack {
	name: string
	damage: number
	type: string
}

export const attacks = {
	tackle: {
		name: 'Tackle',
		damage: 10,
		type: 'Normal',
		color: 'black',
	},
	fireball: {
		name: 'Fireball',
		damage: 75,
		type: 'Fire',
		color: 'red',
	},
}
