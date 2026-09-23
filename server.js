require("dotenv").config({
  path: "./monitor-server/atlas-credentials.env",
});
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB error:", err.message));

const statSchema = new mongoose.Schema({
  machine: String,
  cpu_temp: Number,
  gpu_temp: Number,
  gpu_hotspot: Number,
  gpu_mem_temp: Number,
  ram: Number,
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

const Stat = mongoose.model("Stat", statSchema);

app.post("/api/stats", async (req, res) => {
  try {
    await Stat.create(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats", async (req, res) => {
  const stats = await Stat.find().sort({ createdAt: -1 }).limit(50);
  res.json(stats.reverse());
});

app.listen(5000, () => console.log("Server running on port 5000"));