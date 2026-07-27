export const BRAND = {
  orange: '#EE4D2D',
  background: '#F7F5F2',
  paper: '#FFFFFF',
  ink: '#171717',
  muted: '#6B6B67',
  green: '#137A5A',
  letterSpacing: 0,
} as const;

export const WEBSITE_SCENES = [
  'founder-proof',
  'operating-layer',
  'objective-plan',
  'organization',
  'safety-locality',
  'readback',
  'status-vision',
  'cta',
] as const;

export const WECHAT_SCENES = [
  {id: 'proof', layout: 'portrait'},
  {id: 'loop', layout: 'portrait'},
  {id: 'governance', layout: 'portrait'},
  {id: 'safety', layout: 'portrait'},
  {id: 'trial', layout: 'portrait'},
] as const;
