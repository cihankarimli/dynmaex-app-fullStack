// app.js və ya server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB-yə bağlantı uğurlu!");
  })
  .catch((error) => {
    console.error("MongoDB bağlantı xətası:", error);
    process.exit(1);
  });

// Routes
const contactRoutes = require("./routes/contacts");
const aboutRoutes = require("./routes/about");
const servicesRoutes = require("./routes/services");
const authRoutes = require("./routes/user");

app.use("/contacts", contactRoutes);
app.use("/about", aboutRoutes);
app.use("/services", servicesRoutes);
app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "DynamEx API işləyir!",
    version: "1.0.0",
    endpoints: {
      contacts: "/contacts",
      about: "/about",
      services: "/services",
      auth: "/auth",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint tapılmadı",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server xətası:", error);
  res.status(500).json({
    success: false,
    error: "Server xətası",
  });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda işləyir`);
  console.log(`API URL: http://localhost:${PORT}`);
});

module.exports = app;
