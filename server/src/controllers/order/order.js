import {
  Branch,
  DeliveryPartner,
  Order,
  Customer,
} from "../../models/index.js";

/**
 * user  => CREATE ORDER => GET ORDERS => GET ORDER BY ID
 *
 * delivery Partner => GET ORDERS => CONFIRM ORDER => UPDATE ORDER
 *
 * CREATE ORDER => branch => delivery Partner
 *
 */

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    const customerData = await Customer.findById(userId);
    const branchData = await Branch.findById(branch);
    console.log("branch data", branchData);

    if (!customerData) {
      return reply.status(404).send({ message: "Customer not found" });
    }

    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.couint,
      })),
      branch: branch, // can use short-hand branch
      totalPrice,
      // TBD :: Need to review the deliveryLocation DATA.
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude || 0,
        longitude: customerData.liveLocation.longitude || 0,
        address: customerData.address || "No address available",
      },
      pickupLocation: {
        latitude: branchData.location || 0,
        longitude: branchData.location || 0,
        address: branchData.address || "No address available",
      },
      createdAt: Date.now(), // Need to check, how to update.
      updatedAt: Date.now(), // Need to check, how to update.
    });

    const savedOrder = await newOrder.save();
    return reply.status(201).send(savedOrder); // 201 - new data created
  } catch (error) {
    console.log("checking order", req.user, req.body.branch, error);
    return reply.status(500).send({ message: "Failed to create order", error });
  }
};

export const confirmOrder = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;

    const deliveryPerson = await DeliveryPartner.findById(userId);

    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery Person not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) return reply.status(404).send({ message: "Order not found" });

    if (order.status !== "available") {
      return reply.status(400).send({ message: "Order is not available" });
    }
    order.status = "confirmed";

    order.deliveryPartner = userId;
    order.deliveryPersonLocation = {
      latitude: deliveryPersonLocation?.latitude,
      longitude: deliveryPersonLocation?.longitude,
      address: deliveryPersonLocation?.address || "",
    };

    req.server.io.to(orderId).emit("orderConfirmed", order);
    await order.save();
    reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: " Failed to comfirm order" });
  }
};

export const updateOrderStatus = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;

    const { userId } = req.user;

    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply.status(404).send({ message: " Delivery Person not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) return reply.status(400).send({ message: "Order not found" });

    if (["cancelled", "delivered"].includes(order.status)) {
      return reply.status(400).send({ message: "Order cannot be updated" });
    }

    if (order.deliveryPartner.toString() !== userId) {
      return reply.status(403).send({ message: "Unauthorized Order" });
    }

    order.status = status;
    order.deliveryPersonLocation = deliveryPersonLocation;
    await order.save();

    // need to send to frontend in live
    req.server.io.to(orderId).emit("liveTrackingUpdates", order);

    return reply.send(order);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: " Failed to update order status" });
  }
};

export const getOrders = async (req, reply) => {
  try {
    const { status, customerId, deliveryPartnerId, branchId } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    if (customerId) {
      query.customerId = customerId;
    }
    // if passed deliveryPartnerId, then branchId is must.
    if (deliveryPartnerId) {
      query.deliveryPartner = deliveryPartnerId;
      query.branch = branchId;
    }

    const orders = await Order.find(query).populate(
      "customer branch items.item deliveryPartner"
    );
    return reply.send(orders);
  } catch (error) {
    return reply.status(500).send({ message: "Failed to retrive orders" });
  }
};

export const getOrderById = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate(
      "customer branch items.item deliveryParner"
    );
    if (!order) return reply.status(404).send({ message: "Order not Found" });
    return reply.send(order);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to retrive orders", error });
  }
};
