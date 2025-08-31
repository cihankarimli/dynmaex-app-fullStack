const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createService,
  createServiceWithImage,
} = require("../controllers/servicesController");
const Service = require("../models/Services");

// Multer storage
const upload = multer({
  fileFilter: (req, file, cb) => {
    // GIF dəstəklənir?
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"));
    }
  },
});

// GET bütün xidmətlər
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET ID-yə görə xidmət
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      return res
        .status(404)
        .json({ success: false, error: "Xidmət tapılmadı" });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// JSON ilə POST
router.post("/json", createService);

// Şəkillə POST
router.post("/upload", upload.single("image"), createServiceWithImage);

// PUT xidmət yeniləmə
router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service)
      return res
        .status(404)
        .json({ success: false, error: "Xidmət tapılmadı" });
    res.json({
      success: true,
      data: service,
      message: "Xidmət uğurla yeniləndi",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
//Sekille put
router.put("/upload/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.filename;
    }
    const service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!service)
      return res
        .status(404)
        .json({ success: false, error: "Xidmət tapılmadı" });
    res.json({
      success: true,
      data: service,
      message: "Xidmət uğurla yeniləndi",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE xidmət
router.delete("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service)
      return res
        .status(404)
        .json({ success: false, error: "Xidmət tapılmadı" });
    res.json({
      success: true,
      data: service,
      message: "Xidmət uğurla silindi",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
