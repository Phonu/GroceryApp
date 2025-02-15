import "dotenv/config";
import fastifySession from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { Admin } from "../models/index.js";

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;

const MongoDBStore = ConnectMongoDBSession(fastifySession);

// store mongo session data
export const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

sessionStore.on("error", (error) => {
  console.log("Session store error", error);
});

export const authenticate = async (email, password) => {
  // we can have manual email and password to login AdminJS
  // if ((email === "kunal") & (password === "11111")) {
  //   return Promise.resolve({ email: email, password: password });
  // } else {
  //   return null;
  // }

  // k@k.com 11
  if (email && password) {
    const user = await Admin.findOne({ email });
    if (!user) {
      return null;
    }
    if (user.password === password) {
      return Promise.resolve({ email: email, password: password });
    } else {
      return null;
    }
  }

  return null;
};
