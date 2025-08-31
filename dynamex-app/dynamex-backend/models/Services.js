const mongoose = require("mongoose");
const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "services",
  }
);

module.exports = mongoose.model("Service", serviceSchema);
