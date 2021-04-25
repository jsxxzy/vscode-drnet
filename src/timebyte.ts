export default (h: number): string=> {
	if (h < 60) {
		return `${ h }分钟`
	}
	if (h == 60) {
		return "1小时"
	}
	const m = h % 60
	const b = (h / 60).toFixed(0)
	return `${ b }小时${ m }分钟`
}