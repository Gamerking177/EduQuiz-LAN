const express = require("express");
const router = express.Router();

// 🟢 NAYA: 'logout' ko bhi import kiya
const { register, login, logout } = require("./auth.controller");

// Naya Joi Validator aur Middleware import kiya
const { registerSchema, loginSchema } = require("./auth.validator");
const validate = require("../../middlewares/validate.middleware"); 

// Routes 
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// 🟢 NAYA: Logout route (Isme validation ki zaroorat nahi hai)
router.post("/logout", logout);

module.exports = router;