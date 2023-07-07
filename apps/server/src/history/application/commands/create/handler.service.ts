import Repository from '@/history/domain/repository.service';

export interface Command {
	date: Date;
	r1: number;
	r2: number;
	d: number;
	n: number;
}

export default class CreateHistoryHandler {
	constructor(private repository: Repository) {}

	public async execute(cmd: Command): Promise<void> {
		await this.repository.save(cmd);
	}
}
