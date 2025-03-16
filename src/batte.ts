import { animate } from 'motion'
import { attacks } from './data/attacks'
import { audio } from './data/audio'
import { monsters } from './data/monsters'
import { Monster, Sprite } from './sprite'

const FPS = 60
const FRAME_INTERVAL = 1000 / FPS

export function handleBattle(
	c: CanvasRenderingContext2D,
	gameLoop: (n: number) => void,
	battle: {
		initiated: boolean
	},
) {
	const dialogBox = document.getElementById('dialog-box') as HTMLDivElement
	const attackTypeDiv = document.getElementById('attack-type') as HTMLDivElement
	const overlappingDiv = document.getElementById(
		'overlapping-div',
	) as HTMLDivElement
	const userInterfaceDiv = document.getElementById(
		'user-interface',
	) as HTMLDivElement
	const playerHealthBar = document.getElementById(
		'player-health-bar',
	) as HTMLDivElement
	const enemyHealthBar = document.getElementById(
		'enemy-health-bar',
	) as HTMLDivElement
	const attackBox = document.getElementById('attack-box') as HTMLDivElement

	audio.battle.play()

	playerHealthBar.style.width = '100%'
	enemyHealthBar.style.width = '100%'
	dialogBox.style.display = 'none'
	attackBox.replaceChildren()

	animate(userInterfaceDiv, { opacity: 1, display: 'block' }, { duration: 0.5 })

	let lastTime = 0

	// Load battle zone image
	const battleZoneImage = new Image()
	battleZoneImage.src = '/public/battleBackground.png'
	const battleBackgroundSprite = new Sprite({
		image: battleZoneImage,
		position: {
			x: 0,
			y: 0,
		},
	})

	const draggle = new Monster(monsters.draggle)
	const emby = new Monster(monsters.emby)
	const renderedSprites: Sprite[] = [draggle, emby]

	for (const attack of emby.attacks) {
		const attackButton = document.createElement('button')
		attackButton.classList.add('attack')
		attackButton.innerText = attack.name
		attackButton.id = attack.name.toLowerCase()
		attackBox.append(attackButton)
	}

	let battleAnimationId: number

	function battleAnimation(c: CanvasRenderingContext2D) {
		console.log('battle')

		battleBackgroundSprite.draw(c)

		for (const renderedSprite of renderedSprites) {
			renderedSprite.draw(c)
		}
	}

	function battleGameLoop(timestamp: number) {
		if (!c) {
			throw new Error('2D context not found')
		}
		battleAnimationId = requestAnimationFrame(battleGameLoop)
		const deltaTime = timestamp - lastTime
		if (deltaTime >= FRAME_INTERVAL) {
			lastTime = timestamp - (deltaTime % FRAME_INTERVAL)
			battleAnimation(c)
		}
	}

	const attackQueue: Array<() => void> = []

	const attackButtons =
		document.querySelectorAll<HTMLButtonElement>('button.attack')

	function handleBattleEnd() {
		attackQueue.push(() => {
			animate(
				overlappingDiv,
				{
					opacity: 1,
				},
				{
					onComplete: () => {
						cancelAnimationFrame(battleAnimationId)
						gameLoop(0)

						animate(
							overlappingDiv,
							{ opacity: 0 },
							{
								duration: 0.8,
								delay: 0.5,
							},
						)
						audio.map.play()
						animate(userInterfaceDiv, { opacity: 0, display: 'none' })
					},
				},
			)
			battle.initiated = false
		})
	}

	for (const attackButton of attackButtons) {
		attackButton.addEventListener('click', () => {
			const attack = attacks[attackButton.id as keyof typeof attacks]
			if (!attack) {
				throw new Error(`Attack ${attackButton.id} not found`)
			}

			emby.attack({
				attack: attack,
				recipient: draggle,
				renderedSprites,
			})

			if (draggle.health <= 0) {
				attackQueue.push(() => {
					draggle.faint()
				})
				handleBattleEnd()
				return
			}
			const randomAttack =
				draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

			attackQueue.push(() => {
				draggle.attack({
					attack: randomAttack,
					recipient: emby,
					renderedSprites,
				})
				if (emby.health <= 0) {
					attackQueue.push(() => {
						emby.faint()
					})
					handleBattleEnd()
					return
				}
			})
		})

		attackButton.addEventListener('mouseenter', (e) => {
			const selectedAttack = attacks[attackButton.id as keyof typeof attacks]
			attackTypeDiv.innerText = `${selectedAttack.name} - ${selectedAttack.type}`
			attackTypeDiv.style.color = selectedAttack.color
		})
	}

	dialogBox.addEventListener('click', () => {
		dialogBox.style.display = 'none'
		if (attackQueue.length > 0) {
			const nextAttack = attackQueue.shift()
			nextAttack?.()
		}
	})

	// Start the battle game loop
	battleGameLoop(0)
}
