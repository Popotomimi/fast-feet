import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Delivery } from "../models/Delivery";
import { Recipient } from "../models/Recipient";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,
  username: "fastfeet",
  password: "password",
  database: "fastfeet",
  entities: [User, Delivery, Recipient],
  synchronize: true, // apenas para dev
});
