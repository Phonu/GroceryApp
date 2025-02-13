import {
  createOrder,
  confirmOrder,
  updateOrderStatus,
  getOrders,
  getOrderById,
} from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

export const orderRoutes = async (fastify, options) => {
  // fastify.get("/user", { preHandler: [verifyToken] }, fetchUser);
  // here with the help of hook, we are calling the perHandler
  // preHandler verification required for all the below order apis.
  fastify.addHook("preHandler", async (request, reply) => {
    const isAuthenticated = await verifyToken(request, reply);
    if (!isAuthenticated) {
      return reply.code(401).send({ message: "Unauthorized" });
    }
  });

  // order/:orderId/status
  // :orderId => passing this as params in url
  fastify.post("/order", createOrder);
  fastify.get("/order", getOrders);
  fastify.patch("/order/:orderId/status", updateOrderStatus);
  fastify.post("/order/:orderId/confirm", confirmOrder);
  fastify.post("/order/:orderId", getOrderById);
};
