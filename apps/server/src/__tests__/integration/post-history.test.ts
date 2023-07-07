import fetch from 'node-fetch';
import * as assert from 'assert/strict';
import getApiUrl from './get-api-url';

describe('When creating a history record', function (this) {
	this.timeout(10_0000);

	const d = 1;
	const n = 1;
	const r1 = 1;
	const r2 = 1;
	const date = new Date();

	let baseUrl: string;

	before(async () => {
		baseUrl = `https://${await getApiUrl()}.execute-api.eu-west-1.amazonaws.com/prod`;
	});

	describe('and the body is valid', () => {
		it('should 200', async () => {
			const result = await fetch(`${baseUrl}/history`, {
				method: 'POST',
				body: JSON.stringify({
					date: date.toISOString(),
					r1,
					r2,
					d,
					n
				})
			});
			assert.strictEqual(result.status, 200);
		});
	});

	describe('and the body is malformed', () => {
		it('should 400', async () => {
			const result = await fetch(`${baseUrl}/history`, {
				method: 'POST',
				body: JSON.stringify({})
			});
			assert.strictEqual(result.status, 400);
		});
	});
});
