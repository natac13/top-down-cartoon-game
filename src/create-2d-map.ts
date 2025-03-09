export function create2DMap(
	input: number[],
	map: {
		width: number
	},
): number[][] {
	const result = []
	for (let i = 0; i < input.length; i += map.width) {
		result.push(input.slice(i, i + map.width))
	}
	return result
}
