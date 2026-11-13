/**
 * Tệp cấu hình thông số kiến trúc mô phỏng cho Bảo tàng 3D Nhà dài Ê-đê.
 * Theo tiêu chuẩn Realistic Heritage Visualization & Gameplay Babylon.js.
 *
 * Cấu trúc tách biệt hoàn toàn để dễ dàng tùy chỉnh tỷ lệ, màu sắc,
 * chế độ trưng bày (Sinh hoạt thường ngày / Lễ hội sử thi), và các mức đồ họa.
 */

export type ExhibitionMode = 'daily' | 'festive';
export type CameraMode = 'firstPerson' | 'thirdPerson' | 'orbit';

export const LONGHOUSE_3D_CONFIG = {
  simulationDisclaimer:
    'Mô hình kiến trúc Nhà dài Ê-đê 3D chuẩn Realistic Heritage Visualization phục vụ giáo dục Ngữ văn 10 và trải nghiệm di sản văn hóa Tây Nguyên.',

  world: {
    groundSize: 120,
    fogDensity: 0.005,
    fogColorRgb: [0.55, 0.62, 0.56] as [number, number, number],
    skyColorRgb: [0.55, 0.68, 0.82] as [number, number, number],
    gravityY: -0.45,
  },

  player: {
    spawnExterior: { x: -1.5, y: 1.85, z: 22.0 },
    spawnInterior: { x: 0, y: 3.7, z: 8.5 },
    spawnOrbit: { radius: 36, alpha: -Math.PI / 2.6, beta: Math.PI / 3.2, target: { x: 0, y: 3.5, z: 0 } },
    moveSpeedDesktop: 0.22,
    moveSpeedMobile: 0.18,
    eyeHeightOffset: 1.75,
    ellipsoid: { x: 0.65, y: 0.95, z: 0.65 },
    groundFloorHeight: 1.9,
    areaZThreshold: 13.0,
  },

  architecture: {
    floor: {
      width: 8.8,
      length: 28.0,
      elevationY: 1.85,
      thickness: 0.28,
      plankWidth: 0.35,
      porchDepth: 4.8, // Hiên Dring rộng mở phía trước như ảnh mẫu
    },
    pillars: {
      xPositions: [-4.0, -1.8, 1.8, 4.0],
      zPositions: [-13, -9, -5, -1, 3, 7, 11, 14],
      stiltRadius: 0.24,
      wallPostRadius: 0.18,
      wallHeight: 2.85,
    },
    walls: {
      thickness: 0.18,
      height: 2.8,
      frontDoorWidth: 2.6,
      frontDoorHeight: 2.45,
      partitionZ: 0.5, // Ranh giới giữa Gian Gah (z > 0.5) và Gian Ôk (z < 0.5)
      partitionDoorWidth: 2.2,
    },
    roof: {
      peakHeight: 7.4,
      eaveHeight: 4.35,
      length: 30.6,
      overhangWidth: 5.8,
      thickness: 0.38,
      ridgeRadius: 0.18,
      gableHornLength: 1.8,
      gableOverhangZ: 2.2,
    },
    twoStairs: {
      // 2 cầu thang đặt cạnh nhau ở đầu hiên như ảnh mẫu tư liệu
      stairCai: {
        x: -1.35,
        width: 1.35,
        stepCount: 7,
        bottomZ: 18.5,
        topZ: 14.1,
        bottomY: 0.05,
        topY: 1.85,
        breastRadius: 0.22,
        moonRadius: 0.42,
      },
      stairDuc: {
        x: -2.95,
        width: 1.15,
        stepCount: 7,
        bottomZ: 18.5,
        topZ: 14.1,
        bottomY: 0.05,
        topY: 1.85,
      },
    },
    frontPorch: {
      // Hiên Dring đón khách
      width: 8.8,
      depth: 4.8,
      centerZ: 14.0,
    },
    pathway: {
      startZ: 18.5,
      endZ: 33.0,
      width: 4.0,
    },
  },

  artifacts: {
    kpanBench: {
      length: 10.5,
      width: 0.85,
      height: 0.44,
      x: -3.3,
      z: 5.8,
    },
    hearthGah: {
      size: 2.1,
      height: 0.32,
      x: 0,
      z: 4.2,
    },
    hearthOk: {
      size: 1.8,
      height: 0.32,
      x: -1.2,
      z: -7.5,
    },
    gongRack: {
      width: 3.4,
      height: 2.2,
      x: 3.0,
      z: 6.8,
      gongCount: 7,
    },
    hgorDrum: {
      diameter: 1.15,
      length: 1.65,
      x: 2.8,
      z: 9.2,
    },
    weavingLoom: {
      width: 1.4,
      length: 2.1,
      height: 0.95,
      x: 2.4,
      z: -4.5,
    },
    riceMortar: {
      diameter: 0.75,
      height: 0.85,
      pestleLength: 1.8,
      x: 2.5,
      z: -8.8,
    },
  },

  palette: {
    forestGround: [0.28, 0.42, 0.24] as [number, number, number],
    redBazanSoil: [0.52, 0.26, 0.16] as [number, number, number],
    timberDarkAged: [0.38, 0.24, 0.14] as [number, number, number],
    timberPillars: [0.46, 0.30, 0.18] as [number, number, number],
    bambooFloor: [0.72, 0.58, 0.38] as [number, number, number],
    wovenBambooWall: [0.70, 0.56, 0.38] as [number, number, number],
    thatchRoofDark: [0.66, 0.50, 0.30] as [number, number, number],
    thatchRoofLayer: [0.74, 0.58, 0.36] as [number, number, number],
    riverStoneGray: [0.52, 0.50, 0.46] as [number, number, number],
    bronzeGold: [0.94, 0.78, 0.32] as [number, number, number],
    ceramicGlazeTuk: [0.48, 0.28, 0.15] as [number, number, number],
    brocadeCrimson: [0.88, 0.18, 0.22] as [number, number, number],
    brocadeIndigo: [0.18, 0.44, 0.72] as [number, number, number],
    canopyGreenDark: [0.18, 0.42, 0.22] as [number, number, number],
    emberGlow: [1.0, 0.55, 0.14] as [number, number, number],
    mountainBlue: [0.48, 0.58, 0.64] as [number, number, number],
    hotspotIdle: [0.18, 0.68, 0.56] as [number, number, number],
    hotspotNear: [0.95, 0.74, 0.24] as [number, number, number],
    hotspotDone: [0.25, 0.74, 0.44] as [number, number, number],
  },

  performancePresets: {
    high: {
      label: 'Đồ họa cao (Máy tính)',
      shadowsEnabled: true,
      shadowMapSize: 2048,
      treeCount: 28,
      hardwareScaling: 1,
      proceduralTextures: true,
    },
    medium: {
      label: 'Đồ họa cân bằng (Laptop)',
      shadowsEnabled: true,
      shadowMapSize: 1024,
      treeCount: 18,
      hardwareScaling: 1,
      proceduralTextures: true,
    },
    low: {
      label: 'Tiết kiệm pin (Điện thoại)',
      shadowsEnabled: false,
      shadowMapSize: 512,
      treeCount: 10,
      hardwareScaling: 1.25,
      proceduralTextures: false,
    },
  },
};
