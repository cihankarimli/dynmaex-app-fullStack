const About = require("../models/About");

// Bütün about datanı gətir
const getAbout = async (req, res) => {
  try {
    const data = await About.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Yeni about əlavə et
const createAbout = async (req, res) => {
  try {
    const about = new About({
      title: req.body.title,
    });

    const newAbout = await about.save();
    res.status(201).json(newAbout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAbout,
  createAbout,
};
