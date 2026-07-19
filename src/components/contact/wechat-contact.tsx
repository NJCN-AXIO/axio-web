import Image from "next/image";

import { withBasePath } from "../../config/site-path";

type WechatContactProps = {
  readonly className?: string;
};

const qrSource = withBasePath("/images/contact/wechat-nay.webp");

export function WechatContact({ className }: WechatContactProps) {
  const classes = ["wechat-contact", className].filter(Boolean).join(" ");

  return (
    <figure className={classes} data-testid="wechat-contact">
      <Image
        alt="楠 Nay 的微信二维码"
        className="wechat-contact__qr"
        height={610}
        loading="lazy"
        sizes="(max-width: 767px) 220px, 190px"
        src={qrSource}
        width={610}
      />
      <figcaption>
        <strong>微信咨询 · 楠 Nay</strong>
        <span>扫码添加微信，直接沟通店铺规模与演示需求</span>
      </figcaption>
    </figure>
  );
}
