export function DemoForm() {
  const demoFormEndpoint =
    process.env.NEXT_PUBLIC_DEMO_FORM_ENDPOINT?.trim() ?? "";
  const demoFormConfigured = demoFormEndpoint.startsWith(
    "https://formspree.io/f/",
  );
  return (
    <form
      action={demoFormConfigured ? demoFormEndpoint : undefined}
      aria-label="预约产品演示"
      className="demo-form"
      method={demoFormConfigured ? "post" : undefined}
    >
      <label className="demo-form__field">
        称呼
        <input
          disabled={!demoFormConfigured}
          autoComplete="name"
          name="name"
          required
          type="text"
        />
      </label>
      <label className="demo-form__field">
        联系邮箱
        <input
          disabled={!demoFormConfigured}
          autoComplete="email"
          name="email"
          required
          type="email"
        />
      </label>
      <label className="demo-form__field">
        公司或团队
        <input
          disabled={!demoFormConfigured}
          autoComplete="organization"
          name="company"
          type="text"
        />
      </label>
      <label className="demo-form__field">
        店铺规模
        <select
          disabled={!demoFormConfigured}
          defaultValue=""
          name="storeCountBand"
          required
        >
          <option disabled value="">
            请选择
          </option>
          <option value="1-9">1 至 9 家</option>
          <option value="10-49">10 至 49 家</option>
          <option value="50-200">50 至 200 家</option>
          <option value="200+">200 家以上</option>
        </select>
      </label>
      <label className="demo-form__field">
        联系偏好
        <select
          disabled={!demoFormConfigured}
          defaultValue="email"
          name="contactPreference"
        >
          <option value="email">邮箱</option>
          <option value="wechat">微信</option>
          <option value="phone">电话</option>
        </select>
      </label>
      <label className="demo-form__field">
        联系方式
        <input
          disabled={!demoFormConfigured}
          name="contact"
          required
          type="text"
        />
      </label>
      <label className="demo-form__field demo-form__field--wide">
        希望了解的业务场景
        <textarea
          disabled={!demoFormConfigured}
          name="message"
          required
          rows={5}
        />
      </label>
      <div className="demo-form__actions">
        <p>提交后我们会根据你的站点、店铺规模与协作方式安排沟通。</p>
        <button
          className="button button--primary"
          disabled={!demoFormConfigured}
          type="submit"
        >
          {demoFormConfigured ? "提交演示预约" : "预约通道配置中"}
        </button>
      </div>
    </form>
  );
}
