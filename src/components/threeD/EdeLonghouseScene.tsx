import React, { useEffect, useRef, useState } from 'react';
import {
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  TransformNode,
  UniversalCamera,
  Vector3,
} from '@babylonjs/core';
import { LONGHOUSE_3D_CONFIG } from '../../config/longhouse3dConfig';
import { MUSEUM_3D_HOTSPOTS } from '../../data/museum3dData';
import { Museum3DHotspot } from '../../types/museum';

export type QualityPreset = 'high' | 'low';

export interface PlayerTelemetry {
  x: number;
  z: number;
  yaw: number;
  area: 'A' | 'B';
  nearestHotspot: Museum3DHotspot | null;
}

interface EdeLonghouseSceneProps {
  quality: QualityPreset;
  completedHotspotIds: string[];
  paused: boolean;
  teleportRequest: { target: 'A' | 'B'; nonce: number } | null;
  onTelemetryUpdate: (telemetry: PlayerTelemetry) => void;
  onInteractHotspot: (hotspot: Museum3DHotspot) => void;
  onTogglePause: () => void;
  onExitFallback: () => void;
}

export const EdeLonghouseScene: React.FC<EdeLonghouseSceneProps> = ({
  quality,
  completedHotspotIds,
  paused,
  teleportRequest,
  onTelemetryUpdate,
  onInteractHotspot,
  onTogglePause,
  onExitFallback,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<UniversalCamera | null>(null);
  const joystickVecRef = useRef<{ vx: number; vz: number }>({ vx: 0, vz: 0 });
  const completedRef = useRef<string[]>(completedHotspotIds);
  const pausedRef = useRef<boolean>(paused);
  const nearestRef = useRef<Museum3DHotspot | null>(null);

  const [loading, setLoading] = useState(true);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const joyActiveRef = useRef(false);
  const joyOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lookTouchRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    completedRef.current = completedHotspotIds;
  }, [completedHotspotIds]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Handle teleport between Area A and Area B
  useEffect(() => {
    if (!teleportRequest || !cameraRef.current) return;
    const cam = cameraRef.current;
    const sp =
      teleportRequest.target === 'A'
        ? LONGHOUSE_3D_CONFIG.player.spawnExterior
        : LONGHOUSE_3D_CONFIG.player.spawnInterior;
    cam.position = new Vector3(sp.x, sp.y, sp.z);
    cam.setTarget(
      teleportRequest.target === 'A'
        ? new Vector3(0, 2.6, 12)
        : new Vector3(0, 3.6, -4)
    );
  }, [teleportRequest]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: Engine | null = null;
    let scene: Scene | null = null;
    const preset = LONGHOUSE_3D_CONFIG.performancePresets[quality];

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
      engine = new Engine(canvas, quality === 'high', {
        preserveDrawingBuffer: false,
        stencil: true,
        antialias: quality === 'high',
      });
      engine.setHardwareScalingLevel(preset.hardwareScaling);

      scene = new Scene(engine);
      scene.collisionsEnabled = true;
      scene.gravity = new Vector3(0, LONGHOUSE_3D_CONFIG.world.gravityY, 0);

      const [sr, sg, sb] = LONGHOUSE_3D_CONFIG.world.skyColorRgb;
      scene.clearColor = new Color4(sr, sg, sb, 1.0);
      scene.fogMode = Scene.FOGMODE_EXP2;
      const [fr, fg, fb] = LONGHOUSE_3D_CONFIG.world.fogColorRgb;
      scene.fogColor = new Color3(fr, fg, fb);
      scene.fogDensity = LONGHOUSE_3D_CONFIG.world.fogDensity;

      // First-Person Camera
      const sp = LONGHOUSE_3D_CONFIG.player.spawnExterior;
      const camera = new UniversalCamera('fpCamera', new Vector3(sp.x, sp.y, sp.z), scene);
      camera.setTarget(new Vector3(0, 2.7, 11));
      camera.attachControl(canvas, true);
      camera.applyGravity = true;
      camera.checkCollisions = true;
      const el = LONGHOUSE_3D_CONFIG.player.ellipsoid;
      camera.ellipsoid = new Vector3(el.x, el.y, el.z);
      camera.minZ = 0.2;
      camera.maxZ = 140;
      camera.speed = LONGHOUSE_3D_CONFIG.player.moveSpeedDesktop;
      camera.angularSensibility = 2600;
      camera.inertia = 0.65;

      // WASD + Arrow keys
      camera.keysUp = [87, 38];
      camera.keysDown = [83, 40];
      camera.keysLeft = [65, 37];
      camera.keysRight = [68, 39];
      cameraRef.current = camera;

      // Natural Daylight + Interior Hearth Glow
      const hemi = new HemisphericLight('hemiSky', new Vector3(0, 1, 0), scene);
      hemi.intensity = 0.72;
      hemi.diffuse = new Color3(0.98, 0.94, 0.85);
      hemi.groundColor = new Color3(0.24, 0.2, 0.14);

      const sun = new DirectionalLight('sunLight', new Vector3(-0.5, -0.85, 0.4), scene);
      sun.position = new Vector3(22, 30, -14);
      sun.intensity = 1.25;
      sun.diffuse = new Color3(1.0, 0.91, 0.72);

      const hearthLight = new PointLight('hearthLight', new Vector3(0, 3.2, -1.5), scene);
      hearthLight.diffuse = new Color3(1.0, 0.56, 0.2);
      hearthLight.intensity = 1.8;
      hearthLight.range = 18;

      const indoorWarmFill = new PointLight('indoorWarmFill', new Vector3(0, 4.4, 5.5), scene);
      indoorWarmFill.diffuse = new Color3(0.98, 0.84, 0.62);
      indoorWarmFill.intensity = 0.95;
      indoorWarmFill.range = 18;

      let shadowGen: ShadowGenerator | null = null;
      if (preset.shadowsEnabled) {
        shadowGen = new ShadowGenerator(preset.shadowMapSize, sun);
        shadowGen.useBlurExponentialShadowMap = true;
        shadowGen.blurKernel = 12;
      }

      const addShadow = (mesh: Mesh, receive = true) => {
        mesh.receiveShadows = receive;
        if (shadowGen) {
          shadowGen.addShadowCaster(mesh);
        }
      };

      // Shared Reusable Materials (Performance Optimized)
      const makeMat = (name: string, rgb: [number, number, number], spec = 0.12) => {
        const m = new StandardMaterial(name, scene!);
        m.diffuseColor = new Color3(rgb[0], rgb[1], rgb[2]);
        m.specularColor = new Color3(spec, spec, spec);
        return m;
      };

      const pal = LONGHOUSE_3D_CONFIG.palette;
      const groundMat = makeMat('groundMat', pal.forestGround, 0.03);
      const pathMat = makeMat('pathMat', pal.redSoilPath, 0.04);
      const timberMat = makeMat('timberMat', pal.timberDark, 0.15);
      const bambooMat = makeMat('bambooMat', pal.bambooFloor, 0.1);
      const thatchMat = makeMat('thatchMat', pal.thatchRoof, 0.05);
      const stoneMat = makeMat('stoneMat', pal.stoneGray, 0.08);
      const bronzeMat = makeMat('bronzeMat', pal.bronzeGold, 0.6);
      const brocadeMat = makeMat('brocadeMat', pal.brocadeAccent, 0.12);
      const canopyMat = makeMat('canopyMat', pal.canopyGreen, 0.05);

      const emberMat = makeMat('emberMat', pal.emberGlow, 0.2);
      emberMat.emissiveColor = new Color3(0.95, 0.36, 0.08);

      const hotspotIdleMat = makeMat('hotspotIdleMat', pal.hotspotIdle, 0.3);
      hotspotIdleMat.emissiveColor = new Color3(0.12, 0.45, 0.38);

      const hotspotNearMat = makeMat('hotspotNearMat', pal.hotspotNear, 0.4);
      hotspotNearMat.emissiveColor = new Color3(0.85, 0.62, 0.16);

      const hotspotDoneMat = makeMat('hotspotDoneMat', pal.hotspotDone, 0.3);
      hotspotDoneMat.emissiveColor = new Color3(0.16, 0.52, 0.28);

      // 1. Forest Terrain & Pathway (Area A)
      const ground = MeshBuilder.CreateGround(
        'forestGround',
        { width: LONGHOUSE_3D_CONFIG.world.groundSize, height: LONGHOUSE_3D_CONFIG.world.groundSize },
        scene
      );
      ground.material = groundMat;
      ground.checkCollisions = true;
      ground.receiveShadows = true;

      const arch = LONGHOUSE_3D_CONFIG.architecture;
      const pathLen = arch.pathway.endZ - arch.pathway.startZ;
      const pathway = MeshBuilder.CreateBox(
        'pathway',
        { width: arch.pathway.width, height: 0.08, depth: pathLen },
        scene
      );
      pathway.position = new Vector3(0, 0.04, arch.pathway.startZ + pathLen / 2);
      pathway.material = pathMat;
      pathway.checkCollisions = true;
      pathway.receiveShadows = true;

      // Entrance museum wooden gate arch (z = 26)
      const gatePostL = MeshBuilder.CreateCylinder('gatePostL', { diameter: 0.36, height: 3.8 }, scene);
      gatePostL.position = new Vector3(-2.3, 1.9, 25.5);
      gatePostL.material = timberMat;
      gatePostL.checkCollisions = true;
      addShadow(gatePostL);

      const gatePostR = MeshBuilder.CreateCylinder('gatePostR', { diameter: 0.36, height: 3.8 }, scene);
      gatePostR.position = new Vector3(2.3, 1.9, 25.5);
      gatePostR.material = timberMat;
      gatePostR.checkCollisions = true;
      addShadow(gatePostR);

      const gateBeam = MeshBuilder.CreateBox('gateBeam', { width: 5.4, height: 0.34, depth: 0.36 }, scene);
      gateBeam.position = new Vector3(0, 3.7, 25.5);
      gateBeam.material = timberMat;
      addShadow(gateBeam);

      // Intro Signboard at ext-gateway
      const signPost = MeshBuilder.CreateBox('signPost', { width: 0.14, height: 1.5, depth: 0.14 }, scene);
      signPost.position = new Vector3(-3.2, 0.75, 23.5);
      signPost.material = timberMat;
      signPost.checkCollisions = true;
      const signBoard = MeshBuilder.CreateBox('signBoard', { width: 1.5, height: 0.95, depth: 0.1 }, scene);
      signBoard.position = new Vector3(-3.2, 1.55, 23.5);
      signBoard.rotation.y = Math.PI / 6;
      signBoard.material = bambooMat;

      // Perimeter Invisible World Boundary Walls so player stays inside the forest museum
      const createBoundary = (name: string, w: number, h: number, d: number, x: number, z: number) => {
        const b = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
        b.position = new Vector3(x, h / 2, z);
        b.isVisible = false;
        b.checkCollisions = true;
      };
      createBoundary('boundN', 68, 8, 1, 0, -28);
      createBoundary('boundS', 68, 8, 1, 0, 32);
      createBoundary('boundW', 1, 8, 62, -28, 2);
      createBoundary('boundE', 1, 8, 62, 28, 2);

      // Surrounding Tay Nguyen Forest Trees & Boulders
      const treeSpots: Array<[number, number, number]> = [
        [-12, 24, 1.1], [-16, 18, 1.25], [-13, 10, 1.0], [-15, 2, 1.2], [-14, -7, 1.15],
        [-11, -16, 1.05], [12, 23, 1.15], [15, 16, 1.0], [13, 8, 1.25], [16, -2, 1.1],
        [13, -12, 1.2], [9, -20, 1.15], [-8, -21, 1.2], [0, -23, 1.3],
        [-20, 13, 1.3], [20, 12, 1.25], [-21, -4, 1.15], [21, -8, 1.2],
        [-19, -17, 1.1], [19, -18, 1.25], [-7, 29, 0.95], [8, 29, 1.05],
      ];

      treeSpots.slice(0, preset.treeCount).forEach(([tx, tz, scale], idx) => {
        const trunk = MeshBuilder.CreateCylinder(
          `treeTrunk_${idx}`,
          { diameterTop: 0.42 * scale, diameterBottom: 0.72 * scale, height: 5.4 * scale, tessellation: 10 },
          scene
        );
        trunk.position = new Vector3(tx, 2.7 * scale, tz);
        trunk.material = timberMat;
        trunk.checkCollisions = true;
        addShadow(trunk, false);

        const canopy = MeshBuilder.CreateSphere(
          `treeCanopy_${idx}`,
          { diameter: 4.8 * scale, segments: 8 },
          scene
        );
        canopy.scaling = new Vector3(1.1, 0.78, 1.1);
        canopy.position = new Vector3(tx, 6.0 * scale, tz);
        canopy.material = canopyMat;
        addShadow(canopy, false);
      });

      // Decorative stones along pathway
      for (let i = 0; i < 6; i++) {
        const stoneL = MeshBuilder.CreateSphere(`stoneL_${i}`, { diameter: 0.55, segments: 6 }, scene);
        stoneL.scaling = new Vector3(1.2, 0.6, 1);
        stoneL.position = new Vector3(-2.1, 0.15, 18.2 + i * 2.0);
        stoneL.material = stoneMat;

        const stoneR = MeshBuilder.CreateSphere(`stoneR_${i}`, { diameter: 0.55, segments: 6 }, scene);
        stoneR.scaling = new Vector3(1.2, 0.6, 1);
        stoneR.position = new Vector3(2.1, 0.15, 18.2 + i * 2.0);
        stoneR.material = stoneMat;
      }

      // 2. Ede Longhouse Model (Modular Parametric Parts from LONGHOUSE_3D_CONFIG)
      const houseRoot = new TransformNode('edeLonghouseRoot', scene);

      // Raised Floor Deck
      const floor = arch.floor;
      const floorDeck = MeshBuilder.CreateBox(
        'longhouseFloor',
        { width: floor.width, height: floor.thickness, depth: floor.length },
        scene
      );
      floorDeck.position = new Vector3(0, floor.elevationY, 0);
      floorDeck.material = bambooMat;
      floorDeck.checkCollisions = true;
      floorDeck.receiveShadows = true;
      floorDeck.parent = houseRoot;

      // Under-floor Stilt Pillars
      for (const px of arch.pillars.xPositions) {
        for (const pz of arch.pillars.zPositions) {
          const stilt = MeshBuilder.CreateCylinder(
            `stilt_${px}_${pz}`,
            { diameter: arch.pillars.stiltRadius * 2, height: floor.elevationY, tessellation: 10 },
            scene
          );
          stilt.position = new Vector3(px, floor.elevationY / 2, pz);
          stilt.material = timberMat;
          stilt.checkCollisions = true;
          addShadow(stilt);
          stilt.parent = houseRoot;
        }
      }

      // Upper Interior Structural Wall Posts & Cross Beams
      const postY = floor.elevationY + arch.pillars.wallHeight / 2;
      for (const pz of arch.pillars.zPositions) {
        for (const px of [-4.4, 4.4]) {
          const post = MeshBuilder.CreateCylinder(
            `wallPost_${px}_${pz}`,
            { diameter: arch.pillars.wallPostRadius * 2, height: arch.pillars.wallHeight, tessellation: 10 },
            scene
          );
          post.position = new Vector3(px, postY, pz);
          post.material = timberMat;
          post.checkCollisions = true;
          addShadow(post);
          post.parent = houseRoot;
        }

        // Overhead timber tie beam
        const beam = MeshBuilder.CreateBox(
          `tieBeam_${pz}`,
          { width: floor.width - 0.5, height: 0.2, depth: 0.22 },
          scene
        );
        beam.position = new Vector3(0, floor.elevationY + arch.pillars.wallHeight, pz);
        beam.material = timberMat;
        beam.parent = houseRoot;
      }

      // Stairs: Visual Steps + Smooth Invisible Collision Ramp so player climbs effortlessly
      const st = arch.stairs;
      const stairSpanZ = st.bottomZ - st.topZ;
      const stairRiseY = st.topY - st.bottomY;
      for (let i = 0; i < st.stepCount; i++) {
        const t = (i + 0.5) / st.stepCount;
        const step = MeshBuilder.CreateBox(
          `stairStep_${i}`,
          { width: st.width, height: 0.22, depth: stairSpanZ / st.stepCount + 0.08 },
          scene
        );
        step.position = new Vector3(
          0,
          st.bottomY + t * stairRiseY,
          st.bottomZ - t * stairSpanZ
        );
        step.material = timberMat;
        addShadow(step);
        step.parent = houseRoot;
      }

      // Invisible angled ramp collider for smooth First-Person walk up/down stairs
      const rampLength = Math.hypot(stairSpanZ, stairRiseY) + 0.6;
      const rampAngle = Math.atan2(stairRiseY, stairSpanZ);
      const stairRamp = MeshBuilder.CreateBox(
        'stairRampCollider',
        { width: st.width, height: 0.2, depth: rampLength },
        scene
      );
      stairRamp.position = new Vector3(
        0,
        (st.bottomY + st.topY) / 2 - 0.04,
        (st.bottomZ + st.topZ) / 2
      );
      stairRamp.rotation.x = rampAngle;
      stairRamp.isVisible = false;
      stairRamp.checkCollisions = true;

      // Front Porch Railings (z = 10.6 to 12.9)
      const porchRailL = MeshBuilder.CreateBox('porchRailL', { width: 0.16, height: 0.9, depth: 2.3 }, scene);
      porchRailL.position = new Vector3(-4.5, floor.elevationY + 0.55, 11.75);
      porchRailL.material = timberMat;
      porchRailL.checkCollisions = true;
      const porchRailR = MeshBuilder.CreateBox('porchRailR', { width: 0.16, height: 0.9, depth: 2.3 }, scene);
      porchRailR.position = new Vector3(4.5, floor.elevationY + 0.55, 11.75);
      porchRailR.material = timberMat;
      porchRailR.checkCollisions = true;

      // Exterior Walls with Solid Colliders (Entrance Wall at z = 10.4 has central Doorway!)
      const wallY = floor.elevationY + arch.walls.height / 2;
      const wallZStart = -12.6;
      const wallZEnd = 10.4;
      const interiorDepth = wallZEnd - wallZStart;

      // Left & Right side walls (with low clerestory gap under roof for natural daylight)
      const leftWall = MeshBuilder.CreateBox(
        'leftWall',
        { width: arch.walls.thickness, height: arch.walls.height - 0.35, depth: interiorDepth },
        scene
      );
      leftWall.position = new Vector3(-4.6, wallY - 0.15, (wallZStart + wallZEnd) / 2);
      leftWall.material = timberMat;
      leftWall.checkCollisions = true;
      addShadow(leftWall);

      const rightWall = MeshBuilder.CreateBox(
        'rightWall',
        { width: arch.walls.thickness, height: arch.walls.height - 0.35, depth: interiorDepth },
        scene
      );
      rightWall.position = new Vector3(4.6, wallY - 0.15, (wallZStart + wallZEnd) / 2);
      rightWall.material = timberMat;
      rightWall.checkCollisions = true;
      addShadow(rightWall);

      const backWall = MeshBuilder.CreateBox(
        'backWall',
        { width: floor.width - 0.3, height: arch.walls.height, depth: arch.walls.thickness },
        scene
      );
      backWall.position = new Vector3(0, wallY, wallZStart);
      backWall.material = timberMat;
      backWall.checkCollisions = true;
      addShadow(backWall);

      // Front Entrance Wall Split Around Doorway (Door opening: x in [-1.4, 1.4])
      const sidePanelWidth = (floor.width - arch.walls.frontDoorWidth) / 2;
      const frontLeft = MeshBuilder.CreateBox(
        'frontWallLeft',
        { width: sidePanelWidth, height: arch.walls.height, depth: arch.walls.thickness },
        scene
      );
      frontLeft.position = new Vector3(
        -(arch.walls.frontDoorWidth / 2 + sidePanelWidth / 2),
        wallY,
        wallZEnd
      );
      frontLeft.material = timberMat;
      frontLeft.checkCollisions = true;
      addShadow(frontLeft);

      const frontRight = MeshBuilder.CreateBox(
        'frontWallRight',
        { width: sidePanelWidth, height: arch.walls.height, depth: arch.walls.thickness },
        scene
      );
      frontRight.position = new Vector3(
        arch.walls.frontDoorWidth / 2 + sidePanelWidth / 2,
        wallY,
        wallZEnd
      );
      frontRight.material = timberMat;
      frontRight.checkCollisions = true;
      addShadow(frontRight);

      const doorLintel = MeshBuilder.CreateBox(
        'doorLintel',
        { width: arch.walls.frontDoorWidth, height: 0.45, depth: arch.walls.thickness },
        scene
      );
      doorLintel.position = new Vector3(0, floor.elevationY + arch.walls.height - 0.22, wallZEnd);
      doorLintel.material = timberMat;
      doorLintel.checkCollisions = true;

      // Pitched Thatched Roof & Crossed Gable Horns
      const rf = arch.roof;
      const roofHalfSpan = rf.overhangWidth;
      const roofDrop = rf.peakHeight - rf.eaveHeight;
      const slopeLen = Math.hypot(roofHalfSpan, roofDrop);
      const slopeAngle = Math.atan2(roofDrop, roofHalfSpan);

      const roofLeft = MeshBuilder.CreateBox(
        'roofLeft',
        { width: slopeLen, height: rf.thickness, depth: rf.length },
        scene
      );
      roofLeft.position = new Vector3(-roofHalfSpan / 2, (rf.peakHeight + rf.eaveHeight) / 2, 0);
      roofLeft.rotation.z = slopeAngle;
      roofLeft.material = thatchMat;
      addShadow(roofLeft, false);

      const roofRight = MeshBuilder.CreateBox(
        'roofRight',
        { width: slopeLen, height: rf.thickness, depth: rf.length },
        scene
      );
      roofRight.position = new Vector3(roofHalfSpan / 2, (rf.peakHeight + rf.eaveHeight) / 2, 0);
      roofRight.rotation.z = -slopeAngle;
      roofRight.material = thatchMat;
      addShadow(roofRight, false);

      const ridge = MeshBuilder.CreateCylinder(
        'roofRidge',
        { diameter: rf.ridgeRadius * 2, height: rf.length + 0.6 },
        scene
      );
      ridge.rotation.x = Math.PI / 2;
      ridge.position = new Vector3(0, rf.peakHeight + 0.08, 0);
      ridge.material = timberMat;

      for (const gz of [rf.length / 2 - 0.2, -rf.length / 2 + 0.2]) {
        const hornA = MeshBuilder.CreateBox(
          `gableHornA_${gz}`,
          { width: 0.16, height: rf.gableHornLength, depth: 0.16 },
          scene
        );
        hornA.position = new Vector3(0, rf.peakHeight + 0.45, gz);
        hornA.rotation.z = Math.PI / 5;
        hornA.material = timberMat;

        const hornB = MeshBuilder.CreateBox(
          `gableHornB_${gz}`,
          { width: 0.16, height: rf.gableHornLength, depth: 0.16 },
          scene
        );
        hornB.position = new Vector3(0, rf.peakHeight + 0.45, gz);
        hornB.rotation.z = -Math.PI / 5;
        hornB.material = timberMat;
      }

      // 3. Interior Exhibits (Area B)
      // Central Hearth (z = -1.5)
      const hearthBase = MeshBuilder.CreateBox('hearthBase', { width: 1.9, height: 0.28, depth: 1.9 }, scene);
      hearthBase.position = new Vector3(0, floor.elevationY + 0.28, -1.5);
      hearthBase.material = stoneMat;
      hearthBase.checkCollisions = true;

      const ember = MeshBuilder.CreateSphere('hearthEmber', { diameter: 0.68, segments: 8 }, scene);
      ember.position = new Vector3(0, floor.elevationY + 0.56, -1.5);
      ember.material = emberMat;

      // Long Kpan Wooden Bench (left side)
      const kpanBench = MeshBuilder.CreateBox('kpanBench', { width: 0.95, height: 0.42, depth: 7.5 }, scene);
      kpanBench.position = new Vector3(-3.3, floor.elevationY + 0.36, -5.5);
      kpanBench.material = timberMat;
      kpanBench.checkCollisions = true;
      addShadow(kpanBench);

      // Decorative Brocade Panel & Hero Shield Pedestal (right side)
      const pedestal = MeshBuilder.CreateBox('artifactPedestal', { width: 1.3, height: 1.0, depth: 1.3 }, scene);
      pedestal.position = new Vector3(3.0, floor.elevationY + 0.64, -6.8);
      pedestal.material = timberMat;
      pedestal.checkCollisions = true;

      const shield = MeshBuilder.CreateCylinder('shieldArtifact', { diameter: 1.05, height: 0.12, tessellation: 20 }, scene);
      shield.rotation.x = Math.PI / 2.6;
      shield.position = new Vector3(3.0, floor.elevationY + 1.42, -6.8);
      shield.material = bronzeMat;

      const brocadePanel = MeshBuilder.CreateBox('brocadePanel', { width: 0.1, height: 1.8, depth: 2.6 }, scene);
      brocadePanel.position = new Vector3(4.38, floor.elevationY + 1.5, -6.8);
      brocadePanel.material = brocadeMat;

      // Material Display Table (Bamboo / Timber Samples)
      const matTable = MeshBuilder.CreateBox('materialTable', { width: 1.4, height: 0.85, depth: 1.8 }, scene);
      matTable.position = new Vector3(3.2, floor.elevationY + 0.56, 3.2);
      matTable.material = bambooMat;
      matTable.checkCollisions = true;

      // Front Veranda Gong Rack
      const gongBar = MeshBuilder.CreateBox('gongBar', { width: 2.6, height: 0.14, depth: 0.14 }, scene);
      gongBar.position = new Vector3(2.8, floor.elevationY + 1.85, 11.4);
      gongBar.material = timberMat;
      for (let g = 0; g < 3; g++) {
        const gong = MeshBuilder.CreateCylinder(
          `verandaGong_${g}`,
          { diameter: 0.62 - g * 0.06, height: 0.1, tessellation: 18 },
          scene
        );
        gong.rotation.x = Math.PI / 2;
        gong.position = new Vector3(2.15 + g * 0.65, floor.elevationY + 1.25, 11.4);
        gong.material = bronzeMat;
      }

      // 4. Interactive Glowing Hotspots (Area A + Area B)
      const hotspotVisuals: Array<{
        hotspot: Museum3DHotspot;
        ring: Mesh;
        orb: Mesh;
        baseY: number;
      }> = [];

      for (const hs of MUSEUM_3D_HOTSPOTS) {
        const ring = MeshBuilder.CreateTorus(
          `hsRing_${hs.id}`,
          { diameter: 1.35, thickness: 0.08, tessellation: 24 },
          scene
        );
        ring.position = new Vector3(hs.position.x, hs.position.y - 0.85, hs.position.z);
        ring.material = hotspotIdleMat;

        const orb = MeshBuilder.CreatePolyhedron(
          `hsOrb_${hs.id}`,
          { type: 1, size: 0.24 },
          scene
        );
        const baseY = hs.position.y + 0.25;
        orb.position = new Vector3(hs.position.x, baseY, hs.position.z);
        orb.material = hotspotIdleMat;

        hotspotVisuals.push({ hotspot: hs, ring, orb, baseY });
      }

      // Keyboard E (Interact) and ESC (Pause)
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onTogglePause();
          return;
        }
        if ((e.key === 'e' || e.key === 'E') && !pausedRef.current && nearestRef.current) {
          onInteractHotspot(nearestRef.current);
        }
      };
      window.addEventListener('keydown', onKeyDown);

      // Render Loop & Proximity Checks
      let tick = 0;
      let lastHudSync = 0;

      engine.runRenderLoop(() => {
        if (!scene || !camera) return;
        tick += 0.03;

        // Apply subtle hearth light animation
        hearthLight.intensity = 1.6 + Math.sin(tick * 2.5) * 0.25;

        // Apply mobile virtual joystick movement if active & not paused
        if (!pausedRef.current) {
          const jv = joystickVecRef.current;
          if (Math.abs(jv.vx) > 0.04 || Math.abs(jv.vz) > 0.04) {
            const forward = camera.getDirection(Vector3.Forward());
            forward.y = 0;
            if (forward.lengthSquared() > 0.0001) forward.normalize();
            const right = camera.getDirection(Vector3.Right());
            right.y = 0;
            if (right.lengthSquared() > 0.0001) right.normalize();

            const speed = LONGHOUSE_3D_CONFIG.player.moveSpeedMobile;
            const moveVec = forward.scale(jv.vz * speed).add(right.scale(jv.vx * speed));
            camera.cameraDirection.addInPlace(moveVec);
          }
        }

        // Prevent falling out of bounds
        if (camera.position.y < 0.8) {
          camera.position.y = 1.85;
        }

        // Animate hotspots & locate nearest hotspot
        let closest: Museum3DHotspot | null = null;
        let closestDist = Infinity;

        for (const item of hotspotVisuals) {
          item.orb.position.y = item.baseY + Math.sin(tick * 1.6) * 0.1;
          item.orb.rotation.y += 0.02;

          const dx = camera.position.x - item.hotspot.position.x;
          const dz = camera.position.z - item.hotspot.position.z;
          const dy = Math.abs(camera.position.y - item.hotspot.position.y);
          const dist = Math.hypot(dx, dz);

          const isNear = dist <= item.hotspot.triggerRadius && dy < 2.6;
          const isDone = completedRef.current.includes(item.hotspot.id);

          if (isNear) {
            item.ring.material = hotspotNearMat;
            item.orb.material = hotspotNearMat;
            item.ring.scaling.setAll(1.16);
            if (dist < closestDist) {
              closestDist = dist;
              closest = item.hotspot;
            }
          } else if (isDone) {
            item.ring.material = hotspotDoneMat;
            item.orb.material = hotspotDoneMat;
            item.ring.scaling.setAll(1.0);
          } else {
            item.ring.material = hotspotIdleMat;
            item.orb.material = hotspotIdleMat;
            item.ring.scaling.setAll(1.0);
          }
        }

        nearestRef.current = closest;

        const now = performance.now();
        if (now - lastHudSync > 100) {
          lastHudSync = now;
          const isInsideB =
            camera.position.z < LONGHOUSE_3D_CONFIG.player.areaZThreshold &&
            camera.position.y > 2.4 &&
            Math.abs(camera.position.x) <= 5.0;

          onTelemetryUpdate({
            x: camera.position.x,
            z: camera.position.z,
            yaw: camera.rotation.y,
            area: isInsideB ? 'B' : 'A',
            nearestHotspot: closest,
          });
        }

        scene.render();
      });

      const onResize = () => engine?.resize();
      window.addEventListener('resize', onResize);
      setLoading(false);

      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('resize', onResize);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        scene?.dispose();
        engine?.dispose();
      };
    } catch {
      setLoading(false);
      setWebglError('Thiết bị hoặc trình duyệt hiện tại không hỗ trợ WebGL để chạy không gian 3D.');
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }
  }, [quality, onInteractHotspot, onTelemetryUpdate, onTogglePause]);

  // Toggle Babylon camera input when paused or modal is open
  useEffect(() => {
    const cam = cameraRef.current;
    const canvas = canvasRef.current;
    if (!cam || !canvas) return;
    if (paused) {
      cam.detachControl();
    } else {
      cam.attachControl(canvas, true);
    }
  }, [paused]);

  // Virtual Joystick Handlers (Mobile Left Side)
  const handleJoyStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    joyActiveRef.current = true;
    joyOriginRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const handleJoyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joyActiveRef.current) return;
    const maxR = 36;
    const dx = e.clientX - joyOriginRef.current.x;
    const dy = e.clientY - joyOriginRef.current.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(maxR, dist);
    const angle = Math.atan2(dy, dx);
    const tx = Math.cos(angle) * clampedDist;
    const ty = Math.sin(angle) * clampedDist;
    setJoystickThumb({ x: tx, y: ty });
    joystickVecRef.current = {
      vx: tx / maxR,
      vz: -ty / maxR,
    };
  };

  const handleJoyEnd = () => {
    joyActiveRef.current = false;
    setJoystickThumb({ x: 0, y: 0 });
    joystickVecRef.current = { vx: 0, vz: 0 };
  };

  // Right Swipe Touch Look Zone (Mobile Right Side)
  const handleLookStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lookTouchRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
  };

  const handleLookMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!lookTouchRef.current.active || !cameraRef.current || pausedRef.current) return;
    const dx = e.clientX - lookTouchRef.current.lastX;
    const dy = e.clientY - lookTouchRef.current.lastY;
    lookTouchRef.current.lastX = e.clientX;
    lookTouchRef.current.lastY = e.clientY;

    cameraRef.current.rotation.y += dx * 0.0055;
    cameraRef.current.rotation.x = Math.max(
      -1.05,
      Math.min(1.05, cameraRef.current.rotation.x + dy * 0.0045)
    );
  };

  const handleLookEnd = () => {
    lookTouchRef.current.active = false;
  };

  if (webglError) {
    return (
      <div className="w-full h-full min-h-[520px] flex flex-col items-center justify-center bg-wood-950 text-cream p-8 text-center rounded-2xl border border-wood-800 space-y-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-400">
          Không thể khởi tạo không gian 3D WebGL
        </h2>
        <p className="text-sm text-cream/85 max-w-md leading-relaxed">{webglError}</p>
        <button
          type="button"
          onClick={onExitFallback}
          className="px-5 py-2.5 text-sm font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 transition-colors cursor-pointer"
        >
          Quay lại Bảo tàng chính
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[540px] bg-wood-950 rounded-2xl overflow-hidden border border-wood-800 select-none">
      <canvas ref={canvasRef} className="w-full h-full block outline-none touch-none" />

      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-wood-950 text-cream gap-3">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-cream/90">
            Đang dựng rừng đại ngàn và Nhà dài Ê-đê mô phỏng 3D...
          </p>
        </div>
      )}

      {/* Mobile Touch Controls: Left Virtual Joystick + Right Swipe Look Area */}
      <div className="lg:hidden absolute inset-0 pointer-events-none z-10 flex justify-between items-end p-4 pb-16">
        {/* Left Virtual Joystick */}
        <div
          onPointerDown={handleJoyStart}
          onPointerMove={handleJoyMove}
          onPointerUp={handleJoyEnd}
          onPointerCancel={handleJoyEnd}
          aria-label="Joystick di chuyển"
          className="pointer-events-auto w-24 h-24 rounded-full bg-wood-950/60 border border-white/25 backdrop-blur-sm flex items-center justify-center touch-none"
        >
          <div
            className="w-10 h-10 rounded-full bg-gold-500/90 border border-cream/60 shadow-md"
            style={{
              transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
            }}
          />
        </div>

        {/* Right Swipe Look Pad */}
        <div
          onPointerDown={handleLookStart}
          onPointerMove={handleLookMove}
          onPointerUp={handleLookEnd}
          onPointerCancel={handleLookEnd}
          aria-label="Vuốt để xoay góc nhìn"
          className="pointer-events-auto w-28 h-24 rounded-xl bg-wood-950/45 border border-white/15 backdrop-blur-sm flex items-center justify-center text-[11px] text-cream/80 text-center px-2 touch-none"
        >
          Vuốt xoay góc nhìn
        </div>
      </div>
    </div>
  );
};
