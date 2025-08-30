// models/Contact.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    v: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt və updatedAt avtomatik yaranır
    collection: "contacts", // Collection adını açıq şəkildə təyin et
  }
);

module.exports = mongoose.model("Contact", contactSchema);
