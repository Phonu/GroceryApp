import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
  name: { type: String },
  location: {
    latitute: { type: Number },
    longitude: { type: Number },
  },
  address: { type: String, default: false },
  deliveryPartners: [
    { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner" },
  ],
});

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
