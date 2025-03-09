export function rectangularCollision({
	s1,
	s2,
}: {
	s1: { position: { x: number; y: number }; width: number; height: number }
	s2: { position: { x: number; y: number }; width: number; height: number }
}) {
	return (
		s1.position.x + s1.width >= s2.position.x &&
		s1.position.x <= s2.position.x + s2.width &&
		s1.position.y + s1.height >= s2.position.y &&
		s1.position.y <= s2.position.y + s2.height
	)
}
