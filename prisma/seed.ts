import { faker } from "@faker-js/faker";
import { prisma } from "#app/utils/db.server";
import { cleanupDb, createPassword, createUser } from "#tests/db-utils";

const seed = async () => {
	console.log("🌱 Seeding...");
	console.time("🌱 Database has been seeded");

	console.time("🧹 Cleanup database");
	await cleanupDb();
	console.timeEnd("🧹 Cleanup database");

	console.time("🗝️  Create permissions...");
	const entities = ["user", "note"];
	const actions = ["create", "read", "update", "delete"];
	const accesses = ["own", "any"] as const;

	const permissionsToCreate = [];

	for (const entity of entities) {
		for (const action of actions) {
			for (const access of accesses) {
				permissionsToCreate.push({
					entity,
					action,
					access,
				});
			}
		}
	}

	await prisma.permission.createMany({ data: permissionsToCreate });
	console.timeEnd("🗝️  Create permissions...");

	console.time("👑 Create roles...");
	await prisma.role.create({
		data: {
			name: "admin",
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: "any" },
				}),
			},
		},
	});

	await prisma.role.create({
		data: {
			name: "user",
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: "own" },
				}),
			},
		},
	});
	console.timeEnd("👑 Create roles...");

	const totalUsers = 5;
	console.time(`👥 Create ${totalUsers} users`);

	for (let i = 0; i < totalUsers; i++) {
		const userData = await createUser();

		await prisma.user.create({
			data: {
				...userData,
				roles: { connect: { name: "user" } },
				password: {
					create: await createPassword(userData.username),
				},
				notes: {
					create: Array.from({
						length: faker.number.int({ min: 1, max: 5 }),
					}).map(() => ({
						title: faker.lorem.sentence(),
						content: faker.lorem.paragraphs(),
					})),
				},
			},
		});
	}

	console.timeEnd(`👥 Create ${totalUsers} users`);

	console.time(`🐨 Create Kody user`);

	await prisma.user.create({
		data: {
			email: "kody@gmail.com",
			name: "Kody",
			username: "kody",
			roles: { connect: [{ name: "user" }, { name: "admin" }] },
			password: {
				create: await createPassword("kodylovesyou"),
			},
			notes: {
				create: Array.from({
					length: faker.number.int({ min: 1, max: 5 }),
				}).map(() => ({
					title: faker.lorem.sentence(),
					content: faker.lorem.paragraphs(),
				})),
			},
		},
	});

	console.timeEnd(`🐨 Create Kody user`);

	console.timeEnd("🌱 Database has been seeded");
};

seed()
	.catch((error) => {
		console.error("🌵 Seed process failed", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
