export type PublicRelease = {
  readonly releaseVersion: string;
  readonly releaseDate: string;
  readonly downloadUrl: string;
  readonly downloadLabel: string;
  readonly sha256: string;
  readonly fileSize: string;
  readonly releaseNotes: string;
  readonly templateUrl: string;
  readonly manualUrl: string;
};

export type DownloadState =
  | { readonly kind: "ready"; readonly href: string; readonly message: string }
  | { readonly kind: "missing" | "invalid"; readonly message: string };

const missingDownloadMessage = "正式下载链接准备中，请联系 AXIO 获取";
const invalidDownloadMessage = "下载链接无效，请联系 AXIO 获取";

export function isSafePublicLink(value: string): boolean {
  const href = value.trim();
  if (!href) return false;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

export function getPublicLink(
  value: string,
): { readonly href: string; readonly external: boolean } | null {
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")) {
    return { href, external: false };
  }
  if (isSafePublicLink(href)) return { href, external: true };
  return null;
}

export function getDownloadState(release: PublicRelease): DownloadState {
  const href = release.downloadUrl.trim();
  if (!href) {
    return { kind: "missing", message: missingDownloadMessage };
  }

  if (!isSafePublicLink(href)) {
    return { kind: "invalid", message: invalidDownloadMessage };
  }

  return { kind: "ready", href, message: release.downloadLabel };
}
