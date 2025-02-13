import Category from "../../models/category.js";

export const getAllCategories = async (req, reply) => {
  try {
    console.log("check getAllCategories");
    const categories = await Category.find();
    return reply.send(categories);
  } catch (error) {
    return reply.status(500).send({ message: "An error occured", error });
  }
};
