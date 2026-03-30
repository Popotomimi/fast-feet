const { Client } = require("pg");

const client = new Client({
  host: "127.0.0.1",
  port: 5433,
  user: "fastfeet",
  password: "password",
  database: "fastfeet",
});

client
  .connect()
  .then(() => console.log("Connected"))
  .catch((err) => console.error("Error", err))
  .finally(() => client.end());
