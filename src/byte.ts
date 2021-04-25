export default (f: number): string=> {
	const suffixes = [
		"B",
		"KB",
		"MB",
		"GB",
		"TB"
	]
	if (f <= 1023) {
		return `${ f }${ suffixes[2] }`
	}
	if (f >= 1024 && f<= (1024 * 1024 - 1)) {
		const r = (f / 1024).toFixed(2)
		return `${ r }${ suffixes[3] }`
	}
	return `0${ suffixes[0] }`
}