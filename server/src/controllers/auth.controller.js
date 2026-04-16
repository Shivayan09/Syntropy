import User from "../models/user.model.js"
import validator from 'validator'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body
    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        })
    }
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        })
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email!"
        })
    }
    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Password is required"
        })
    }
    if (!validator.isMobilePhone(phoneNumber, "any")) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid phone number!"
        })
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists!"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, phoneNumber, email, password: hashedPassword });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

const savedUser = await User.findById(user._id);

return res.status(200).json({
    success: true,
    user: savedUser
});
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Enter your username!"
        })
    }
    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Enter your password!"
        })
    }
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            })
        }
        const matched = await bcrypt.compare(password, user.password)
        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Incorrect credentials"
            })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            message: "Logged In successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(0),
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};