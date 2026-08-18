import type { Metadata } from "next";

import { MarketingCta } from "../../../components/marketing/marketing-cta";
import { WechatContact } from "../../../components/contact/wechat-contact";
import { FaqList } from "../../../components/marketing/faq-list";
import { ReleaseDownload } from "../../../components/marketing/release-download";
import { getSiteContent } from "../../../content";
import { withBasePath } from "../../../config/site-path";

export const metadata: Metadata = {
  title: "下载 AXIO 客户端",
  description:
    "获取 AXIO 通用客户包、安装配置说明、空白导入模板和手动升级回滚指南。",
};

export default function DownloadPage() {
  const content = getSiteContent();
  const release = content.publicRelease;
  const templateLinks = [
    ["店铺导入模板", release.templateUrl],
    ["商品导入模板", "/downloads/templates/products.csv"],
    ["类目导入模板", "/downloads/templates/categories.csv"],
    ["关键词导入模板", "/downloads/templates/keywords.csv"],
    ["定价参数模板", "/downloads/templates/pricing.csv"],
  ] as const;

  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div>
            <p className="marketing-eyebrow">DOWNLOAD / CUSTOMER DELIVERY</p>
            <h1>下载 AXIO 客户端</h1>
            <p className="marketing-hero__lead">
              下载中心提供版本元数据、安装准备、API
              配置、空白数据导入和手动升级路径。
              当前不提供账号鉴权下载，也不填写未经验收的真实下载链接。
            </p>
          </div>
          <aside className="marketing-hero__aside">
            <strong>静态官网，链接手动发布</strong>
            <p>下载链接、SHA-256 和文件大小必须与同一个签名 ZIP 人工核对。</p>
            <p className="marketing-hero__boundary">
              <span>Windows 10/11 x64</span>
              <span>离线设备许可</span>
            </p>
          </aside>
        </div>
      </section>

      <section className="marketing-section marketing-section--surface">
        <div className="marketing-section__inner">
          <ReleaseDownload release={release} />
        </div>
      </section>

      <section
        className="marketing-section download-contact-section"
        aria-label="微信联系入口"
      >
        <div className="marketing-section__inner download-guidance">
          <header className="marketing-section__heading">
            <p className="marketing-eyebrow">SUPPORT / WECHAT</p>
            <h2>需要确认交付范围？直接联系 AXIO</h2>
            <p>
              下载链接准备中、版本核对或安装边界有疑问时，请通过微信咨询。请勿发送店铺密码、Cookie、API
              Key 或完整业务数据。
            </p>
          </header>
          <WechatContact className="download-wechat-contact" />
        </div>
      </section>

      <section className="marketing-section" aria-label="安装和配置">
        <div className="marketing-section__inner download-guidance">
          <header className="marketing-section__heading">
            <p className="marketing-eyebrow">SETUP / FIRST RUN</p>
            <h2>安装前先确认边界</h2>
            <p>
              客户在自己的 Windows 环境完成许可导入、API 配置、数据导入和 Chrome
              登录。 官网不接收账号密码、Cookie、浏览器 Profile 或 API Key。
            </p>
          </header>
          <div className="download-guidance__grid">
            <article>
              <h3>系统要求</h3>
              <ul>
                <li>Windows 10/11 x64</li>
                <li>已安装 Chrome 与 VC++ 2015–2022 运行库</li>
                <li>不需要安装 Python</li>
                <li>本地回环端口可用，首次启动按提示处理权限</li>
              </ul>
            </article>
            <article>
              <h3>首次启动</h3>
              <ol>
                <li>校验 ZIP 签名与 SHA-256，再解压到独立版本目录。</li>
                <li>导入客户自己的离线许可，未授权时保持受保护或只读状态。</li>
                <li>API Key 由客户自行配置，并先完成能力测试。</li>
                <li>导入空白模板，预览、校验、确认后才写入客户数据库。</li>
              </ol>
            </article>
          </div>
        </div>
      </section>

      <section
        className="marketing-section marketing-section--surface"
        aria-label="数据模板"
      >
        <div className="marketing-section__inner download-guidance">
          <header className="marketing-section__heading">
            <p className="marketing-eyebrow">IMPORT / BLANK TEMPLATES</p>
            <h2>从空白数据开始</h2>
            <p>
              模板只有字段表头和说明，不包含任何店铺、商品、订单、利润或客户身份。
            </p>
          </header>
          <nav className="download-template-links" aria-label="空白导入模板">
            {templateLinks.map(([label, href]) => (
              <a href={withBasePath(href)} key={href}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="marketing-section" aria-label="升级和回滚">
        <div className="marketing-section__inner download-guidance">
          <header className="marketing-section__heading">
            <p className="marketing-eyebrow">UPDATE / RECOVERY</p>
            <h2>手动并排升级，失败时回滚旧版本</h2>
            <p>
              新旧版本使用独立目录；客户数据和备份目录不随版本目录删除。先备份并迁移，
              完成健康检查后再切换；迁移失败保留旧版本和备份，不自动覆盖。
            </p>
          </header>
          <div className="download-guidance__links">
            <a
              href={withBasePath("/downloads/manual/customer-installation.md")}
            >
              查看客户安装手册
            </a>
            <a href={withBasePath("/downloads/manual/api-configuration.md")}>
              查看 API 配置手册
            </a>
          </div>
        </div>
      </section>

      <section
        className="marketing-section marketing-section--surface"
        aria-label="客户常见问题"
      >
        <div className="marketing-section__inner">
          <FaqList groups={content.faqGroups} />
        </div>
      </section>

      <MarketingCta
        description="如果下载链接尚未发布，请联系 AXIO 获取经过验收的版本信息。"
        title="先确认交付边界，再开始安装"
      />
    </main>
  );
}
