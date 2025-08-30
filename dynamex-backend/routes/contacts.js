// routes/contacts.js
const express = require("express");
const Contact = require("../models/Contact");
const router = express.Router();

// Bütün kontaktları al
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find({ isActive: true });
    res.json({
      success: true,
      data: contacts,
      count: contacts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ID-yə görə kontakt al
router.get("/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Kontakt tapılmadı",
      });
    }
    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Yeni kontakt əlavə et
router.post("/", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({
      success: true,
      data: contact,
      message: "Kontakt uğurla yaradıldı",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Kontakt yenilə
router.put("/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Kontakt tapılmadı",
      });
    }
    res.json({
      success: true,
      data: contact,
      message: "Kontakt uğurla yeniləndi",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Kontakt sil (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Kontakt tapılmadı",
      });
    }
    res.json({
      success: true,
      message: "Kontakt uğurla silindi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Şəhərə görə axtarış
router.get("/city/:city", async (req, res) => {
  try {
    const contacts = await Contact.find({
      city: new RegExp(req.params.city, "i"),
      isActive: true,
    });
    res.json({
      success: true,
      data: contacts,
      count: contacts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
