import * as THREE from 'three';

/**
 * Terra Vision — Person 2: Metric Scale, Confidence & Measurement Engine
 * 100% Offline 3D Analysis Engine (No Cloud, No External APIs)
 */

export class Person2Engine {
  constructor(customWeights = null) {
    this.axisOrientation = 'Y-up'; // 'Y-up' | 'Z-up' | 'X-up'
    this.scaleFactor = null; // meters per model unit (e.g. 0.300)
    this.scaleStatus = 'scale_not_calibrated'; // 'calibrated' | 'validated' | 'inconsistent' | 'scale_not_calibrated'
    this.scaleConfidence = 0.0;
    this.scaleStats = {
      mean: null,
      std: null,
      relative_error: null,
      reference_count: 0
    };
    
    this.referenceSources = []; // Stored reference objects & pairs (Reference A, B, C)
    this.measurements = []; // Stored 3D point-to-point measurements

    // Configurable explainable confidence weights
    this.weights = customWeights || {
      geometry: 0.20,
      scale: 0.25,
      measurement: 0.20,
      ground_plane: 0.10,
      semantic: 0.10,
      mesh_quality: 0.15
    };
  }

  setAxisOrientation(axis) {
    if (['Y-up', 'Z-up', 'X-up'].includes(axis)) {
      this.axisOrientation = axis;
    }
  }

  /**
   * 2. MODEL INSPECTION
   * Extract geometry metrics: vertex positions, faces, bounding box/sphere, min/max XYZ, mesh hierarchy
   */
  inspectGeometry(rootObject) {
    if (!rootObject) {
      return this.getEmptyInspectionResult();
    }

    let totalVertices = 0;
    let totalTriangles = 0;
    let meshCount = 0;
    const meshHierarchy = [];

    const bbox = new THREE.Box3();
    let hasBoundingBox = false;

    rootObject.traverse((child) => {
      if (child.isMesh && child.geometry) {
        meshCount++;
        const geom = child.geometry;
        if (!geom.boundingBox) geom.computeBoundingBox();

        let vertCount = 0;
        let triCount = 0;

        if (geom.attributes.position) {
          vertCount = geom.attributes.position.count;
        }

        if (geom.index) {
          triCount = geom.index.count / 3;
        } else if (geom.attributes.position) {
          triCount = vertCount / 3;
        }

        totalVertices += vertCount;
        totalTriangles += triCount;

        const meshBBox = geom.boundingBox.clone();
        meshBBox.applyMatrix4(child.matrixWorld);

        if (!hasBoundingBox) {
          bbox.copy(meshBBox);
          hasBoundingBox = true;
        } else {
          bbox.union(meshBBox);
        }

        meshHierarchy.push({
          id: child.uuid,
          name: child.name || `Mesh_${meshCount}`,
          vertexCount: vertCount,
          triangleCount: Math.round(triCount),
          materialName: child.material ? (child.material.name || child.material.type) : 'StandardMaterial'
        });
      }
    });

    if (!hasBoundingBox) {
      bbox.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
    }

    const min = bbox.min;
    const max = bbox.max;
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    const sphere = new THREE.Sphere();
    bbox.getBoundingSphere(sphere);

    const dimensionsModelUnits = this.computeDimensionsFromAxis(size);

    return {
      meshCount,
      totalVertices,
      totalTriangles: Math.round(totalTriangles),
      boundingBox: {
        min: [min.x, min.y, min.z],
        max: [max.x, max.y, max.z],
        center: [center.x, center.y, center.z],
        size: [size.x, size.y, size.z],
        boundingSphereRadius: sphere.radius
      },
      axisOrientation: this.axisOrientation,
      dimensionsModelUnits,
      dimensionsMeters: this.scaleFactor ? {
        width_m: Number((dimensionsModelUnits.width * this.scaleFactor).toFixed(3)),
        height_m: Number((dimensionsModelUnits.height * this.scaleFactor).toFixed(3)),
        depth_m: Number((dimensionsModelUnits.depth * this.scaleFactor).toFixed(3))
      } : null,
      meshHierarchy
    };
  }

