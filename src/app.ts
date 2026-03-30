import express from "express";
import routes from "./routes";
import { AppDataSource } from "./config/database";

const app = express();
app.use(express.json());
app.use(routes);

AppDataSource.initialize()
  .then(() => console.log("Banco conectado"))
  .catch((err) => console.error(err));

export default app;
