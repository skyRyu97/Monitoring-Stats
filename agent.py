import clr, time, psutil, os, sys, requests

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
clr.AddReference(r"C:\Users\gsd10\Desktop\Monitoring Stats\LibreHardwareMonitor\LibreHardwareMonitorLib.dll")

from LibreHardwareMonitor.Hardware import Computer, SensorType

pc = Computer()
pc.IsCpuEnabled = True
pc.IsGpuEnabled = True
pc.Open()

def get_temps():
    temps = {}
    for hw in pc.Hardware:
        hw.Update()
        for s in hw.Sensors:
            if s.SensorType == SensorType.Temperature and s.Value is not None:
                temps[f"{hw.Name} | {s.Name}".lower()] = round(s.Value, 1)
    return temps

def find(temps, must_have, must_not_have=()):
    for name, value in temps.items():
        if all(w in name for w in must_have) and not any(w in name for w in must_not_have):
            return value
    return None

while True:
    temps = get_temps()

    print("=== ALL TEMPS ===")
    for name, value in temps.items():
        print(repr(name), "=", value)
    print("=================")

    payload = {
        "machine": "my-pc",
        "cpu_temp": find(temps, ["tctl"]) or find(temps, ["tdie"]),
        "gpu_temp": find(temps, ["gpu core"]),
        "gpu_hotspot": find(temps, ["hot"]),
        "gpu_mem_temp": find(temps, ["memory"], ["vr"]),
        "ram": psutil.virtual_memory().percent,
    }

    try:
        requests.post("https://monitoring-stats.onrender.com/api/stats", json=payload, timeout=3)
        print("Sent:", payload)
    except requests.exceptions.RequestException:
        print("Server not reachable")

    time.sleep(5)