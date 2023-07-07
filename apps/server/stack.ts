import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
import {
	LambdaIntegration,
	MockIntegration,
	PassthroughBehavior,
	RestApi,
	IResource,
} from 'aws-cdk-lib/aws-apigateway';

class Stack extends cdk.Stack {
	public static readonly appName = 'lens';

	private static buildResourcePrefix(v: string): string {
		return `${Stack.appName}-${v}`;
	}

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const table = new dynamodb.Table(
			this,
			Stack.buildResourcePrefix('history'),
			{
				partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
				sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
				tableName: id,
				billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
				tableClass: dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS,
				removalPolicy: RemovalPolicy.DESTROY,
			}
		);

		const lambdaProps: lambda.NodejsFunctionProps = {
			bundling: { externalModules: ['aws-sdk'] },
			environment: { tableName: table.tableName },
			runtime: Runtime.NODEJS_16_X,
		};

		const postHistoryEndpointLambda = new lambda.NodejsFunction(
			this,
			Stack.buildResourcePrefix('postHistoryEndpoint'),
			{
				...lambdaProps,
				functionName: Stack.buildResourcePrefix('postHistoryEndpoint'),
				entry: path.join(
					__dirname,
					'src/app/aws-lambda/api-gateway/post-history.ts'
				),
			}
		);
		const getHistoryEndpointLambda = new lambda.NodejsFunction(
			this,
			Stack.buildResourcePrefix('getHistoryEndpoint'),
			{
				...lambdaProps,
				functionName: Stack.buildResourcePrefix('getHistoryEndpoint'),
				entry: path.join(
					__dirname,
					'src/app/aws-lambda/api-gateway/get-history.ts'
				),
			}
		);
		table.grantWriteData(postHistoryEndpointLambda);
		table.grantReadData(getHistoryEndpointLambda);

		const api = new RestApi(this, 'hitoryApi', { restApiName: 'History API' });

		const items = api.root.addResource('history');
		items.addMethod('POST', new LambdaIntegration(postHistoryEndpointLambda));
		items.addMethod('GET', new LambdaIntegration(getHistoryEndpointLambda));
		this.addCorsOptions(items);
	}

	private addCorsOptions(apiResource: IResource) {
		apiResource.addMethod(
			'OPTIONS',
			new MockIntegration({
				integrationResponses: [
					{
						statusCode: '200',
						responseParameters: {
							'method.response.header.Access-Control-Allow-Headers':
								'\'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent\'',
							'method.response.header.Access-Control-Allow-Origin': '\'*\'',
							'method.response.header.Access-Control-Allow-Credentials':
								'\'false\'',
							'method.response.header.Access-Control-Allow-Methods':
								'\'OPTIONS,GET,PUT,POST,DELETE\'',
						},
					},
				],
				passthroughBehavior: PassthroughBehavior.NEVER,
				requestTemplates: {
					'application/json': '{"statusCode": 200}',
				},
			}),
			{
				methodResponses: [
					{
						statusCode: '200',
						responseParameters: {
							'method.response.header.Access-Control-Allow-Headers': true,
							'method.response.header.Access-Control-Allow-Methods': true,
							'method.response.header.Access-Control-Allow-Credentials': true,
							'method.response.header.Access-Control-Allow-Origin': true,
						},
					},
				],
			}
		);
	}
}

const app = new cdk.App();
new Stack(app, Stack.appName, {});
app.synth();
