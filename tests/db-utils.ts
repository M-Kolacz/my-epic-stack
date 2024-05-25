import { prisma } from '#app/utils/db.server';
import { faker } from '@faker-js/faker';
import { UniqueEnforcer } from 'enforce-unique';
import bcrypt from 'bcryptjs';

const uniqueUsernameEnforcer = new UniqueEnforcer();

export const createUser = async () => {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();

	const username = uniqueUsernameEnforcer
		.enforce(
			() =>
				faker.string.alphanumeric({ length: 2 }) +
				'_' +
				faker.internet.userName({ firstName, lastName }),
		)
		.slice(0, 20)
		.toLocaleLowerCase()
		.replace(/[^a-z0-9_]/g, '_');

	return {
		username,
		name: `${firstName} ${lastName}`,
		email: `${username}@gmail.com`,
	};
};

export const createPassword = async (
	password: string = faker.internet.password(),
) => ({ hash: await bcrypt.hash(password, 10) });

export const cleanupDb = async () => {
	const tables = await prisma.$queryRaw<
		{ name: string }[]
	>`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`;

	await prisma.$transaction([
		// Disable FK constraints to avoid relation conflicts during deletion
		prisma.$executeRaw`PRAGMA foreign_keys = OFF;`,
		// Delete all rows from each table, preserving table structures
		...tables.map(({ name }) =>
			prisma.$executeRawUnsafe(`DELETE from "${name}"`),
		),
		prisma.$executeRaw`PRAGMA foreign_keys = ON;`,
	]);
};
