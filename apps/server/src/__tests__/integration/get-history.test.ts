import fetch from 'node-fetch';
import getApiUrl from './get-api-url';
import * as assert from 'assert/strict';
import { Resource } from '@lens/internal/api-gateway/history';
import cleanup from './cleanup';

const N = 10;

describe('When getting history', () => {
	const from = new Date('2020-01-01');
	const to = new Date('2020-01-02');
	let baseUrl: string;

	before(async () => {
		baseUrl = `https://${await getApiUrl()}.execute-api.eu-west-1.amazonaws.com/prod`;
		await addHistoryRecords(baseUrl, N, from, to);
	});

	after(() => cleanup());

	describe('and there are records for a given timfeframe', () => {
		it('should 200', async () => {
			const result = await fetch(
				`${baseUrl}/history?from=${from.toISOString()}&to=${to.toISOString()}`,
				{ method: 'GET' }
			);
			assert.strictEqual(result.status, 200);
			const body = (await result.json()) as { items: Resource[] };
			assert.strictEqual(body.items.length, N);
		});

		describe('and there are no records for a given timeframe', () => {
			const from = new Date('2026-01-01');
			const to = new Date('2026-01-02');
			it('should 200', async () => {
				const result = await fetch(
					`${baseUrl}/history?from=${from.toISOString()}&to=${to.toISOString()}`,
					{ method: 'GET' }
				);
				assert.strictEqual(result.status, 200);
				const body = (await result.json()) as { items: Resource[] };
				assert.strictEqual(body.items.length, 0);
			});
		});
	});
});

async function addHistoryRecords(url: string, n: number, from: Date, to: Date) {
	await Promise.all(
		Array.from({ length: n }).map((_, i) =>
			fetch(`${url}/history`, {
				method: 'POST',
				body: JSON.stringify({
					date: i % 2 === 0 ? minutes(from, i).toISOString() : minutes(to, -i).toISOString(),
					r1: i,
					r2: i,
					d: i,
					n: i
				})
			})
		)
	);
}

function minutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * 60 * 1000);
}
