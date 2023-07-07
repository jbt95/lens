import { CloudFormation } from 'aws-sdk';

const cf = new CloudFormation();

export default async function getApiUrl(): Promise<string> {
	const stack = await cf
		.describeStacks({
			StackName: 'lens-test'
		})
		.promise()
		.then((res) => res.Stacks?.at(0));

	return stack!.Outputs!.find((o) => o.OutputKey === 'ExportHttpApiIdtest')!.OutputValue!;
}
