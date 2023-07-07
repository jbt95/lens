import fetch from 'node-fetch';
import getApiUrl from './get-api-url';
import * as assert from 'assert/strict';
import { Resource } from '@lens/internal/api-gateway/history';
import { EMPTY, bufferCount, defer, expand, lastValueFrom, mergeMap } from 'rxjs';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const N = 10;

const dc = new DocumentClient();

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

async function cleanup() {
	const tableName = 'lens';

	await lastValueFrom(
		defer(() => dc.scan({ TableName: tableName }).promise()).pipe(
			expand((r) =>
				r.LastEvaluatedKey
					? dc.scan({ TableName: tableName, ExclusiveStartKey: r.LastEvaluatedKey }).promise()
					: EMPTY
			),
			mergeMap((res) => res.Items as { pk: string; sk: string }[]),
			bufferCount(25),
			mergeMap((batch) =>
				defer(() =>
					dc
						.batchWrite({
							RequestItems: {
								[tableName]: batch.map((item) => ({
									DeleteRequest: { Key: { pk: item.pk, sk: item.sk } }
								}))
							}
						})
						.promise()
				)
			)
		),
		{ defaultValue: undefined }
	);
}