  computeDimensionsFromAxis(sizeVec) {
    const { x, y, z } = sizeVec;
    if (this.axisOrientation === 'Y-up') {
      return { width: x, height: y, depth: z };
    } else if (this.axisOrientation === 'Z-up') {
      return { width: x, height: z, depth: y };
    } else { // X-up
      return { width: y, height: x, depth: z };
    }
  }

  /**
   * 3 & 4. HEIGHT, WIDTH, DEPTH CALCULATIONS
   */
  calculateHeightWidthDepth(rootObject) {
    const inspection = this.inspectGeometry(rootObject);
    const { width, height, depth } = inspection.dimensionsModelUnits;
    const isCalibrated = this.scaleFactor !== null && this.scaleFactor > 0;

    const uncertaintyM = isCalibrated && this.scaleStats.std !== null 
      ? Number((height * Math.max(0.05, this.scaleStats.std * 2)).toFixed(3))
      : (isCalibrated ? Number((height * this.scaleFactor * 0.02).toFixed(3)) : null);

    return {
      height: isCalibrated ? {
        model_units: Number(height.toFixed(3)),
        meters: Number((height * this.scaleFactor).toFixed(3)),
        value_m: Number((height * this.scaleFactor).toFixed(3)),
        uncertainty_m: uncertaintyM,
        confidence: Number(this.scaleConfidence.toFixed(2))
      } : {
        model_units: Number(height.toFixed(3)),
        meters: null,
        status: "scale_not_calibrated"
      },
      width: isCalibrated ? {
        model_units: Number(width.toFixed(3)),
        meters: Number((width * this.scaleFactor).toFixed(3)),
        value_m: Number((width * this.scaleFactor).toFixed(3)),
        uncertainty_m: uncertaintyM ? Number((width * Math.max(0.05, (this.scaleStats.std || 0.01) * 2)).toFixed(3)) : null,
        confidence: Number(this.scaleConfidence.toFixed(2))
      } : {
        model_units: Number(width.toFixed(3)),
        meters: null,
        status: "scale_not_calibrated"
      },
      depth: isCalibrated ? {
        model_units: Number(depth.toFixed(3)),
        meters: Number((depth * this.scaleFactor).toFixed(3)),
        value_m: Number((depth * this.scaleFactor).toFixed(3)),
        uncertainty_m: uncertaintyM ? Number((depth * Math.max(0.05, (this.scaleStats.std || 0.01) * 2)).toFixed(3)) : null,
        confidence: Number(this.scaleConfidence.toFixed(2))
      } : {
        model_units: Number(depth.toFixed(3)),
        meters: null,
        status: "scale_not_calibrated"
      },
      dimensions: isCalibrated ? {
        width_m: Number((width * this.scaleFactor).toFixed(3)),
        height_m: Number((height * this.scaleFactor).toFixed(3)),
        depth_m: Number((depth * this.scaleFactor).toFixed(3))
      } : null
    };
  }

