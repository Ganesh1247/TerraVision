export const MOCK_JOBS = [
  {
    id: 'TV-2026-089',
    datasetName: 'Flight 04: Industrial Substation Grid',
    timestamp: '2026-09-05 18:24:10',
    status: 'completed',
    runtime: '04m 18s',
    videoSize: '342.8 MB',
    frames: 4950,
    pointCount: '1,420,000 pts',
    meshFaces: '280,000 faces',
    scaleUncertainty: '± 0.012 m (1.2 cm)',
    confidenceAvg: 87,
    hasImu: true,
    degradedFlags: ['Loop-Closure Triggered'],
    thumbnailType: 'substation',
    exportSizes: {
      obj: '48.2 MB',
      las: '112.5 MB',
      geotiff: '184.0 MB',
      pdf: '2.4 MB'
    }
  },
  {
    id: 'TV-2026-088',
    datasetName: 'Flight 19: GPS-Denied Urban Canyon',
    timestamp: '2026-09-05 14:10:02',
    status: 'completed',
    runtime: '06m 02s',
    videoSize: '512.4 MB',
    frames: 5760,
    pointCount: '2,150,000 pts',
    meshFaces: '410,000 faces',
    scaleUncertainty: '± 0.028 m (2.8 cm)',
    confidenceAvg: 81,
    hasImu: true,
    degradedFlags: ['DCP Dehaze Active', 'Adaptive IMU Boost'],
    thumbnailType: 'urban',
    exportSizes: {
      obj: '64.8 MB',
      las: '168.0 MB',
      geotiff: '240.2 MB',
      pdf: '3.1 MB'
    }
  },
  {
    id: 'TV-2026-087',
    datasetName: 'Flight 12: Open-Pit Mountain Quarry',
    timestamp: '2026-09-05 10:45:33',
    status: 'completed',
    runtime: '03m 52s',
    videoSize: '418.0 MB',
    frames: 4200,
    pointCount: '1,890,000 pts',
    meshFaces: '340,000 faces',
    scaleUncertainty: '± 0.038 m (3.8 cm)',
    confidenceAvg: 89,
    hasImu: false,
    degradedFlags: ['Visual-Only Fallback (No IMU)'],
    thumbnailType: 'quarry',
    exportSizes: {
      obj: '58.0 MB',
      las: '144.1 MB',
      geotiff: '210.5 MB',
      pdf: '2.8 MB'
    }
  },
  {
    id: 'TV-2026-086',
    datasetName: 'Flight 08: Low-Light Manufacturing Facility',
    timestamp: '2026-09-04 22:15:18',
    status: 'completed',
    runtime: '05m 14s',
    videoSize: '284.1 MB',
    frames: 3540,
    pointCount: '980,000 pts',
    meshFaces: '195,000 faces',
    scaleUncertainty: '± 0.045 m (4.5 cm)',
    confidenceAvg: 75,
    hasImu: true,
    degradedFlags: ['Zero-DCE Low-Light Active', 'Wiener Deblur Active'],
    thumbnailType: 'factory',
    exportSizes: {
      obj: '34.2 MB',
      las: '78.5 MB',
      geotiff: '120.0 MB',
      pdf: '2.1 MB'
    }
  },
  {
    id: 'TV-2026-085',
    datasetName: 'Field Test 03: Foggy Coastal Radar Station',
    timestamp: '2026-09-04 16:30:40',
    status: 'warning',
    runtime: '04m 40s',
    videoSize: '390.0 MB',
    frames: 4600,
    pointCount: '1,120,000 pts',
    meshFaces: '210,000 faces',
    scaleUncertainty: '± 0.062 m (6.2 cm)',
    confidenceAvg: 68,
    hasImu: true,
    degradedFlags: ['MiDaS Mono-Depth Fallback', 'High Fog Density'],
    thumbnailType: 'substation',
    exportSizes: {
      obj: '38.0 MB',
      las: '90.2 MB',
      geotiff: '142.0 MB',
      pdf: '2.0 MB'
    }
  }
];
