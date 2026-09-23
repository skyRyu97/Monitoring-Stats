import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/stats";
const POLL_INTERVAL_MS = 3000;

function StatCard({ label, value, unit }) {
  return (
    <div className="stat-card">
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
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h1>PC Monitor</h1>

      {error && <div className="error-banner">Can't reach server: {error}</div>}

      <div className="stat-grid">
        <StatCard label="CPU Temp" value={stats?.cpu_temp} unit="°C" />
        <StatCard label="GPU Temp" value={stats?.gpu_temp} unit="°C" />
        <StatCard label="GPU Hotspot" value={stats?.gpu_hotspot} unit="°C" />
        <StatCard label="GPU Mem Temp" value={stats?.gpu_mem_temp} unit="°C" />
        <StatCard label="RAM Usage" value={stats?.ram} unit="%" />
      </div>
    </div>
  );
}
