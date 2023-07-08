export function debounceAsync(fn: (...args: any[]) => Promise<unknown>) {
	let timer: number | undefined
	return async () => {
		window.clearTimeout(timer)
		timer = window.setTimeout(async () => {
			timer = undefined
			await fn()
		}, 400)
	}
}

export function formatDate(isoDate: string) {
	return Intl.DateTimeFormat('en-GB', {
		dateStyle: 'full',
		timeStyle: 'short',
		timeZone: 'Europe/Madrid'
	}).format(new Date(isoDate))
}
