const express = require("express");
const About = require("../models/About");
const router = express.Router();
//butun melumatlari getir
router.get("/", async (req, res) => {
  try {
    const abouts = await About.find();
    res.json({
      success: true,
      data: abouts,
      count: abouts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
//id-ye gore melumat getir
router.get("/:id", async (req, res) => {
  try {
    const about = await About.findById(req.params.id);
    if (!about) {
      return res.status(404).json({
        success: false,
        error: "Melumat tapilmadi",
      });
    }
    res.json({
      success: true,
      data: about,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
//yeni melumat elave et
router.post("/", async (req, res) => {
  try {
    const about = new About(req.body);
    await about.save();
    res.status(201).json({
      success: true,
      data: about,
      message: "Melumat ugurla elave olundu",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});
//melumati yenile
router.put("/:id", async (req, res) => {
  try {
    const about = await About.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!about) {
      return res.status(404).json({
        success: false,
        error: "Melumat tapilmadi",
      });
    }
    res.json({
      success: true,
      data: about,
      message: "Melumat ugurla yenilendi",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});
//melumati sil
router.delete("/:id", async (req, res) => {
  try {
    const about = await About.findByIdAndDelete(req.params.id);
    if (!about) {
      return res.status(404).json({
        success: false,
        error: "Melumat tapilmadi",
      });
    }
    res.json({
      success: true,
      data: about,
      message: "Melumat ugurla silindi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
module.exports = router;
