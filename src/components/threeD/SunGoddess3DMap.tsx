import React, { useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import {
  CheckCircle2,
  Compass,
  Eye,
  Flame,
  Lock,
  Mountain,
  RotateCcw,
  ScrollText,
  Sun,
} from 'lucide-react';
import { StationStatus, SunGoddessStation } from '../../types/museum';
import { SafeImage } from '../common/SafeImage';

interface SunGoddess3DMapProps {
  stations: SunGoddessStation[];
  activeStationId: SunGoddessStation['id'];
  getStationStatus: (stationId: SunGoddessStation['id']) => StationStatus;
  onSelectStation: (stationId: SunGoddessStation['id']) => void;
  reducedMotion?: boolean;
}

const PALACE_COORDS = { x: 25, y: 10.6, z: 24 };

export function renderStationEmblem(
  emblemType: SunGoddessStation['emblemType'],
  className = 'w-4 h-4'
) {
  switch (emblemType) {
    case 'torch':
      return <Flame className={className} />;
    case 'mountain':
      return <Mountain className={className} />;
    case 'sun':
      return <Sun className={className} />;
    case 'scroll':
      return <ScrollText className={className} />;
  }
}

export const SunGoddess3DMap: React.FC<SunGoddess3DMapProps> = ({
  stations,
  activeStationId,
  getStationStatus,
  onSelectStation,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const targetGoalRef = useRef<Vector3>(new Vector3(0, 4.5, 0));
  const cameraRadiusGoalRef = useRef<number>(48);
  const stationRefs = useRef<
    Record<
      string,
      {
        beaconMat: StandardMaterial;
        ringMesh: Mesh;
        orbMesh: Mesh;
      }
    >
  >({});
  const connectorMatsRef = useRef<StandardMaterial[]>([]);
  const onSelectRef = useRef(onSelectStation);
  const getStatusRef = useRef(getStationStatus);
  const reducedMotionRef = useRef(reducedMotion);

  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [webglError, setWebglError] = useState<string | null>(null);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelectStation;
  }, [onSelectStation]);

  useEffect(() => {
    getStatusRef.current = getStationStatus;
  }, [getStationStatus]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  // Smoothly focus 3D camera toward the active station
  useEffect(() => {
    const active = stations.find((s) => s.id === activeStationId);
    if (active) {
      targetGoalRef.current = new Vector3(
        active.mapCoords.x,
        active.mapCoords.y + 1.5,
        active.mapCoords.z
      );
      cameraRadiusGoalRef.current = 24;
    }
  }, [activeStationId, stations]);

  // Update 3D beacon and path-connector illumination whenever station statuses change
  useEffect(() => {
    stations.forEach((station, idx) => {
      const status = getStationStatus(station.id);
      const entry = stationRefs.current[station.id];
      if (entry) {
        if (status === 'completed') {
          entry.beaconMat.diffuseColor = Color3.FromHexString('#1E7A56');
          entry.beaconMat.emissiveColor = Color3.FromHexString('#2FA877');
        } else if (status === 'active') {
          entry.beaconMat.diffuseColor = Color3.FromHexString('#DCA847');
          entry.beaconMat.emissiveColor = Color3.FromHexString('#F0B949');
        } else {
          entry.beaconMat.diffuseColor = Color3.FromHexString('#6B6053');
          entry.beaconMat.emissiveColor = Color3.FromHexString('#1E1812');
        }
      }

      const connectorMat = connectorMatsRef.current[idx];
      if (connectorMat) {
        const nextStation = stations[idx + 1];
        const nextStatus = nextStation ? getStationStatus(nextStation.id) : status;
        if (status === 'completed') {
          connectorMat.diffuseColor = Color3.FromHexString('#F2C15A');
          connectorMat.emissiveColor = Color3.FromHexString('#C88924');
        } else if (status === 'active' || nextStatus !== 'locked') {
          connectorMat.diffuseColor = Color3.FromHexString('#D39A3B');
          connectorMat.emissiveColor = Color3.FromHexString('#7B5212');
        } else {
          connectorMat.diffuseColor = Color3.FromHexString('#5B5044');
          connectorMat.emissiveColor = Color3.FromHexString('#1C1611');
        }
      }
    });
  }, [stations, getStationStatus, activeStationId, sceneReady]);

  const handleResetOverview = () => {
    targetGoalRef.current = new Vector3(1, 4.5, 1);
    cameraRadiusGoalRef.current = 52;
    if (cameraRef.current) {
      cameraRef.current.alpha = -Math.PI / 2.35;
      cameraRef.current.beta = Math.PI / 3.1;
    }
  };

  useEffect(() => {
    if (viewMode !== '3d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: Engine | null = null;
    let scene: Scene | null = null;

    const handleContextLost = (ev: Event) => {
      ev.preventDefault();
      setWebglError('Trình duyệt tạm ngừng đồ họa WebGL. Đã chuyển sang chế độ bản đồ 2D minh họa.');
    };
    const handleContextRestored = () => {
      setWebglError(null);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    try {
      engine = new Engine(canvas, true, {
        preserveDrawingBuffer: false,
        stencil: true,
        antialias: true,
      });

      scene = new Scene(engine);
      scene.clearColor = new Color4(0.11, 0.08, 0.06, 1);
      scene.fogMode = Scene.FOGMODE_EXP2;
      scene.fogColor = new Color3(0.24, 0.17, 0.11);
      scene.fogDensity = 0.0085;

      const camera = new ArcRotateCamera(
        'SunGoddessMapCam',
        -Math.PI / 2.35,
        Math.PI / 3.1,
        52,
        new Vector3(1, 4.5, 1),
        scene
      );
      camera.attachControl(canvas, true);
      camera.lowerRadiusLimit = 15;
      camera.upperRadiusLimit = 72;
      camera.lowerBetaLimit = 0.35;
      camera.upperBetaLimit = Math.PI / 2.15;
      camera.wheelPrecision = 14;
      camera.panningSensibility = 120;
      cameraRef.current = camera;

      // Atmospheric dawn lighting
      const hemiLight = new HemisphericLight('DawnHemi', new Vector3(0.2, 1, 0.3), scene);
      hemiLight.intensity = 0.85;
      hemiLight.diffuse = new Color3(1.0, 0.92, 0.78);
      hemiLight.groundColor = new Color3(0.17, 0.24, 0.17);

      const sunLight = new DirectionalLight('SunDirectional', new Vector3(-0.6, -0.8, -0.5), scene);
      sunLight.position = new Vector3(32, 34, 30);
      sunLight.intensity = 1.45;
      sunLight.diffuse = new Color3(1.0, 0.84, 0.56);

      const palaceLight = new PointLight(
        'PalaceGlow',
        new Vector3(PALACE_COORDS.x, PALACE_COORDS.y + 5, PALACE_COORDS.z),
        scene
      );
      palaceLight.diffuse = new Color3(1.0, 0.78, 0.35);
      palaceLight.intensity = 2.6;
      palaceLight.range = 38;

      // Materials
      const valleyGroundMat = new StandardMaterial('valleyGroundMat', scene);
      valleyGroundMat.diffuseColor = Color3.FromHexString('#1E3B2B');
      valleyGroundMat.specularColor = new Color3(0.05, 0.05, 0.05);

      const rockMat = new StandardMaterial('rockMat', scene);
      rockMat.diffuseColor = Color3.FromHexString('#4D3D2F');
      rockMat.specularColor = new Color3(0.08, 0.07, 0.05);

      const peakGoldMat = new StandardMaterial('peakGoldMat', scene);
      peakGoldMat.diffuseColor = Color3.FromHexString('#7A5B36');
      peakGoldMat.emissiveColor = new Color3(0.12, 0.08, 0.02);

      const trunkMat = new StandardMaterial('trunkMat', scene);
      trunkMat.diffuseColor = Color3.FromHexString('#4A321F');

      const leafDarkMat = new StandardMaterial('leafDarkMat', scene);
      leafDarkMat.diffuseColor = Color3.FromHexString('#1A4A33');

      const leafWarmMat = new StandardMaterial('leafWarmMat', scene);
      leafWarmMat.diffuseColor = Color3.FromHexString('#276243');

      const pathStoneMat = new StandardMaterial('pathStoneMat', scene);
      pathStoneMat.diffuseColor = Color3.FromHexString('#8B6B46');
      pathStoneMat.specularColor = new Color3(0.1, 0.08, 0.05);

      const palaceMat = new StandardMaterial('palaceMat', scene);
      palaceMat.diffuseColor = Color3.FromHexString('#D8A143');
      palaceMat.emissiveColor = new Color3(0.28, 0.16, 0.04);

      const solarCoreMat = new StandardMaterial('solarCoreMat', scene);
      solarCoreMat.diffuseColor = Color3.FromHexString('#FFE28A');
      solarCoreMat.emissiveColor = Color3.FromHexString('#FFB938');

      const mistMat = new StandardMaterial('mistMat', scene);
      mistMat.diffuseColor = Color3.FromHexString('#F4D59A');
      mistMat.emissiveColor = Color3.FromHexString('#C98F3A');
      mistMat.alpha = 0.22;

      // 1. Base valley ground
      const ground = MeshBuilder.CreateGround('valleyGround', { width: 96, height: 96 }, scene);
      ground.material = valleyGroundMat;
      ground.position.y = 0;

      // 2. Mountain ridges & terraced elevation plateaus along the ascent
      const mountainSpecs = [
        { x: -24, y: 5.5, z: -24, h: 12, d: 14 },
        { x: -28, y: 7, z: -5, h: 15, d: 13 },
        { x: -16, y: 8, z: 14, h: 17, d: 15 },
        { x: 6, y: 7.5, z: -20, h: 16, d: 14 },
        { x: 22, y: 9, z: -8, h: 19, d: 16 },
        { x: 29, y: 12, z: 12, h: 24, d: 16 },
        { x: 11, y: 11.5, z: 28, h: 23, d: 16 },
        { x: 28, y: 13.5, z: 29, h: 28, d: 18 },
      ];
      mountainSpecs.forEach((m, idx) => {
        const peak = MeshBuilder.CreateCylinder(
          `mountain_${idx}`,
          { diameterTop: m.d * 0.18, diameterBottom: m.d, height: m.h, tessellation: 6 },
          scene!
        );
        peak.position = new Vector3(m.x, m.y, m.z);
        peak.rotation.y = idx * 0.7;
        peak.material = idx >= 5 ? peakGoldMat : rockMat;
      });

      // Elevated terraces supporting stations 2, 3, 4 and the Palace
      const terraces = [
        { x: -18, y: 0.5, z: -16, d: 8.5, h: 1.2 },
        { x: -6, y: 1.6, z: -4, d: 9, h: 3.4 },
        { x: 7, y: 3.0, z: 7, d: 9.5, h: 6.2 },
        { x: 18, y: 4.5, z: 18, d: 10, h: 9.2 },
        { x: PALACE_COORDS.x, y: 5.2, z: PALACE_COORDS.z, d: 13, h: 10.6 },
      ];
      terraces.forEach((t, idx) => {
        const plateau = MeshBuilder.CreateCylinder(
          `terrace_${idx}`,
          { diameterTop: t.d, diameterBottom: t.d + 3.8, height: t.h, tessellation: 8 },
          scene!
        );
        plateau.position = new Vector3(t.x, t.y, t.z);
        plateau.material = idx === terraces.length - 1 ? peakGoldMat : rockMat;
      });

      // 3. Đại ngàn forest trees around the lower & mid trail
      const treeSpots = [
        [-22, -10], [-14, -22], [-10, -14], [-25, -18], [-15, -6],
        [-2, -14], [4, -10], [-14, 4], [-9, 10], [-1, 4],
        [13, -3], [16, 4], [2, 16], [-6, -21], [-21, 2],
      ];
      treeSpots.forEach(([tx, tz], idx) => {
        const baseY = tx > 0 && tz > 0 ? 3.2 : 0.4;
        const trunk = MeshBuilder.CreateCylinder(
          `treeTrunk_${idx}`,
          { diameterTop: 0.28, diameterBottom: 0.5, height: 2.2, tessellation: 6 },
          scene!
        );
        trunk.position = new Vector3(tx, baseY + 1.0, tz);
        trunk.material = trunkMat;

        const crown = MeshBuilder.CreateCylinder(
          `treeCrown_${idx}`,
          { diameterTop: 0.4, diameterBottom: 2.6, height: 3.1, tessellation: 7 },
          scene!
        );
        crown.position = new Vector3(tx, baseY + 2.9, tz);
        crown.material = idx % 2 === 0 ? leafDarkMat : leafWarmMat;
      });

      // 4. Winding forest & mountain trail + glowing progress paths between stations
      const waypoints = [
        ...stations.map((s) => new Vector3(s.mapCoords.x, s.mapCoords.y + 0.15, s.mapCoords.z)),
        new Vector3(PALACE_COORDS.x, PALACE_COORDS.y + 0.15, PALACE_COORDS.z),
      ];

      connectorMatsRef.current = [];
      for (let i = 0; i < waypoints.length - 1; i++) {
        const start = waypoints[i];
        const end = waypoints[i + 1];
        const segmentMat = new StandardMaterial(`connectorMat_${i}`, scene);
        segmentMat.diffuseColor = Color3.FromHexString('#D39A3B');
        segmentMat.emissiveColor = Color3.FromHexString('#7B5212');
        connectorMatsRef.current.push(segmentMat);

        const steps = 10;
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          // Gentle organic curve offset
          const arcOffset = Math.sin(t * Math.PI) * (i % 2 === 0 ? 1.8 : -1.8);
          const px = start.x + (end.x - start.x) * t + arcOffset;
          const py = start.y + (end.y - start.y) * t;
          const pz = start.z + (end.z - start.z) * t - arcOffset * 0.45;

          const steppingStone = MeshBuilder.CreateBox(
            `trailStone_${i}_${s}`,
            { width: 1.5, height: 0.35, depth: 1.5 },
            scene
          );
          steppingStone.position = new Vector3(px, py - 0.15, pz);
          steppingStone.material = pathStoneMat;

          const glowOrb = MeshBuilder.CreateSphere(
            `trailGlow_${i}_${s}`,
            { diameter: 0.55, segments: 8 },
            scene
          );
          glowOrb.position = new Vector3(px, py + 0.25, pz);
          glowOrb.material = segmentMat;
        }
      }

      // 5. Cung điện Nữ thần Mặt Trời at the summit endpoint
      const palaceRoot = new TransformNode('SunPalaceRoot', scene);
      palaceRoot.position = new Vector3(PALACE_COORDS.x, PALACE_COORDS.y, PALACE_COORDS.z);

      const dais = MeshBuilder.CreateCylinder(
        'palaceDais',
        { diameter: 9.2, height: 0.9, tessellation: 12 },
        scene
      );
      dais.position.y = 0.45;
      dais.parent = palaceRoot;
      dais.material = palaceMat;

      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2;
        const pillar = MeshBuilder.CreateCylinder(
          `palacePillar_${p}`,
          { diameter: 0.72, height: 5.2, tessellation: 8 },
          scene
        );
        pillar.position = new Vector3(Math.cos(angle) * 3.3, 3.2, Math.sin(angle) * 3.3);
        pillar.parent = palaceRoot;
        pillar.material = palaceMat;
      }

      const dome = MeshBuilder.CreateSphere(
        'palaceDome',
        { diameter: 5.6, slice: 0.55, segments: 12 },
        scene
      );
      dome.position.y = 5.5;
      dome.parent = palaceRoot;
      dome.material = palaceMat;

      const solarOrb = MeshBuilder.CreateSphere(
        'palaceSolarOrb',
        { diameter: 2.3, segments: 14 },
        scene
      );
      solarOrb.position.y = 3.6;
      solarOrb.parent = palaceRoot;
      solarOrb.material = solarCoreMat;

      const solarHalo = MeshBuilder.CreateTorus(
        'palaceHalo',
        { diameter: 6.2, thickness: 0.26, tessellation: 28 },
        scene
      );
      solarHalo.position.y = 7.4;
      solarHalo.rotation.x = Math.PI / 3;
      solarHalo.parent = palaceRoot;
      solarHalo.material = solarCoreMat;

      // 6. Four interactive station pedestals & clickable beacons
      stationRefs.current = {};
      stations.forEach((station) => {
        const sNode = new TransformNode(`stationNode_${station.id}`, scene!);
        sNode.position = new Vector3(station.mapCoords.x, station.mapCoords.y, station.mapCoords.z);

        const basePedestal = MeshBuilder.CreateCylinder(
          `stationBase_${station.id}`,
          { diameterTop: 2.8, diameterBottom: 3.4, height: 0.9, tessellation: 8 },
          scene!
        );
        basePedestal.position.y = 0.45;
        basePedestal.parent = sNode;
        basePedestal.material = rockMat;
        basePedestal.metadata = { stationId: station.id };

        const beaconMat = new StandardMaterial(`beaconMat_${station.id}`, scene!);
        beaconMat.diffuseColor = Color3.FromHexString('#DCA847');
        beaconMat.emissiveColor = Color3.FromHexString('#F0B949');

        const orbMesh = MeshBuilder.CreatePolyhedron(
          `stationOrb_${station.id}`,
          { type: 1, size: 1.05 },
          scene!
        );
        orbMesh.position.y = 2.6;
        orbMesh.parent = sNode;
        orbMesh.material = beaconMat;
        orbMesh.metadata = { stationId: station.id };

        const ringMesh = MeshBuilder.CreateTorus(
          `stationRing_${station.id}`,
          { diameter: 3.1, thickness: 0.18, tessellation: 20 },
          scene!
        );
        ringMesh.position.y = 1.2;
        ringMesh.parent = sNode;
        ringMesh.material = beaconMat;
        ringMesh.metadata = { stationId: station.id };

        stationRefs.current[station.id] = { beaconMat, ringMesh, orbMesh };
      });

      // 7. Mythic clouds & floating golden motes
      const mistDiscs: Mesh[] = [];
      for (let m = 0; m < 8; m++) {
        const cloud = MeshBuilder.CreateSphere(
          `mythicCloud_${m}`,
          { diameterX: 9 + (m % 3) * 2.5, diameterY: 1.4, diameterZ: 6.5, segments: 8 },
          scene
        );
        cloud.position = new Vector3(-22 + m * 7, 3.2 + (m % 4) * 2.1, 14 - (m % 3) * 11);
        cloud.material = mistMat;
        mistDiscs.push(cloud);
      }

      // Clickable 3D station picking
      scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === 1 /* POINTERDOWN */) {
          const picked = pointerInfo.pickInfo?.pickedMesh;
          const sid = picked?.metadata?.stationId as SunGoddessStation['id'] | undefined;
          if (sid) {
            onSelectRef.current(sid);
          }
        }
      });

      let elapsed = 0;
      engine.runRenderLoop(() => {
        if (!scene) return;
        const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
        elapsed += dt;

        // Smooth camera target & radius focus
        camera.target = Vector3.Lerp(camera.target, targetGoalRef.current, 0.08);
        camera.radius += (cameraRadiusGoalRef.current - camera.radius) * 0.06;

        if (!reducedMotionRef.current) {
          solarHalo.rotation.z = elapsed * 0.55;
          solarHalo.rotation.y = elapsed * 0.3;
          solarOrb.position.y = 3.6 + Math.sin(elapsed * 2) * 0.25;

          stations.forEach((st, idx) => {
            const entry = stationRefs.current[st.id];
            if (!entry) return;
            const stStatus = getStatusRef.current(st.id);
            const speed = stStatus === 'active' ? 1.8 : 0.7;
            entry.orbMesh.rotation.y = elapsed * speed + idx;
            entry.orbMesh.position.y = 2.6 + Math.sin(elapsed * 2.4 + idx) * 0.22;
            entry.ringMesh.rotation.z = elapsed * 0.4;
          });

          mistDiscs.forEach((cloud, idx) => {
            cloud.position.x += Math.sin(elapsed * 0.25 + idx) * 0.008;
          });
        }

        scene.render();
      });

      const handleResize = () => engine?.resize();
      window.addEventListener('resize', handleResize);
      setSceneReady(true);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        scene?.dispose();
        engine?.dispose();
      };
    } catch {
      setWebglError('Thiết bị chưa hỗ trợ WebGL 3D. Đang hiển thị bản đồ minh họa 2D.');
    }

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      scene?.dispose();
      engine?.dispose();
    };
  }, [viewMode, stations]);

  const show2DFallback = viewMode === '2d' || Boolean(webglError);

  return (
    <section
      aria-label="Bản đồ phiêu lưu 3D Con đường đến Nữ thần Mặt Trời"
      className="rounded-2xl overflow-hidden border border-wood-800 bg-wood-950 text-cream shadow-lg"
    >
      {/* Map Viewport */}
      <div className="relative h-[400px] sm:h-[470px] w-full overflow-hidden">
        {!show2DFallback ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full block outline-none cursor-grab active:cursor-grabbing"
          />
        ) : (
          <div className="relative w-full h-full">
            <SafeImage
              src="/src/assets/images/sun_goddess_palace_epic_1794540838277.jpg"
              alt="Bản đồ minh họa Con đường đến Nữ thần Mặt Trời"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-wood-950/60" />

            {/* Interactive SVG Adventure Path Overlay for 2D / Low-Spec Mode */}
            <svg
              viewBox="0 0 1000 420"
              className="absolute inset-0 w-full h-full"
              aria-label="Lộ trình 4 trạm đến Cung điện Nữ thần Mặt Trời"
            >
              <defs>
                <linearGradient id="epicTrailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1E7A56" />
                  <stop offset="50%" stopColor="#DCA847" />
                  <stop offset="100%" stopColor="#FFE28A" />
                </linearGradient>
              </defs>
              <path
                d="M 110 340 Q 250 260, 355 255 T 615 170 T 860 88"
                fill="none"
                stroke="url(#epicTrailGrad)"
                strokeWidth="7"
                strokeDasharray="12 8"
                opacity="0.9"
              />
              {[
                { x: 110, y: 340, idx: 0 },
                { x: 355, y: 255, idx: 1 },
                { x: 615, y: 170, idx: 2 },
                { x: 830, y: 100, idx: 3 },
              ].map(({ x, y, idx }) => {
                const st = stations[idx];
                const status = getStationStatus(st.id);
                const isSelected = activeStationId === st.id;
                const fill =
                  status === 'completed'
                    ? '#1E7A56'
                    : status === 'active'
                      ? '#DCA847'
                      : '#4F3C2A';
                return (
                  <g
                    key={st.id}
                    onClick={() => onSelectStation(st.id)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle cx={x} cy={y} r="32" fill="none" stroke="#FFE28A" strokeWidth="2.5" />
                    )}
                    <circle cx={x} cy={y} r="22" fill={fill} stroke="#F8F4EC" strokeWidth="2.5" />
                    <text
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      fill="#F8F4EC"
                      fontSize="14"
                      fontWeight="700"
                    >
                      0{st.stepNumber}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Top Floating Semantic Map Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-start justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto bg-wood-950/75 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5 max-w-lg">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-400">
              Bản đồ phiêu lưu sử thi 3D
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream leading-tight">
              Con Đường Đến Nữ Thần Mặt Trời
            </h2>
            <p className="text-xs text-cream/80 mt-0.5">
              Đại ngàn · Đường xuyên rừng · Núi đá · Cung điện Nữ thần Mặt Trời ở điểm cuối
            </p>
          </div>

          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            {!show2DFallback && (
              <button
                type="button"
                onClick={handleResetOverview}
                className="px-3 py-2 text-xs font-medium bg-wood-950/80 hover:bg-wood-900 text-cream border border-white/15 rounded-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-sm whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gold-400" />
                <span>Toàn cảnh 3D</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === '3d' ? '2d' : '3d'))}
              className="px-3 py-2 text-xs font-medium bg-wood-950/80 hover:bg-wood-900 text-cream border border-white/15 rounded-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-sm whitespace-nowrap shrink-0"
            >
              <Eye className="w-3.5 h-3.5 text-gold-400" />
              <span>{show2DFallback ? 'Bật bản đồ 3D' : 'Chế độ 2D nhẹ'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-xs">
          <div className="pointer-events-auto bg-wood-950/75 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-cream/85 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span>
              {show2DFallback
                ? webglError || 'Nhấn vào từng trạm trên lộ trình để khám phá.'
                : 'Kéo chuột để xoay góc nhìn · Cuộn để thu phóng · Nhấn trực tiếp vào cột sáng trạm 3D'}
            </span>
          </div>
        </div>
      </div>

      {/* Synchronized 4-Station Route Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-wood-800 bg-wood-900">
        {stations.map((station) => {
          const status = getStationStatus(station.id);
          const isSelected = activeStationId === station.id;
          const statusMeta =
            status === 'completed'
              ? { label: 'Hoàn thành', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, textClass: 'text-emerald-300' }
              : status === 'active'
                ? { label: 'Đang thực hiện', icon: <Sun className="w-3.5 h-3.5 text-gold-400" />, textClass: 'text-gold-300' }
                : { label: 'Chưa khám phá', icon: <Lock className="w-3.5 h-3.5 text-cream/50" />, textClass: 'text-cream/60' };

          return (
            <button
              key={station.id}
              type="button"
              onClick={() => onSelectStation(station.id)}
              className={`p-4 text-left transition-colors border-b sm:border-b-0 sm:border-r last:border-r-0 border-wood-800 flex items-start gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-wood-800/95 ring-1 ring-inset ring-gold-400/70'
                  : status === 'locked'
                    ? 'bg-wood-950/60 opacity-75 hover:opacity-95'
                    : 'bg-wood-900 hover:bg-wood-800/60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  status === 'completed'
                    ? 'bg-forest-800 border-emerald-500/40 text-emerald-300'
                    : status === 'active'
                      ? 'bg-gold-600/20 border-gold-400/50 text-gold-300'
                      : 'bg-wood-950 border-wood-700 text-cream/50'
                }`}
              >
                {renderStationEmblem(station.emblemType, 'w-4 h-4')}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono tabular-nums text-cream/65">TRẠM 0{station.stepNumber}</span>
                  <span className={`inline-flex items-center gap-1 font-medium whitespace-nowrap ${statusMeta.textClass}`}>
                    {statusMeta.icon}
                    <span>{statusMeta.label}</span>
                  </span>
                </div>
                <p className="font-serif text-base font-bold text-cream leading-snug">
                  {station.shortName.replace(/^Trạm \d · /, '')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
