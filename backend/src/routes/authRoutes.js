import express from "express";
import { googleAuth, login, signup } from "../controllers/Auth.Controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-auth", googleAuth);  // ← add this


export default router;