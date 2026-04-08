// schemas/validations.js
import { z } from 'zod';

// Validation schema for Signup
export const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Access Key must be at least 6 characters long" })
});

// Validation schema for Login (without name)
export const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Access Key must be at least 6 characters long" })
});