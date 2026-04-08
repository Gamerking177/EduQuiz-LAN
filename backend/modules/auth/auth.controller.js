const authService = require("./auth.service");

exports.register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message || "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ message: error.message || "Invalid credentials" });
    }
};

// 🟢 NAYA: Logout Controller
exports.logout = async (req, res) => {
    try {
        // JWT stateless hai, isliye backend se kuch delete nahi karna.
        // Frontend apna token khud delete karega. 
        // Ye API sirf ek clean response dene ke liye hai.
        res.status(200).json({ 
            success: true,
            message: "Logged out successfully" 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during logout" });
    }
};