/* eslint-disable quotes */
import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';
import * as path from 'path';
import {Cors, LambdaIntegration, RestApi} from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as z from 'zod';

const STAGE = z.string().parse(process.env.STAGE);

class Stack extends cdk.Stack {
	public static readonly appName = `lens`;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const table = new dynamodb.Table(this, Stack.buildResourcePrefix('history'), {
			partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
			tableName: id,
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			tableClass: dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS,
			removalPolicy: RemovalPolicy.DESTROY
		});

		const lambdaProps: lambda.NodejsFunctionProps = {
			bundling: { externalModules: ['aws-sdk'] },
			environment: { tableName: table.tableName },
			runtime: Runtime.NODEJS_16_X,
			memorySize: 2048,
			logRetention: logs.RetentionDays.INFINITE
		};

		const postHistoryEndpointLambda = new lambda.NodejsFunction(
			this,
			Stack.buildResourcePrefix('postHistoryEndpoint'),
			{
				...lambdaProps,
				functionName: Stack.buildResourcePrefix('postHistoryEndpoint'),
				entry: path.join(__dirname, 'src/app/aws-lambda/api-gateway/post-history.ts')
			}
		);
		const getHistoryEndpointLambda = new lambda.NodejsFunction(
			this,
			Stack.buildResourcePrefix('getHistoryEndpoint'),
			{
				...lambdaProps,
				functionName: Stack.buildResourcePrefix('getHistoryEndpoint'),
				entry: path.join(__dirname, 'src/app/aws-lambda/api-gateway/get-history.ts')
			}
		);

		table.grantWriteData(postHistoryEndpointLambda);
		table.grantReadData(getHistoryEndpointLambda);

		const api = new RestApi(this, 'hitoryApi', {
			restApiName: 'History API',
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
				allowMethods: Cors.ALL_METHODS,
				allowHeaders: Cors.DEFAULT_HEADERS,
				allowCredentials: true,
				statusCode: 200,
				exposeHeaders: [
					'Access-Control-Allow-Origin',
					'Access-Control-Allow-Headers',
					'Access-Control-Allow-Methods',
					'Access-Control-Allow-Credentials'
				]
			}
		});

		const items = api.root.addResource('history');
		items.addMethod('POST', new LambdaIntegration(postHistoryEndpointLambda));
		items.addMethod('GET', new LambdaIntegration(getHistoryEndpointLambda));

		this.exportValue(api.restApiId, {
			name: `HttpApiId-${STAGE}`
		});
	}

	private static buildResourcePrefix(v: string): string {
		return `${Stack.appName}-${STAGE}-${v}`;
	}
}

const app = new cdk.App();
new Stack(app, `${Stack.appName}-${STAGE}`, {});
app.synth();
