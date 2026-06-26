import serverless from "serverless-http";
import express from "express";
import { neon } from "@neondatabase/serverless";

const app = express();

async function dbClient() {
  return neon(process.env.DATABASE_URL);
}

app.get("/", async (req, res, next) => {
  const db = await dbClient();
  const [result] = await db`SELECT NOW()`;
  console.log("Database query result:", result?.now);

  return res.status(200).json({
    message: "Hello from root!",
    databaseUrl: process.env.DATABASE_URL || "No database URL set",
  });
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

// server-full app
// app.listen(3000, () => {
//   console.log("Server is running on port http://localhost:3000");
// });

// Use ES module export syntax instead of exports.handler
export const handler = serverless(app);
