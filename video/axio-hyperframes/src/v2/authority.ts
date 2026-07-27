export type AuthorityRole = 'governance' | 'dispatch' | 'advice';

export const HERO_COPY =
  '不是一个 AI 工具。是一套 AI 电商经营组织。';

export const validateEdge = (
  from: string,
  _to: string,
  role: AuthorityRole,
): true => {
  if (role === 'dispatch' && from !== 'AI Supervisor') {
    throw new Error(`${from} cannot dispatch`);
  }
  return true;
};
