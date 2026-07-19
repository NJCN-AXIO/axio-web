export function normalizeBasePath(basePath: string) {
  const trimmedBasePath = basePath.trim();
  if (!trimmedBasePath) return "";

  const normalizedBasePath = `/${trimmedBasePath.replace(/^\/+|\/+$/g, "")}`;
  return normalizedBasePath === "/" ? "" : normalizedBasePath;
}

export function withBasePath(
  path: string,
  basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "",
) {
  const normalizedBasePath = normalizeBasePath(basePath);
  if (!path.startsWith("/") || !normalizedBasePath) return path;

  return `${normalizedBasePath}${path}`;
}
