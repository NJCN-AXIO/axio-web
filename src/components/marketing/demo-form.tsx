export function DemoForm() {
  return (
    <form
      action="/api/demo-requests"
      aria-label="预约产品演示"
      className="demo-form"
      method="post"
    >
      <label className="demo-form__field">
        称呼
        <input autoComplete="name" name="name" required type="text" />
      </label>
      <label className="demo-form__field">
        联系邮箱
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label className="demo-form__field">
        公司或团队
        <input autoComplete="organization" name="company" type="text" />
      </label>
      <label className="demo-form__field">
        店铺规模
        <select defaultValue="" name="storeCountBand" required>
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
        <select defaultValue="email" name="contactPreference">
          <option value="email">邮箱</option>
          <option value="wechat">微信</option>
          <option value="phone">电话</option>
        </select>
      </label>
      <label className="demo-form__field">
        联系方式
        <input name="contact" required type="text" />
      </label>
      <label className="demo-form__field demo-form__field--wide">
        希望了解的业务场景
        <textarea name="message" required rows={5} />
      </label>
      <div className="demo-form__actions">
        <p>提交后我们会根据你的站点、店铺规模与协作方式安排沟通。</p>
        <button className="button button--primary" type="submit">
          提交演示预约
        </button>
      </div>
    </form>
  );
}
