export class SameOriginError extends Error {
  readonly status = 403;

  constructor() {
    super("Cross-origin request rejected");
    this.name = "SameOriginError";
  }
}

export function assertSameOrigin(request: Request): void {
  const originHeader = request.headers.get("origin");
  if (!originHeader) throw new SameOriginError();

  try {
    if (new URL(originHeader).origin !== new URL(request.url).origin) {
      throw new SameOriginError();
    }
  } catch (error) {
    if (error instanceof SameOriginError) throw error;
    throw new SameOriginError();
  }
}
