import type { PublicRelease } from "../../config/public-release";
import { getDownloadState } from "../../config/public-release";

export function ReleaseDownload({ release }: { release: PublicRelease }) {
  const state = getDownloadState(release);

  return (
    <article className="release-download" data-testid="release-download">
      <div className="release-download__heading">
        <p className="marketing-eyebrow">RELEASE / CUSTOMER ZIP</p>
        <h2>通用客户包</h2>
        <p>
          一个通用、签名的客户
          ZIP，功能由离线设备许可区分。官网不分发客户许可、API Key 或 Founder
          数据。
        </p>
      </div>
      <dl className="release-download__metadata">
        <div>
          <dt>版本</dt>
          <dd>{release.releaseVersion}</dd>
        </div>
        <div>
          <dt>发布日期</dt>
          <dd>{release.releaseDate}</dd>
        </div>
        <div>
          <dt>文件大小</dt>
          <dd>{release.fileSize}</dd>
        </div>
        <div>
          <dt>SHA-256</dt>
          <dd>{release.sha256}</dd>
        </div>
      </dl>
      <div className="release-download__action" aria-live="polite">
        {state.kind === "ready" ? (
          <a
            className="button button--primary"
            href={state.href}
            rel="noreferrer"
            target="_blank"
          >
            {state.message}
          </a>
        ) : (
          <button className="button button--primary" disabled type="button">
            {state.message}
          </button>
        )}
      </div>
      <p className="release-download__notes">{release.releaseNotes}</p>
    </article>
  );
}
