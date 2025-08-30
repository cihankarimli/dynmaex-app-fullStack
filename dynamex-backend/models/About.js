// models/Contact.js
const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt və updatedAt avtomatik yaranır
    collection: "about", // Collection adını açıq şəkildə təyin et
  }
);
module.exports = mongoose.model("About", aboutSchema);
