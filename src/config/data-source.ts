import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import { Config } from ".";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  synchronize: true,
  logging: false,

  entities: [path.join(__dirname, "../entity/*.{ts,js}")],
  migrations: [path.join(__dirname, "../migration/*.{ts,js}")],

  subscribers: [],
});
