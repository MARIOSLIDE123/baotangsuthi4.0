/**
 * Tệp cấu hình thông số kiến trúc mô phỏng cho Bảo tàng 3D Nhà dài Ê-đê.
 * Tách biệt hoàn toàn khỏi logic dựng scene để dễ dàng điều chỉnh kích thước,
 * màu sắc, vật liệu hoặc tích hợp mô hình GLB về sau.
 *
 * Lưu ý giáo dục: Đây là mô hình mô phỏng nghệ thuật phục vụ giảng dạy,
 * không phải bản phục dựng khảo cổ chính xác của một ngôi nhà dài có thật.
 */
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
    fogDensity: 0.008,
    fogColorRgb: [0.38, 0.44, 0.36] as [number, number, number],
    skyColorRgb: [0.45, 0.58, 0.68] as [number, number, number],
    gravityY: -0.45,
  },

  player: {
    spawnExterior: { x: 0, y: 1.85, z: 27.5 },
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
    },
    pillars: {
      xPositions: [-4.0, -1.8, 1.8, 4.0],
      zPositions: [-13, -9, -5, -1, 3, 7, 11, 13],
      stiltRadius: 0.22,
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
      peakHeight: 7.2,
      eaveHeight: 4.45,
      length: 30.2,
      overhangWidth: 5.6,
      thickness: 0.32,
      ridgeRadius: 0.18,
      gableHornLength: 1.8,
      gableOverhangZ: 1.6,
    },
    masterStairs: {
      // Cầu thang cái (K'Kha Drai) có trăng khuyết và đôi bầu ngực
      width: 1.6,
      boardThickness: 0.28,
      stepCount: 7,
      bottomZ: 17.6,
      topZ: 13.4,
      bottomY: 0.05,
      topY: 1.85,
      breastRadius: 0.22,
      moonRadius: 0.42,
    },
    rearStairs: {
      // Cầu thang phụ (K'Kha găm) phía sau
      width: 1.2,
      stepCount: 7,
      bottomZ: -17.2,
      topZ: -13.4,
      bottomY: 0.05,
      topY: 1.85,
    },
    frontPorch: {
      // Hiên Dring đón khách
      width: 8.8,
      depth: 3.2,
      centerZ: 13.2,
    },
    pathway: {
      startZ: 17.6,
      endZ: 33.0,
      width: 3.8,
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
    forestGround: [0.22, 0.34, 0.2] as [number, number, number],
    redBazanSoil: [0.46, 0.22, 0.14] as [number, number, number],
    timberDarkAged: [0.24, 0.15, 0.09] as [number, number, number],
    timberPillars: [0.29, 0.19, 0.12] as [number, number, number],
    bambooFloor: [0.55, 0.42, 0.26] as [number, number, number],
    wovenBambooWall: [0.58, 0.46, 0.29] as [number, number, number],
    thatchRoofDark: [0.36, 0.28, 0.17] as [number, number, number],
    thatchRoofLayer: [0.44, 0.34, 0.21] as [number, number, number],
    riverStoneGray: [0.4, 0.39, 0.37] as [number, number, number],
    bronzeGold: [0.82, 0.62, 0.25] as [number, number, number],
    ceramicGlazeTuk: [0.26, 0.16, 0.1] as [number, number, number],
    brocadeCrimson: [0.65, 0.14, 0.16] as [number, number, number],
    brocadeIndigo: [0.12, 0.26, 0.38] as [number, number, number],
    canopyGreenDark: [0.12, 0.29, 0.16] as [number, number, number],
    emberGlow: [0.98, 0.46, 0.12] as [number, number, number],
    mountainBlue: [0.36, 0.45, 0.48] as [number, number, number],
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
