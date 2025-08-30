const Service = require("../models/Services");

// JSON ilə xidmət əlavə et
const createService = async (req, res) => {
  try {
    const { title, description, icon } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, error: "Title və description mütləqdir" });
    }

    const service = new Service({ title, description, icon });
    await service.save();

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error("JSON xidmət əlavə xətası:", error);
    res.status(500).json({ success: false, error: "Server xətası" });
  }
};

// Şəkillə xidmət əlavə et
const createServiceWithImage = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, error: "Title və description mütləqdir" });
    }

    const service = new Service({ title, description, image });
    await service.save();

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error("Şəkilli xidmət əlavə xətası:", error);
    res.status(500).json({ success: false, error: "Server xətası" });
  }
};

module.exports = { createService, createServiceWithImage };
