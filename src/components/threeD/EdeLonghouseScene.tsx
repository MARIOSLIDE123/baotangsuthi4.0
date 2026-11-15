import React, { useEffect, useRef, useState } from 'react';
import {
  Animation,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  DynamicTexture,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  PointLight,
  PointerEventTypes,
  QuadraticEase,
  EasingFunction,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Tools,
  TransformNode,
  Vector3,
  VertexData,
} from '@babylonjs/core';
import {
  CameraMode,
  ExhibitionMode,
  LONGHOUSE_3D_CONFIG,
} from '../../config/longhouse3dConfig';
import { MUSEUM_3D_HOTSPOTS } from '../../data/museum3dData';
import { Museum3DHotspot } from '../../types/museum';

export type QualityPreset = 'high' | 'medium' | 'low';

// --- Tour Point System ---
export interface TourPoint {
  id: string;
  label: string;
  area: 'A' | 'B';
  camAlpha: number;
  camBeta: number;
  camRadius: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  neighbors: { up?: string; down?: string; left?: string; right?: string };
}

export const TOUR_POINTS: TourPoint[] = [
  { id: 'tp-entrance',     label: 'Cửa vào Gian Gah',       area: 'A', camAlpha: -1.57, camBeta: 1.20, camRadius: 22, targetX:  0,    targetY: 2.0, targetZ: 16,   neighbors: { down: 'tp-porch' } },
  { id: 'tp-porch',        label: 'Hiên Dring đón khách',    area: 'A', camAlpha: -1.57, camBeta: 1.10, camRadius: 14, targetX:  0,    targetY: 2.0, targetZ: 12,   neighbors: { up: 'tp-entrance', down: 'tp-gah-overview' } },
  { id: 'tp-gah-overview', label: 'Toàn cảnh Gian Gah',      area: 'B', camAlpha: -1.57, camBeta: 1.00, camRadius: 10, targetX:  0,    targetY: 3.0, targetZ:  4,   neighbors: { up: 'tp-porch', down: 'tp-hearth', left: 'tp-kpan', right: 'tp-gong' } },
  { id: 'tp-hearth',       label: 'Bếp lửa & Kể Khan',       area: 'B', camAlpha: -1.57, camBeta: 1.10, camRadius:  5.5, targetX: 0,  targetY: 2.8, targetZ:  4.2, neighbors: { up: 'tp-gah-overview', down: 'tp-ok-entry', left: 'tp-kpan', right: 'tp-jars' } },
  { id: 'tp-kpan',         label: 'Ghế Kpan đại ngàn',       area: 'B', camAlpha: -2.50, camBeta: 1.00, camRadius:  5.5, targetX:-3.3, targetY: 2.5, targetZ:  5.8, neighbors: { right: 'tp-hearth', down: 'tp-ok-entry' } },
  { id: 'tp-gong',         label: 'Cồng Chiêng & Trống',     area: 'B', camAlpha: -0.60, camBeta: 1.00, camRadius:  5.5, targetX: 3.0, targetY: 2.8, targetZ:  6.8, neighbors: { left: 'tp-hearth', down: 'tp-jars' } },
  { id: 'tp-jars',         label: 'Ché cổ & Rượu cần',       area: 'B', camAlpha: -0.50, camBeta: 1.10, camRadius:  5.5, targetX: 3.4, targetY: 2.5, targetZ:  2.2, neighbors: { up: 'tp-gong', left: 'tp-hearth', down: 'tp-ok-entry' } },
  { id: 'tp-ok-entry',     label: 'Vào Gian Ôk',             area: 'B', camAlpha: -1.57, camBeta: 1.00, camRadius:  8,   targetX: 0,   targetY: 3.0, targetZ: -2,   neighbors: { up: 'tp-hearth', down: 'tp-loom', left: 'tp-baskets' } },
  { id: 'tp-loom',         label: 'Khung dệt thổ cẩm',       area: 'B', camAlpha: -0.80, camBeta: 1.10, camRadius:  5.5, targetX: 2.4, targetY: 2.5, targetZ: -4.5, neighbors: { up: 'tp-ok-entry', right: 'tp-baskets', down: 'tp-mortar' } },
  { id: 'tp-baskets',      label: 'Gùi Đới & Đồ mây tre',    area: 'B', camAlpha: -2.30, camBeta: 1.10, camRadius:  5.5, targetX:-2.8, targetY: 2.5, targetZ: -4.2, neighbors: { up: 'tp-ok-entry', left: 'tp-loom' } },
  { id: 'tp-mortar',       label: 'Cối chày giã gạo',         area: 'B', camAlpha: -0.80, camBeta: 1.10, camRadius:  5.5, targetX: 2.5, targetY: 2.5, targetZ: -8.8, neighbors: { up: 'tp-loom' } },
];

interface EdeLonghouseSceneProps {
  quality: QualityPreset;
  exhibitionMode: ExhibitionMode;
  cameraMode: CameraMode;
  completedHotspotIds: string[];
  screenshotNonce?: number | null;
  currentTourPointId?: string;
  onInteractHotspot: (hotspot: Museum3DHotspot) => void;
  onNavigateFnReady?: (fn: (id: string) => void) => void;
  onTourPointChange?: (point: TourPoint, id: string) => void;
  onExitFallback: () => void;
}

