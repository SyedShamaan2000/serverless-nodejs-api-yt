import serverless from "serverless-http";
import express from "express";
import { neon, neonConfig } from "@neondatabase/serverless";
import AWS from "aws-sdk";

AWS.config.update({ region: process.env.AWS_REGION || "ap-southeast-1" });
const ssm = new AWS.SSM();

const app = express();

const STAGE = process.env.STAGE || "prod";
// SSM parameter name for the database URL
const DATABASE_URL_SSM_PARAM = `/serverless-nodejs-api-yt/${STAGE}/database-url`;

async function dbClient() {
  // for http connections
  // non-pooling
  const param = await ssm.getParameter({ Name: DATABASE_URL_SSM_PARAM, WithDecryption: true }).promise();
  
  neonConfig.fetchConnectionCache = true;
  return neon(param.Parameter?.Value);
}


app.get("/", async (req, res, next) => {
  const db = await dbClient();
  const [result] = await db`SELECT NOW()`;
  console.log("Database query result:", result?.now);

  return res.status(200).json({
    message: "Hello from root!",
    databaseTime: result?.now,
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
