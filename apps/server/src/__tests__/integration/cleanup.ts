import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { EMPTY, bufferCount, defer, expand, lastValueFrom, mergeMap } from 'rxjs';

const dc = new DocumentClient();

export default async function cleanup() {
	const tableName = 'lens-test';

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
