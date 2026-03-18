import express from "express";
import { deleteTrip, getAllTrips, getTripById, updateTrip } from "../controllers/Fetch.Data.js";

const router = express.Router();

// POST /api/trip/generate

router.get("/view-trip/:tripId", getTripById)
router.get("/my-trips", getAllTrips)
router.delete("/delete-trip/:tripId", deleteTrip);
router.put("/update-trips/:tripId", updateTrip);



export default router;