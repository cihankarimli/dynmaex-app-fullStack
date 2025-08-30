const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

// JWT token yaratmaq üçün helper
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Test route
router.get("/", (req, res) => {
  res.json({
    message: "Auth routes işləyir",
    endpoints: {
      register: "POST /auth/register",
      login: "POST /auth/login",
    },
  });
});

// Register (Qeydiyyat) - DÜZƏLDILDI: "/" əlavə edildi
router.post(
  "/register", // Buraya diqqət: "/" əlavə edildi
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username ən azı 3 simvol olmalıdır"),
    body("email").isEmail().withMessage("Düzgün email daxil edin"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Parol ən azı 6 simvol olmalıdır"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, userSurname, email, password } = req.body;

      // İstifadəçinin mövcud olub-olmadığını yoxla
      const existingUser = await User.findOne({
        $or: [{ email }, { username }, { userSurname }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Bu email və ya username artıq mövcuddur",
        });
      }

      // Parolu hash et
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Yeni istifadəçi yarat
      const newUser = new User({
        username,
        userSurname,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      // Token yarat
      const token = generateToken(newUser._id);

      res.status(201).json({
        success: true,
        message: "Qeydiyyat uğurla tamamlandı",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server xətası baş verdi" });
    }
  }
);

// Login (Giriş) - DÜZƏLDILDI: "/" əlavə edildi
router.post(
  "/login", // Buraya diqqət: "/" əlavə edildi
  [
    body("email").isEmail().withMessage("Düzgün email daxil edin"),
    body("password").notEmpty().withMessage("Parol tələb olunur"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // İstifadəçini tap
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Email və ya parol yanlışdır" });
      }

      // Parolu yoxla
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Email və ya parol yanlışdır" });
      }

      // Token yarat
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Giriş uğurlu oldu",
        token,
        user: {
          id: user._id,
          username: user.username,
          userSurname: user.userSurname,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server xətası baş verdi" });
    }
  }
);

module.exports = router;
