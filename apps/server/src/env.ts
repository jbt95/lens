import * as z from 'zod';

const appEnv = {
	tableName: z.string().parse(process.env.tableName)
};

export default appEnv;
