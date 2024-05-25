import { remember } from '@epic-web/remember';
import { PrismaClient } from '@prisma/client';

export const prisma = remember('prisma', () => {
	// NOTE: if you change anything in this function you'll need to restart
	// the dev server to see your changes.

	// Feel free to change this log threshold to something that makes sense for you

	const client = new PrismaClient({});
	client.$connect();
	return client;
});
