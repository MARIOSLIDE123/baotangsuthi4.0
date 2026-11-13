/**
 * Tệp cấu hình thông số kiến trúc mô phỏng cho Bảo tàng 3D Nhà dài Ê-đê.
 * Tách biệt hoàn toàn khỏi logic dựng scene để dễ dàng điều chỉnh kích thước,
 * màu sắc, vật liệu hoặc tích hợp mô hình GLB về sau.
 *
 * Lưu ý giáo dục: Đây là mô hình mô phỏng nghệ thuật phục vụ giảng dạy,
 * không phải bản phục dựng khảo cổ chính xác của một ngôi nhà dài có thật.
 */
export const LONGHOUSE_3D_CONFIG = {
  simulationDisclaimer:
    'Mô hình 3D được dựng bằng hình khối mô phỏng nghệ thuật phục vụ giáo dục Ngữ văn 10, không phải bản phục dựng khảo cổ chính xác của một ngôi nhà dài có thật.',

  world: {
    groundSize: 96,
    fogDensity: 0.011,
    fogColorRgb: [0.16, 0.21, 0.16] as [number, number, number],
    skyColorRgb: [0.22, 0.29, 0.24] as [number, number, number],
    gravityY: -0.45,
  },

  player: {
    spawnExterior: { x: 0, y: 1.85, z: 27.5 },
    spawnInterior: { x: 0, y: 3.7, z: 8.5 },
    moveSpeedDesktop: 0.22,
    moveSpeedMobile: 0.18,
    eyeHeightOffset: 1.75,
    ellipsoid: { x: 0.65, y: 0.95, z: 0.65 },
    groundFloorHeight: 1.9,
    areaZThreshold: 13.0, // z < 13 inside/under porch -> Area B once elevated
  },

  architecture: {
    floor: {
      width: 9.6,
      length: 26.0,
      elevationY: 1.85,
      thickness: 0.28,
    },
    pillars: {
      xPositions: [-4.4, 0, 4.4],
      zPositions: [-12, -8, -4, 0, 4, 8, 12],
      stiltRadius: 0.22,
      wallPostRadius: 0.18,
      wallHeight: 2.85,
    },
    walls: {
      thickness: 0.22,
      height: 2.8,
      frontDoorWidth: 2.8,
      frontDoorHeight: 2.45,
    },
    roof: {
      peakHeight: 7.0,
      eaveHeight: 4.55,
      length: 27.8,
      overhangWidth: 5.9,
      thickness: 0.24,
      ridgeRadius: 0.16,
      gableHornLength: 1.65,
    },
    stairs: {
      width: 2.8,
      stepCount: 7,
      bottomZ: 17.2,
      topZ: 13.0,
      bottomY: 0.05,
      topY: 1.85,
    },
    pathway: {
      startZ: 17.2,
      endZ: 31.0,
      width: 3.6,
    },
  },

  palette: {
    forestGround: [0.16, 0.25, 0.15] as [number, number, number],
    redSoilPath: [0.38, 0.22, 0.14] as [number, number, number],
    timberDark: [0.27, 0.17, 0.1] as [number, number, number],
    bambooFloor: [0.47, 0.34, 0.2] as [number, number, number],
    thatchRoof: [0.35, 0.27, 0.16] as [number, number, number],
    stoneGray: [0.36, 0.35, 0.32] as [number, number, number],
    bronzeGold: [0.83, 0.61, 0.22] as [number, number, number],
    brocadeAccent: [0.13, 0.42, 0.35] as [number, number, number],
    canopyGreen: [0.13, 0.34, 0.19] as [number, number, number],
    emberGlow: [0.96, 0.44, 0.12] as [number, number, number],
    hotspotIdle: [0.18, 0.68, 0.56] as [number, number, number],
    hotspotNear: [0.95, 0.74, 0.24] as [number, number, number],
    hotspotDone: [0.25, 0.74, 0.44] as [number, number, number],
  },

  performancePresets: {
    high: {
      label: 'Đồ họa cao (Máy tính)',
      shadowsEnabled: true,
      shadowMapSize: 1024,
      treeCount: 22,
      hardwareScaling: 1,
    },
    low: {
      label: 'Tiết kiệm (Điện thoại / Máy yếu)',
      shadowsEnabled: false,
      shadowMapSize: 512,
      treeCount: 12,
      hardwareScaling: 1.35,
    },
  },
};
