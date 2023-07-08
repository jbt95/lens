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

interface JsonRequestOptions<Body = unknown> {
	url: string
	method: 'GET' | 'POST' | 'PUT' | 'DELETE'
	body?: Body
	headers?: Record<string, string>
}

export function jsonRequest<Body = unknown, Response = unknown>(opts: JsonRequestOptions<Body>) {
	return fetch(opts.url, {
		body: JSON.stringify(opts.body),
		method: opts.method,
		mode: 'cors',
		headers: {
			...opts.headers,
			'Content-Type': 'application/json'
		}
	}).then((res) => res.json() as Promise<Response>)
}
