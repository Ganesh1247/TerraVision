import { Person2Engine } from '../person2Engine.js';
import * as THREE from 'three';

/**
 * Offline Automated Verification Tests for Person 2 Engine
 */
export function runOfflinePerson2EngineTests() {
  const results = [];
  const logTest = (name, passed, detail) => {
    results.push({ name, passed, detail });
    console.log(`[TEST ${passed ? 'PASSED' : 'FAILED'}] ${name}: ${detail}`);
  };

  try {
    // TEST 1: Dimension Test (10x10x10 Cube)
    const engine = new Person2Engine();
    const cubeGeom = new THREE.BoxGeometry(10, 10, 10);
    const cubeMesh = new THREE.Mesh(cubeGeom, new THREE.MeshBasicMaterial());
    const cubeGroup = new THREE.Group();
    cubeGroup.add(cubeMesh);

    const dims = engine.calculateHeightWidthDepth(cubeGroup);
    const passDims = dims.height.model_units === 10 && dims.width.model_units === 10 && dims.depth.model_units === 10;
    logTest('Dimension Test (10x10x10 Cube)', passDims, `Width: ${dims.width.model_units}, Height: ${dims.height.model_units}, Depth: ${dims.depth.model_units}`);

    // TEST 2: Specific Test Vector Scale Calibration (P1=[0.30, 2.89, 0.0], P2=[-0.53, 1.63, 0.0], Known = 10.0m)
    const p1 = [0.30, 2.89, 0.00];
    const p2 = [-0.53, 1.63, 0.00];
    const expectedModelDist = Math.sqrt(Math.pow(0.30 - (-0.53), 2) + Math.pow(2.89 - 1.63, 2)); // ~1.50907
    const expectedScale = 10.0 / expectedModelDist; // ~6.62657
    engine.addScaleReferenceUserPoints(p1, p2, 10.0);

    const passVector = Math.abs(engine.scaleFactor - expectedScale) < 0.01;
    logTest('Specific Test Vector Scale (P1, P2 -> 10m)', passVector, `Model Dist: ${expectedModelDist.toFixed(3)} units, Dynamic Scale: ${engine.scaleFactor} m/unit (Expected ~6.63)`);

    // TEST 3: Dynamic Metric Conversion (Height 3.412 units * Scale ~6.63 -> ~22.62m)
    const demoGeom = new THREE.BoxGeometry(5.0, 3.412, 3.0);
    const demoMesh = new THREE.Mesh(demoGeom, new THREE.MeshBasicMaterial());
    const demoGroup = new THREE.Group();
    demoGroup.add(demoMesh);

    const demoDims = engine.calculateHeightWidthDepth(demoGroup);
    const expectedHeightM = 3.412 * engine.scaleFactor; // ~22.61m
    const passDemoHeight = Math.abs(demoDims.height.meters - expectedHeightM) < 0.05;
    logTest('Dynamic Metric Conversion (Height 3.412 units)', passDemoHeight, `Units: 3.412, Meters: ${demoDims.height.meters}m (Expected ~22.6m)`);

    // TEST 4: Signed Volume Test for Closed Mesh (10x10x10 Cube)
    const areaVol = engine.calculateAreaAndVolume(cubeGroup);
    const expectedVolM3 = 1000 * Math.pow(engine.scaleFactor, 3);
    const passVol = areaVol.volume.status === 'valid' && Math.abs(areaVol.volume.value_m3 - expectedVolM3) < 5.0;
    logTest('Signed Volume Test (Closed 10x10x10 Cube)', passVol, `Volume Status: ${areaVol.volume.status}, Calculated: ${areaVol.volume.value_m3} m³`);

    // TEST 5: Open Mesh Volume Test (Plane Geometry)
    const planeGeom = new THREE.PlaneGeometry(10, 10);
    const planeMesh = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial());
    const planeGroup = new THREE.Group();
    planeGroup.add(planeMesh);

    const openVol = engine.calculateAreaAndVolume(planeGroup);
    const passOpen = openVol.volume.status === 'mesh_not_closed' && openVol.volume.value_m3 === null;
    logTest('Open Mesh Handling Test (Plane)', passOpen, `Volume Status: ${openVol.volume.status}, Value: ${openVol.volume.value_m3}`);

    // TEST 6: Scale Disagreement Detection Test (User=6.6, Known=6.5, Ground=9.2)
    const multiEngine = new Person2Engine();
    multiEngine.addScaleReferenceUserPoints([0,0,0], [0,1,0], 6.6);
    multiEngine.addScaleReferenceKnownObject('car', 1.0, 6.5);
    multiEngine.addScaleReferenceKnownObject('building', 1.0, 9.2);

    const passDisagreement = multiEngine.scaleStatus === 'inconsistent' || multiEngine.scaleStats.relative_error > 0.15;
    logTest('Scale Disagreement Detection (6.6 vs 6.5 vs 9.2)', passDisagreement, `Scale Status: ${multiEngine.scaleStatus}, Relative Error: ${multiEngine.scaleStats.relative_error}`);

    // TEST 7: Standardized JSON Result Export & Serialization Test
    const jsonResult = multiEngine.generateAnalysisJsonResult(cubeGroup, []);
    const jsonStr = JSON.stringify(jsonResult);
    const parsed = JSON.parse(jsonStr);
    const passJson = parsed.project === "Terra Vision" && !jsonStr.includes("NaN") && !jsonStr.includes("Infinity");
    logTest('JSON Export & Serialization Test', passJson, `Valid JSON produced. Has 5 Confidence Dimensions: Geometry ${parsed.confidence.geometry}%, Depth ${parsed.confidence.depth}%, Scale ${parsed.confidence.scale}%, Semantic ${parsed.confidence.semantic}%, Measurement ${parsed.confidence.measurement}%, Overall ${parsed.confidence.overall}%`);

  } catch (err) {
    logTest('Engine Test Exception', false, err.message);
  }

  return results;
}

