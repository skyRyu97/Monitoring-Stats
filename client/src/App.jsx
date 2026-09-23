import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://monitoring-stats.onrender.com/api/stats";
const POLL_INTERVAL_MS = 3000;
const STALE_AFTER_MS = 15000;

function getStatus(value, unit, isStale) {
  if (isStale) return "normal";
  if (value === undefined || value === null || unit !== "°C") return "normal";
  if (value >= 80) return "hot";
  if (value >= 60) return "warm";
  return "normal";
}

function StatCard({ label, value, unit, isStale }) {
  const status = getStatus(value, unit, isStale);
  return (
    <div className={`stat-card status-${status} ${isStale ? "stale" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value !== undefined && value !== null ? value : "--"}
        <span className="stat-unit">{unit}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        // Adjust this if your API returns { data: {...} } or an array
        setStats(Array.isArray(data) ? data[data.length - 1] : data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL_MS);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(clock);
    };
  }, []);

  const lastUpdate = stats?.createdAt ? new Date(stats.createdAt).getTime() : null;
  const isStale = lastUpdate ? now - lastUpdate > STALE_AFTER_MS : true;

  return (
    <div className="dashboard">
      <h1>PC Monitor</h1>
      <div className={`live-badge ${isStale ? "offline" : "online"}`}>
        {isStale ? "● Agent offline" : "● Live"}
        {lastUpdate && (
          <span className="last-update">
            {" "}— last update {Math.max(0, Math.round((now - lastUpdate) / 1000))}s ago
          </span>
        )}
      </div>

      {error && <div className="error-banner">Can't reach server: {error}</div>}

      <div className="stat-grid">
        <StatCard label="CPU Temp" value={stats?.cpu_temp} unit="°C" isStale={isStale} />
        <StatCard label="GPU Temp" value={stats?.gpu_temp} unit="°C" isStale={isStale} />
        <StatCard label="GPU Hotspot" value={stats?.gpu_hotspot} unit="°C" isStale={isStale} />
        <StatCard label="GPU Mem Temp" value={stats?.gpu_mem_temp} unit="°C" isStale={isStale} />
        <StatCard label="RAM Usage" value={stats?.ram} unit="%" isStale={isStale} />
      </div>
    </div>
  );
}
