import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import buildHandler from '../handler';
import * as z from 'zod';
import CreateHistoryHandler from '@/history/application/commands/create/handler.service';
import handleApiError from './error-handler';
import ProductionRepository from '@/history/infrastructure/adapters/production-repository.service';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const bodySchema = z.object({
	date: z.string().transform((s) => new Date(s)),
	r1: z.number(),
	r2: z.number(),
	d: z.number(),
	n: z.number()
});

const createHistoryHandler = new CreateHistoryHandler(
	new ProductionRepository(new DocumentClient())
);

export const handler = buildHandler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>(async (e) => {
	try {
		const body = bodySchema.parse(JSON.parse(e.body!));
		return createHistoryHandler
			.execute(body)
			.then(() => ({ statusCode: 200, body: JSON.stringify({ success: true }) }));
	} catch (err) {
		return handleApiError(err);
	}
});
