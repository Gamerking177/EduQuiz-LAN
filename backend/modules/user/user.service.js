const User = require("./user.model");

// User ka profile ID se fetch karna
exports.getUserProfile = async (userId) => {
    // Password wese bhi select: false hai schema mein, toh safe hai
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};

// User ki details update karna
exports.updateUserProfile = async (userId, updateData) => {
    // Sirf allowed fields update karne dena chahiye (jaise sirf name)
    // Email aur Password update karne ka logic alag aur secure hona chahiye
    const allowedUpdates = {};
    if (updateData.name) allowedUpdates.name = updateData.name;

    const updatedUser = await User.findByIdAndUpdate(
        userId, 
        allowedUpdates, 
        { new: true, runValidators: true } // new: true naya data return karta hai
    );

    if (!updatedUser) {
        throw new Error("User not found");
    }
    
    return updatedUser;
};