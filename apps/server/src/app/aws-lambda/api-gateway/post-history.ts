import 'reflect-metadata';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import buildHandler from '../handler';
import * as z from 'zod';
import container from '../container';
import CreateHistoryHandler from '@/history/application/commands/create/handler.service';
import handleApiError from './error-handler';

const bodySchema = z.object({
	date: z.string().transform((s) => new Date(s)),
	r1: z.number(),
	r2: z.number(),
	d: z.number(),
	n: z.number()
});

const createHistoryHandler = container.get(CreateHistoryHandler);

export const handler = buildHandler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>(async (e) => {
	try {
		return createHistoryHandler.execute(bodySchema.parse(JSON.parse(e.body!))).then(() => ({
			statusCode: 200,
			body: JSON.stringify({ success: true })
		}));
	} catch (err) {
		return handleApiError(err);
	}
});
