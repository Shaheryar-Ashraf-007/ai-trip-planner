import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tripRoutes from "./routes/Trip.route.js"
import fetchRoutes from "./routes/Fetch.route.js"
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173"}, {Credential: true}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/trip", tripRoutes);

app.use("/api/trip", fetchRoutes)

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));