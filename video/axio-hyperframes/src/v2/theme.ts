export const V2 = {
  orange: '#EE4D2D',
  orangeSoft: '#FFE3D9',
  warm: '#F4F1EC',
  paper: '#FFFFFF',
  ink: '#111111',
  muted: '#68645F',
  silver: '#D7D2CA',
  green: '#0D7657',
  font: 'Microsoft YaHei, PingFang SC, Arial, sans-serif',
} as const;

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const range = (frame: number, start: number, end: number) =>
  clamp((frame - start) / Math.max(1, end - start));
