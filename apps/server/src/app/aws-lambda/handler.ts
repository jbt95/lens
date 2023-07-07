import { Context, Handler } from 'aws-lambda';
import { config } from 'aws-sdk';

config.logger = console;

export default function buildHandler<E, O = unknown>(
	handler: (e: E, ctx: Context) => Promise<O>
): Handler {
	return async (e: E, ctx) => {
		console.log('[INPUT]', JSON.stringify(e));
		let response: O;
		try {
			response = await handler(e, ctx);
		} catch (err: unknown) {
			console.error('[ERROR]', err instanceof Error ? err.stack : JSON.stringify(err));
			throw err;
		}
		console.log('[OUTPUT]', JSON.stringify(response));

		return response;
	};
}
