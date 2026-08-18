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

export function getDownloadState(release: PublicRelease): DownloadState {
  const href = release.downloadUrl.trim();
  if (!href) {
    return { kind: "missing", message: missingDownloadMessage };
  }

  try {
    const parsedUrl = new URL(href);
    if (parsedUrl.protocol !== "https:") {
      return { kind: "invalid", message: invalidDownloadMessage };
    }
  } catch {
    return { kind: "invalid", message: invalidDownloadMessage };
  }

  return { kind: "ready", href, message: release.downloadLabel };
}
