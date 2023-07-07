import History from './entity';

export default abstract class Repository {
	public abstract save(history: History): Promise<void>;

	public abstract getByTimeframe(from: Date, to: Date): Promise<History[]>;
}