export const EdeLonghouseScene: React.FC<EdeLonghouseSceneProps> = ({
  quality,
  exhibitionMode,
  cameraMode,
  completedHotspotIds,
  screenshotNonce,
  currentTourPointId,
  onInteractHotspot,
  onNavigateFnReady,
  onTourPointChange,
  onExitFallback,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const tourCameraRef = useRef<ArcRotateCamera | null>(null);
  const orbitCameraRef = useRef<ArcRotateCamera | null>(null);

  const completedRef = useRef<string[]>(completedHotspotIds);
  const exhibitionModeRef = useRef<ExhibitionMode>(exhibitionMode);
  const festiveMeshesRef = useRef<Mesh[]>([]);
  const dailyMeshesRef = useRef<Mesh[]>([]);
  const hearthLightRef = useRef<PointLight | null>(null);
  const currentTourPointIdRef = useRef<string>('tp-entrance');

  const [loading, setLoading] = useState(true);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Museum3DHotspot | null>(null);

  useEffect(() => {
    completedRef.current = completedHotspotIds;
  }, [completedHotspotIds]);

  // Update exhibition mode visibility (daily vs festive)
  useEffect(() => {
    exhibitionModeRef.current = exhibitionMode;
    const isFestive = exhibitionMode === 'festive';

    festiveMeshesRef.current.forEach((m) => {
      m.setEnabled(isFestive);
    });
    dailyMeshesRef.current.forEach((m) => {
      m.setEnabled(!isFestive);
    });

    if (hearthLightRef.current) {
      hearthLightRef.current.intensity = isFestive ? 3.0 : 1.8;
      hearthLightRef.current.range = isFestive ? 16 : 12;
    }
  }, [exhibitionMode]);

  // Handle camera mode switch
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (cameraMode === 'orbit') {
      if (orbitCameraRef.current) {
        scene.activeCamera = orbitCameraRef.current;
        orbitCameraRef.current.attachControl(canvasRef.current, true);
      }
    } else {
      if (tourCameraRef.current) {
        scene.activeCamera = tourCameraRef.current;
        tourCameraRef.current.attachControl(canvasRef.current, true);
      }
    }
  }, [cameraMode]);

  // Handle screenshot capture
  useEffect(() => {
    if (!screenshotNonce || !sceneRef.current || !canvasRef.current) return;
    try {
      Tools.CreateScreenshotUsingRenderTarget(
        sceneRef.current.getEngine(),
        sceneRef.current.activeCamera || tourCameraRef.current!,
        { precision: 1.5 },
        (data) => {
          const a = document.createElement('a');
          a.href = data;
          a.download = `baotang-suthi-ede-3d-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      );
    } catch {
      const canvas = canvasRef.current;
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `baotang-suthi-ede-3d-${Date.now()}.png`;
      a.click();
    }
  }, [screenshotNonce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: Engine | null = null;
    let scene: Scene | null = null;
    const preset = LONGHOUSE_3D_CONFIG.performancePresets[quality] || LONGHOUSE_3D_CONFIG.performancePresets.high;

    const handleContextLost = (ev: Event) => {
      ev.preventDefault();
      setWebglError('Trình duyệt tạm ngừng ngữ cảnh đồ họa WebGL.');
    };
    const handleContextRestored = () => {
      setWebglError(null);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    try {
      engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: quality !== 'low',
        powerPreference: 'high-performance',
      });
      engineRef.current = engine;
      engine.setHardwareScalingLevel(preset.hardwareScaling);

      scene = new Scene(engine);
      sceneRef.current = scene;

      // Bright, vibrant atmospheric clear color & tone mapping
      scene.clearColor = new Color4(0.55, 0.7, 0.85, 1.0);
      scene.ambientColor = new Color3(0.55, 0.52, 0.48);

      if (scene.imageProcessingConfiguration) {
        scene.imageProcessingConfiguration.toneMappingEnabled = true;
        scene.imageProcessingConfiguration.toneMappingType = 1; // ACES Filmic Tone Mapping
        scene.imageProcessingConfiguration.exposure = 1.35; // Bright exposure for clear interior visibility
        scene.imageProcessingConfiguration.contrast = 1.15;
      }

      // Highlands Mist / Light Fog
      scene.fogMode = Scene.FOGMODE_EXP2;
      scene.fogDensity = LONGHOUSE_3D_CONFIG.world.fogDensity;
      scene.fogColor = Color3.FromArray(LONGHOUSE_3D_CONFIG.world.fogColorRgb);

      // Collisions & Physics Gravity
      scene.collisionsEnabled = true;
      scene.gravity = new Vector3(0, LONGHOUSE_3D_CONFIG.world.gravityY, 0);

      // 1. Natural Bright Highlands Lighting Setup
      // Sky Hemispheric Ambient Light (Bright fill)
      const hemiLight = new HemisphericLight('hemiSkyLight', new Vector3(0, 1, 0), scene);
      hemiLight.intensity = 1.1;
      hemiLight.diffuse = new Color3(1.0, 0.98, 0.95);
      hemiLight.groundColor = new Color3(0.45, 0.38, 0.3);

      // Sun Directional Light with Warm Golden Angle
      const sunLight = new DirectionalLight(
        'sunLight',
        new Vector3(-0.6, -1.1, -0.7).normalize(),
        scene
      );
      sunLight.position = new Vector3(35, 60, 45);
      sunLight.intensity = 1.85;
      sunLight.diffuse = new Color3(1.0, 0.96, 0.88);
      sunLight.specular = new Color3(0.4, 0.35, 0.28);

      let shadowGen: ShadowGenerator | null = null;
      if (preset.shadowsEnabled) {
        shadowGen = new ShadowGenerator(preset.shadowMapSize, sunLight);
        shadowGen.usePoissonSampling = true;
        shadowGen.bias = 0.002;
        shadowGen.normalBias = 0.02;
        shadowGen.darkness = 0.3;
      }

      const addShadow = (mesh: Mesh, receive = true) => {
        if (shadowGen) shadowGen.addShadowCaster(mesh);
        if (receive) mesh.receiveShadows = true;
      };

      // --- Enhanced Interior Illumination for clear visibility of all objects ---
      // 4 Ambient interior fill lights distributed along the roof ridge
      const interiorZSpots = [8.5, 3.0, -3.5, -9.0];
      interiorZSpots.forEach((iz, idx) => {
        const fillLight = new PointLight(`interiorFill_${idx}`, new Vector3(0, 4.2, iz), scene!);
        fillLight.diffuse = new Color3(1.0, 0.92, 0.82);
        fillLight.intensity = 1.35;
        fillLight.range = 14.0;
      });

      // Interior Hearth Light in Gian Gah (Central Guest Fireplace)
      const hearthGahLight = new PointLight('hearthGahLight', new Vector3(0, 2.7, 4.2), scene);
      hearthGahLight.diffuse = new Color3(1.0, 0.58, 0.18);
      hearthGahLight.specular = new Color3(0.8, 0.35, 0.1);
      hearthGahLight.intensity = 2.2;
      hearthGahLight.range = 14.0;
      hearthLightRef.current = hearthGahLight;

      // Interior Hearth Light in Gian Ôk (Family Kitchen)
      const hearthOkLight = new PointLight('hearthOkLight', new Vector3(-1.2, 2.7, -7.5), scene);
      hearthOkLight.diffuse = new Color3(1.0, 0.55, 0.15);
      hearthOkLight.intensity = 1.8;
      hearthOkLight.range = 12.0;

      // 2. Procedural Textures for Organic PBR Materials
      const pal = LONGHOUSE_3D_CONFIG.palette;

      const makeProceduralTexture = (
        name: string,
        pattern: 'wood' | 'bamboo' | 'thatch' | 'soil' | 'brocade' | 'ceramic',
        baseRgb: [number, number, number]
      ) => {
        if (!preset.proceduralTextures) return null;
        const size = quality === 'high' ? 512 : 256;
        const dt = new DynamicTexture(name, { width: size, height: size }, scene, true);
        const ctx = dt.getContext();

        const [r, g, b] = baseRgb.map((v) => Math.round(v * 255));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, 0, size, size);

        if (pattern === 'wood') {
          // Fine longitudinal wood grain
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          for (let i = 0; i < size; i += 6) {
            ctx.fillRect(i, 0, 2 + (i % 3), size);
          }
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          for (let i = 3; i < size; i += 12) {
            ctx.fillRect(i, 0, 1, size);
          }
        } else if (pattern === 'bamboo') {
          // Woven bamboo strips (nong mot / nong hai)
          const tileSize = 16;
          for (let y = 0; y < size; y += tileSize) {
            for (let x = 0; x < size; x += tileSize) {
              const alt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
              ctx.fillStyle = alt ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)';
              ctx.fillRect(x, y, tileSize - 2, tileSize - 2);
            }
          }
        } else if (pattern === 'thatch') {
          // Golden layered straw strands
          ctx.strokeStyle = 'rgba(0,0,0,0.18)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 220; i++) {
            const sx = Math.random() * size;
            const sy = Math.random() * size;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + (Math.random() - 0.5) * 35, sy + 30 + Math.random() * 45);
            ctx.stroke();
          }
        } else if (pattern === 'soil') {
          for (let i = 0; i < 350; i++) {
            const sx = Math.random() * size;
            const sy = Math.random() * size;
            const radius = 1 + Math.random() * 2.5;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(255,200,140,0.2)';
            ctx.beginPath();
            ctx.arc(sx, sy, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (pattern === 'brocade') {
          // Vibrant scarlet, indigo and golden diamond pattern
          ctx.fillStyle = '#b81e28';
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = '#1e486e';
          for (let y = 0; y < size; y += 48) {
            ctx.fillRect(0, y, size, 22);
          }
          ctx.strokeStyle = '#f5c53b';
          ctx.lineWidth = 5;
          for (let x = 0; x < size; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 16, 24);
            ctx.lineTo(x + 32, 0);
            ctx.stroke();
          }
        } else if (pattern === 'ceramic') {
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          for (let i = 0; i < 200; i++) {
            ctx.fillRect(Math.random() * size, Math.random() * size, 3, 3);
          }
        }

        dt.update();
        return dt;
      };

      // 3. Bright, Vibrant PBR Materials
      const makePBRMat = (
        name: string,
        albedoRgb: [number, number, number],
        roughness: number,
        metallic = 0.05,
        pattern?: 'wood' | 'bamboo' | 'thatch' | 'soil' | 'brocade' | 'ceramic'
      ) => {
        const mat = new PBRMaterial(name, scene!);
        mat.albedoColor = Color3.FromArray(albedoRgb);
        mat.roughness = roughness;
        mat.metallic = metallic;
        mat.environmentIntensity = 1.0;

        if (pattern) {
          const tex = makeProceduralTexture(`${name}_tex`, pattern, albedoRgb);
          if (tex) {
            mat.albedoTexture = tex;
            if (pattern === 'wood' || pattern === 'bamboo') {
              mat.bumpTexture = tex;
              mat.bumpTexture.level = 0.3;
            }
          }
        }
        return mat;
      };

      const matGround = makePBRMat('matGround', pal.forestGround, 0.92, 0.02, 'soil');
      const matRedSoil = makePBRMat('matRedSoil', pal.redBazanSoil, 0.85, 0.02, 'soil');
      const matTimberPillars = makePBRMat('matTimberPillars', pal.timberPillars, 0.65, 0.06, 'wood');
      const matTimberBeams = makePBRMat('matTimberBeams', pal.timberDarkAged, 0.68, 0.06, 'wood');
      const matPlankFloor = makePBRMat('matPlankFloor', pal.bambooFloor, 0.38, 0.08, 'bamboo');
      const matWovenWalls = makePBRMat('matWovenWalls', pal.wovenBambooWall, 0.7, 0.04, 'bamboo');
      const matThatchRoof = makePBRMat('matThatchRoof', pal.thatchRoofDark, 0.82, 0.02, 'thatch');
      matThatchRoof.backFaceCulling = false;
      const matRiverStone = makePBRMat('matRiverStone', pal.riverStoneGray, 0.78, 0.05);
      const matBronze = makePBRMat('matBronze', pal.bronzeGold, 0.24, 0.9);
      const matCeramic = makePBRMat('matCeramic', pal.ceramicGlazeTuk, 0.16, 0.12, 'ceramic');
      const matBrocade = makePBRMat('matBrocade', pal.brocadeCrimson, 0.75, 0.04, 'brocade');

      const matEmber = new StandardMaterial('matEmber', scene);
      matEmber.diffuseColor = Color3.FromArray(pal.emberGlow);
      matEmber.emissiveColor = Color3.FromArray(pal.emberGlow).scale(0.9);

      // Helper to register interactive mesh for raycast clicking (Requirement 3)
      const registerInteractive = (mesh: Mesh, hotspotId: string) => {
        mesh.metadata = { hotspotId };
        mesh.isPickable = true;
      };

      // 4. Exterior Environment: Ground, Mountains, Pathway & Ancient Trees
      const ground = MeshBuilder.CreateGround(
        'forestGround',
        { width: LONGHOUSE_3D_CONFIG.world.groundSize, height: LONGHOUSE_3D_CONFIG.world.groundSize },
        scene
      );
      ground.material = matGround;
      ground.checkCollisions = true;
      ground.receiveShadows = true;

      // Distant Highlands Mountain Ridge
      for (let m = 0; m < 7; m++) {
        const mountain = MeshBuilder.CreateCylinder(
          `mountain_${m}`,
          { diameterTop: 0, diameterBottom: 45 + (m % 3) * 14, height: 26 + (m % 2) * 12, tessellation: 6 },
          scene
        );
        const ang = (m / 7) * Math.PI - Math.PI / 2;
        const dist = 55 + (m % 2) * 8;
        mountain.position = new Vector3(Math.sin(ang) * dist, 11, -Math.cos(ang) * dist - 8);
        const mMat = new StandardMaterial(`mMat_${m}`, scene);
        mMat.diffuseColor = Color3.FromArray(m % 2 === 0 ? pal.mountainBlue : pal.canopyGreenDark).scale(0.75);
        mountain.material = mMat;
      }

      // Red Bazan Soil Path leading to stairs
      const arch = LONGHOUSE_3D_CONFIG.architecture;
      const pathLen = arch.pathway.endZ - arch.pathway.startZ;
      const pathway = MeshBuilder.CreateBox(
        'redBazanPathway',
        { width: arch.pathway.width, height: 0.08, depth: pathLen },
        scene
      );
      pathway.position = new Vector3(-1.5, 0.04, arch.pathway.startZ + pathLen / 2);
      pathway.material = matRedSoil;
      pathway.checkCollisions = true;
      pathway.receiveShadows = true;

      // Ko-nia & Highlands Forest Trees
      const treeCoords: Array<[number, number, number]> = [
        [-15, 25, 1.2], [-18, 17, 1.35], [-16, 8, 1.1], [-18, -2, 1.25], [-17, -11, 1.2],
        [-14, -20, 1.1], [14, 25, 1.15], [18, 16, 1.3], [15, 7, 1.2], [18, -4, 1.25],
        [15, -15, 1.3], [10, -24, 1.15], [-9, -24, 1.2], [0, -26, 1.4],
        [-22, 12, 1.3], [22, 11, 1.25], [-23, -6, 1.2], [23, -10, 1.2],
      ];

      treeCoords.slice(0, preset.treeCount).forEach(([tx, tz, sc], idx) => {
        const trunk = MeshBuilder.CreateCylinder(
          `treeTrunk_${idx}`,
          { diameterTop: 0.48 * sc, diameterBottom: 0.88 * sc, height: 6.2 * sc, tessellation: 10 },
          scene
        );
        trunk.position = new Vector3(tx, 3.1 * sc, tz);
        trunk.material = matTimberPillars;
        trunk.checkCollisions = true;
        addShadow(trunk, false);

        const canopyA = MeshBuilder.CreateSphere(`canopyA_${idx}`, { diameter: 5.6 * sc, segments: 8 }, scene);
        canopyA.scaling = new Vector3(1.15, 0.8, 1.15);
        canopyA.position = new Vector3(tx, 6.8 * sc, tz);
        const cMat = new StandardMaterial(`canopyMat_${idx}`, scene);
        cMat.diffuseColor = Color3.FromArray(pal.canopyGreenDark);
        canopyA.material = cMat;
        addShadow(canopyA, false);
      });

      // River stones flanking pathway
      for (let s = 0; s < 7; s++) {
        for (const side of [-1, 1]) {
          const stone = MeshBuilder.CreateSphere(
            `riverStone_${s}_${side}`,
            { diameter: 0.65 + (s % 3) * 0.15, segments: 6 },
            scene
          );
          stone.scaling = new Vector3(1.3, 0.65, 1.1);
          stone.position = new Vector3(-1.5 + side * 2.3, 0.2, 19.0 + s * 1.9);
          stone.material = matRiverStone;
        }
      }

      // Invisible perimeter boundary walls around forest yard
      const makeBoundary = (name: string, w: number, h: number, d: number, x: number, z: number) => {
        const b = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
        b.position = new Vector3(x, h / 2, z);
        b.isVisible = false;
        b.checkCollisions = true;
      };
      makeBoundary('boundN', 76, 8, 1, 0, -32);
      makeBoundary('boundS', 76, 8, 1, 0, 35);
      makeBoundary('boundW', 1, 8, 70, -32, 1);
      makeBoundary('boundE', 1, 8, 70, 32, 1);

      // 5. LONGHOUSE MODEL: Rebuilt to match user's reference photo
      const houseRoot = new TransformNode('Longhouse_Root', scene);

      // A. Longhouse_Pillars: 32 Stilt Pillars with stone plinths
      const pillarsNode = new TransformNode('Longhouse_Pillars', scene);
      pillarsNode.parent = houseRoot;

      for (const px of arch.pillars.xPositions) {
        for (const pz of arch.pillars.zPositions) {
          const plinth = MeshBuilder.CreateCylinder(
            `plinth_${px}_${pz}`,
            { diameter: 0.68, height: 0.25, tessellation: 8 },
            scene
          );
          plinth.position = new Vector3(px, 0.12, pz);
          plinth.material = matRiverStone;
          plinth.parent = pillarsNode;

          const stilt = MeshBuilder.CreateCylinder(
            `stilt_${px}_${pz}`,
            { diameter: arch.pillars.stiltRadius * 2, height: arch.floor.elevationY - 0.1, tessellation: 12 },
            scene
          );
          stilt.position = new Vector3(px, (arch.floor.elevationY + 0.12) / 2, pz);
          stilt.material = matTimberPillars;
          stilt.checkCollisions = true;
          addShadow(stilt);
          stilt.parent = pillarsNode;

          if (Math.abs(px) >= 3.8 && pz <= 11) {
            const wallPost = MeshBuilder.CreateCylinder(
              `wallPost_${px}_${pz}`,
              { diameter: arch.pillars.wallPostRadius * 2, height: arch.pillars.wallHeight, tessellation: 12 },
              scene
            );
            wallPost.position = new Vector3(px, arch.floor.elevationY + arch.pillars.wallHeight / 2, pz);
            wallPost.material = matTimberPillars;
            wallPost.checkCollisions = true;
            addShadow(wallPost);
            wallPost.parent = pillarsNode;
          }
        }
      }

      // B. Longhouse_Floor: Raised Deck + Extended Front Porch (Hiên Dring) as in photo
      const floorNode = new TransformNode('Longhouse_Floor', scene);
      floorNode.parent = houseRoot;

      // Main enclosed floor deck (z: -13.2 to 10.8)
      const floorDeck = MeshBuilder.CreateBox(
        'floorDeck',
        { width: arch.floor.width, height: arch.floor.thickness, depth: 24.0 },
        scene
      );
      floorDeck.position = new Vector3(0, arch.floor.elevationY, -1.2);
      floorDeck.material = matPlankFloor;
      floorDeck.checkCollisions = true;
      floorDeck.receiveShadows = true;
      floorDeck.parent = floorNode;

      // Wide Open Front Porch (Hiên Dring - z: 10.8 to 14.1) as in photo!
      const porchDeck = MeshBuilder.CreateBox(
        'porchDeck',
        { width: arch.floor.width, height: arch.floor.thickness, depth: 4.8 },
        scene
      );
      porchDeck.position = new Vector3(0, arch.floor.elevationY, 12.3);
      porchDeck.material = matPlankFloor;
      porchDeck.checkCollisions = true;
      porchDeck.receiveShadows = true;
      porchDeck.parent = floorNode;
      registerInteractive(porchDeck, 'ext-facade');

      // Exposed round timber log ends along the front & side edge of porch (as in photo!)
      for (let rx = -4.0; rx <= 4.0; rx += 0.45) {
        const logBeam = MeshBuilder.CreateCylinder(
          `porchLog_${rx}`,
          { diameter: 0.28, height: 4.9, tessellation: 10 },
          scene
        );
        logBeam.rotation.x = Math.PI / 2;
        logBeam.position = new Vector3(rx, arch.floor.elevationY - 0.12, 12.3);
        logBeam.material = matTimberPillars;
        logBeam.parent = floorNode;
      }

      // Decorative water/washing pot near porch front as seen in user's photo!
      const porchWaterPot = MeshBuilder.CreateCylinder(
        'porchWaterPot',
        { diameterTop: 0.9, diameterBottom: 0.65, height: 0.72, tessellation: 16 },
        scene
      );
      porchWaterPot.position = new Vector3(1.2, arch.floor.elevationY + 0.45, 13.6);
      porchWaterPot.material = matRiverStone;
      porchWaterPot.checkCollisions = true;
      porchWaterPot.parent = floorNode;
      registerInteractive(porchWaterPot, 'ext-facade');

      // C. Longhouse_Stairs: TWO STAIRS SIDE-BY-SIDE (as in photo!)
      // Cầu thang cái (K'Kha Drai) with crescent moon & sculpted breasts + Cầu thang đực (K'Kha găm)
      const stairsNode = new TransformNode('Longhouse_Stairs', scene);
      stairsNode.parent = houseRoot;

      const stCai = arch.twoStairs.stairCai;
      const stDuc = arch.twoStairs.stairDuc;
      const stairSpanZ = stCai.bottomZ - stCai.topZ;
      const stairRiseY = stCai.topY - stCai.bottomY;
      const stairAngle = Math.atan2(stairRiseY, stairSpanZ);

      // --- 1. Cầu thang cái (K'Kha Drai) - On the right side of the pair (x = -1.35) ---
      const stairCaiLength = Math.hypot(stairSpanZ, stairRiseY) + 1.2;
      const stairCaiSlab = MeshBuilder.CreateBox(
        'masterStairSlab',
        { width: stCai.width, height: 0.28, depth: stairCaiLength },
        scene
      );
      stairCaiSlab.position = new Vector3(stCai.x, (stCai.bottomY + stCai.topY) / 2 + 0.15, (stCai.bottomZ + stCai.topZ) / 2 + 0.3);
      stairCaiSlab.rotation.x = stairAngle;
      stairCaiSlab.material = matTimberBeams;
      addShadow(stairCaiSlab);
      stairCaiSlab.parent = stairsNode;
      registerInteractive(stairCaiSlab, 'ext-stairs');

      // 7 Notched steps on Cầu thang cái
      for (let i = 0; i < stCai.stepCount; i++) {
        const t = (i + 0.5) / stCai.stepCount;
        const step = MeshBuilder.CreateBox(
          `mstStep_${i}`,
          { width: stCai.width * 0.94, height: 0.18, depth: 0.45 },
          scene
        );
        step.position = new Vector3(stCai.x, stCai.bottomY + t * stairRiseY + 0.1, stCai.bottomZ - t * stairSpanZ);
        step.material = matTimberPillars;
        addShadow(step);
        step.parent = stairsNode;
        registerInteractive(step, 'ext-stairs');
      }

      // Sculpted Crescent Moon Head (Trăng khuyết ở đầu cầu thang cái)
      const moonCrest = MeshBuilder.CreateTorus(
        'crescentMoonHead',
        { diameter: stCai.moonRadius * 2, thickness: 0.2, tessellation: 20 },
        scene
      );
      moonCrest.rotation.x = Math.PI / 2;
      moonCrest.scaling = new Vector3(1.25, 0.85, 1);
      moonCrest.position = new Vector3(stCai.x, stCai.topY + 0.95, stCai.topZ + 0.15);
      moonCrest.material = matTimberBeams;
      addShadow(moonCrest);
      moonCrest.parent = stairsNode;
      registerInteractive(moonCrest, 'ext-stairs');

      // 3D Sculpted Pair of Breasts (Đôi bầu ngực đắp nổi bằng hình học 3D thật!)
      for (const side of [-1, 1]) {
        const breast = MeshBuilder.CreateSphere(
          `sculptedBreast_${side}`,
          { diameter: stCai.breastRadius * 2, segments: 12 },
          scene
        );
        breast.scaling = new Vector3(1, 1.25, 0.9);
        breast.position = new Vector3(stCai.x + side * 0.32, stCai.topY + 0.52, stCai.topZ + 0.28);
        breast.material = matTimberBeams;
        addShadow(breast);
        breast.parent = stairsNode;
        registerInteractive(breast, 'ext-stairs');

        const nipple = MeshBuilder.CreateSphere(`nipple_${side}`, { diameter: 0.08, segments: 6 }, scene);
        nipple.position = new Vector3(stCai.x + side * 0.32, stCai.topY + 0.52, stCai.topZ + 0.48);
        nipple.material = matTimberPillars;
        nipple.parent = stairsNode;
      }

      // --- 2. Cầu thang đực (K'Kha găm) - Parallel next to Cầu thang cái (x = -2.95) as in photo! ---
      const stairDucLength = Math.hypot(stairSpanZ, stairRiseY) + 0.8;
      const stairDucSlab = MeshBuilder.CreateBox(
        'stairDucSlab',
        { width: stDuc.width, height: 0.26, depth: stairDucLength },
        scene
      );
      stairDucSlab.position = new Vector3(stDuc.x, (stDuc.bottomY + stDuc.topY) / 2 + 0.1, (stDuc.bottomZ + stDuc.topZ) / 2 + 0.2);
      stairDucSlab.rotation.x = stairAngle;
      stairDucSlab.material = matTimberBeams;
      addShadow(stairDucSlab);
      stairDucSlab.parent = stairsNode;
      registerInteractive(stairDucSlab, 'ext-stairs');

      // 7 Notched steps on Cầu thang đực
      for (let i = 0; i < stDuc.stepCount; i++) {
        const t = (i + 0.5) / stDuc.stepCount;
        const step = MeshBuilder.CreateBox(
          `ducStep_${i}`,
          { width: stDuc.width * 0.92, height: 0.16, depth: 0.42 },
          scene
        );
        step.position = new Vector3(stDuc.x, stDuc.bottomY + t * stairRiseY + 0.08, stDuc.bottomZ - t * stairSpanZ);
        step.material = matTimberPillars;
        addShadow(step);
        step.parent = stairsNode;
        registerInteractive(step, 'ext-stairs');
      }

      // --- 3. Seamless Collision Ramp spanning BOTH stairs for smooth climbing up/down (Requirement 4) ---
      const rampWidth = Math.abs(stCai.x - stDuc.x) + stCai.width + 0.6;
      const rampCenterX = (stCai.x + stDuc.x) / 2;
      const rampLength = Math.hypot(stairSpanZ, stairRiseY) + 0.9;
      const smoothStairCollider = MeshBuilder.CreateBox(
        'smoothStairCollider',
        { width: rampWidth, height: 0.25, depth: rampLength },
        scene
      );
      smoothStairCollider.position = new Vector3(
        rampCenterX,
        (stCai.bottomY + stCai.topY) / 2 + 0.02,
        (stCai.bottomZ + stCai.topZ) / 2
      );
      smoothStairCollider.rotation.x = stairAngle;
      smoothStairCollider.isVisible = false;
      smoothStairCollider.checkCollisions = true;

      // D. Longhouse_Walls: Woven Bamboo Walls with Wide Entrance Doorway (z = 10.8)
      const wallsNode = new TransformNode('Longhouse_Walls', scene);
      wallsNode.parent = houseRoot;

      const wallY = arch.floor.elevationY + arch.walls.height / 2;
      const wallZStart = -13.2;
      const wallZEnd = 10.8;
      const interiorLength = wallZEnd - wallZStart;

      // Side Walls with Clerestory Eave Openings
      for (const side of [-1, 1]) {
        const sideWall = MeshBuilder.CreateBox(
          `sideWall_${side}`,
          { width: arch.walls.thickness, height: arch.walls.height - 0.4, depth: interiorLength },
          scene
        );
        sideWall.position = new Vector3(side * (arch.floor.width / 2 - 0.1), wallY - 0.2, (wallZStart + wallZEnd) / 2);
        sideWall.material = matWovenWalls;
        sideWall.checkCollisions = true;
        addShadow(sideWall);
        sideWall.parent = wallsNode;
      }

      // Rear Wall (North Gable Wall)
      const rearWall = MeshBuilder.CreateBox(
        'rearWall',
        { width: arch.floor.width - 0.2, height: arch.walls.height, depth: arch.walls.thickness },
        scene
      );
      rearWall.position = new Vector3(0, wallY, wallZStart);
      rearWall.material = matWovenWalls;
      rearWall.checkCollisions = true;
      addShadow(rearWall);
      rearWall.parent = wallsNode;

      // Front Wall split around Wide Entrance Doorway (Doorway width: 2.6m, NO COLLIDER across opening!)
      const frontPanelWidth = (arch.floor.width - arch.walls.frontDoorWidth) / 2;
      for (const side of [-1, 1]) {
        const frontPanel = MeshBuilder.CreateBox(
          `frontWallPanel_${side}`,
          { width: frontPanelWidth, height: arch.walls.height, depth: arch.walls.thickness },
          scene
        );
        frontPanel.position = new Vector3(
          side * (arch.walls.frontDoorWidth / 2 + frontPanelWidth / 2),
          wallY,
          wallZEnd
        );
        frontPanel.material = matWovenWalls;
        frontPanel.checkCollisions = true;
        addShadow(frontPanel);
        frontPanel.parent = wallsNode;
      }

      // Carved Front Door Lintel (Above door opening)
      const doorLintel = MeshBuilder.CreateBox(
        'doorLintel',
        { width: arch.walls.frontDoorWidth + 0.4, height: 0.42, depth: arch.walls.thickness + 0.08 },
        scene
      );
      doorLintel.position = new Vector3(0, arch.floor.elevationY + arch.walls.height - 0.21, wallZEnd);
      doorLintel.material = matTimberBeams;
      doorLintel.checkCollisions = true;
      doorLintel.parent = wallsNode;

      // Internal Partition Wall separating Gian Gah & Gian Ôk (z = 0.5) with open center doorway
      const partPanelW = (arch.floor.width - arch.walls.partitionDoorWidth) / 2;
      for (const side of [-1, 1]) {
        const partPanel = MeshBuilder.CreateBox(
          `partitionPanel_${side}`,
          { width: partPanelW, height: arch.walls.height - 0.2, depth: 0.14 },
          scene
        );
        partPanel.position = new Vector3(
          side * (arch.walls.partitionDoorWidth / 2 + partPanelW / 2),
          wallY - 0.1,
          arch.walls.partitionZ
        );
        partPanel.material = matWovenWalls;
        partPanel.checkCollisions = true;
        addShadow(partPanel);
        partPanel.parent = wallsNode;
        registerInteractive(partPanel, 'int-ok-living');
      }

      // E. Longhouse_Roof: Golden Thatch Roof matching photo contour with deep front gable overhang
      const roofNode = new TransformNode('Longhouse_Roof', scene);
      roofNode.parent = houseRoot;

      const rf = arch.roof;
      const roofHalfSpan = rf.overhangWidth;
      const roofDrop = rf.peakHeight - rf.eaveHeight;
      const slopeLen = Math.hypot(roofHalfSpan, roofDrop);
      const slopeAngle = Math.atan2(roofDrop, roofHalfSpan);

      // 1. Two Symmetrical Pitched Roof Planes (sloping down from ridge peak x=0 to eaves x=±roofHalfSpan)
      for (const side of [-1, 1]) {
        // Main pitched golden thatch plane
        const roofPlane = MeshBuilder.CreateBox(
          `roofPlane_${side}`,
          { width: slopeLen + 0.5, height: rf.thickness, depth: rf.length },
          scene
        );
        roofPlane.position = new Vector3(side * (roofHalfSpan / 2), (rf.peakHeight + rf.eaveHeight) / 2, 0.4);
        roofPlane.rotation.z = -side * slopeAngle; // Negative for right, positive for left = correct pitched roof
        roofPlane.material = matThatchRoof;
        addShadow(roofPlane, false);
        roofPlane.parent = roofNode;
        registerInteractive(roofPlane, 'ext-facade');

        // Lower thick eave overhang (draping down naturally)
        const eaveOverhang = MeshBuilder.CreateBox(
          `eaveOverhang_${side}`,
          { width: 0.95, height: 0.32, depth: rf.length + 0.6 },
          scene
        );
        eaveOverhang.position = new Vector3(side * (roofHalfSpan + 0.28), rf.eaveHeight - 0.1, 0.4);
        eaveOverhang.rotation.z = -side * (slopeAngle + 0.15);
        eaveOverhang.material = matThatchRoof;
        eaveOverhang.parent = roofNode;
      }

      // 2. Heavy Roof Ridge Purlin (Đòn nóc tròn chạy suốt đỉnh mái)
      const ridge = MeshBuilder.CreateCylinder('roofRidge', { diameter: rf.ridgeRadius * 2, height: rf.length + 1.2 }, scene);
      ridge.rotation.x = Math.PI / 2;
      ridge.position = new Vector3(0, rf.peakHeight + 0.12, 0.4);
      ridge.material = matTimberBeams;
      ridge.parent = roofNode;

      // 3. Triangular Gable Pediments (Vách tam giác đầu hồi khép kín đỉnh vách)
      const createGablePediment = (name: string, zPos: number) => {
        const gableMesh = new Mesh(name, scene);
        const w2 = arch.floor.width / 2;
        const yBottom = arch.floor.elevationY + arch.walls.height;
        const yTop = rf.peakHeight;
        const thick = arch.walls.thickness;

        const positions = [
          -w2, yBottom, zPos + thick / 2, // 0: BL front
           w2, yBottom, zPos + thick / 2, // 1: BR front
            0, yTop,    zPos + thick / 2, // 2: Peak front
          -w2, yBottom, zPos - thick / 2, // 3: BL back
           w2, yBottom, zPos - thick / 2, // 4: BR back
            0, yTop,    zPos - thick / 2, // 5: Peak back
        ];

        const indices = [
          // Front face (two-sided so visible from inside & outside)
          0, 1, 2,  0, 2, 1,
          // Back face
          3, 4, 5,  3, 5, 4,
          // Left sloped side
          0, 2, 5,  0, 5, 3,
          // Right sloped side
          1, 5, 2,  1, 4, 5,
          // Bottom side
          0, 3, 4,  0, 4, 1,
        ];

        const normals: number[] = [];
        const uvs = [0, 0, 1, 0, 0.5, 1, 0, 0, 1, 0, 0.5, 1];
        VertexData.ComputeNormals(positions, indices, normals);

        const vData = new VertexData();
        vData.positions = positions;
        vData.indices = indices;
        vData.normals = normals;
        vData.uvs = uvs;
        vData.applyToMesh(gableMesh);

        gableMesh.material = matWovenWalls;
        gableMesh.checkCollisions = true;
        addShadow(gableMesh);
        return gableMesh;
      };

      const frontGableWall = createGablePediment('frontGablePediment', wallZEnd);
      frontGableWall.parent = roofNode;
      registerInteractive(frontGableWall, 'ext-facade');

      const rearGableWall = createGablePediment('rearGablePediment', wallZStart);
      rearGableWall.parent = roofNode;

      // 4. Decorative Bargeboard Rafters & Crossed Buffalo Horns (Khau Kut) at Front & Rear Gables
      const gableZPositions = [0.4 + rf.length / 2, 0.4 - rf.length / 2];
      for (const gz of gableZPositions) {
        for (const side of [-1, 1]) {
          const barge = MeshBuilder.CreateBox(
            `bargeboard_${side}_${gz}`,
            { width: slopeLen, height: 0.28, depth: 0.22 },
            scene
          );
          barge.position = new Vector3(
            side * (roofHalfSpan / 2),
            (rf.peakHeight + rf.eaveHeight) / 2,
            gz
          );
          barge.rotation.z = -side * slopeAngle;
          barge.material = matTimberBeams;
          barge.parent = roofNode;

          // Crossed Horns (Khau Kut)
          const horn = MeshBuilder.CreateBox(
            `gableHorn_${side}_${gz}`,
            { width: 0.16, height: rf.gableHornLength, depth: 0.16 },
            scene
          );
          horn.position = new Vector3(side * 0.35, rf.peakHeight + 0.65, gz);
          horn.rotation.z = side * (Math.PI / 6);
          horn.material = matTimberBeams;
          horn.parent = roofNode;
        }
      }

      // 6. DETAILED 12 CULTURAL ARTIFACTS (With Raycast Pick Metadata)
      const interiorNode = new TransformNode('Longhouse_Interior', scene);
      interiorNode.parent = houseRoot;

      // --- GIAN GAH: KHÔNG GIAN TIẾP KHÁCH & CỘNG ĐỒNG ---
      // Artifact 1: Ghế Kpan nguyên khối đại ngàn (Dọc vách phía Tây)
      const kpanLen = LONGHOUSE_3D_CONFIG.artifacts.kpanBench.length;
      const kpan = MeshBuilder.CreateBox(
        'kpanBench',
        { width: 0.92, height: 0.46, depth: kpanLen },
        scene
      );
      kpan.position = new Vector3(-3.4, arch.floor.elevationY + 0.38, 5.8);
      kpan.material = matTimberPillars;
      kpan.checkCollisions = true;
      addShadow(kpan);
      kpan.parent = interiorNode;
      registerInteractive(kpan, 'int-kpan');

      // Brocade runner on Kpan (festive mode)
      const kpanCloth = MeshBuilder.CreateBox(
        'kpanBrocadeCloth',
        { width: 0.94, height: 0.04, depth: kpanLen * 0.75 },
        scene
      );
      kpanCloth.position = new Vector3(-3.4, arch.floor.elevationY + 0.62, 5.8);
      kpanCloth.material = matBrocade;
      kpanCloth.parent = interiorNode;
      registerInteractive(kpanCloth, 'int-kpan');
      festiveMeshesRef.current.push(kpanCloth);

      // Artifact 2: Dàn Cồng Chiêng Knah (7 Chiêng đồng)
      const gongRack = MeshBuilder.CreateBox(
        'gongRackBar',
        { width: 0.18, height: 2.1, depth: 3.4 },
        scene
      );
      gongRack.position = new Vector3(3.2, arch.floor.elevationY + 1.25, 6.8);
      gongRack.material = matTimberBeams;
      gongRack.parent = interiorNode;
      registerInteractive(gongRack, 'int-gong-hgor');

      for (let g = 0; g < 7; g++) {
        const gongDiam = 0.68 - g * 0.04;
        const gong = MeshBuilder.CreateCylinder(
          `chiengKnah_${g}`,
          { diameter: gongDiam, height: 0.08, tessellation: 20 },
          scene
        );
        gong.rotation.z = Math.PI / 2;
        gong.position = new Vector3(3.05, arch.floor.elevationY + 1.35 - (g % 2) * 0.35, 5.4 + g * 0.48);
        gong.material = matBronze;
        addShadow(gong);
        gong.parent = interiorNode;
        registerInteractive(gong, 'int-gong-hgor');
      }

      // Artifact 3: Trống đại H'gơr
      const hgorDrum = MeshBuilder.CreateCylinder(
        'hgorDrumMesh',
        { diameter: 1.15, height: 1.6, tessellation: 20 },
        scene
      );
      hgorDrum.rotation.x = Math.PI / 2;
      hgorDrum.position = new Vector3(2.8, arch.floor.elevationY + 1.45, 9.4);
      hgorDrum.material = matTimberPillars;
      addShadow(hgorDrum);
      hgorDrum.parent = interiorNode;
      registerInteractive(hgorDrum, 'int-gong-hgor');

      // Artifact 4: Hàng Ché Cổ Tuk, Tang & Rượu cần
      for (let c = 0; c < 5; c++) {
        const jar = MeshBuilder.CreateSphere(
          `cheTuk_${c}`,
          { diameter: 0.72 + (c % 2) * 0.12, segments: 12 },
          scene
        );
        jar.scaling = new Vector3(1, 1.4, 1);
        jar.position = new Vector3(3.4, arch.floor.elevationY + 0.54, 1.5 + c * 0.75);
        jar.material = matCeramic;
        addShadow(jar);
        jar.parent = interiorNode;
        registerInteractive(jar, 'int-jars');

        // Curved bamboo drinking reeds (festive mode)
        const reed = MeshBuilder.CreateCylinder(
          `wineReed_${c}`,
          { diameter: 0.04, height: 1.4, tessellation: 6 },
          scene
        );
        reed.rotation.z = Math.PI / 7;
        reed.position = new Vector3(3.2, arch.floor.elevationY + 1.1, 1.5 + c * 0.75);
        reed.material = matPlankFloor;
        reed.parent = interiorNode;
        registerInteractive(reed, 'int-jars');
        festiveMeshesRef.current.push(reed);
      }

      // Artifact 5: Bếp lửa Gian Gah (Không gian kể sử thi Khan)
      const hearthGahBase = MeshBuilder.CreateBox(
        'hearthGahBase',
        { width: 2.1, height: 0.28, depth: 2.1 },
        scene
      );
      hearthGahBase.position = new Vector3(0, arch.floor.elevationY + 0.2, 4.2);
      hearthGahBase.material = matRiverStone;
      hearthGahBase.checkCollisions = true;
      hearthGahBase.parent = interiorNode;
      registerInteractive(hearthGahBase, 'int-hearth');

      const hearthEmberGah = MeshBuilder.CreateSphere(
        'hearthEmberGah',
        { diameter: 0.85, segments: 8 },
        scene
      );
      hearthEmberGah.position = new Vector3(0, arch.floor.elevationY + 0.48, 4.2);
      hearthEmberGah.material = matEmber;
      hearthEmberGah.parent = interiorNode;
      registerInteractive(hearthEmberGah, 'int-hearth');

      const tripod = MeshBuilder.CreateTorus(
        'hearthTripod',
        { diameter: 0.72, thickness: 0.06, tessellation: 12 },
        scene
      );
      tripod.position = new Vector3(0, arch.floor.elevationY + 0.48, 4.2);
      tripod.material = matBronze;
      tripod.parent = interiorNode;
      registerInteractive(tripod, 'int-hearth');

      // --- GIAN ÔK: KHÔNG GIAN SINH HOẠT GIA ĐÌNH ---
      // Artifact 6: Khung dệt thổ cẩm Ê-đê (Weaving Loom)
      const loomRoot = new TransformNode('weavingLoom', scene);
      loomRoot.position = new Vector3(2.4, arch.floor.elevationY + 0.45, -4.5);
      loomRoot.parent = interiorNode;

      const loomCloth = MeshBuilder.CreateBox('loomCloth', { width: 1.1, height: 0.03, depth: 1.6 }, scene);
      loomCloth.position = new Vector3(0, 0.48, 0);
      loomCloth.material = matBrocade;
      loomCloth.parent = loomRoot;
      registerInteractive(loomCloth, 'int-loom');

      for (const side of [-1, 1]) {
        const frame = MeshBuilder.CreateBox(`loomFrame_${side}`, { width: 0.1, height: 0.75, depth: 2.1 }, scene);
        frame.position = new Vector3(side * 0.6, 0.35, 0);
        frame.material = matTimberBeams;
        frame.parent = loomRoot;
        registerInteractive(frame, 'int-loom');
      }

      // Artifact 7: Cối & Chày giã gạo
      const mortar = MeshBuilder.CreateCylinder(
        'riceMortar',
        { diameterTop: 0.78, diameterBottom: 0.58, height: 0.85, tessellation: 14 },
        scene
      );
      mortar.position = new Vector3(2.5, arch.floor.elevationY + 0.45, -8.8);
      mortar.material = matTimberPillars;
      mortar.checkCollisions = true;
      addShadow(mortar);
      mortar.parent = interiorNode;
      registerInteractive(mortar, 'int-mortar');

      const pestle = MeshBuilder.CreateCylinder(
        'ricePestle',
        { diameterTop: 0.12, diameterBottom: 0.14, height: 1.8, tessellation: 8 },
        scene
      );
      pestle.rotation.z = Math.PI / 7;
      pestle.position = new Vector3(2.65, arch.floor.elevationY + 0.95, -8.8);
      pestle.material = matTimberBeams;
      pestle.parent = interiorNode;
      registerInteractive(pestle, 'int-mortar');

      // Artifact 8: Bếp nấu ăn gia đình Gian Ôk & Giàn sấy gác củi
      const hearthOkBase = MeshBuilder.CreateBox(
        'hearthOkBase',
        { width: 1.8, height: 0.24, depth: 1.8 },
        scene
      );
      hearthOkBase.position = new Vector3(-1.2, arch.floor.elevationY + 0.18, -7.5);
      hearthOkBase.material = matRiverStone;
      hearthOkBase.checkCollisions = true;
      hearthOkBase.parent = interiorNode;
      registerInteractive(hearthOkBase, 'int-ok-living');

      const emberOk = MeshBuilder.CreateSphere('emberOk', { diameter: 0.65, segments: 6 }, scene);
      emberOk.position = new Vector3(-1.2, arch.floor.elevationY + 0.4, -7.5);
      emberOk.material = matEmber;
      emberOk.parent = interiorNode;
      registerInteractive(emberOk, 'int-ok-living');

      const smokeRack = MeshBuilder.CreateBox('smokeRack', { width: 1.6, height: 0.1, depth: 1.6 }, scene);
      smokeRack.position = new Vector3(-1.2, arch.floor.elevationY + 1.85, -7.5);
      smokeRack.material = matTimberBeams;
      smokeRack.parent = interiorNode;
      registerInteractive(smokeRack, 'int-ok-living');

      // Artifact 9: Gùi Đới & Giỏ đan mây tre
      for (let b = 0; b < 3; b++) {
        const gui = MeshBuilder.CreateCylinder(
          `guiBasket_${b}`,
          { diameterTop: 0.46, diameterBottom: 0.28, height: 0.72, tessellation: 10 },
          scene
        );
        gui.position = new Vector3(-2.8 + b * 0.45, arch.floor.elevationY + 0.4, -4.2);
        gui.material = matWovenWalls;
        gui.parent = interiorNode;
        registerInteractive(gui, 'int-baskets');
      }

      // 7. Raycast Pointer Down (Double-click opens info modal; single-click = gold highlight)
      const lastClickMap: Record<string, number> = {};
      scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
          const pick = pointerInfo.pickInfo;
          if (pick && pick.hit && pick.pickedMesh) {
            let m: Mesh | null = pick.pickedMesh as Mesh;
            while (m) {
              const hsId = m.metadata?.hotspotId;
              if (hsId) {
                const now = Date.now();
                const last = lastClickMap[hsId] ?? 0;
                if (now - last < 400) {
                  // Double-click → open modal
                  const hotspot = MUSEUM_3D_HOTSPOTS.find((h) => h.id === hsId);
                  if (hotspot) onInteractHotspot(hotspot);
                  delete lastClickMap[hsId];
                } else {
                  // Single click → gold glow highlight for 800ms
                  lastClickMap[hsId] = now;
                  const mat = (pick.pickedMesh as Mesh).material as PBRMaterial;
                  if (mat && !mat.isDisposed()) {
                    const orig = mat.emissiveColor?.clone() ?? new Color3(0, 0, 0);
                    mat.emissiveColor = new Color3(1, 0.85, 0.2);
                    setTimeout(() => { if (!mat.isDisposed()) mat.emissiveColor = orig; }, 800);
                  }
                }
                break;
              }
              m = m.parent as Mesh;
            }
          }
        } else if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
          const pick = pointerInfo.pickInfo;
          let foundHs: Museum3DHotspot | null = null;
          if (pick && pick.hit && pick.pickedMesh) {
            let m: Mesh | null = pick.pickedMesh as Mesh;
            while (m) {
              const hsId = m.metadata?.hotspotId;
              if (hsId) {
                foundHs = MUSEUM_3D_HOTSPOTS.find((h) => h.id === hsId) || null;
                break;
              }
              m = m.parent as Mesh;
            }
          }
          setHoveredHotspot(foundHs);
          if (canvasRef.current) {
            canvasRef.current.style.cursor = foundHs ? 'pointer' : 'default';
          }
        }
      });

      // 8. Tour Camera (ArcRotateCamera at tp-entrance) + Orbit Camera
      const initPt = TOUR_POINTS[0]; // tp-entrance
      const tourCam = new ArcRotateCamera(
        'tourCamera',
        initPt.camAlpha,
        initPt.camBeta,
        initPt.camRadius,
        new Vector3(initPt.targetX, initPt.targetY, initPt.targetZ),
        scene
      );
      tourCam.lowerRadiusLimit = 3;
      tourCam.upperRadiusLimit = 30;
      tourCam.lowerBetaLimit = 0.2;
      tourCam.upperBetaLimit = Math.PI / 2.1;
      tourCameraRef.current = tourCam;

      // navigateToTourPoint: smooth animated camera transition between tour points
      const navigateToTourPoint = (pointId: string) => {
        const pt = TOUR_POINTS.find((p) => p.id === pointId);
        if (!pt || !sceneRef.current) return;
        currentTourPointIdRef.current = pointId;
        const cam = tourCameraRef.current!;
        const ease = new QuadraticEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        const fps = 60;
        const frames = 45;
        const makeAnim = (name: string, prop: string, from: number, to: number) => {
          const a = new Animation(
            name, prop, fps,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
          );
          a.setKeys([{ frame: 0, value: from }, { frame: frames, value: to }]);
          a.setEasingFunction(ease);
          return a;
        };
        cam.animations = [
          makeAnim('aAlpha',  'alpha',    cam.alpha,    pt.camAlpha),
          makeAnim('aBeta',   'beta',     cam.beta,     pt.camBeta),
          makeAnim('aRad',    'radius',   cam.radius,   pt.camRadius),
          makeAnim('tX',      'target.x', cam.target.x, pt.targetX),
          makeAnim('tY',      'target.y', cam.target.y, pt.targetY),
          makeAnim('tZ',      'target.z', cam.target.z, pt.targetZ),
        ];
        sceneRef.current.beginAnimation(cam, 0, frames, false, 1, () => {
          onTourPointChange?.(pt, pointId);
        });
      };

      // Expose navigateToTourPoint to parent (Museum3DPage)
      onNavigateFnReady?.(navigateToTourPoint);

      // Orbit Camera for 360-degree Architectural Inspection
      const orbSp = LONGHOUSE_3D_CONFIG.player.spawnOrbit;
      const orbitCam = new ArcRotateCamera(
        'orbitCamera',
        orbSp.alpha,
        orbSp.beta,
        orbSp.radius,
        new Vector3(orbSp.target.x, orbSp.target.y, orbSp.target.z),
        scene
      );
      orbitCam.lowerRadiusLimit = 12;
      orbitCam.upperRadiusLimit = 55;
      orbitCam.lowerBetaLimit = 0.1;
      orbitCam.upperBetaLimit = Math.PI / 2.05;
      orbitCameraRef.current = orbitCam;

      if (cameraMode === 'orbit') {
        scene.activeCamera = orbitCam;
        orbitCam.attachControl(canvas, true);
      } else {
        scene.activeCamera = tourCam;
        tourCam.attachControl(canvas, true);
      }

      // Render Loop
      let animTime = 0;

      engine.runRenderLoop(() => {
        if (!scene || scene.isDisposed) return;
        animTime += 0.035;

        // Hearth firelight flicker
        if (hearthGahLight) {
          const flicker = Math.sin(animTime * 6.5) * 0.18 + Math.cos(animTime * 11) * 0.12;
          hearthGahLight.intensity = (exhibitionModeRef.current === 'festive' ? 3.0 : 2.2) + flicker;
        }

        scene.render();
      });

      const handleResize = () => {
        if (engine && !engine.isDisposed) {
          engine.resize();
        }
      };
      window.addEventListener('resize', handleResize);

      setLoading(false);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        scene?.dispose();
        engine?.dispose();
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khởi tạo 3D WebGL.';
      setWebglError(msg);
      setLoading(false);
    }
  }, [quality]);

  if (webglError) {
    return (
      <div className="w-full aspect-[16/9] min-h-[440px] flex flex-col items-center justify-center p-8 bg-wood-950 text-cream rounded-2xl border border-sandstone text-center space-y-4">
        <h3 className="font-serif text-xl font-bold text-gold-400">Không thể khởi tạo WebGL 3D</h3>
        <p className="text-sm text-cream/80 max-w-md">{webglError}</p>
        <button
          type="button"
          onClick={onExitFallback}
          className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors"
        >
          Quay lại sảnh bảo tàng
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-wood-950">
      <canvas ref={canvasRef} className="w-full h-full block outline-none" />

      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-wood-950/90 text-cream space-y-3">
          <div className="w-10 h-10 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-sm tracking-wide text-gold-400">
            Đang khởi tạo không gian Nhà dài Ê-đê 3D...
          </p>
        </div>
      )}

      {/* Floating Interactive Hover Tooltip Pill */}
      {hoveredHotspot && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          <div className="px-4 py-2 rounded-xl bg-gold-500 text-wood-950 font-semibold text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-gold-300">
            <span>🖱️ Nhấp đúp để tìm hiểu: {hoveredHotspot.title}</span>
          </div>
        </div>
      )}
    </div>
  );
};