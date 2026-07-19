export type EmailMessage = {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildVerificationEmail(input: {
  to: string;
  verificationUrl: string;
}): EmailMessage {
  return {
    to: input.to,
    subject: "验证你的 AXIO 智核邮箱",
    text: `请打开以下一次性链接完成邮箱验证：\n${input.verificationUrl}`,
    html: `<p>请点击以下链接完成邮箱验证：</p><p><a href="${escapeHtml(input.verificationUrl)}">验证邮箱</a></p>`,
  };
}

export function buildSalesNotificationEmail(input: {
  to: string;
  requestId: string;
  type: "DEMO" | "SUPPORT";
  name: string;
  email: string;
}): EmailMessage {
  const requestLabel = input.type === "DEMO" ? "演示申请" : "支持请求";
  return {
    to: input.to,
    subject: `AXIO ${requestLabel}：${input.requestId}`,
    text: `${requestLabel}\n请求编号：${input.requestId}\n联系人：${input.name}\n邮箱：${input.email}`,
    html: `<h1>${requestLabel}</h1><p>请求编号：${escapeHtml(input.requestId)}</p><p>联系人：${escapeHtml(input.name)}</p><p>邮箱：${escapeHtml(input.email)}</p>`,
  };
}
