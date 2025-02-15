import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import { dark, light, noSidebar } from "@adminjs/themes";

import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js";
import { authenticate, COOKIE_PASSWORD } from "./config.js";

import { sessionStore } from "./config.js";

AdminJS.registerAdapter(AdminJSMongoose);

// https://docs.adminjs.co/
export const admin = new AdminJS({
  resources: [
    {
      resource: Models.Customer,
      options: {
        listProperties: ["phone", "role", "isActivated"],
        filterProperties: ["phone", "role"],
      },
    },
    {
      resource: Models.DeliveryPartner,
      options: {
        listProperties: ["email", "role", "isActivated"],
        filterProperties: ["email", "role"],
      },
    },
    {
      resource: Models.Admin,
      options: {
        listProperties: ["email", "role", "isActivated"],
        filterProperties: ["email", "role"],
      },
    },
    {
      resource: Models.Branch,
    },
    {
      resource: Models.Product,
    },
    {
      resource: Models.Category,
    },

    {
      resource: Models.Counter,
    },
    {
      resource: Models.Order,
    },
  ],
  branding: {
    companyName: "Grocery Delivery App",
    withMadeWithLove: false,
  },
  defaultTheme: light.id,
  availableThemes: [dark, light, noSidebar],
  rootPath: "/admin",
});

// it will build fastify App
export const buildAdminRouter = async (app) => {
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: COOKIE_PASSWORD,
      cookieName: "adminjs",
    },
    app,
    {
      store: sessionStore,
      saveUninitialized: true,
      secret: COOKIE_PASSWORD,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
};
