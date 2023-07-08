# Installation

This project uses `pnpm` as its package manager. You can install it with `npm i -g pnpm`.

To install the dependencies, run

```
pnpm i
```

# Project structure
This project is a monorepo composed of two `apps`:
- `apps/server`: The backend API
- `apps/internal`: Shared code between the `server` and `web` apps
- `apps/web`: The frontend web app
- `packages/eslint-config`: Contains the eslint configuration
- `packages/ts-config`: Contains the typescript configuration

# Usage
### Deploying the server
To deploy de server run `pnpm deploy:prod:all` with this environment variables:
- `AWS_ACCESS_KEY_ID=<your_key>`
- `AWS_SECRET_ACCESS_KEY=<your_secret_key>`
- `AWS_ACCOUNT_ID=<your_account_id>`
- `AWS_REGION=eu-west-1`
- `STAGE=prod`

For example:
``` 
 AWS_ACCESS_KEY_ID=<your_key> AWS_SECRET_ACCESS_KEY=<your_secret_key> AWS_ACCOUNT_ID=<your_account_id> STAGE=prod AWS_REGION=eu-west-1 pnpm deploy:prod:all
```

After the deploy is completed you should grab the api url either from your aws console or from the output of the deploy command.

It should look like this: 
> `https://<api_id>.execute-api.eu-west-1.amazonaws.com/prod`

### Running the web app
To run the web app you will need to create an `.env` file in `apps/web` folder with the following content:

> VITE_API_URL=<api_url>

`VITE_API_URL` should be the url you got from the deploy command or from the aws console.

Then you can `cd apps/web` and run `pnpm run dev` to start the web app.

# License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# Contributing
This project is not open to contributions.

# Tech Stack
- [pnpm](https://pnpm.io/)
- [Typescript](https://www.typescriptlang.org/)
- [Vue 3](https://v3.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [AWS CDK](https://aws.amazon.com/cdk/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DynamoDB](https://aws.amazon.com/dynamodb/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [AWS API Gateway](https://aws.amazon.com/api-gateway/)
- [Mocha](https://mochajs.org/)
- [Turborepo](https://turborepo.org/)

