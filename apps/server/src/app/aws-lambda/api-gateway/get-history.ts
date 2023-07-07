import 'reflect-metadata';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import buildHandler from '../handler';
import * as z from 'zod';
import container from '../container';
import handleApiError from './error-handler';
import ProductionRepository from '@/history/infrastructure/adapters/production-repository.service';
import History from '@/history/domain/entity';
import { apiGateway } from '@lens/internal';

const bodySchema = z.object({
	from: z.string().transform((s) => new Date(s)),
	to: z.string().transform((s) => new Date(s))
});

const repository = container.get(ProductionRepository);

export const handler = buildHandler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>(async (e) => {
	const { from, to } = bodySchema.parse(JSON.parse(e.body!));
	try {
		return repository.getByTimeframe(from, to).then((items) => ({
			statusCode: 200,
			body: JSON.stringify({ items: items.map(buildResource) })
		}));
	} catch (err) {
		return handleApiError(err);
	}
});

const buildResource = (h: History): apiGateway.history.Resource => ({
	date: h.date.toISOString(),
	r1: h.r1,
	r2: h.r2,
	d: h.d,
	n: h.n
});
