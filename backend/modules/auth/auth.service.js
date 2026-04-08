const User = require("../user/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key", {
        expiresIn: "30d",
    });
};

exports.registerUser = async (userData) => {
    // 1. secretCode yahan se hata diya
    const { name, email, password } = userData;

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User with this email already exists");
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user in DB (Role apne aap default 'student' lag jayega model se)
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    // 5. Return success data with Token
    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    };
};

exports.loginUser = async (email, password) => {
    // Fetch user aur password explicitly select karna kyunki schema me select: false hai
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    };
};