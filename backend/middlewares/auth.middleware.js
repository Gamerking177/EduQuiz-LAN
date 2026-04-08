const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");

exports.protect = async (req, res, next) => {
    let token;

    // 1. Check karo ki request ke headers mein 'Authorization' hai aur wo 'Bearer' se shuru hota hai
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // 2. Token ko extract karo ("Bearer token_string" mein se sirf token_string nikalo)
            token = req.headers.authorization.split(" ")[1];

            // 3. Token ko verify karo apni secret key se
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");

            // 4. Token ke andar jo user ID hai, usse database se user nikalo (password chhor kar)
            // Aur usko req.user mein daal do taaki aage controllers isko use kar sakein
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user no longer exists" });
            }

            // 5. Sab theek hai, ab request ko aage Controller ke paas bhej do
            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed or expired" });
        }
    }

    // Agar token bheja hi nahi gaya
    if (!token) {
        res.status(401).json({ message: "Not authorized, no token provided" });
    }
};

// Ek extra middleware sirf Host (Teacher) ke routes protect karne ke liye
exports.hostOnly = (req, res, next) => {
    if (req.user && req.user.role === "host") {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Only hosts can perform this action." });
    }
};