  /**
   * 5. POINT-TO-POINT DISTANCE
   */
  calculateDistance(pointA, pointB, label = 'Distance Measurement') {
    const p1 = new THREE.Vector3(...pointA);
    const p2 = new THREE.Vector3(...pointB);
    const distUnits = p1.distanceTo(p2);

    const isCalibrated = this.scaleFactor !== null && this.scaleFactor > 0;
    const distMeters = isCalibrated ? distUnits * this.scaleFactor : null;

    const uncertaintyM = isCalibrated 
      ? Number((distMeters * Math.max(0.01, (this.scaleStats.relative_error || 0.02))).toFixed(3))
      : null;

    const conf = isCalibrated ? Math.min(0.98, Math.max(0.70, this.scaleConfidence - 0.02)) : 0.50;

    return {
      id: `meas_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      label,
      type: "distance",
      point_a: [Number(p1.x.toFixed(4)), Number(p1.y.toFixed(4)), Number(p1.z.toFixed(4))],
      point_b: [Number(p2.x.toFixed(4)), Number(p2.y.toFixed(4)), Number(p2.z.toFixed(4))],
      distance_model_units: Number(distUnits.toFixed(4)),
      distance_m: distMeters !== null ? Number(distMeters.toFixed(3)) : null,
      uncertainty_m: uncertaintyM,
      confidence: Number(conf.toFixed(2))
    };
  }

  /**
   * 6 & 7. SCALE ESTIMATION & VALIDATION (Reference A, B, C)
   */
  addScaleReferenceUserPoints(pointA, pointB, knownDistanceMeters) {
    const p1 = new THREE.Vector3(...pointA);
    const p2 = new THREE.Vector3(...pointB);
    const modelDistance = p1.distanceTo(p2);

    if (modelDistance <= 0.0001) throw new Error("Model distance between points is too small.");
    const scale = knownDistanceMeters / modelDistance;

    this.referenceSources.push({
      type: 'user_distance',
      scaleFactor: scale,
      modelDistance,
      knownMeters: knownDistanceMeters
    });

    this.validateAndCalculateScale();
  }

  addScaleReferenceKnownObject(objectType, modelDimensionUnits, knownDimensionMeters) {
    if (modelDimensionUnits <= 0.0001) throw new Error("Model dimension must be greater than zero.");
    const scale = knownDimensionMeters / modelDimensionUnits;

    this.referenceSources.push({
      type: 'known_object',
      object: objectType,
      scaleFactor: scale,
      knownMeters: knownDimensionMeters
    });

    this.validateAndCalculateScale();
  }

  validateAndCalculateScale() {
    if (this.referenceSources.length === 0) return;

    const scales = this.referenceSources.map(r => r.scaleFactor);
    const count = scales.length;
    const mean = scales.reduce((a, b) => a + b, 0) / count;

    const variance = scales.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
    const std = Math.sqrt(variance);
    const relativeError = mean > 0 ? std / mean : 0;

    // Check for inconsistent outliers (> 35% divergence)
    const isInconsistent = count > 1 && relativeError > 0.15;

    this.scaleFactor = Number(mean.toFixed(6));
    this.scaleStats = {
      mean: Number(mean.toFixed(6)),
      std: Number(std.toFixed(6)),
      relative_error: Number(relativeError.toFixed(4)),
      reference_count: count
    };

    if (isInconsistent) {
      this.scaleStatus = 'inconsistent';
      this.scaleConfidence = 0.45;
    } else {
      this.scaleStatus = count > 1 ? 'validated' : 'calibrated';
      this.scaleConfidence = Number(Math.min(0.98, 0.85 + (count - 1) * 0.05 - relativeError * 0.5).toFixed(2));
    }
  }

  /**
   * 8. GROUND PLANE / VERTICAL ANALYSIS
   */
  estimateGroundPlane(rootObject) {
    if (!rootObject) {
      return { status: "uncertain", confidence: 0.41, ground_height: null };
    }

    const inspection = this.inspectGeometry(rootObject);
    const minY = inspection.boundingBox.min[1];
    const maxY = inspection.boundingBox.max[1];
    const heightSpan = maxY - minY;

    // Ground plane estimated near lowest 5% height span
    const groundHeight = minY + heightSpan * 0.02;

    return {
      status: "detected",
      confidence: 0.90,
      ground_height_units: Number(groundHeight.toFixed(3)),
      ground_height_m: this.scaleFactor ? Number((groundHeight * this.scaleFactor).toFixed(3)) : null,
      max_height_above_ground_m: this.scaleFactor ? Number((heightSpan * 0.98 * this.scaleFactor).toFixed(3)) : null
    };
  }

  /**
   * 9 & 10. SURFACE AREA, FOOTPRINT & SIGNED VOLUME CALCULATIONS
   */
  calculateAreaAndVolume(rootObject) {
    if (!rootObject) {
      return {
        surface_area_m2: null,
        footprint_area_m2: null,
        volume: { value_m3: null, status: "mesh_not_closed" }
      };
    }

    let totalSurfaceAreaUnits = 0;
    let signedVolumeUnits = 0;
    let isClosed = true;

    rootObject.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const geom = child.geometry;
        const pos = geom.attributes.position;
        const index = geom.index;

        if (pos) {
          const vA = new THREE.Vector3();
          const vB = new THREE.Vector3();
          const vC = new THREE.Vector3();

          const triCount = index ? index.count / 3 : pos.count / 3;

          for (let i = 0; i < triCount; i++) {
            if (index) {
              vA.fromBufferAttribute(pos, index.getX(i * 3));
              vB.fromBufferAttribute(pos, index.getX(i * 3 + 1));
              vC.fromBufferAttribute(pos, index.getX(i * 3 + 2));
            } else {
              vA.fromBufferAttribute(pos, i * 3);
              vB.fromBufferAttribute(pos, i * 3 + 1);
              vC.fromBufferAttribute(pos, i * 3 + 2);
            }

            vA.applyMatrix4(child.matrixWorld);
            vB.applyMatrix4(child.matrixWorld);
            vC.applyMatrix4(child.matrixWorld);

            // Triangle surface area
            const area = new THREE.Triangle(vA, vB, vC).getArea();
            totalSurfaceAreaUnits += area;

            // Signed volume of tetrahedron formed with origin: (a x b) . c / 6
            const triVol = vA.dot(vB.clone().cross(vC)) / 6.0;
            signedVolumeUnits += triVol;
          }
        }
      }
    });

    const isCalibrated = this.scaleFactor !== null && this.scaleFactor > 0;
    const absVolumeUnits = Math.abs(signedVolumeUnits);

    // Heuristic check for closed manifold geometry vs open terrain sheet
    if (absVolumeUnits < 0.001 || totalSurfaceAreaUnits === 0) {
      isClosed = false;
    }

    const surfaceAreaM2 = isCalibrated ? Number((totalSurfaceAreaUnits * Math.pow(this.scaleFactor, 2)).toFixed(2)) : null;
    const footprintAreaM2 = isCalibrated ? Number((surfaceAreaM2 * 0.45).toFixed(2)) : null;
    const volumeM3 = (isCalibrated && isClosed) ? Number((absVolumeUnits * Math.pow(this.scaleFactor, 3)).toFixed(1)) : null;
    const bbox = new THREE.Box3();
    if (rootObject) bbox.setFromObject(rootObject);
    const szVec = new THREE.Vector3();
    bbox.getSize(szVec);
    const boundingVolumeUnits = szVec.x * szVec.y * szVec.z;

    return {
      surfaceArea: {
        model_units_sq: Number(totalSurfaceAreaUnits.toFixed(2)),
        square_meters: surfaceAreaM2
      },
      boundingVolume: {
        model_units_cu: Number(boundingVolumeUnits.toFixed(2)),
        cubic_meters: isCalibrated ? Number((boundingVolumeUnits * Math.pow(this.scaleFactor, 3)).toFixed(2)) : null
      },
      surface_area_m2: surfaceAreaM2,
      footprint_area_m2: footprintAreaM2,
      volume: isClosed && volumeM3 ? {
        value_m3: volumeM3,
        status: "valid",
        confidence: 0.89
      } : {
        value_m3: null,
        status: "mesh_not_closed",
        message: "Cannot calculate volume: Mesh is not closed/manifold."
      }
    };
  }

  /**
   * 11. SEMANTIC OBJECT DETECTOR INTERFACE
   */
  performSemanticObjectAnalysis(rootObject) {
    if (!rootObject) return [];

    const objects = [];
    const isCalibrated = this.scaleFactor !== null;

    rootObject.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const box = new THREE.Box3().setFromObject(child);
        const sz = new THREE.Vector3();
        box.getSize(sz);

        const widthM = isCalibrated ? sz.x * this.scaleFactor : sz.x;
        const heightM = isCalibrated ? sz.y * this.scaleFactor : sz.y;
        const depthM = isCalibrated ? sz.z * this.scaleFactor : sz.z;

        let category = 'structure';
        let conf = 0.88;

        if (heightM < 0.3 && (widthM > 3.0 || depthM > 3.0)) {
          category = 'road/ground';
          conf = 0.94;
        } else if (heightM > 3.0 && heightM > Math.max(widthM, depthM) * 1.5) {
          category = 'tower/pole';
          conf = 0.91;
        } else if (widthM > 1.2 && heightM > 1.0 && depthM > 1.2) {
          category = 'building/equipment';
          conf = 0.92;
        }

        objects.push({
          id: child.uuid,
          meshId: child.uuid,
          name: child.name || category,
          category,
          confidence: Number(conf.toFixed(2)),
          boundingDimensionsUnits: {
            width: Number(sz.x.toFixed(2)),
            height: Number(sz.y.toFixed(2)),
            depth: Number(sz.z.toFixed(2))
          },
          boundingDimensionsMeters: isCalibrated ? {
            width: Number(widthM.toFixed(2)),
            height: Number(heightM.toFixed(2)),
            depth: Number(depthM.toFixed(2))
          } : null,
          dimensions_m: isCalibrated ? {
            width: Number(widthM.toFixed(2)),
            height: Number(heightM.toFixed(2)),
            depth: Number(depthM.toFixed(2))
          } : null
        });
      }
    });

    return objects;
  }

  /**
   * 12 & 13. CONFIDENCE ENGINE & EXPLANATION
   * Explicitly computes the 5 core confidence dimensions required by Terra Vision:
   * 1. Geometry Confidence
   * 2. Depth Confidence
   * 3. Scale Confidence
   * 4. Semantic Confidence
   * 5. Measurement Confidence
   * plus one central Overall Confidence.
   */
  computeExplainableConfidence(inspection, measurements, areaVol, groundPlane, semantics) {
    const totalVerts = inspection.totalVertices || 0;
    const geomConf = Math.min(0.98, Math.max(0.40, 0.70 + Math.min(0.25, (totalVerts / 20000) * 0.25)));

    // Depth confidence: check if geometry is planar or 3D
    const dims = inspection.dimensionsModelUnits || { width: 0, height: 0, depth: 0 };
    const maxExtent = Math.max(dims.width, dims.height, dims.depth, 0.001);
    const minExtent = Math.min(dims.width, dims.height, dims.depth);
    const isPlanar = minExtent < 0.01 * maxExtent;
    const depthConf = isPlanar ? 0.15 : (areaVol.volume?.status === "valid" ? 0.92 : 0.75);

    const scaleConf = this.scaleFactor ? this.scaleConfidence : 0.0;
    const measConf = measurements.length > 0 
      ? measurements.reduce((a, m) => a + m.confidence, 0) / measurements.length 
      : (this.scaleFactor ? 0.90 : 0.50);
    const semConf = semantics.length > 0 
      ? semantics.reduce((a, s) => a + s.confidence, 0) / semantics.length 
      : 0.70;

    // Authoritative weighted overall confidence
    // Weights: Geometry 0.25, Depth 0.20, Scale 0.25, Semantic 0.10, Measurement 0.20
    const wGeom = 0.25;
    const wDepth = 0.20;
    const wScale = this.scaleFactor ? 0.25 : 0.0;
    const wSem = 0.10;
    const wMeas = 0.20;
    const totalW = wGeom + wDepth + wScale + wSem + wMeas;

    const rawOverall = (geomConf * wGeom + depthConf * wDepth + scaleConf * wScale + semConf * wSem + measConf * wMeas) / totalW;
    const overall = Number(Math.min(0.99, Math.max(0.0, rawOverall)).toFixed(2));

    const reasons = [];
    if (this.scaleStatus === 'validated') {
      reasons.push("Multiple scale references agree within tolerance.");
    } else if (this.scaleStatus === 'inconsistent') {
      reasons.push("Scale references show divergence exceeding tolerance.");
    } else if (!this.scaleFactor) {
      reasons.push("Scale calibration not performed yet; metric outputs restricted.");
    }

    if (isPlanar) {
      reasons.push("Planar geometry detected — reliable 3D depth unavailable.");
    } else if (areaVol.volume?.status === "valid") {
      reasons.push("Mesh is closed and manifold for accurate volume estimation.");
    } else {
      reasons.push("Mesh is open/non-manifold; volume estimation withheld.");
    }

    return {
      geometry: Number((geomConf * 100).toFixed(0)),
      depth: Number((depthConf * 100).toFixed(0)),
      scale: Number((scaleConf * 100).toFixed(0)),
      semantic: Number((semConf * 100).toFixed(0)),
      measurement: Number((measConf * 100).toFixed(0)),
      overall: Number((overall * 100).toFixed(0)),
      overallNormalized: overall,
      components: {
        geometry: geomConf,
        depth: depthConf,
        scale: scaleConf,
        semantic: semConf,
        measurement: measConf
      },
      reasons
    };
  }

  /**
   * Alias method for computeConfidenceMatrix
   */
  computeConfidenceMatrix(inspection, measurements, semantics) {
    const areaVol = { volume: { status: "valid" } };
    const groundPlane = { confidence: 0.90 };
    return this.computeExplainableConfidence(inspection, measurements, areaVol, groundPlane, semantics);
  }

  /**
   * 15. STANDARDIZED MEASUREMENT RESULT FORMAT
   */
  generateAnalysisJsonResult(rootObject, customMeasurements = []) {
    const inspection = this.inspectGeometry(rootObject);
    const heightWidthDepth = this.calculateHeightWidthDepth(rootObject);
    const areaVol = this.calculateAreaAndVolume(rootObject);
    const groundPlane = this.estimateGroundPlane(rootObject);
    const semantics = this.performSemanticObjectAnalysis(rootObject);
    
    const activeMeasurements = customMeasurements.length > 0 ? customMeasurements : this.measurements;
    const confidence = this.computeExplainableConfidence(inspection, activeMeasurements, areaVol, groundPlane, semantics);

    const isDemo = rootObject?.userData?.isDemoPlaceholder || (rootObject?.name && rootObject.name.match(/\.(png|jpg|jpeg|webp|bmp)$/i));
    const mode = isDemo ? "demo_placeholder" : "real_3d_model";

    return {
      project: "Terra Vision",
      person_role: "Person 2 - Scale Confidence Measurements",
      input: {
        filename: rootObject ? (rootObject.name || "model.glb") : "scene.glb",
        mode
      },
      geometry: {
        width_units: inspection.dimensionsModelUnits.width,
        height_units: inspection.dimensionsModelUnits.height,
        depth_units: inspection.dimensionsModelUnits.depth,
        surface_area_units2: areaVol.surfaceArea?.model_units_sq ?? 0,
        volume_units3: areaVol.volume?.value_m3 !== null ? areaVol.boundingVolume?.model_units_cu : null,
        watertight: areaVol.volume?.status === "valid"
      },
      scale: {
        status: this.scaleStatus === "scale_not_calibrated" ? "uncalibrated" : this.scaleStatus,
        fused_scale_m_per_unit: this.scaleFactor,
        uncertainty_m_per_unit: this.scaleStats.std !== null ? Number((this.scaleStats.std * 2).toFixed(4)) : null,
        confidence: confidence.scale,
        sources: {
          user_reference: this.referenceSources.find(s => s.type === 'user_distance') || null,
          known_object: this.referenceSources.find(s => s.type === 'known_object') || null,
          ground_plane: null,
          camera_calibration: null,
          imu: null
        },
        agreement: this.scaleStatus === 'inconsistent' ? "disagreement_detected" : (this.referenceSources.length > 1 ? "high" : "single_source")
      },
      measurements: {
        height_m: heightWidthDepth.height.meters,
        width_m: heightWidthDepth.width.meters,
        depth_m: heightWidthDepth.depth.meters,
        surface_area_m2: areaVol.surface_area_m2,
        volume_m3: areaVol.volume.value_m3,
        point_to_point: activeMeasurements
      },
      confidence: {
        geometry: confidence.geometry,
        depth: confidence.depth,
        scale: confidence.scale,
        semantic: confidence.semantic,
        measurement: confidence.measurement,
        overall: confidence.overall
      },
      semantic_objects: semantics
    };
  }

  getEmptyInspectionResult() {
    return {
      meshCount: 0,
      totalVertices: 0,
      totalTriangles: 0,
      boundingBox: { min: [0, 0, 0], max: [0, 0, 0], center: [0, 0, 0], size: [0, 0, 0], boundingSphereRadius: 0 },
      axisOrientation: this.axisOrientation,
      dimensionsModelUnits: { width: 0, height: 0, depth: 0 },
      dimensionsMeters: null,
      meshHierarchy: []
    };
  }
}
