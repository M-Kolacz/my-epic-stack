import { prisma } from "#app/utils/db.server";
import { cleanupDb, createPassword, createUser } from "#tests/db-utils";
import { faker } from "@faker-js/faker";

const seed = async () => {
  console.log("🌱 Seeding...");
  console.time("🌱 Database has been seeded");

  console.time("🧹 Cleanup database");
  await cleanupDb();
  console.timeEnd("🧹 Cleanup database");

  const totalUsers = 5;
  console.time(`👥 Create ${totalUsers} users`);

  for (let i = 0; i < totalUsers; i++) {
    const userData = await createUser();

    await prisma.user.create({
      data: {
        ...userData,
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
      password: {
        create: await createPassword("kody"),
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
