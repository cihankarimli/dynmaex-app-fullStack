const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.get("/", (req, res) => {
  res.json({
    message: "Auth routes işləyir",
    endpoints: {
      register: "POST /auth/register",
      login: "POST /auth/login",
      test: "GET /auth/test",
    },
  });
});

router.get("/test", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      success: true,
      message: "Database əlaqəsi uğurludur",
      totalUsers: userCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database əlaqəsi problemlidir",
      error: error.message,
    });
  }
});

router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username ən azı 3 simvol olmalıdır")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username yalnız hərf, rəqəm və _ simvolu ola bilər"),
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Düzgün email daxil edin"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Parol ən azı 6 simvol olmalıdır"),
    body("userSurname")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Soyad ən azı 1 simvol olmalıdır"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { username, userSurname, email, password } = req.body;

      console.log("Register attempt:", {
        username,
        email,
        userSurname: userSurname || "not provided",
      });

      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Bu email artıq qeydiyyatdan keçib",
          field: "email",
        });
      }

      const existingUsername = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
      });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Bu username artıq istifadə olunur",
          field: "username",
        });
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        username: username.trim(),
        userSurname: userSurname ? userSurname.trim() : undefined,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      });

      await newUser.save();
      console.log("New user created:", newUser._id);

      const token = generateToken(newUser._id);

      res.status(201).json({
        success: true,
        message: "Qeydiyyat uğurla tamamlandı",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          userSurname: newUser.userSurname || "",
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error("Register error:", error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `Bu ${field} artıq mövcuddur`,
          field: field,
        });
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation xətası",
          errors: messages,
        });
      }

      res.status(500).json({
        success: false,
        message: "Server xətası baş verdi",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Düzgün email daxil edin"),
    body("password").notEmpty().withMessage("Parol tələb olunur"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      console.log("Login attempt for:", email);

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({
          success: false,
          message: "Email və ya parol yanlışdır",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Invalid password for:", email);
        return res.status(401).json({
          success: false,
          message: "Email və ya parol yanlışdır",
        });
      }

      const token = generateToken(user._id);
      console.log("Login successful for:", user._id);

      res.json({
        success: true,
        message: "Giriş uğurlu oldu",
        token,
        user: {
          id: user._id,
          username: user.username,
          userSurname: user.userSurname || "",
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server xətası baş verdi",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Çıxış uğurlu oldu",
  });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tapılmadı",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi tapılmadı",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        userSurname: user.userSurname || "",
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Etibarsız token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token müddəti bitib",
      });
    }

    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
});

module.exports = router;
