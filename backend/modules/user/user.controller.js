const userService = require("./user.service");

// @desc    Get logged in user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res) => {
    try {
        // req.user.id hume aage chalkar auth middleware se milega
        const user = await userService.getUserProfile(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message || "Profile not found" });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message || "Failed to update profile" });
    }
};