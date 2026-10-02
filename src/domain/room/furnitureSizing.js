export const FURNITURE_SIZE_PRESETS = {
  XS: { width: 50 },
  S: { width: 70 },
  M: { width: 95 },
  L: { width: 125 },
  XL: { width: 155 },
  XXL: { width: 190 },
};

export const DEFAULT_FURNITURE_SETTINGS = {
  size: 'M',                          // 基本サイズ（XS / S / M / L / XL / XXL）
  scale: 1,                           // 基本サイズに対する拡大・縮小率
  footprint: { width: 1, depth: 1 },  // 配置時に占めるグリッド数（横幅・奥行き）
  placementType: 'floor',             // 配置場所の種類（floor: 床、wall: 壁）
  placementAnchor: { x: 0.5, y: 1 },  // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
};

export const resolveFurnitureSize = (product) => {
  const preset = FURNITURE_SIZE_PRESETS[product.size] ?? FURNITURE_SIZE_PRESETS.M;
  const scale = Number(product.scale) || 1;
  if (product.displayWidth && product.displayHeight) return { width: Math.round(product.displayWidth * scale), height: Math.round(product.displayHeight * scale) };
  const width = Math.round(preset.width * scale);
  const aspectRatio = Number(product.aspectRatio) || 1;
  return { width, height: Math.round(width / aspectRatio) };
};

export const normalizeFurnitureSettings = (settings, legacyWidth, legacyHeight) => {
  if (typeof settings === 'object' && settings !== null) {
    return {
      ...DEFAULT_FURNITURE_SETTINGS,
      ...settings,
      footprint: { ...DEFAULT_FURNITURE_SETTINGS.footprint, ...settings.footprint },
      placementAnchor: { ...DEFAULT_FURNITURE_SETTINGS.placementAnchor, ...settings.placementAnchor },
    };
  }
  const width = Number(settings) || legacyWidth || FURNITURE_SIZE_PRESETS.M.width;
  const height = Number(legacyWidth) || legacyHeight || width;
  return {
    ...DEFAULT_FURNITURE_SETTINGS,
    size: Object.entries(FURNITURE_SIZE_PRESETS).find(([, preset]) => preset.width === width)?.[0] ?? 'M',
    aspectRatio: width / height,
    displayWidth: width,
    displayHeight: height,
    footprint: { width: Math.max(1, Math.ceil(width / 32)), depth: Math.max(1, Math.ceil(height / 32)) },
  };
};
