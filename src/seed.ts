import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import { User } from "./entity/User";
import { Roles } from "./constants";
import bcrypt from "bcrypt";

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.findOne({
    where: { email: "admin@gmail.com" },
  });

  if (existing) {
    console.log("✅ Admin already exists");
    process.exit(0);
  }

  // hash password manually
  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = userRepo.create({
    firstName: "saud",
    lastName: "Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: Roles.ADMIN,
  });

  await userRepo.save(admin);

  console.log("✅ Admin created:", admin.email);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});