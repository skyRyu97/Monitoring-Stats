import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://monitoring-stats.onrender.com/api/stats";
const POLL_INTERVAL_MS = 3000;
const STALE_AFTER_MS = 15000;
const HOT_THRESHOLD = 80;

const TILES = [
  { key: "cpu_temp", label: "CPU", unit: "°C", icon: "🖥️", color: "cyan", max: 100 },
  { key: "gpu_temp", label: "GPU", unit: "°C", icon: "🎮", color: "emerald", max: 100 },
  { key: "gpu_hotspot", label: "HOTSPOT", unit: "°C", icon: "🔥", color: "amber", max: 100 },
  { key: "gpu_mem_temp", label: "VRAM", unit: "°C", icon: "💾", color: "purple", max: 100 },
  { key: "ram", label: "RAM", unit: "%", icon: "📊", color: "indigo", max: 100 },
];

function Tile({ label, icon, color, unit, value, max, isStale }) {
  const num = value !== undefined && value !== null ? value : 0;
  const pct = Math.min(100, Math.max(0, (num / max) * 100));
  const isHot = unit === "°C" && num > HOT_THRESHOLD && !isStale;

  return (
    <div className={`tile ${isHot ? "hot" : ""} ${isStale ? "stale" : ""}`}>
      <div className="tile-top">
        <span className="tile-label">
          <span className="tile-icon">{icon}</span>
          {label}
        </span>
      </div>
      <div className="tile-value">
        {value !== undefined && value !== null ? value : "--"}
        <span className="tile-unit">{unit}</span>
      </div>
      <div className="tile-bar-track">
        <div
          className={`tile-bar-fill ${isHot ? "hot" : `c-${color}`}`}
          style={{ width: `${pct}%` }}
        />
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
    <div className="telemetry-container">
      <div className="tile status-tile">
        <span className="status-pill">
          <span className={`ping ${isStale ? "off" : "on"}`} />
          <span className={`dot ${isStale ? "off" : "on"}`} />
          <span className="status-text">SYS STAT</span>
        </span>
        <span className="status-ms">{POLL_INTERVAL_MS}ms</span>
      </div>

      {error && <div className="error-banner">Can't reach server</div>}

      {TILES.map((t) => (
        <Tile
          key={t.key}
          label={t.label}
          icon={t.icon}
          color={t.color}
          unit={t.unit}
          max={t.max}
          value={stats?.[t.key]}
          isStale={isStale}
        />
      ))}
    </div>
  );
}
