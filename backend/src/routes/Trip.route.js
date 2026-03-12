import express from "express";
import { generateTrip } from "../controllers/AI.Model.js";

const router = express.Router();

// POST /api/trip/generate
router.post("/generate",generateTrip );

export default router;