import { useState, useEffect } from 'react';

export function useSystemHealth() {
  const [health, setHealth] = useState({
    status: 'healthy',
    uptime: '14h 22m 08s',
    gpu: {
      name: 'NVIDIA RTX 4070 Laptop (8GB VRAM)',
      loadPct: 68,
      tempC: 58,
      vramUsedGb: 3.4,
      vramTotalGb: 8.0,
      cudaVersion: '12.4',
      tensorRtStatus: 'Active (INT8 / FP16)'
    },
    system: {
      cpuUsagePct: 42,
      ramUsedGb: 14.8,
      ramTotalGb: 32.0,
      nvmeFreeGb: 384.2,
      nvmeReadWriteMb: '412 MB/s'
    },
    database: {
      engine: 'SQLite 3 (WAL mode)',
      status: 'Connected / Locked 0ms',
      recordsCount: 142
    },
    vioDaemon: {
      status: 'Ready',
      threadId: '0x7ffd19b0',
      frequency: '200 Hz'
    },
    network: {
      offlineMode: true,
      interfaces: 'All external sockets disabled (Air-gapped safe)'
    }
  });

  // Minor fluctuations to feel live and authentic
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(prev => ({
        ...prev,
        gpu: {
          ...prev.gpu,
          loadPct: Math.min(95, Math.max(30, prev.gpu.loadPct + (Math.random() * 6 - 3))),
          tempC: Math.min(74, Math.max(52, prev.gpu.tempC + (Math.random() * 0.8 - 0.4))),
          vramUsedGb: parseFloat((3.4 + Math.random() * 0.4).toFixed(2))
        },
        system: {
          ...prev.system,
          cpuUsagePct: Math.min(85, Math.max(25, prev.system.cpuUsagePct + (Math.random() * 8 - 4)))
        }
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return health;
}
