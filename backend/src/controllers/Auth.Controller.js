import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET ="2a9f4e6c8d1b7a5f3c9e2d6b8f4a1c7e9d5b3a6f8c2e4d7b1a9f3c6e8d2b5a1"; // move to .env later

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if user exists
    const userRef = db.collection("users");
    const snapshot = await userRef.where("email", "==", email).get();

    if (!snapshot.empty) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save User
    const newUser = await userRef.add({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Generate Token
    const token = jwt.sign(
      { id: newUser.id, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        name,
        email,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};



// LOGIN
// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Guard: ensure credentials were sent ──────────────────────────────
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const userRef = db.collection("users");
    const snapshot = await userRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    let user;
    snapshot.forEach(doc => {
      user = { id: doc.id, ...doc.data() };
    });

    // ── Guard: account exists but was created via Google (no password) ───
    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google sign-in. Please continue with Google.",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// In Auth.Controller.js — add this new function
export const googleAuth = async (req, res) => {
  try {
    const { name, email, picture } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const userRef = db.collection("users");
    const snapshot = await userRef.where("email", "==", email).get();

    let userId;

    if (snapshot.empty) {
      // First time Google login — create user without password
      const newUser = await userRef.add({
        name,
        email,
        picture,
        provider: "google",
        createdAt: new Date(),
      });
      userId = newUser.id;
    } else {
      snapshot.forEach(doc => { userId = doc.id; });
    }

    // Sign a proper JWT — same as manual login
    const token = jwt.sign(
      { id: userId, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: { id: userId, name, email, picture, provider: "google" },
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: error.message });
  }
};