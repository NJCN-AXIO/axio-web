export function withBasePath(
  path: string,
  basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "",
) {
  if (!path.startsWith("/") || !basePath) return path;

  const normalizedBasePath = `/${basePath.replace(/^\/+|\/+$/g, "")}`;
  return normalizedBasePath === "/" ? path : `${normalizedBasePath}${path}`;
}
