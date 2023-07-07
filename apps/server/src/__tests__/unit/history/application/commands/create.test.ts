import CreateHistoryHandler from '@/history/application/commands/create/handler.service';
import InMemoryRepository from '@/history/infrastructure/adapters/in-memory-repository.service';
import * as assert from 'node:assert/strict';

describe('When creating a history record', () => {
	const d = 1;
	const n = 1;
	const r1 = 1;
	const r2 = 1;
	const date = new Date();

	const repository = new InMemoryRepository();
	const handler = new CreateHistoryHandler(repository);

	it('should save it', async () => {
		await handler.execute({ date, d, n, r1, r2 });
		const records = await repository.getByTimeframe(new Date(0), date);
		assert.strictEqual(records.length, 1);
		const history = records.at(0)!;
		assert.strictEqual(history.date, date);
		assert.strictEqual(history.d, d);
		assert.strictEqual(history.n, n);
		assert.strictEqual(history.r1, r1);
		assert.strictEqual(history.r2, r2);
	});
});
