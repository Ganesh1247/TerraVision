export const MOCK_HOTSPOTS = {
  villa: [
    {
      id: 'hs-villa-height',
      title: 'Villa Main Structure — Total Eaves Height',
      position: [0.0, 2.4, 0.0],
      category: 'Building Elevation',
      measurement: {
        type: 'Total Building Height',
        value: 8.24,
        unit: 'm',
        uncertainty: 0.08,
        secondaryMetric: {
          label: 'Roof Area',
          value: '214.5 m²',
          uncertainty: '± 1.2 m²'
        }
      },
      confidence: {
        geometry: 98,
        depth: 95,
        scale: 96,
        semantic: 97,
        measurement: 96
      },
      qualityAssessment: 'Certified High-Precision Grade',
      statusColor: 'emerald',
      explanation: 'Complete 360-degree aerial parallax scan. Wall verticality RANSAC error < 0.18cm over 2,400 keyframe matches.',
      recommendedAction: 'Validated for architectural height clearance & elevation compliance.'
    },
    {
      id: 'hs-villa-facade',
      title: 'Main Facade — Frontage Width Span',
      position: [1.8, 1.2, 1.8],
      category: 'Architectural Dimension',
      measurement: {
        type: 'Frontage Span',
        value: 16.50,
        unit: 'm',
        uncertainty: 0.12,
        secondaryMetric: {
          label: 'Building Volume',
          value: '1685.0 m³',
          uncertainty: '± 14.5 m³'
        }
      },
      confidence: {
        geometry: 96,
        depth: 94,
        scale: 95,
        semantic: 96,
        measurement: 95
      },
      qualityAssessment: 'Optimal Precision',
      statusColor: 'emerald',
      explanation: 'Clear planar corners with zero occlusion. Scale validated against ground plane and entrance pillars.',
      recommendedAction: 'Ready for CAD floorplan extraction & site surveying.'
    },
    {
      id: 'hs-villa-canopy',
      title: 'Entrance Canopy — Porch Pillar Height',
      position: [1.2, 0.6, 2.2],
      category: 'Support Pillar Clearance',
      measurement: {
        type: 'Pillar Height',
        value: 3.20,
        unit: 'm',
        uncertainty: 0.04,
        secondaryMetric: {
          label: 'Canopy Slab Width',
          value: '4.10 m',
          uncertainty: '± 0.05 m'
        }
      },
      confidence: {
        geometry: 97,
        depth: 96,
        scale: 94,
        semantic: 98,
        measurement: 96
      },
      qualityAssessment: 'High Confidence (Structural Pillar)',
      statusColor: 'emerald',
      explanation: 'Distinct reddish-brown pillar geometry mapped with 1.4mm surface resolution.',
      recommendedAction: 'Confirmed structural pillar dimensions.'
    },
    {
      id: 'hs-villa-balcony',
      title: 'Upper Floor — Cantilever Balcony Overhang',
      position: [-2.1, 1.6, 0.4],
      category: 'Cantilever Overhang',
      measurement: {
        type: 'Overhang Projection',
        value: 1.45,
        unit: 'm',
        uncertainty: 0.03,
        secondaryMetric: {
          label: 'Balcony Width',
          value: '2.80 m',
          uncertainty: '± 0.04 m'
        }
      },
      confidence: {
        geometry: 95,
        depth: 92,
        scale: 94,
        semantic: 95,
        measurement: 94
      },
      qualityAssessment: 'High Precision Overhang',
      statusColor: 'emerald',
      explanation: 'Cantilever balcony projection verified against main wall reference plane.',
      recommendedAction: 'Suitable for structural load audit.'
    }
  ],
  substation: [
    {
      id: 'hs-trans-a',
      title: 'Building A — High Voltage Transformer Bank',
      position: [-1.8, 1.2, 0.4],
      category: 'Critical Infrastructure',
      measurement: {
        type: 'Estimated Height',
        value: 18.4,
        unit: 'm',
        uncertainty: 0.35, // ± 0.35 m
        secondaryMetric: {
          label: 'Footprint Area',
          value: '486.2 m²',
          uncertainty: '± 4.8 m²'
        }
      },
      confidence: {
        geometry: 94,
        depth: 89,
        scale: 83,
        semantic: 92,
        measurement: 81
      },
      qualityAssessment: 'High Confidence (Verified Metric)',
      statusColor: 'emerald',
      explanation: 'High feature density (420 keypoints/m²); 18 overlapping camera viewing angles with wide parallax baseline. Scale validated against ground plane and calibrated IMU metric acceleration.',
      recommendedAction: 'Ready for engineering clearance inspection and CAD asset generation.'
    },
    {
      id: 'hs-mast-b',
      title: 'Tower B — Steel Gantry Communication Mast',
      position: [2.1, 2.8, -1.2],
      category: 'Structural Asset',
      measurement: {
        type: 'Total Mast Height',
        value: 34.6,
        unit: 'm',
        uncertainty: 0.85, // ± 0.85 m
        secondaryMetric: {
          label: 'Guy Wire Clearance',
          value: '12.8 m',
          uncertainty: '± 0.4 m'
        }
      },
      confidence: {
        geometry: 88,
        depth: 82,
        scale: 84,
        semantic: 89,
        measurement: 78
      },
      qualityAssessment: 'Medium-High Confidence',
      statusColor: 'emerald',
      explanation: 'Thin lattice structure exhibits mild background occlusions, but triangulation converged with 0.52px reprojection error over 14 camera poses.',
      recommendedAction: 'Suitable for structural clearance audits; verify guy wire anchor points.'
    },
    {
      id: 'hs-switch-c',
      title: 'Zone C — Circuit Breaker & Busbar Yard',
      position: [0.5, 0.6, 2.2],
      category: 'Switchgear Complex',
      measurement: {
        type: 'Phase Clearance Gap',
        value: 4.82,
        unit: 'm',
        uncertainty: 0.12, // ± 0.12 m
        secondaryMetric: {
          label: 'Insulator Span',
          value: '2.14 m',
          uncertainty: '± 0.05 m'
        }
      },
      confidence: {
        geometry: 96,
        depth: 93,
        scale: 88,
        semantic: 95,
        measurement: 89
      },
      qualityAssessment: 'Optimal Precision (Grade 1)',
      statusColor: 'emerald',
      explanation: 'Dense multi-angle nadir and oblique captures. Ground plane RANSAC fit achieved 99.4% inlier confidence.',
      recommendedAction: 'Direct export to GIS digital twin and spatial maintenance database.'
    },
    {
      id: 'hs-water-d',
      title: 'Basin D — Retention Basin Water Surface',
      position: [-2.6, 0.2, -2.4],
      category: 'Reflective Hydrological Surface',
      measurement: {
        type: 'Basin Surface Level',
        value: 1.25,
        unit: 'm',
        uncertainty: 0.95, // ± 0.95 m (Large uncertainty!)
        secondaryMetric: {
          label: 'Water Surface Area',
          value: '312.0 m²',
          uncertainty: '± 38.0 m²'
        }
      },
      confidence: {
        geometry: 48,
        depth: 42,
        scale: 75,
        semantic: 82,
        measurement: 45
      },
      qualityAssessment: 'Degraded / Low Confidence (Reflective Specularity)',
      statusColor: 'amber',
      explanation: 'Specular water reflections caused sparse feature matching (< 12 pts/m²). Fallback monocular depth prior applied with adaptive IMU weighting.',
      recommendedAction: 'Flagged for human operator review: Treat water depth measurement with caution.'
    }
  ],
  urban: [
    {
      id: 'hs-highrise-a',
      title: 'Sector 1 — Commercial High-Rise Façade',
      position: [-1.4, 2.2, 0.8],
      category: 'Urban Structure',
      measurement: {
        type: 'Building Eaves Height',
        value: 62.4,
        unit: 'm',
        uncertainty: 1.40,
        secondaryMetric: {
          label: 'Façade Width',
          value: '28.5 m',
          uncertainty: '± 0.6 m'
        }
      },
      confidence: {
        geometry: 86,
        depth: 81,
        scale: 79,
        semantic: 94,
        measurement: 76
      },
      qualityAssessment: 'Moderate Confidence (GPS-Denied VIO)',
      statusColor: 'emerald',
      explanation: 'VIO trajectory maintained 0.08m/100m drift rate. Loop closure executed at frame 4,120 successfully re-anchored position against building corner landmarks.',
      recommendedAction: 'Reliable for architectural volume estimation.'
    },
    {
      id: 'hs-glass-b',
      title: 'Sector 4 — Tinted Glass Curtain Wall',
      position: [1.8, 1.6, -1.0],
      category: 'Specular Material',
      measurement: {
        type: 'Curtain Wall Width',
        value: 19.2,
        unit: 'm',
        uncertainty: 1.80,
        secondaryMetric: {
          label: 'Floor Span',
          value: '4.2 m',
          uncertainty: '± 0.7 m'
        }
      },
      confidence: {
        geometry: 54,
        depth: 49,
        scale: 72,
        semantic: 80,
        measurement: 51
      },
      qualityAssessment: 'Low Confidence (Mirror Reflections)',
      statusColor: 'amber',
      explanation: 'Glass curtain reflection caused phantom 3D depth artifacts; MiDaS monocular depth prior auto-activated to constrain geometry.',
      recommendedAction: 'Flagged: Use structural mullions as reference rather than glass center.'
    }
  ],
  quarry: [
    {
      id: 'hs-bench-a',
      title: 'Quarry Pit — Excavation Bench 03',
      position: [0.2, -0.4, 0.0],
      category: 'Topographic Excavation',
      measurement: {
        type: 'Cut & Fill Volume',
        value: 14820,
        unit: 'm³',
        uncertainty: 280, // ± 280 m³
        secondaryMetric: {
          label: 'Slope Angle',
          value: '41.8°',
          uncertainty: '± 0.6°'
        }
      },
      confidence: {
        geometry: 97,
        depth: 95,
        scale: 91,
        semantic: 89,
        measurement: 93
      },
      qualityAssessment: 'High Confidence (Visual Ground Reference)',
      statusColor: 'emerald',
      explanation: 'High rock texture roughness provided 980+ inlier keypoints per frame. Ground plane fit combined with known 4.2m haul truck bounding box anchors metric scale.',
      recommendedAction: 'Certified for volumetric mining billing and haulage computation.'
    }
  ],
  factory: [
    {
      id: 'hs-silo-a',
      title: 'Storage Unit — Grain Silo Cluster 4',
      position: [-1.0, 1.5, 0.5],
      category: 'Storage Silo',
      measurement: {
        type: 'Silo Cylinder Height',
        value: 24.1,
        unit: 'm',
        uncertainty: 0.92,
        secondaryMetric: {
          label: 'Estimated Diameter',
          value: '8.4 m',
          uncertainty: '± 0.3 m'
        }
      },
      confidence: {
        geometry: 78,
        depth: 72,
        scale: 81,
        semantic: 88,
        measurement: 74
      },
      qualityAssessment: 'Medium Confidence (Zero-DCE Low-Light)',
      statusColor: 'amber',
      explanation: 'Captured in low-light conditions; Zero-DCE neural enhancement illuminated underexposed shadows, allowing feature extraction without noise blowup.',
      recommendedAction: 'Accurate for spatial dimensioning.'
    }
  ]
};
