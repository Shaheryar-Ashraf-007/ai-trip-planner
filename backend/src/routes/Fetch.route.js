import express from "express";
import { getAllTrips, getTripById } from "../controllers/Fetch.Data.js";

const router = express.Router();

// POST /api/trip/generate

router.get("/view-trip/:tripId", getTripById)
router.get("/my-trips", getAllTrips)


export default router;