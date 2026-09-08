import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Scene3D({
  renderMode = 'textured',
  activeStageIndex = 0,
  pipelineState = 'idle',
  hotspots = [],
  selectedHotspot,
  onSelectHotspot,
  showTrajectory = true,
  showRuler = false,
  selectedDataset
}) {
  const pointsRef = useRef();
  const droneFrustumRef = useRef();
  const trajectoryTimeRef = useRef(0);
  const beaconGroupRef = useRef();

  const datasetType = selectedDataset?.defaultHotspots || 'substation';

  // Generate Flight Path Spline Points
  const flightPathPoints = useMemo(() => {
    const pts = [];
    const radius = 5.2;
    const numPoints = 64;
    for (let i = 0; i <= numPoints; i++) {
      const theta = (i / numPoints) * Math.PI * 4;
      const r = radius - (i / numPoints) * 1.2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * (r * 0.9);
      const y = 2.8 + Math.sin(theta * 2) * 0.6 + (1 - i / numPoints) * 0.8;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  const flightCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(flightPathPoints);
  }, [flightPathPoints]);

  const flightLineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(flightCurve.getPoints(100));
  }, [flightCurve]);

  // Generate dense tie-point cloud particles (12,000 points)
  const { pointPositions, pointColorsNormal, pointColorsConfidence, pointColorsHeight } = useMemo(() => {
    const count = 12000;
    const pos = new Float32Array(count * 3);
    const colNormal = new Float32Array(count * 3);
    const colConf = new Float32Array(count * 3);
    const colHeight = new Float32Array(count * 3);

    const cCyan = new THREE.Color('#22D3EE');
    const cGreen = new THREE.Color('#22C55E');
    const cAmber = new THREE.Color('#F59E0B');
    const cRed = new THREE.Color('#EF4444');
    const cBlue = new THREE.Color('#3B82F6');

    for (let i = 0; i < count; i++) {
      let x, y, z;
      const cluster = Math.random();

      if (cluster < 0.35) {
        // Ground plane
        x = (Math.random() - 0.5) * 11;
        z = (Math.random() - 0.5) * 11;
        y = (Math.random() * 0.15) - 0.05;
      } else if (cluster < 0.7) {
        // Primary Structure Cluster
        x = -1.2 + (Math.random() - 0.5) * 3.2;
        z = 0.2 + (Math.random() - 0.5) * 2.8;
        y = Math.random() * 2.4;
      } else if (cluster < 0.9) {
        // Secondary Structure / Tower
        x = 1.8 + (Math.random() - 0.5) * 1.6;
        z = -1.0 + (Math.random() - 0.5) * 1.6;
        y = Math.random() * 3.6;
      } else {
        // Low-confidence zone / basin
        x = -2.2 + (Math.random() - 0.5) * 1.8;
        z = -2.0 + (Math.random() - 0.5) * 1.6;
        y = Math.random() * 0.2;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Normal Mode Color (Cyan Scan)
      const baseCol = cCyan.clone().lerp(new THREE.Color('#06B6D4'), Math.random() * 0.4);
      colNormal[i * 3] = baseCol.r;
      colNormal[i * 3 + 1] = baseCol.g;
      colNormal[i * 3 + 2] = baseCol.b;

      // Heightmap Color
      const normHeight = THREE.MathUtils.clamp(y / 3.6, 0, 1);
      const hCol = normHeight < 0.3 
        ? cBlue.clone().lerp(cGreen, normHeight / 0.3)
        : normHeight < 0.7 
        ? cGreen.clone().lerp(cAmber, (normHeight - 0.3) / 0.4)
        : cAmber.clone().lerp(cRed, (normHeight - 0.7) / 0.3);
      colHeight[i * 3] = hCol.r;
      colHeight[i * 3 + 1] = hCol.g;
      colHeight[i * 3 + 2] = hCol.b;

      // Confidence Color
      let confCol = cGreen;
      if (x < -1.2 && z < -1.2) {
        confCol = Math.random() > 0.4 ? cAmber : cRed;
      } else if (Math.random() > 0.85) {
        confCol = cAmber;
      }
      colConf[i * 3] = confCol.r;
      colConf[i * 3 + 1] = confCol.g;
      colConf[i * 3 + 2] = confCol.b;
    }

    return {
      pointPositions: pos,
      pointColorsNormal: colNormal,
      pointColorsConfidence: colConf,
      pointColorsHeight: colHeight
    };
  }, []);

  const activePointColors = useMemo(() => {
    if (renderMode === 'heatmap') return pointColorsConfidence;
    if (renderMode === 'heightmap') return pointColorsHeight;
    return pointColorsNormal;
  }, [renderMode, pointColorsConfidence, pointColorsHeight, pointColorsNormal]);

  // Frame tick animation for drone flight and 3D beacon pulses
  useFrame((state, delta) => {
    trajectoryTimeRef.current = (trajectoryTimeRef.current + delta * 0.07) % 1;
    if (droneFrustumRef.current && flightCurve) {
      const pos = flightCurve.getPointAt(trajectoryTimeRef.current);
      const tangent = flightCurve.getTangentAt(trajectoryTimeRef.current);
      droneFrustumRef.current.position.copy(pos);
      droneFrustumRef.current.lookAt(pos.clone().add(tangent));
    }

    if (beaconGroupRef.current && Array.isArray(hotspots) && hotspots.length > 0) {
      const time = state.clock.getElapsedTime();
      beaconGroupRef.current.children.forEach((child, idx) => {
        if (hotspots[idx] && hotspots[idx].position) {
          child.position.y = (hotspots[idx].position[1] || 1) + Math.sin(time * 3 + idx) * 0.08 + 0.3;
          child.rotation.y = time * 1.5 + idx;
        }
      });
    }
  });

  const showMesh = renderMode === 'textured' || renderMode === 'wireframe' || renderMode === 'heatmap' || renderMode === 'heightmap';
  const isWireframe = renderMode === 'wireframe';
  const isHeatmap = renderMode === 'heatmap';
  const isHeightmap = renderMode === 'heightmap';

  return (
    <group position={[0, -0.4, 0]}>
      {/* Ground Terrain Slab */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 12]} />
        <meshStandardMaterial
          color={isHeatmap ? '#0F172A' : isHeightmap ? '#1E3A8A' : '#0B0F14'}
          roughness={0.9}
          metalness={0.1}
          wireframe={isWireframe}
        />
      </mesh>

      {/* Metric Coordinate Grid */}
      <gridHelper args={[12, 24, '#22D3EE', '#1E293B']} position={[0, 0.01, 0]} />

      {/* Drone Trajectory & Sensor Cone */}
      {showTrajectory && (
        <group>
          <line geometry={flightLineGeometry}>
            <lineBasicMaterial color="#22D3EE" opacity={0.65} transparent linewidth={2} />
          </line>

          <group ref={droneFrustumRef}>
            {/* Camera Frustum Cone */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.3, 0.6, 4]} />
              <meshBasicMaterial color="#22D3EE" wireframe />
            </mesh>
            {/* Drone Sensor Sphere */}
            <mesh>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial color="#38BDF8" />
            </mesh>
            {/* Scanning Laser Beam */}
            <mesh position={[0, -0.9, 0]}>
              <cylinderGeometry args={[0.02, 0.9, 1.8, 8, 1, true]} />
              <meshBasicMaterial color="#22D3EE" opacity={0.15} transparent side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      )}

      {/* Dense Point Cloud */}
      {(renderMode === 'pointcloud' || (pipelineState === 'processing' && activeStageIndex >= 3 && activeStageIndex <= 6)) && (
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pointPositions.length / 3}
              array={pointPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={activePointColors.length / 3}
              array={activePointColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            vertexColors
            transparent
            opacity={0.95}
            sizeAttenuation
          />
        </points>
      )}

      {/* 3D Reconstructed Models */}
      {showMesh && (pipelineState === 'completed' || pipelineState === 'idle' || activeStageIndex >= 7) && (
        <group>
          {/* DATASET: 2-Story Residential Villa (User Reference 3D Model) */}
          {(datasetType === 'villa' || !datasetType) && (
            <group position={[0, 0, 0]}>
              {/* Main 2-Story Villa Building Block */}
              <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[4.4, 2.4, 3.6]} />
                <meshStandardMaterial
                  color={isHeatmap ? '#22C55E' : isHeightmap ? '#10B981' : '#D1D5DB'}
                  roughness={0.5}
                  wireframe={isWireframe}
                />
              </mesh>

              {/* Roof Slab & Parapet Edge */}
              <mesh position={[0, 2.45, 0]} receiveShadow>
                <boxGeometry args={[4.5, 0.12, 3.7]} />
                <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#E5E7EB'} wireframe={isWireframe} />
              </mesh>

              {/* Blue Central Roof Stripe */}
              <mesh position={[0, 2.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.25, 3.5]} />
                <meshStandardMaterial color="#6366F1" wireframe={isWireframe} />
              </mesh>

              {/* Main Entrance Porch Canopy (Right Front) */}
              <group position={[1.4, 0, 1.8]}>
                {/* Roof Slab */}
                <mesh position={[0, 1.3, 0.4]} castShadow receiveShadow>
                  <boxGeometry args={[1.8, 0.15, 1.4]} />
                  <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#F3F4F6'} wireframe={isWireframe} />
                </mesh>
                {/* Reddish-Brown Support Pillars */}
                <mesh position={[0.7, 0.65, 0.9]} castShadow>
                  <cylinderGeometry args={[0.07, 0.07, 1.3, 12]} />
                  <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#991B1B'} wireframe={isWireframe} />
                </mesh>
                <mesh position={[-0.7, 0.65, 0.9]} castShadow>
                  <cylinderGeometry args={[0.07, 0.07, 1.3, 12]} />
                  <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#991B1B'} wireframe={isWireframe} />
                </mesh>
                {/* Porch Slab Base */}
                <mesh position={[0, 0.05, 0.4]}>
                  <boxGeometry args={[1.85, 0.1, 1.45]} />
                  <meshStandardMaterial color="#E5E7EB" wireframe={isWireframe} />
                </mesh>
              </group>

              {/* Secondary Front Canopy (Center Front) */}
              <group position={[-0.6, 0, 1.8]}>
                <mesh position={[0, 0.85, 0.3]} castShadow>
                  <boxGeometry args={[1.2, 0.12, 1.0]} />
                  <meshStandardMaterial color="#F3F4F6" wireframe={isWireframe} />
                </mesh>
                <mesh position={[-0.5, 0.42, 0.6]} castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.85, 12]} />
                  <meshStandardMaterial color="#991B1B" wireframe={isWireframe} />
                </mesh>
                <mesh position={[0.4, 0.42, 0.6]} castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.85, 12]} />
                  <meshStandardMaterial color="#991B1B" wireframe={isWireframe} />
                </mesh>
                <mesh position={[0, 0.04, 0.3]}>
                  <boxGeometry args={[1.25, 0.08, 1.05]} />
                  <meshStandardMaterial color="#E5E7EB" wireframe={isWireframe} />
                </mesh>
              </group>

              {/* Left Side Upper Balconies with Cantilever Overhangs */}
              <group position={[-2.25, 0, 0]}>
                {/* Upper Balcony 1 */}
                <mesh position={[-0.4, 1.5, 0.7]} castShadow>
                  <boxGeometry args={[0.9, 0.1, 1.1]} />
                  <meshStandardMaterial color="#F3F4F6" wireframe={isWireframe} />
                </mesh>
                <mesh position={[-0.8, 1.65, 0.7]} castShadow>
                  <boxGeometry args={[0.1, 0.25, 1.1]} />
                  <meshStandardMaterial color="#E5E7EB" wireframe={isWireframe} />
                </mesh>
                {/* Upper Balcony 2 */}
                <mesh position={[-0.4, 1.5, -0.7]} castShadow>
                  <boxGeometry args={[0.9, 0.1, 1.1]} />
                  <meshStandardMaterial color="#F3F4F6" wireframe={isWireframe} />
                </mesh>
                <mesh position={[-0.8, 1.65, -0.7]} castShadow>
                  <boxGeometry args={[0.1, 0.25, 1.1]} />
                  <meshStandardMaterial color="#E5E7EB" wireframe={isWireframe} />
                </mesh>
                {/* Balcony Canopy Sunshade */}
                <mesh position={[-0.5, 2.0, 0]} castShadow>
                  <boxGeometry args={[1.1, 0.1, 2.8]} />
                  <meshStandardMaterial color="#E5E7EB" wireframe={isWireframe} />
                </mesh>
              </group>

              {/* Windows & Teal Glass Panes */}
              {/* Front Windows */}
              <mesh position={[0.4, 1.7, 1.81]}>
                <planeGeometry args={[0.8, 0.7]} />
                <meshStandardMaterial color="#0D9488" roughness={0.1} metalness={0.8} />
              </mesh>
              <mesh position={[-1.2, 1.7, 1.81]}>
                <planeGeometry args={[0.8, 0.7]} />
                <meshStandardMaterial color="#0D9488" roughness={0.1} metalness={0.8} />
              </mesh>
              <mesh position={[0.4, 0.6, 1.81]}>
                <planeGeometry args={[0.7, 0.6]} />
                <meshStandardMaterial color="#0D9488" roughness={0.1} metalness={0.8} />
              </mesh>
              <mesh position={[-1.2, 0.6, 1.81]}>
                <planeGeometry args={[0.7, 0.6]} />
                <meshStandardMaterial color="#0D9488" roughness={0.1} metalness={0.8} />
              </mesh>

              {/* Large Ground Entrance Glass Door (Under Canopy) */}
              <mesh position={[1.4, 0.7, 1.81]}>
                <planeGeometry args={[1.4, 1.0]} />
                <meshStandardMaterial color="#0D9488" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
              </mesh>

              {/* Right Side Glass Curtain Wall */}
              <mesh position={[2.21, 1.2, 0.2]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[1.8, 2.0]} />
                <meshStandardMaterial color="#0D9488" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
              </mesh>
            </group>
          )}

          {/* DATASET 1: Substation Grid */}
          {datasetType === 'substation' && (
            <group>
              {/* Transformer A */}
              <group position={[-1.6, 0.9, 0.4]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[2.6, 1.8, 2.0]} />
                  <meshStandardMaterial
                    color={isHeatmap ? '#22C55E' : isHeightmap ? '#10B981' : '#1E293B'}
                    roughness={0.4}
                    metalness={0.6}
                    wireframe={isWireframe}
                  />
                </mesh>
                {/* Radiator Fins */}
                <mesh position={[0, 0, 1.05]}>
                  <boxGeometry args={[2.2, 1.4, 0.1]} />
                  <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#334155'} wireframe={isWireframe} />
                </mesh>
                {/* Bushing terminals */}
                {[-0.8, 0, 0.8].map((xOff, i) => (
                  <mesh key={i} position={[xOff, 1.15, 0]}>
                    <cylinderGeometry args={[0.08, 0.14, 0.6, 10]} />
                    <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#F59E0B'} roughness={0.3} wireframe={isWireframe} />
                  </mesh>
                ))}
              </group>

              {/* Lattice Communication Tower B */}
              <group position={[1.8, 1.6, -1.0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.15, 0.35, 3.2, 4]} />
                  <meshStandardMaterial
                    color={isHeatmap ? '#22C55E' : isHeightmap ? '#F59E0B' : '#475569'}
                    wireframe={isWireframe}
                    metalness={0.8}
                  />
                </mesh>
                {/* Crossarms */}
                <mesh position={[0, 1.0, 0]}>
                  <boxGeometry args={[1.8, 0.12, 0.15]} />
                  <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#64748B'} wireframe={isWireframe} />
                </mesh>
                <mesh position={[0, 1.4, 0]}>
                  <boxGeometry args={[1.2, 0.1, 0.15]} />
                  <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#64748B'} wireframe={isWireframe} />
                </mesh>
              </group>

              {/* Switchgear Bay C */}
              <group position={[0.6, 0.35, 1.8]}>
                <mesh castShadow>
                  <boxGeometry args={[1.8, 0.7, 1.4]} />
                  <meshStandardMaterial
                    color={isHeatmap ? '#22C55E' : isHeightmap ? '#3B82F6' : '#1E293B'}
                    wireframe={isWireframe}
                  />
                </mesh>
              </group>

              {/* Water Retention Basin D (Low Confidence Area) */}
              <group position={[-2.2, 0.05, -2.0]}>
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[2.6, 0.15, 2.2]} />
                  <meshStandardMaterial color={isHeatmap ? '#F59E0B' : '#0F172A'} wireframe={isWireframe} />
                </mesh>
                <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[2.3, 1.9]} />
                  <meshStandardMaterial
                    color={isHeatmap ? '#EF4444' : '#0284C7'}
                    roughness={0.1}
                    metalness={0.9}
                    opacity={0.9}
                    transparent
                  />
                </mesh>
              </group>
            </group>
          )}

          {/* DATASET 2: Urban Canyon */}
          {datasetType === 'urban' && (
            <group>
              {/* High-Rise 1 */}
              <group position={[-1.4, 1.8, 0.6]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[2.0, 3.6, 2.2]} />
                  <meshStandardMaterial
                    color={isHeatmap ? '#22C55E' : isHeightmap ? '#EF4444' : '#1E293B'}
                    roughness={0.3}
                    metalness={0.7}
                    wireframe={isWireframe}
                  />
                </mesh>
              </group>
              {/* Glass Curtain Building 2 (Low Confidence Glass) */}
              <group position={[1.6, 1.4, -0.8]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.8, 2.8, 2.0]} />
                  <meshStandardMaterial
                    color={isHeatmap ? '#EF4444' : '#0369A1'}
                    roughness={0.1}
                    metalness={0.9}
                    wireframe={isWireframe}
                  />
                </mesh>
              </group>
              {/* Street Corridor */}
              <mesh position={[0, 0.01, 0]}>
                <planeGeometry args={[1.2, 10]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
            </group>
          )}

          {/* DATASET 3: Mountain Quarry */}
          {datasetType === 'quarry' && (
            <group>
              {/* Multi-tiered Benches */}
              {[0, 1, 2].map((lvl) => (
                <mesh key={lvl} position={[0, lvl * 0.5 + 0.25, 0]} receiveShadow>
                  <cylinderGeometry args={[4.5 - lvl * 1.1, 5.0 - lvl * 1.1, 0.5, 16]} />
                  <meshStandardMaterial
                    color={isHeatmap ? '#22C55E' : isHeightmap ? (lvl === 2 ? '#F59E0B' : '#10B981') : '#334155'}
                    roughness={0.9}
                    wireframe={isWireframe}
                  />
                </mesh>
              ))}
              {/* Excavation Bench Pit */}
              <mesh position={[0.2, 0.8, 0]}>
                <boxGeometry args={[1.5, 0.4, 1.2]} />
                <meshStandardMaterial color={isHeatmap ? '#22C55E' : '#475569'} wireframe={isWireframe} />
              </mesh>
            </group>
          )}

          {/* DATASET 4: Low-Light Factory Silos */}
          {datasetType === 'factory' && (
            <group>
              {/* 4 Silo Cluster */}
              {[
                [-0.8, -0.8],
                [-0.8, 0.8],
                [0.8, -0.8],
                [0.8, 0.8]
              ].map(([sx, sz], i) => (
                <group key={i} position={[sx, 1.1, sz]}>
                  <mesh castShadow>
                    <cylinderGeometry args={[0.6, 0.6, 2.2, 16]} />
                    <meshStandardMaterial
                      color={isHeatmap ? '#F59E0B' : isHeightmap ? '#10B981' : '#475569'}
                      roughness={0.4}
                      metalness={0.6}
                      wireframe={isWireframe}
                    />
                  </mesh>
                  {/* Conical Roof */}
                  <mesh position={[0, 1.3, 0]}>
                    <coneGeometry args={[0.65, 0.5, 16]} />
                    <meshStandardMaterial color={isHeatmap ? '#F59E0B' : '#334155'} wireframe={isWireframe} />
                  </mesh>
                </group>
              ))}
            </group>
          )}
        </group>
      )}

      {/* 3D Native Interactive Hotspot Beacons */}
      <group ref={beaconGroupRef}>
        {hotspots.map((hs) => {
          const isSelected = selectedHotspot?.id === hs.id;
          const isAmber = hs.statusColor === 'amber';
          const beaconColor = isSelected ? '#FFFFFF' : isAmber ? '#F59E0B' : '#22D3EE';

          return (
            <group
              key={hs.id}
              position={[hs.position[0], hs.position[1] + 0.3, hs.position[2]]}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectHotspot) onSelectHotspot(hs);
              }}
            >
              {/* 3D Diamond / Octahedron Beacon */}
              <mesh scale={isSelected ? [0.22, 0.28, 0.22] : [0.16, 0.20, 0.16]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color={beaconColor}
                  emissive={beaconColor}
                  emissiveIntensity={isSelected ? 1.2 : 0.6}
                  wireframe={false}
                />
              </mesh>

              {/* Pulsing Outer Orbit Ring */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.3, 0.02, 8, 24]} />
                <meshBasicMaterial color={beaconColor} transparent opacity={0.7} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
