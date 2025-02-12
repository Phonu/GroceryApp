import "dotenv/config";
import { connectDB } from "./src/config/connect.js";
import fastify from "fastify";
import { PORT } from "./src/config/config.js";

const start = async () => {
  await connectDB(process.env.MONGO_URI);

  const app = fastify();
  app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Grocery App is running om http://localhost:${PORT}`);
    }
  });
};

start();
