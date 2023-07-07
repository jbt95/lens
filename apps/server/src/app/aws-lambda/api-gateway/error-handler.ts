import { APIGatewayProxyResultV2 } from 'aws-lambda';
import * as z from 'zod';

export default function handleApiError(err: unknown): APIGatewayProxyResultV2 {
	if (err instanceof z.ZodError) {
		return {
			statusCode: 400,
			body: JSON.stringify({ errors: err.errors })
		};
	}
	if (err instanceof Error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ errors: [err.message] })
		};
	}
	return {
		statusCode: 500,
		body: JSON.stringify({ errors: ['Unknown error'] })
	};
}
