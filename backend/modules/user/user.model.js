const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters long"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address"
            ]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
            select: false 
        },
        role: {
            type: String,
            enum: ["student", "host", "admin"],
            default: "student"
        },
        totalScore: {
            type: Number,
            default: 0
        },
        // 🟢 NAYA: Dashboard ke liye "My Quizzes" aur "Played Quizzes" ka record
        createdQuizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Game" 
            }
        ],
        playedQuizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Game" 
            }
        ]
    },
    { 
        timestamps: true 
    }
);

module.exports = mongoose.model("User", userSchema);