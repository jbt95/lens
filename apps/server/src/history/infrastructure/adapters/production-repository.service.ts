import appEnv from '@/env';
import History from '@/history/domain/entity';
import Repository from '@/history/domain/repository.service';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { injectable } from 'inversify';
import { EMPTY, Observable, defer, expand, lastValueFrom, map, mergeMap, toArray } from 'rxjs';

type ISODateString = string;

interface Marshalled extends DocumentClient.AttributeMap {
	pk: string;
	sk: ISODateString;
	r1: number;
	r2: number;
	d: number;
	n: number;
}

@injectable()
export default class ProductionRepository extends Repository {
	private static readonly commonId = '_';

	private static marhsall(h: History): Marshalled {
		return {
			pk: ProductionRepository.commonId,
			sk: h.date.toISOString(),
			r1: h.r1,
			r2: h.r2,
			d: h.d,
			n: h.n
		};
	}

	private static unmarshall(m: Marshalled): History {
		return {
			date: new Date(m.sk),
			r1: m.r1,
			r2: m.r2,
			d: m.d,
			n: m.n
		};
	}

	constructor(private documentClient: DocumentClient) {
		super();
	}

	public async save(history: History): Promise<void> {
		await this.documentClient
			.put({
				TableName: appEnv.tableName,
				Item: ProductionRepository.marhsall(history)
			})
			.promise();
	}

	public getByTimeframe(from: Date, to: Date): Promise<History[]> {
		return lastValueFrom(
			query$<Marshalled>(this.documentClient, {
				TableName: appEnv.tableName,
				ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
				ExpressionAttributeValues: {
					':pk': ProductionRepository.commonId,
					':from': from.toISOString(),
					':to': to.toISOString()
				},
				KeyConditionExpression: '#pk = :pk AND #sk BETWEEN :from AND :to',
				ScanIndexForward: false
			}).pipe(map(ProductionRepository.unmarshall), toArray()),
			{ defaultValue: [] }
		);
	}
}

function query$<T extends DocumentClient.AttributeMap>(
	dc: DocumentClient,
	query: DocumentClient.QueryInput
): Observable<T> {
	return defer(() => dc.query(query).promise())
		.pipe(
			expand((res) =>
				res.LastEvaluatedKey
					? dc.query({ ...query, ExclusiveStartKey: res.LastEvaluatedKey! }).promise()
					: EMPTY
			)
		)
		.pipe(mergeMap((res) => res.Items as T[]));
}
