import Repository from '@/history/domain/repository.service';
import History from '@/history/domain/entity';
import { injectable } from 'inversify';

@injectable()
export default class InMemoryRepository extends Repository {
	private memory = new Map<string, History>();

	private static buildKey(h: History): string {
		return h.date.toISOString();
	}

	constructor() {
		super();
	}

	public async save(history: History): Promise<void> {
		this.memory.set(InMemoryRepository.buildKey(history), history);
	}

	public async getByTimeframe(from: Date, to: Date): Promise<History[]> {
		return Array.from(this.memory.values())
			.filter((h) => h.date >= from && h.date <= to)
			.sort((a, b) => b.date.getTime() - a.date.getTime());
	}
}
