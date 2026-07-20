let currentTaskId = null;
let auditTimer = null;
let taskPollTimer = null;
let auditModalShownForTask = null;
let dashboardPollTimer = null;
let selectionCandidatesData = [];
let explicitStoreOptions = [];
let explicitStoreGroup = '';
let explicitSelectedStoreIds = new Set();
let explicitStoreRequestId = 0;
let pricingShadowState = null;

const TASK_STATUS = {
  COLLECTING: 'collecting',
  PROCESSING: 'processing',
  AUDITING: 'auditing',
  WAITING_CONFIRM: 'waiting_confirm',
  PUBLISHING: 'publishing',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

function dashSetText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function dashNumber(value) {
  const n = Number(value || 0);
  return n.toLocaleString('en-US');
}

function dashPercent(value) {
  const n = Number(value || 0);
  return n.toFixed(1) + '%';
}

function dashEmpty(text) {
  return '<div class="dashboard-empty">' + text + '</div>';
}

function dashStatusClass(status) {
  return String(status || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function dashSupervisorActionText(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.detail ? (item.title || '') + ' - ' + item.detail : (item.title || '');
  }
  return String(item);
}

async function loadDashboardSummary() {
  if (!document.getElementById('page-dashboard')) return;
  try {
    const res = await demoRequest('/api/dashboard/summary');
    const data = await res.json();
    renderDashboardSummary(data);
    loadDashboardProductCatalog();
    loadDashboardSupervisorReport();
  } catch (e) {
    const risks = document.getElementById('dashboard-risks');
    if (risks) risks.innerHTML = dashEmpty('控制台数据加载失败');
  }
}

function renderDashboardSummary(data) {
  const stores = data.stores || {};
  const tasks = data.tasks || {};
  const ai = data.ai || {};
  const risks = data.risks || {};

  dashSetText('dashboard-last-refresh', data.generated_at || '--');
  dashSetText('dash-total-stores', dashNumber(stores.total));
  dashSetText('dash-current-products', dashNumber(stores.current_products));
  dashSetText('dash-remaining-capacity', dashNumber(stores.remaining_capacity));
  dashSetText('dash-overall-saturation', dashPercent(stores.overall_saturation));
  dashSetText('dash-running-tasks', dashNumber(tasks.running));
  dashSetText('dash-ai-calls', dashNumber(ai.today_calls));
  dashSetText('dash-op-running', dashNumber(tasks.running));
  dashSetText('dash-op-waiting', dashNumber(tasks.waiting_confirm));
  dashSetText('dash-op-failed', dashNumber(tasks.failed));
  dashSetText('dash-op-completed', dashNumber(tasks.completed_today));

  renderDashboardOpportunities(data.opportunities || []);
  renderDashboardRisks(risks);
  renderDashboardRecentTasks(data.recent_tasks || []);
  renderDashboardSites(data.sites || {});
  renderDashboardGroups(data.groups || {});
  renderDashboardFreshness(data.freshness || {});
}

function renderDashboardOpportunities(items) {
  const el = document.getElementById('dashboard-opportunities');
  if (!el) return;
  if (!items.length) {
    el.innerHTML = dashEmpty('暂无可用容量机会');
    return;
  }
  el.innerHTML = items.map(item => {
    const sat = Number(item.saturation || 0);
    return '<div class="dashboard-row">' +
      '<div class="dashboard-row-main"><span class="dashboard-row-title">' + (item.label || item.site || '-') + '</span>' +
      '<span class="dashboard-row-sub">' + dashNumber(item.stores) + ' 店 · 饱和率 ' + dashPercent(sat) + '</span>' +
      '<div class="dashboard-progress"><span style="width:' + Math.min(100, Math.max(0, sat)) + '%"></span></div></div>' +
      '<div class="dashboard-row-value">' + dashNumber(item.remaining_capacity) + '</div>' +
      '</div>';
  }).join('');
}

function renderDashboardRisks(risks) {
  const el = document.getElementById('dashboard-risks');
  if (!el) return;
  const items = risks.items || [];
  if (!items.length) {
    el.innerHTML = dashEmpty('暂无高优先级风险');
    return;
  }
  el.innerHTML = items.map(item => {
    const severity = item.severity || 'warning';
    return '<div class="dashboard-row">' +
      '<div class="dashboard-row-main"><span class="dashboard-row-title">' + (item.label || '-') + '</span>' +
      '<span class="dashboard-row-sub">' + (item.type || 'risk') + '</span></div>' +
      '<div class="dashboard-row-value ' + severity + '">' + (item.detail || '-') + '</div>' +
      '</div>';
  }).join('');
}

function renderDashboardRecentTasks(items) {
  const el = document.getElementById('dashboard-recent-tasks');
  if (!el) return;
  if (!items.length) {
    el.innerHTML = dashEmpty('暂无任务记录');
    return;
  }
  el.innerHTML = items.slice(0, 6).map(task => {
    const status = task.status || 'unknown';
    return '<div class="dashboard-row">' +
      '<div class="dashboard-row-main"><span class="dashboard-row-title">' + (task.label || task.task_id || '-') + '</span>' +
      '<span class="dashboard-row-sub">' + (task.updated_at || '') + '</span></div>' +
      '<span class="dashboard-status ' + dashStatusClass(status) + '">' + status + '</span>' +
      '</div>';
  }).join('');
}

function renderDashboardSites(sites) {
  const el = document.getElementById('dashboard-site-grid');
  if (!el) return;
  const entries = Object.entries(sites).sort((a, b) => a[0].localeCompare(b[0]));
  if (!entries.length) {
    el.innerHTML = dashEmpty('暂无站点数据');
    return;
  }
  el.innerHTML = entries.map(([site, item]) =>
    '<div class="site-item"><span class="site-flag">' + site + '</span><span>' + dashNumber(item.stores) + ' 店</span><strong>' + dashNumber(item.remaining_capacity) + '</strong><small>剩余容量</small></div>'
  ).join('');
}

function renderDashboardGroups(groups) {
  const el = document.getElementById('dashboard-group-grid');
  if (!el) return;
  const entries = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  if (!entries.length) {
    el.innerHTML = dashEmpty('暂无分组数据');
    return;
  }
  el.innerHTML = entries.map(([group, item]) =>
    '<div class="dashboard-group-card"><strong>' + group + '</strong><span>' + dashNumber(item.stores) + ' 店</span><span>' + dashNumber(item.remaining_capacity) + ' 剩余</span><span>' + dashPercent(item.saturation) + ' 饱和</span></div>'
  ).join('');
}

async function loadDashboardProductCatalog() {
  const el = document.getElementById('dashboard-product-catalog');
  if (!el) return;
  try {
    const res = await demoRequest('/api/product-catalog/summary');
    const data = await res.json();
    renderDashboardProductCatalog(data.summary || {});
  } catch (e) {
    el.innerHTML = dashEmpty('商品底账未生成');
  }
}

function renderDashboardProductCatalog(summary) {
  const el = document.getElementById('dashboard-product-catalog');
  if (!el) return;
  const groups = summary.groups || {};
  const names = ['G1', 'G2'];
  el.innerHTML = names.map(group => {
    const item = groups[group] || {};
    const listings = Number(item.listings || 0);
    const classified = Number(item.classified || 0);
    const unclassified = Number(item.unclassified || 0);
    const rate = listings ? (classified / listings * 100) : 0;
    const reasons = Object.entries(item.skip_reasons || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
    const reasonText = reasons.length ? (reasons[0][0] + ' ' + dashNumber(reasons[0][1])) : '暂无主要阻塞';
    return '<div class="dashboard-product-catalog-card">' +
      '<div class="dashboard-product-catalog-head"><strong>' + group + '</strong><span>' + dashPercent(rate) + '</span></div>' +
      '<div class="dashboard-product-catalog-main">' + dashNumber(listings) + '<span>listing</span></div>' +
      '<div class="dashboard-product-catalog-meta"><span>已分类 ' + dashNumber(classified) + '</span><span>未分类 ' + dashNumber(unclassified) + '</span></div>' +
      '<div class="dashboard-product-catalog-reason">' + reasonText + '</div>' +
      '</div>';
  }).join('');
}

function renderDashboardFreshness(freshness) {
  const el = document.getElementById('dashboard-freshness');
  if (!el) return;
  const entries = Object.values(freshness);
  if (!entries.length) {
    el.innerHTML = dashEmpty('暂无数据源状态');
    return;
  }
  el.innerHTML = entries.map(item => {
    const ok = item.status === 'ok';
    return '<div class="dashboard-row">' +
      '<div class="dashboard-row-main"><span class="dashboard-row-title">' + (item.label || '-') + '</span>' +
      '<span class="dashboard-row-sub">' + (item.updated_at || '未生成') + '</span></div>' +
      '<div class="dashboard-row-value ' + (ok ? 'success' : 'warning') + '">' + (ok ? 'OK' : '缺失') + '</div>' +
      '</div>';
  }).join('');
}

function dashSupervisorMarkdownList(items, fallback) {
  const rows = (items || []).slice(0, 3).map(dashSupervisorActionText).filter(Boolean);
  if (!rows.length) return dashEmpty(fallback);
  return '<div class="dashboard-supervisor-list">' + rows.map(item =>
    '<div class="dashboard-supervisor-bullet"><span></span><p>' + escapeHtml(item) + '</p></div>'
  ).join('') + '</div>';
}

async function loadDashboardSupervisorReport() {
  const mount = document.getElementById('dashboard-supervisor-report');
  if (!mount) return;
  try {
    const res = await demoRequest('/api/supervisor/report');
    const data = await res.json();
    renderDashboardSupervisorReport(data.summary || {}, data.markdown || '');
  } catch (e) {
    const status = document.getElementById('dashboard-supervisor-status');
    const actions = document.getElementById('dashboard-supervisor-actions');
    const markdown = document.getElementById('dashboard-supervisor-markdown');
    if (status) status.textContent = '加载失败';
    if (actions) actions.innerHTML = dashEmpty('主管报告加载失败');
    if (markdown) markdown.textContent = '';
  }
}

function renderDashboardSupervisorReport(summary, markdown) {
  const aiHealth = (summary.health && summary.health.ai) || {};
  const usage = (summary.health && summary.health.usage) || {};
  const risks = summary.risks || [];
  const actions = summary.daily_actions || summary.next_actions || [];

  dashSetText('dashboard-supervisor-status', aiHealth.status || '--');
  dashSetText('dashboard-supervisor-calls', dashNumber(usage.today_calls));
  dashSetText('dashboard-supervisor-tokens', dashNumber(usage.today_tokens));
  dashSetText('dashboard-supervisor-risks', dashNumber(risks.length));

  const actionsEl = document.getElementById('dashboard-supervisor-actions');
  if (actionsEl) actionsEl.innerHTML = dashSupervisorMarkdownList(actions, '暂无下一步动作');

  const markdownEl = document.getElementById('dashboard-supervisor-markdown');
  if (markdownEl) markdownEl.textContent = markdown || '';
}

function startDashboardPolling() {
  stopDashboardPolling();
  loadDashboardSummary();
  dashboardPollTimer = setInterval(loadDashboardSummary, 5000);
}

function stopDashboardPolling() {
  if (dashboardPollTimer) {
    clearInterval(dashboardPollTimer);
    dashboardPollTimer = null;
  }
}

// ═══════════════════════════════════════════════
// 居中弹窗替换原生alert/confirm
// ═══════════════════════════════════════════════
(function() {
  var _modal = null;
  function getModal() {
    if (_modal) return _modal;
    _modal = document.createElement('div');
    _modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.45);z-index:9999;justify-content:center;align-items:center;';
    document.body.appendChild(_modal);
    return _modal;
  }

  function showModal(title, msg, buttons) {
    return new Promise(function(resolve) {
      var m = getModal();
      var btnsHtml = buttons.map(function(b) {
        return '<button data-val="' + b.val + '" style="padding:8px 24px;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;background:' + (b.color || '#ee4d2d') + ';color:#fff;">' + b.text + '</button>';
      }).join('');
      m.innerHTML = '<div style="background:#fff;border-radius:12px;padding:0;min-width:340px;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,.2);overflow:hidden;">' +
        '<div style="padding:20px 24px 12px;font-size:16px;font-weight:700;color:#222;">' + (title || '') + '</div>' +
        '<div style="padding:0 24px 20px;font-size:14px;color:#555;line-height:1.6;white-space:pre-wrap;">' + (msg || '') + '</div>' +
        '<div style="padding:12px 24px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:10px;">' + btnsHtml + '</div></div>';
      m.style.display = 'flex';
      m.querySelectorAll('[data-val]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          m.style.display = 'none';
          resolve(btn.getAttribute('data-val') === 'true');
        });
      });
    });
  }

  window._origAlert = window.alert;
  window._origConfirm = window.confirm;
  window.alert = function(msg) { showModal('提示', String(msg), [{text: '确定', val: 'true', color: '#ee4d2d'}]); };
  window.confirm = function(msg) { return showModal('确认', String(msg), [{text: '取消', val: 'false', color: '#999'}, {text: '确定', val: 'true', color: '#ee4d2d'}]); };
})();

const PAGE_ALIASES = {
  hotpick: { page: 'selection', tab: 'hotpick' },
  keywords: { page: 'selection', tab: 'keywords' },
  orders: { page: 'selection', tab: 'orders' },
  tianji: { page: 'selection', tab: 'tianji' },
  scoring: { page: 'selection', tab: 'candidates' }
};

const SELECTION_LEGACY_PAGES = {
  hotpick: 'page-hotpick',
  keywords: 'page-keywords',
  orders: 'page-orders',
  tianji: 'page-tianji'
};

function resolvePage(page) {
  return PAGE_ALIASES[page] || { page: page, tab: '' };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, function(ch) {
    return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch];
  });
}

function mountSelectionLegacyPage(tab) {
  const pageId = SELECTION_LEGACY_PAGES[tab];
  if (!pageId) return;
  const legacyPage = document.getElementById(pageId);
  const mount = document.getElementById('selection-' + tab + '-mount');
  if (!legacyPage || !mount) return;
  if (legacyPage.parentElement !== mount) mount.appendChild(legacyPage);
  legacyPage.classList.add('active');
}

function syncSelectionNav(tab) {
  const parent = document.querySelector('.nav-item[data-page="selection"]');
  if (parent) parent.classList.add('active');
  document.querySelectorAll('.nav-subitem[data-selection-target]').forEach(function(item) {
    item.classList.toggle('active', item.dataset.selectionTarget === tab);
  });
}

function countSelectionBy(rows, field) {
  return rows.reduce(function(acc, row) {
    const key = row[field] || '未知';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function renderSelectionOverview(data, rows) {
  const priority = document.getElementById('selection-priority-list');
  const sourceMix = document.getElementById('selection-source-mix');
  const strategyBalance = document.getElementById('selection-strategy-balance');
  const balance = data.balance || {};
  const counts = balance.counts || {};
  const total = data.total || rows.length || 0;

  if (priority) {
    const topRows = rows.slice(0, 8);
    if (!topRows.length) {
      priority.innerHTML = '<div class="selection-empty">暂无候选，先从热销采集、关键词库或订单回流导入。</div>';
    } else {
      priority.innerHTML = topRows.map(function(row) {
        const score = row.decision_score === undefined || row.decision_score === null ? '-' : row.decision_score;
        return '<div class="selection-priority-row">' +
          '<div><strong>' + escapeHtml(row.keyword || '-') + '</strong><span>' + escapeHtml(row.category || row.source_type || '-') + '</span></div>' +
          '<em>' + escapeHtml(row.recommended_strategy || '-') + '</em>' +
          '<b>' + escapeHtml(score) + '</b>' +
        '</div>';
      }).join('');
    }
  }

  if (sourceMix) {
    const sources = countSelectionBy(rows, 'source_type');
    sourceMix.innerHTML = Object.keys(sources).sort(function(a, b) { return sources[b] - sources[a]; }).map(function(key) {
      return '<div class="selection-mini-row"><span>' + escapeHtml(key) + '</span><b>' + escapeHtml(sources[key]) + '</b></div>';
    }).join('') || '<div class="selection-empty">暂无来源数据</div>';
  }

  if (strategyBalance) {
    const strategies = ['引流款', '走量款', '利润款'];
    strategyBalance.innerHTML = strategies.map(function(name) {
      const value = counts[name] || 0;
      const pct = total ? Math.round(value / total * 100) : 0;
      return '<div class="selection-balance-row">' +
        '<div><span>' + name + '</span><b>' + value + ' / ' + pct + '%</b></div>' +
        '<i><u style="width:' + Math.min(100, pct) + '%"></u></i>' +
      '</div>';
    }).join('');
  }
}

async function loadSelectionCandidates() {
  const body = document.getElementById('selection-candidates-body');
  const summary = document.getElementById('selection-summary-strip');
  const balance = document.getElementById('selection-balance');
  if (!body && !summary) return;
  if (body) body.innerHTML = '<tr><td colspan="6" class="selection-empty">加载中...</td></tr>';

  try {
    const res = await demoRequest('/api/selection/candidates');
    const data = await res.json();
    const rows = data.candidates || [];
    selectionCandidatesData = rows;
    const counts = ((data.balance || {}).counts || {});
    if (summary) {
      summary.innerHTML = [
        '<span>候选 ' + escapeHtml(data.total || rows.length || 0) + '</span>',
        '<span>引流 ' + escapeHtml(counts['引流款'] || 0) + '</span>',
        '<span>走量 ' + escapeHtml(counts['走量款'] || 0) + '</span>',
        '<span>利润 ' + escapeHtml(counts['利润款'] || 0) + '</span>'
      ].join('');
    }
    renderSelectionOverview(data, rows);
    if (balance) {
      balance.innerHTML = '<div class="selection-note">4:3:3 目标：引流 40% · 走量 30% · 利润 30%</div>';
    }
    if (!body) return;
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="6" class="selection-empty">暂无候选，先从热销采集、关键词库或订单回流导入。</td></tr>';
      return;
    }
    body.innerHTML = rows.map(function(row, index) {
      const score = row.decision_score === undefined || row.decision_score === null ? '-' : row.decision_score;
      return '<tr>' +
        '<td><strong>' + escapeHtml(row.keyword || '-') + '</strong><div class="selection-muted">' + escapeHtml(row.category || '') + '</div></td>' +
        '<td>' + escapeHtml(row.source_type || '-') + '</td>' +
        '<td>' + escapeHtml(row.recommended_strategy || '-') + '</td>' +
        '<td>' + escapeHtml(score) + '</td>' +
        '<td>' + escapeHtml(row.decision || '-') + '</td>' +
        '<td><button class="btn btn-sm selection-import-btn" type="button" onclick="importSelectionCandidate(' + index + ')">导入关键词库</button></td>' +
      '</tr>';
    }).join('');
  } catch (e) {
    if (body) body.innerHTML = '<tr><td colspan="6" class="selection-empty">候选池加载失败：' + escapeHtml(e.message) + '</td></tr>';
  }
}

async function importSelectionCandidate(index) {
  const candidate = selectionCandidatesData[index];
  if (!candidate) return;
  const cid = candidate.id || candidate.keyword || String(index);
  try {
    const res = await demoRequest('/api/selection/candidates/' + encodeURIComponent(cid) + '/import-keyword', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({candidate: candidate})
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      alert(data.error || '导入关键词库失败');
      return;
    }
    alert(data.skipped ? '关键词库已存在，未重复导入' : '已导入关键词库');
    loadSelectionCandidates();
    if (typeof loadKeywords === 'function') loadKeywords();
  } catch (e) {
    alert('导入关键词库失败：' + e.message);
  }
}

function showSelectionTab(tab) {
  const nextTab = tab || 'overview';
  document.querySelectorAll('.selection-tab').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.selectionTab === nextTab);
  });
  document.querySelectorAll('.selection-panel').forEach(function(panel) {
    panel.classList.toggle('active', panel.dataset.selectionPanel === nextTab);
  });
  Object.values(SELECTION_LEGACY_PAGES).forEach(function(pageId) {
    const legacyPage = document.getElementById(pageId);
    if (legacyPage) legacyPage.classList.remove('active');
  });
  mountSelectionLegacyPage(nextTab);
  syncSelectionNav(nextTab);

  if (nextTab === 'overview' || nextTab === 'candidates') loadSelectionCandidates();
  if (nextTab === 'keywords') { loadKeywords(); loadHistory(); }
}

function renderPricingShadowState(state) {
  pricingShadowState = state || {
    state: 'invalid',
    reason: 'pricing_shadow_status_unavailable'
  };
  const band = document.getElementById('pricing-shadow-status');
  const summary = document.getElementById('pricing-shadow-summary');
  const meta = document.getElementById('pricing-shadow-meta');
  const approve = document.getElementById('pricing-shadow-approve');
  if (!band || !summary || !meta || !approve) return pricingShadowState;

  const currentState = pricingShadowState.state || 'invalid';
  band.dataset.state = currentState;
  const labels = {
    loading: '正在检查精确价格版本',
    approved_current: '精确价格版本已批准',
    approval_required: '精确价格版本待批准',
    invalid: '精确价格版本不可用'
  };
  summary.textContent = labels[currentState] || labels.invalid;

  const identity = pricingShadowState.pricing_identity || {};
  const version = identity.pricing_version || '未知版本';
  const hash = String(pricingShadowState.content_hash || '');
  const comparisonCount = Number(pricingShadowState.comparison_count || 0);
  meta.textContent = currentState === 'invalid'
    ? String(pricingShadowState.reason || '影子报告校验失败')
    : version + ' · ' + (hash ? hash.slice(0, 12) : '无哈希') + ' · ' + comparisonCount + ' 项对比';
  approve.hidden = currentState !== 'approval_required';
  approve.disabled = false;
  return pricingShadowState;
}

async function loadPricingShadowState() {
  renderPricingShadowState({state: 'loading'});
  try {
    const response = await demoRequest('/api/pricing/shadow');
    const data = await response.json();
    if (!response.ok) {
      data.state = 'invalid';
      data.reason = data.reason || data.error || 'pricing_shadow_status_failed';
    }
    return renderPricingShadowState(data);
  } catch (error) {
    return renderPricingShadowState({
      state: 'invalid',
      reason: error.message || 'pricing_shadow_status_failed'
    });
  }
}

async function approveCurrentPricingShadow() {
  if (!pricingShadowState || pricingShadowState.state !== 'approval_required') {
    await loadPricingShadowState();
  }
  if (!pricingShadowState || !pricingShadowState.content_hash) return;
  const version = pricingShadowState.pricing_identity?.pricing_version || '当前版本';
  if (!confirm('确认批准精确价格版本 ' + version + '？')) return;

  const button = document.getElementById('pricing-shadow-approve');
  if (button) button.disabled = true;
  try {
    const response = await demoRequest('/api/pricing/shadow/approve', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        content_hash: pricingShadowState.content_hash
      })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || '价格版本批准失败');
      return await loadPricingShadowState();
    }
    return renderPricingShadowState(data);
  } catch (error) {
    alert('价格版本批准失败：' + error.message);
    return await loadPricingShadowState();
  } finally {
    if (button) button.disabled = false;
  }
}

async function ensurePricingShadowApprovedBeforeTask() {
  const state = await loadPricingShadowState();
  if (state.state === 'approved_current') return true;
  alert('当前精确价格版本尚未批准，请先检查并批准价格影子报告');
  return false;
}

function showPage(page, el) {
  const requestedPage = page;
  const resolved = resolvePage(page);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item,.nav-subitem').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + resolved.page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = el || document.querySelector(`.nav-item[data-page="${resolved.page}"]`);
  if (navEl) navEl.classList.add('active');
  if (resolved.page === 'selection') showSelectionTab(resolved.tab || 'overview');
  if (resolved.page === 'dashboard') startDashboardPolling(); else stopDashboardPolling();
  if (resolved.page === 'stores') loadStores();
  if (resolved.page === 'history') loadTasks();
  if (resolved.page === 'task') loadPricingShadowState();
  if (requestedPage === 'keywords' || resolved.tab === 'keywords') { loadKeywords(); loadHistory(); }
  if (resolved.page === 'ipcontrol') loadIPData();
  if (resolved.page === 'optimize') loadCatGroups();
  if (resolved.page === 'titlelearn') loadTitleCandidates();
}

function goPage(page) {
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  showPage(page, navEl);
}

// ═══════════════════════════════════════════════
// 策略-利润联动
// ═══════════════════════════════════════════════
const STRATEGY_PROFIT = { traffic: 2, sales: 15, profit: 40 };

function onStrategyChange() {
  var strategy = document.getElementById('f-strategy').value;
  var profit = STRATEGY_PROFIT[strategy];
  if (profit !== undefined) {
    var current = parseFloat(document.getElementById('f-profit').value);
    // 只有当前值等于某个策略默认值时才覆盖，手动改过的不动
    var defaults = Object.values(STRATEGY_PROFIT);
    if (isNaN(current) || defaults.includes(current)) {
      document.getElementById('f-profit').value = profit;
    }
    updateProfitBtns(profit);
  }
}

function setProfit(val) {
  document.getElementById('f-profit').value = val;
  updateProfitBtns(val);
}

function updateProfitBtns(activeVal) {
  document.querySelectorAll('#f-profit-btns .btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-val') == activeVal);
  });
}

// 手动修改利润输入框时同步按钮高亮
document.addEventListener('DOMContentLoaded', function() {
  var profitInput = document.getElementById('f-profit');
  if (profitInput) {
    profitInput.addEventListener('input', function() {
      updateProfitBtns(this.value);
    });
  }
  if (document.getElementById('page-dashboard')?.classList.contains('active')) {
    startDashboardPolling();
  }
});

async function parseNL() {
  const text = document.getElementById('nl-command').value.trim();
  if (!text) return;
  const res = await demoRequest('/api/parse', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text})
  });
  const data = await res.json();
  const d = document.getElementById('nl-result');
  d.style.display = 'block';
  const strat = {'traffic':'引流款','sales':'走量款','profit':'利润款'}[data.strategy] || data.strategy;
  d.innerHTML = `
    <div class="parsed-item"><span class="parsed-label">关键词</span><span class="parsed-value">${data.keywords||'-'}</span></div>
    <div class="parsed-item"><span class="parsed-label">站点</span><span class="parsed-value">${(data.sites||[]).join(', ')||'-'}</span></div>
    <div class="parsed-item"><span class="parsed-label">数量</span><span class="parsed-value">${data.quantity||'-'}</span></div>
    <div class="parsed-item"><span class="parsed-label">类目</span><span class="parsed-value">${data.category||'-'}</span></div>
    <div class="parsed-item"><span class="parsed-label">策略</span><span class="parsed-value">${strat}</span></div>
    <div class="parsed-item"><span class="parsed-label">组别</span><span class="parsed-value">${data.group||'-'}</span></div>
    <div class="parsed-item"><span class="parsed-label">折扣</span><span class="parsed-value">${(data.discount*10).toFixed(0)}折</span></div>
    <button class="btn btn-primary" style="margin-top:12px" onclick='fillForm(${JSON.stringify(data)})'>📋 填入表单</button>
  `;
}

function fillForm(data) {
  if (data.keywords) document.getElementById('f-keywords').value = data.keywords;
  if (data.quantity) document.getElementById('f-quantity').value = data.quantity;
  if (data.category) document.getElementById('f-category').value = data.category;
  if (data.strategy) {
    document.getElementById('f-strategy').value = data.strategy;
    onStrategyChange();
  }
  if (data.discount) document.getElementById('f-discount').value = data.discount;
  document.querySelectorAll('[name="f-group"]').forEach(r => {
    r.checked = r.value === data.group;
    r.parentElement.classList.toggle('active', r.value === data.group);
  });
  document.querySelectorAll('.check-btn input').forEach(cb => {
    cb.checked = (data.sites||[]).includes(cb.value);
    cb.parentElement.classList.toggle('active', cb.checked);
  });
}

// 页面加载时清除所有站点勾选（避免上次残留影响新任务）
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.check-btn input').forEach(cb => {
    cb.checked = false;
    cb.parentElement.classList.remove('active');
  });
  refreshTaskKeywordOptions();
});

async function refreshTaskKeywordOptions() {
  const category = document.getElementById('f-category')?.value || '';
  const input = document.getElementById('f-keywords');
  const datalist = document.getElementById('f-keyword-options');
  if (!input || !datalist) return;
  datalist.innerHTML = '';
  if (!category) return;
  try {
    const response = await demoRequest('/api/keywords?category=' + encodeURIComponent(category));
    const rows = await response.json();
    if (!Array.isArray(rows)) return;
    rows.forEach(row => {
      if (!row || !row.buyerKeyword) return;
      const option = document.createElement('option');
      option.value = row.buyerKeyword;
      option.label = row.buyerKeywordEN || row.productStrategy || '';
      datalist.appendChild(option);
    });
    const exactMatch = rows.some(row => row && row.buyerKeyword === input.value.trim());
    if (input.value.trim() && !exactMatch) input.value = '';
  } catch (error) {
    console.warn('failed to load category buyer keywords', error);
  }
}

function selectRadio(el) {
  el.parentElement.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const input = el.querySelector('input');
  input.checked = true;
  if (input.name === 'f-group' && isExplicitTaskStoreScope()) loadExplicitStoreOptions();
}

function isExplicitTaskStoreScope() {
  return document.querySelector('[name="f-store-scope-mode"]:checked')?.value === 'explicit';
}

function selectedExplicitStoreIds() {
  return Array.from(explicitSelectedStoreIds);
}

function selectedExplicitStoreSites() {
  const selected = explicitSelectedStoreIds;
  return Array.from(new Set(explicitStoreOptions
    .filter(store => selected.has(String(store.id || '')))
    .map(store => String(store.site || '').toUpperCase())
    .filter(Boolean)));
}

function setTaskStoreScope(scope, el) {
  const explicit = scope === 'explicit';
  document.querySelectorAll('[name="f-store-scope-mode"]').forEach(input => {
    input.checked = input.value === scope;
    input.closest('.task-scope-segment')?.classList.toggle('active', input.checked);
  });
  if (el) el.classList.add('active');
  const selector = document.getElementById('f-explicit-stores');
  if (selector) selector.hidden = !explicit;
  document.querySelectorAll('#f-site-options input').forEach(input => {
    input.disabled = explicit;
    input.closest('.check-btn')?.classList.toggle('is-disabled', explicit);
  });
  if (explicit) loadExplicitStoreOptions();
}

function explicitStoreBlockReason(store) {
  const reasonLabels = {
    frozen: '店铺已冻结',
    store_frozen: '店铺已冻结',
    capacity_unverified: '容量未验证',
    capacity_stale: '\u5168\u91cf\u5bb9\u91cf\u6bcf\u5468\u66f4\u65b0\uff1b\u6267\u884c\u524d\u4f1a\u5237\u65b0\u76ee\u6807\u5e97\u94fa',
    stale_capacity: '\u5168\u91cf\u5bb9\u91cf\u6bcf\u5468\u66f4\u65b0\uff1b\u6267\u884c\u524d\u4f1a\u5237\u65b0\u76ee\u6807\u5e97\u94fa',
    at_or_above_85_percent: '已达到 85% 上限',
    daily_quota_exhausted: '今日额度已用完',
    daily_quota_unverified: '今日发布量不可读，请先同步商品底账'
  };
  const reasons = Array.isArray(store.publish_block_reasons) ? store.publish_block_reasons : [];
  return reasons.map(reason => reasonLabels[reason] || reason).join('、');
}

function explicitStoreCapacityWarning(store) {
  const warningLabels = {
    capacity_unavailable: '容量暂不可用，仍可尝试发布',
    capacity_stale: '容量数据较旧，提交前仅刷新该店',
    capacity_at_or_above_limit: '容量已满或超标，仍可尝试发布',
    capacity_requested_exceeds_remaining: '计划数量超过容量余量，以平台结果为准',
    capacity_refresh_failed: '容量刷新失败，仍按原计划尝试',
    capacity_writeback_incomplete: '容量读回未写入本地缓存'
  };
  const warnings = Array.isArray(store.capacity_warnings) ? store.capacity_warnings : [];
  return [...new Set(warnings
    .map(warning => typeof warning === 'string' ? warning : warning?.code)
    .filter(Boolean)
    .map(code => warningLabels[code] || code))]
    .join('、');
}

function explicitStoreSaturation(store) {
  const direct = Number(store.saturation);
  if (Number.isFinite(direct)) return direct;
  const current = Number(store.current_products || 0);
  const capacity = Number(store.total_capacity || 0);
  return capacity > 0 ? current / capacity * 100 : 0;
}

async function loadExplicitStoreOptions() {
  const group = document.querySelector('[name="f-group"]:checked')?.value || 'G1';
  const list = document.getElementById('f-explicit-store-list');
  if (!list) return;
  const requestId = ++explicitStoreRequestId;
  if (explicitStoreGroup && explicitStoreGroup !== group) explicitSelectedStoreIds.clear();
  explicitStoreGroup = group;
  list.innerHTML = '<div class="explicit-store-empty">正在加载店铺...</div>';
  try {
    const response = await demoRequest('/api/stores?group=' + encodeURIComponent(group) + '&publishing=1');
    const data = await response.json();
    if (requestId !== explicitStoreRequestId) return;
    if (!response.ok || data.error) throw new Error(data.error || '店铺加载失败');
    explicitStoreOptions = Array.isArray(data) ? data : (data.stores || []);
    const availableIds = new Set(explicitStoreOptions
      .filter(store => store.publish_eligible)
      .map(store => String(store.id || '')));
    explicitSelectedStoreIds = new Set(selectedExplicitStoreIds().filter(id => availableIds.has(id)));
    renderSelectedExplicitStores();
    renderExplicitStoreOptions();
  } catch (error) {
    if (requestId !== explicitStoreRequestId) return;
    explicitStoreOptions = [];
    explicitSelectedStoreIds.clear();
    renderSelectedExplicitStores();
    list.innerHTML = '<div class="explicit-store-empty is-error">' + escapeHtml(error.message || '店铺加载失败') + '</div>';
  }
}

function filterExplicitStoreOptions() {
  renderExplicitStoreOptions();
}

function updateExplicitStoreCount() {
  const count = document.getElementById('f-explicit-store-count');
  const selectedCount = selectedExplicitStoreIds().length;
  const eligibleCount = explicitStoreOptions.filter(store => store.publish_eligible).length;
  if (count) count.textContent = selectedCount + ' 已选 / ' + eligibleCount + ' 可选';
  const quantity = document.getElementById('f-quantity');
  if (quantity) quantity.min = String(Math.max(1, selectedCount));
}

function renderExplicitStoreOptions() {
  const list = document.getElementById('f-explicit-store-list');
  if (!list) return;
  const query = (document.getElementById('f-store-search')?.value || '').trim().toLowerCase();
  const rows = explicitStoreOptions.filter(store => {
    const haystack = [store.id, store.alias, store.name, store.site, store.category]
      .map(value => String(value || '').toLowerCase()).join(' ');
    return !query || haystack.includes(query);
  });
  updateExplicitStoreCount();
  if (!rows.length) {
    list.innerHTML = '<div class="explicit-store-empty">没有匹配店铺</div>';
    return;
  }
  list.innerHTML = rows.map(store => {
    const id = String(store.id || '');
    const alias = String(store.alias || store.name || id);
    const eligible = Boolean(store.publish_eligible);
    const checked = explicitSelectedStoreIds.has(id);
    const saturation = explicitStoreSaturation(store).toFixed(1);
    const capacityGap = Math.max(0, Number(store.capacity_gap || 0));
    const dailyRemaining = Math.max(0, Number(store.daily_remaining || 0));
    const currentProducts = Math.max(0, Number(store.current_products || 0));
    const totalCapacity = Math.max(0, Number(store.total_capacity || 0));
    const publishedToday = Math.max(0, Number(store.published_today || 0));
    const maxExecutable = Math.max(0, Number(store.max_executable == null ? Math.min(capacityGap, dailyRemaining) : store.max_executable));
    const reason = explicitStoreBlockReason(store);
    const capacityWarning = explicitStoreCapacityWarning(store);
    return '<label class="explicit-store-option' + (eligible ? '' : ' is-blocked') + '">' +
      '<input type="checkbox" data-explicit-store-id="' + escapeHtml(id) + '"' + (checked ? ' checked' : '') + (eligible ? '' : ' disabled') + '>' +
      '<span class="explicit-store-check" aria-hidden="true"></span>' +
      '<span class="explicit-store-main"><strong>' + escapeHtml(alias) + '</strong><small>' + escapeHtml(id) + ' · ' + escapeHtml(store.group || '-') + ' / ' + escapeHtml(store.site || '-') + ' · ' + escapeHtml(store.category || '未分类') + '</small></span>' +
      '<span class="explicit-store-metrics"><b>' + saturation + '% · ' + currentProducts + '/' + totalCapacity + '</b><small>可执行 ' + maxExecutable + ' · 容量余 ' + capacityGap + ' · 今日已上 ' + publishedToday + ' / 余 ' + dailyRemaining + '</small></span>' +
      (capacityWarning ? '<span class="explicit-store-warning">' + escapeHtml(capacityWarning) + '</span>' : '') +
      (reason ? '<span class="explicit-store-reason">' + escapeHtml(reason) + '</span>' : '') +
      '</label>';
  }).join('');
  list.querySelectorAll('[data-explicit-store-id]').forEach(input => {
    input.addEventListener('change', function() {
      const id = this.getAttribute('data-explicit-store-id');
      if (this.checked) explicitSelectedStoreIds.add(id);
      else explicitSelectedStoreIds.delete(id);
      renderSelectedExplicitStores();
      updateExplicitStoreCount();
    });
  });
}

function renderSelectedExplicitStores() {
  const chips = document.getElementById('f-selected-store-chips');
  if (!chips) return;
  const storesById = new Map(explicitStoreOptions.map(store => [String(store.id || ''), store]));
  const ids = selectedExplicitStoreIds();
  chips.innerHTML = ids.map(id => {
    const store = storesById.get(id) || {};
    return '<span class="explicit-store-chip">' + escapeHtml(store.alias || store.name || id) +
      '<button type="button" data-remove-store-id="' + escapeHtml(id) + '" title="移除店铺" aria-label="移除店铺">×</button></span>';
  }).join('');
  chips.querySelectorAll('[data-remove-store-id]').forEach(button => {
    button.addEventListener('click', function() {
      explicitSelectedStoreIds.delete(this.getAttribute('data-remove-store-id'));
      document.querySelectorAll('[data-explicit-store-id]').forEach(input => {
        if (input.getAttribute('data-explicit-store-id') === this.getAttribute('data-remove-store-id')) input.checked = false;
      });
      renderSelectedExplicitStores();
      updateExplicitStoreCount();
    });
  });
}

document.addEventListener('change', function(e) {
  if (e.target.closest('.check-btn')) e.target.parentElement.classList.toggle('active', e.target.checked);
});

function getProfitOverrideValue() {
  var profitRaw = document.getElementById('f-profit')?.value;
  var profitVal = parseFloat(profitRaw);
  if (isNaN(profitVal) || profitRaw === '' || profitRaw === undefined) {
    var strategy = document.getElementById('f-strategy').value;
    profitVal = STRATEGY_PROFIT[strategy] || 15;
    document.getElementById('f-profit').value = profitVal;
  }
  return isNaN(profitVal) ? null : profitVal;
}

function buildFormTaskPayload(batchParams) {
  const sourcePayload = collectSourcePayload();
  const batch = batchParams || { publish_mode: 'once', batches: null };
  const explicit = isExplicitTaskStoreScope();
  const targetStoreIds = explicit ? selectedExplicitStoreIds() : [];
  const sites = explicit
    ? selectedExplicitStoreSites()
    : Array.from(document.querySelectorAll('#f-site-options .check-btn input:checked')).map(cb => cb.value);
  return {
    mode: 'form',
    keywords: document.getElementById('f-keywords').value.trim(),
    group: document.querySelector('[name="f-group"]:checked')?.value || 'G1',
    strategy: document.getElementById('f-strategy').value,
    category: document.getElementById('f-category').value,
    quantity: parseInt(document.getElementById('f-quantity').value) || 80,
    discount: parseFloat(document.getElementById('f-discount').value) || 0.6,
    profit_override: getProfitOverrideValue(),
    include_return: document.getElementById('f-return-loss')?.checked || false,
    include_activity: document.getElementById('f-activity-fee')?.checked || false,
    sites: sites,
    store_scope: explicit ? 'explicit' : 'auto',
    target_store_ids: explicit ? selectedExplicitStoreIds() : [],
    cross_category_override: explicit,
    audit_mode: document.getElementById('f-audit-mode').value,
    saturation_filter: document.getElementById('f-saturation').value || '',
    grade_filter: Array.from(document.querySelectorAll('[name="f-grades"]:checked')).map(cb => cb.value),
    source_type: sourcePayload.source_type,
    source_mode: sourcePayload.source_mode,
    source_site: sourcePayload.source_site,
    source_target: sourcePayload.source_target,
    source_intent: sourcePayload.source_intent,
    cross_border_only: sourcePayload.cross_border_only,
    publish_mode: batch.publish_mode,
    batches: batch.batches
  };
}

function validateTaskPayload(params) {
  if (params.source_mode === 'collect_box') {
    if (!params.source_target) { alert('请输入采集箱商品ID'); return false; }
    params.keywords = params.keywords || '[COLLECT_BOX_RESUME]';
  } else
  if (params.source_type === 'shopee') {
    if (params.sites.length > 0) params.source_site = params.sites[0];
    if (params.source_mode === 'keyword') {
      if (!params.keywords) { alert('请输入关键词'); return false; }
    } else if (params.source_mode === 'shop_url') {
      if (!params.source_target) { alert('请输入店铺链接或店铺ID'); return false; }
      params.keywords = params.keywords || '[SHOP_URL_MODE]';
    } else if (params.source_mode === 'product_url') {
      if (!params.source_target) { alert('请输入商品链接'); return false; }
      params.keywords = params.keywords || '[PRODUCT_URL_MODE]';
    }
  } else {
    if (!params.keywords) { alert('请输入关键词'); return false; }
  }
  if (params.store_scope === 'explicit') {
    if (!params.target_store_ids.length) { alert('请至少选择一个店铺'); return false; }
    if (params.quantity < params.target_store_ids.length) { alert('数量必须不少于已选店铺数'); return false; }
  }
  if (params.sites.length === 0) { alert(params.store_scope === 'explicit' ? '所选店铺缺少站点信息' : '请选择至少一个站点'); return false; }
  if (!params.category) { alert('请选择类目'); return false; }
  return true;
}

function logFrontendTaskPayload(params, source) {
  try {
    console.info('[frontend task payload]', source || 'form', JSON.stringify(params));
  } catch (e) {
    console.info('[frontend task payload]', source || 'form', params);
  }
}

async function startTask() {
  const params = buildFormTaskPayload({ publish_mode: 'once', batches: null });
  if (!validateTaskPayload(params)) return;
  if (!await ensurePricingShadowApprovedBeforeTask()) return;
  logFrontendTaskPayload(params, 'form');
  const res = await demoRequest('/api/task/create', {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(params)
  });
  const data = await res.json();
  if (data.error) { alert(data.error); return; }
  currentTaskId = data.task_id;
  showProgressModal('正在启动任务...');
  await demoRequest('/api/task/' + currentTaskId + '/execute', {method: 'POST'});
  pollTaskStatus();
}

function showProgressModal(msg) {
  document.getElementById('progress-status').textContent = msg;
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-modal').style.display = 'flex';
}

function hideProgressModal() {
  document.getElementById('progress-modal').style.display = 'none';
}

function stopTaskPolling() {
  if (taskPollTimer) {
    clearInterval(taskPollTimer);
    taskPollTimer = null;
  }
}

async function fetchTaskStatusOnce() {
  if (!currentTaskId) return;

  try {
    const res = await demoRequest('/api/task/' + currentTaskId + '/status');
    const task = await res.json();
    const live = task.live_status || {};

    const stages = {
      collecting: 20, processing: 50, auditing: 70,
      waiting_confirm: 75, publishing: 85, blocked: 90,
      completed: 100, failed: 100, cancelled: 100
    };

    if (live.status === TASK_STATUS.WAITING_CONFIRM) {
      hideProgressModal();
      if (auditModalShownForTask !== currentTaskId) {
        const auditResult =
          live.audit_result ||
          (task.checkpoints && task.checkpoints.audited) ||
          { total: 0, passed: 0, warned: 0, failed: 0, results: [] };
        showAuditModal(auditResult, currentTaskId);
        auditModalShownForTask = currentTaskId;
      }
      return;
    }

    document.getElementById('progress-status').textContent = live.progress || '处理中...';
    document.getElementById('progress-fill').style.width = (stages[live.status] || 10) + '%';

    if (live.status === TASK_STATUS.COMPLETED) {
      stopTaskPolling();
      hideProgressModal();
      auditModalShownForTask = null;
      loadDashboardSummary();
      const ckData = (task.checkpoints && task.checkpoints.competitive_analysis) || live;
      if (ckData && ckData.name === 'competitive_analysis' && ckData.data) {
        showCompetitiveResults(ckData.data);
      } else {
        alert('✅ ' + live.progress);
      }
      return;
    }

    if (live.status === TASK_STATUS.BLOCKED) {
      stopTaskPolling();
      hideProgressModal();
      auditModalShownForTask = null;
      loadDashboardSummary();
      alert('⛔ ' + (live.progress || '任务等待人工处理'));
      return;
    }

    if (live.status === TASK_STATUS.FAILED || live.status === TASK_STATUS.CANCELLED) {
      stopTaskPolling();
      hideProgressModal();
      auditModalShownForTask = null;
      loadDashboardSummary();
      alert('❌ ' + live.progress);
      return;
    }
  } catch (e) {}
}

async function pollTaskStatus() {
  if (!currentTaskId) return;
  stopTaskPolling();
  await fetchTaskStatusOnce();
  taskPollTimer = setInterval(fetchTaskStatusOnce, 2000);
}

function showAuditModal(auditResult, taskId) {
  const body = document.getElementById('audit-body');
  let html = '<div class="audit-summary">' +
    '<div class="audit-stat"><div class="num" style="color:var(--text)">' + auditResult.total + '</div><div class="label">总计</div></div>' +
    '<div class="audit-stat"><div class="num" style="color:var(--success)">' + auditResult.passed + '</div><div class="label">✅ 通过</div></div>' +
    '<div class="audit-stat"><div class="num" style="color:var(--warning)">' + auditResult.warned + '</div><div class="label">⚠️ 警告</div></div>' +
    '<div class="audit-stat"><div class="num" style="color:var(--danger)">' + auditResult.failed + '</div><div class="label">❌ 不通过</div></div>' +
    '</div>';

  auditResult.results.filter(function(r) { return !r.passed; }).forEach(function(item) {
    html += '<div class="audit-item audit-fail"><div class="audit-title">❌ ' + (item.title||item.product_id) + '</div><div class="audit-detail">' + (item.errors||[]).join(' | ') + '</div></div>';
  });
  auditResult.results.filter(function(r) { return r.passed && r.warnings && r.warnings.length > 0; }).slice(0,5).forEach(function(item) {
    html += '<div class="audit-item audit-warn"><div class="audit-title">⚠️ ' + (item.title||item.product_id) + '</div><div class="audit-detail">' + (item.warnings||[]).join(' | ') + '</div></div>';
  });

  body.innerHTML = html;
  document.getElementById('audit-modal').style.display = 'flex';
  document.getElementById('audit-countdown').textContent = '手动确认';
  document.getElementById('audit-progress').style.width = '100%';
}

async function confirmPublish() {
  if (auditTimer) clearInterval(auditTimer);
  document.getElementById('audit-modal').style.display = 'none';
  showProgressModal('已确认发布，等待任务继续...');
  if (currentTaskId) {
    await demoRequest('/api/task/' + currentTaskId + '/confirm', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action: 'publish'})
    });
  }
}

async function cancelPublish() {
  if (auditTimer) clearInterval(auditTimer);
  document.getElementById('audit-modal').style.display = 'none';
  showProgressModal('已取消发布，等待任务结束...');
  if (currentTaskId) {
    await demoRequest('/api/task/' + currentTaskId + '/confirm', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action: 'cancel'})
    });
  }
}

function closeModal(id) {
  const modalId = id || 'audit-modal';
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
  if (!id && auditTimer) clearInterval(auditTimer);
}

function showCompetitiveResults(data) {
  const results = data.results || [];
  const count = data.count || results.length;
  const sourceType = data.source_type || 'shopee';

  // 启用联动区域
  const linkage = document.getElementById('competitor-source-linkage');
  const summary = document.getElementById('selected-competitor-summary');
  if (linkage) linkage.style.display = 'grid';
  if (summary) summary.style.display = '';

  renderCompetitorSourceLinkage(results, data.sources || []);
}

let _currentCompetitors = [];
let _currentSources = [];

function renderCompetitorSourceLinkage(competitors, sources) {
  _currentCompetitors = competitors || [];
  _currentSources = sources || [];
  const tbody = document.getElementById('competitor-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  _currentCompetitors.forEach((item, idx) => {
    const matchColor = item.match_status === 'matched' ? '#389e0d' : item.match_status === 'review' ? '#d46b08' : '#999';
    const decColor = item.pricing_decision === 'go' ? '#389e0d' : item.pricing_decision === 'risky' ? '#cf1322' : '#999';
    const cur = item.currency || '';
    const origP = item.price_original || item.price || '-';
    const cnyP = item.price_cny ? item.price_cny.toFixed(2) : '-';
    const mktT = item.market_target_price_cny ? item.market_target_price_cny.toFixed(2) : (item.market_target_price || '-');
    const pubP = item.local_display_price ? item.local_display_price.toFixed(2) : '-';
    const pubC = item.local_display_currency || cur;
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = () => selectCompetitorRow(idx);
    tr.innerHTML = `
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${item.title||''}">${(item.title||'').substring(0,30)}</td>
      <td>${item.productStrategy || '-'}</td>
      <td style="color:${matchColor};font-weight:700;">${item.match_status||'unmatched'}</td>
      <td style="font-size:11px;">${origP} ${cur}</td>
      <td style="font-size:11px;color:#1677ff;">${cnyP} CNY</td>
      <td style="font-size:11px;">${mktT} CNY</td>
      <td style="font-weight:700;">${pubP} ${pubC}</td>
      <td style="color:${decColor};font-weight:700;">${item.pricing_decision||'-'}</td>
    `;
    tbody.appendChild(tr);
  });
  if (_currentCompetitors.length > 0) selectCompetitorRow(0);
}

function selectCompetitorRow(idx) {
  const comp = _currentCompetitors[idx];
  if (!comp) return;
  const matchedId = comp.matched_source_id || '';
  const matchedType = comp.matched_source_type || '';
  let candidates = _currentSources;
  if (matchedId) {
    candidates = _currentSources.filter(s =>
      String(s.source_id||'') === String(matchedId) ||
      `${s.source_type||''}:${s.source_id||''}` === `${matchedType}:${matchedId}`
    );
  }
  renderSourceCandidates(candidates, comp);
  renderCompetitorSummary(comp);
}

function renderSourceCandidates(sources, comp) {
  const tbody = document.getElementById('source-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!sources.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:20px;">暂无匹配货源</td></tr>';
    return;
  }
  sources.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.source_type||''}</td>
      <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${item.title||''}">${(item.title||'').substring(0,25)}</td>
      <td>${item.source_cost||'-'}</td>
      <td>${item.estimated_weight||'-'}</td>
      <td>${comp?.match_score||'-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCompetitorSummary(comp) {
  const box = document.getElementById('selected-competitor-summary');
  if (!box) return;
  if (!comp) { box.style.display = 'none'; return; }
  box.style.display = '';
  const decColor = comp.pricing_decision === 'go' ? '#389e0d' : comp.pricing_decision === 'risky' ? '#cf1322' : '#999';
  box.querySelector('.card-body').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;">
      <div><strong style="font-size:12px;color:#999;">标题</strong><div style="font-size:13px;">${comp.title||''}</div></div>
      <div><strong style="font-size:12px;color:#999;">策略</strong><div style="font-size:13px;">${comp.productStrategy||''}</div></div>
      <div><strong style="font-size:12px;color:#999;">匹配状态</strong><div style="font-size:13px;">${comp.match_status||'unmatched'}</div></div>
      <div><strong style="font-size:12px;color:#999;">市场价带</strong><div style="font-size:13px;">P30=${comp.market_price_p30||'-'} P50=${comp.market_price_p50||'-'} P70=${comp.market_price_p70||'-'}</div></div>
      <div><strong style="font-size:12px;color:#999;">成本保底价</strong><div style="font-size:13px;">${comp.cost_based_min_price||'-'}</div></div>
      <div><strong style="font-size:12px;color:#999;">最终建议价</strong><div style="font-size:13px;font-weight:700;">${comp.final_suggest_price || comp.market_target_price||'-'}</div></div>
      <div><strong style="font-size:12px;color:#999;">决策</strong><div style="font-size:13px;font-weight:700;color:${decColor};">${comp.pricing_decision||'-'}</div></div>
      <div><strong style="font-size:12px;color:#999;">匹配货源</strong><div style="font-size:13px;">${comp.matched_source_type?comp.matched_source_type+':'+comp.matched_source_id:'-'}</div></div>
      <div><strong style="font-size:12px;color:#999;">原因</strong><div style="font-size:13px;color:#666;">${comp.pricing_reason||comp.strategy_reason||'-'}</div></div>
    </div>
  `;
}

let allStores = [];
async function loadStores() {
  const res = await demoRequest('/api/stores');
  allStores = await res.json();
  renderStores(allStores);
}

function filterStores() {
  const group = document.getElementById('filter-group').value;
  const site = document.getElementById('filter-site').value;
  let f = allStores;
  if (group) f = f.filter(function(s) { return s.group === group; });
  if (site) f = f.filter(function(s) { return s.site === site; });
  renderStores(f);
}

function renderStores(stores) {
  document.getElementById('stores-tbody').innerHTML = stores.map(function(s) {
    const sc = s.saturation >= 90 ? 'sat-high' : s.saturation >= 50 ? 'sat-mid' : 'sat-low';
    return '<tr><td><code>' + s.id + '</code></td><td>' + s.alias + '</td><td><span class="badge badge-' + s.group.toLowerCase() + '">' + s.group + '</span></td><td>' + s.site + '</td><td>' + s.category + '</td><td><span class="badge badge-' + s.grade.toLowerCase() + '">' + s.grade + '</span></td><td>' + s.current_products + '</td><td>' + s.total_capacity + '</td><td>' + s.saturation + '%<span class="saturation-bar"><span class="saturation-fill ' + sc + '" style="width:' + Math.min(s.saturation,100) + '%"></span></span></td></tr>';
  }).join('');
}

async function loadTasks() {
  const res = await demoRequest('/api/tasks');
  const tasks = await res.json();
  const list = document.getElementById('task-list');
  if (tasks.length === 0) { list.innerHTML = '<p class="empty-state">暂无任务记录</p>'; return; }
  list.innerHTML = tasks.map(function(t) {
    const p = t.input || {};
    const sc = {'completed':'completed','failed':'failed'}[t.status] || 'running';
    return '<div class="task-item"><div class="task-info"><h4>' + (p.keywords||'-') + ' → ' + (p.sites||[]).join(', ') + '</h4><div class="task-meta">' + t.task_id + ' | ' + (p.group||'-') + ' | ' + (p.quantity||'-') + '个 | ' + (t.created_at||'-') + '</div></div><span class="task-status ' + sc + '">' + t.status + '</span></div>';
  }).join('');
}

const AI_CONFIG_PROVIDERS = ['demo_text_a', 'demo_text_b', 'demo_text_c', 'demo_fallback', 'demo_vision'];

function aiField(provider, suffix) {
  return document.getElementById('cfg-' + provider + '-' + suffix);
}

function collectAiConfigPayload() {
  return {
    demo_text_a_key: aiField('demo_text_a', 'key')?.value || '',
    demo_text_a_base_url: aiField('demo_text_a', 'base_url')?.value || '',
    demo_text_a_model: aiField('demo_text_a', 'model')?.value || '',
    demo_text_a_enabled: !!aiField('demo_text_a', 'enabled')?.checked,
    demo_text_b_key: aiField('demo_text_b', 'key')?.value || '',
    demo_text_b_base_url: aiField('demo_text_b', 'base_url')?.value || '',
    demo_text_b_model: aiField('demo_text_b', 'model')?.value || '',
    demo_text_b_enabled: !!aiField('demo_text_b', 'enabled')?.checked,
    demo_text_c_key: aiField('demo_text_c', 'key')?.value || '',
    demo_text_c_base_url: aiField('demo_text_c', 'base_url')?.value || '',
    demo_text_c_model: aiField('demo_text_c', 'model')?.value || '',
    demo_text_c_enabled: !!aiField('demo_text_c', 'enabled')?.checked,
    demo_fallback_key: aiField('demo_fallback', 'key')?.value || '',
    demo_fallback_model: aiField('demo_fallback', 'model')?.value || '',
    demo_fallback_enabled: !!aiField('demo_fallback', 'enabled')?.checked,
    demo_vision_key: aiField('demo_vision', 'key')?.value || '',
    demo_vision_model: aiField('demo_vision', 'model')?.value || '',
    demo_vision_enabled: !!aiField('demo_vision', 'enabled')?.checked,
  };
}

async function readApiJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    const message = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    throw new Error(message || '服务返回了非 JSON 响应');
  }
}

async function saveConfig() {
  const data = collectAiConfigPayload();
  const res = await demoRequest('/api/ai/save', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
  const r = await readApiJson(res);
  alert(r.message || r.error || '已保存');
  loadAiStatus();
}

async function testAI(provider) {
  const btn = document.getElementById('test-' + provider);
  if (btn) { btn.textContent = '测试中...'; btn.disabled = true; }
  try {
    const payload = collectAiConfigPayload();
    const saveRes = await demoRequest('/api/ai/save', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
    const saveResult = await readApiJson(saveRes);
    if (!saveRes.ok || saveResult.error) {
      if (btn) { btn.textContent = '保存失败'; btn.disabled = false; }
      alert(saveResult.error || '配置保存失败');
      return;
    }
    const res = await demoRequest('/api/ai/test?provider=' + provider);
    const r = await readApiJson(res);
    const status = r.ok ? 'OK ' + r.latency_ms + 'ms' : '失败 ' + (r.error || 'Failed');
    if (btn) { btn.textContent = status; btn.disabled = false; }
  } catch (e) {
    if (btn) { btn.textContent = '测试失败'; btn.disabled = false; }
    alert(e.message || '测试失败');
  }
  loadAiStatus();
}

// === AI 状态栏 ===
let aiPanelOpen = false;

async function loadAiStatus() {
  const dot = document.getElementById('ai-dot');
  const label = document.getElementById('ai-label');
  const model = document.getElementById('ai-model');
  dot.className = 'ai-status-dot loading';
  label.textContent = 'AI: 检测中...';
  model.textContent = '';
  try {
    const res = await demoRequest('/api/ai/status');
    const data = await res.json();
    const active = data.providers.find(p => p.name === data.active);
    if (active) {
      dot.className = 'ai-status-dot ok';
      label.textContent = 'AI: ' + (active.label || active.name);
      model.textContent = active.model;
    } else {
      dot.className = 'ai-status-dot err';
      label.textContent = 'AI: 无可用厂商';
      model.textContent = '请配置API Key';
    }
    renderAiProviderList(data);
    renderAiConfigConsole(data);
    const textChain = data.routes?.text?.chain || [];
    const visionChain = data.routes?.vision?.chain || [];
    if (textChain.length || visionChain.length) {
      dot.className = 'ai-status-dot ok';
      label.textContent = 'AI: 路由模式';
      model.textContent = '文本 ' + (textChain[0] || '-') + ' / 图文 ' + (visionChain[0] || '-');
    }
  } catch(e) {
    dot.className = 'ai-status-dot err';
    label.textContent = 'AI: 连接失败';
    model.textContent = e.message;
  }
}

function isCoolingProvider(data, name) {
  const health = data.health?.providers?.[name] || {};
  return Number(health.cooldown_until || 0) * 1000 > Date.now();
}

function renderAiProviderList(data) {
  const list = document.getElementById('ai-provider-list');
  if (!list) return;
  const textChain = data.routes?.text?.chain || [];
  const visionChain = data.routes?.vision?.chain || [];
  const routeRows = [
    `<div class="ai-provider-item active"><span class="ai-provider-dot ok"></span><span class="ai-provider-name">文本: ${textChain.join(' → ') || '-'}</span><span class="ai-provider-badge active">路由</span></div>`,
    `<div class="ai-provider-item"><span class="ai-provider-dot ready"></span><span class="ai-provider-name">图文: ${visionChain.join(' → ') || '-'}</span><span class="ai-provider-badge ready">路由</span></div>`
  ];
  const providerRows = (data.providers || []).map(p => {
    const cooling = isCoolingProvider(data, p.name);
    const statusClass = cooling ? 'err' : (p.enabled && p.has_key ? 'ready' : 'off');
    const badgeClass = cooling ? 'off' : (p.enabled && p.has_key ? 'ready' : 'off');
    const badgeText = cooling ? '冷却' : (p.enabled && p.has_key ? '可用' : '未启用');
    return `<div class="ai-provider-item" title="${p.model || ''}">
      <span class="ai-provider-dot ${statusClass}"></span>
      <span class="ai-provider-name">${p.label || p.name}</span>
      <span class="ai-provider-badge ${badgeClass}">${badgeText}</span>
    </div>`;
  });
  list.innerHTML = routeRows.concat(providerRows).join('');
}

function renderAiConfigConsole(data) {
  if (!document.getElementById('ai-config-console')) return;
  const routes = data.routes || {};
  const textChain = routes.text ? (routes.text.chain || []) : [];
  const visionChain = routes.vision ? (routes.vision.chain || []) : [];
  const usage = data.usage || {};
  const providers = {};
  (data.providers || []).forEach(p => { providers[p.name] = p; });

  const textEl = document.getElementById('ai-route-text');
  const visionEl = document.getElementById('ai-route-vision');
  const usageEl = document.getElementById('ai-route-usage');
  if (textEl) textEl.textContent = textChain.join(' → ') || '未配置';
  if (visionEl) visionEl.textContent = visionChain.join(' → ') || '未配置';
  if (usageEl) usageEl.textContent = (usage.today_calls || 0) + ' calls / ' + (usage.today_tokens || 0) + ' tokens';

  AI_CONFIG_PROVIDERS.forEach(name => {
    const provider = providers[name] || {};
    const health = data.health?.providers?.[name] || {};
    const providerUsage = usage.providers?.[name] || {};
    setAiInput(name, 'base_url', provider.base_url || '');
    setAiInput(name, 'model', provider.model || '');
    setAiCheckbox(name, 'enabled', !!provider.enabled);

    const status = document.getElementById('cfg-' + name + '-status');
    if (status) {
      const cooling = isCoolingProvider(data, name);
      status.textContent = cooling ? '冷却中' : (provider.enabled && provider.has_key ? '可用' : (provider.has_key ? '有Key未启用' : '未配置'));
      status.className = 'ai-config-status ' + (provider.enabled && provider.has_key && !cooling ? 'ready' : 'off');
    }

    const meta = document.getElementById('meta-' + name);
    if (meta) {
      const latency = health.last_latency_ms ? health.last_latency_ms + 'ms' : '-';
      const calls = providerUsage.today_calls || 0;
      const tokens = providerUsage.today_tokens || 0;
      const error = health.last_error ? ' | ' + health.last_error : '';
      meta.textContent = '今日 ' + calls + ' 次 / ' + tokens + ' tokens | 延迟 ' + latency + error;
    }
  });
}

function setAiInput(provider, suffix, value) {
  const el = aiField(provider, suffix);
  if (el && !el.value) el.value = value;
}

function setAiCheckbox(provider, suffix, checked) {
  const el = aiField(provider, suffix);
  if (el) el.checked = checked;
}

function toggleAiPanel() {
  aiPanelOpen = !aiPanelOpen;
  const panel = document.getElementById('ai-panel');
  const arrow = document.getElementById('ai-arrow');
  panel.style.display = aiPanelOpen ? 'block' : 'none';
  arrow.classList.toggle('open', aiPanelOpen);
  if (aiPanelOpen) loadAiStatus();
}

async function switchAi(name) {
  const label = document.getElementById('ai-label');
  label.textContent = 'AI: 切换中...';
  try {
    const res = await demoRequest('/api/ai/switch', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({name})
    });
    const data = await res.json();
    if (data.ok) {
      loadAiStatus();
    } else {
      label.textContent = 'AI: ' + (data.error || '切换失败');
    }
  } catch(e) {
    label.textContent = 'AI: 切换失败';
  }
}

// 页面加载时获取AI状态
document.addEventListener('DOMContentLoaded', loadAiStatus);

async function cleanupProductDB() {
  if (!confirm('确认清理商品库？只删除非活跃记录(inactive/failed)，不影响去重')) return;
  const res = await demoRequest('/api/products/cleanup', {method: 'POST'});
  const data = await res.json();
  if (data.ok) { alert('清理完成，删除了 ' + data.removed + ' 条非活跃记录'); }
  else { alert('清理失败: ' + (data.error || '')); }
}

// === 分批次发布 ===
let batchTimes = [];
let goldenHoursData = {};

function selectPublishMode(mode, el) {
  el.parentElement.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  el.querySelector('input').checked = true;
  document.getElementById('batch-config').style.display = mode === 'batch' ? 'block' : 'none';
  if (mode === 'batch') loadGoldenHours();
}

async function loadGoldenHours() {
  const sites = Array.from(document.querySelectorAll('.checkbox-group .check-btn input:checked')).map(cb => cb.value);
  if (sites.length === 0) return;
  const info = document.getElementById('golden-hours-info');
  info.innerHTML = '加载中...';
  try {
    const res = await demoRequest('/api/golden_hours');
    const data = await res.json();
    goldenHoursData = data;
    let html = '';
    for (const site of sites) {
      const gh = data[site];
      if (gh) {
        html += `<b>${site}</b>: ${gh.peak.join(', ')} (${gh.peak.length}个黄金时段)<br>`;
      }
    }
    info.innerHTML = html || '未找到黄金时段配置';
    autoSplitBatches();
  } catch(e) {
    info.innerHTML = '加载失败: ' + e.message;
  }
}

function autoSplitBatches() {
  const sites = Array.from(document.querySelectorAll('.checkbox-group .check-btn input:checked')).map(cb => cb.value);
  const quantity = parseInt(document.getElementById('f-quantity').value) || 20;
  if (sites.length === 0) return;
  const primarySite = sites[0];
  const gh = goldenHoursData[primarySite];
  if (!gh) return;

  const times = gh.peak;
  const n = times.length;
  const base = Math.floor(quantity / n);
  const remainder = quantity % n;
  const list = document.getElementById('batch-list');
  list.innerHTML = '';
  batchTimes = [];

  for (let i = 0; i < n; i++) {
    const count = base + (i < remainder ? 1 : 0);
    addBatchItem(count, times[i]);
  }
}

function addBatchItem(count, time) {
  const list = document.getElementById('batch-list');
  const idx = list.children.length;
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:4px;';
  div.innerHTML = `
    <span style="font-size:13px;color:var(--text-mid);min-width:40px;">第${idx+1}批:</span>
    <input type="number" class="batch-count" value="${count||1}" min="1" max="500" style="width:60px;">
    <span style="font-size:13px;">个 @</span>
    <select class="batch-time" style="min-width:100px;"></select>
    <button type="button" class="btn" onclick="this.parentElement.remove();renumberBatches();" style="font-size:11px;padding:2px 8px;">删除</button>
  `;
  list.appendChild(div);
  // 填充时间下拉
  const select = div.querySelector('.batch-time');
  const sites = Array.from(document.querySelectorAll('.checkbox-group .check-btn input:checked')).map(cb => cb.value);
  const primarySite = sites[0] || 'SG';
  const gh = goldenHoursData[primarySite];
  const allTimes = gh ? gh.peak : ['12:00','20:00','22:00'];
  for (const t of allTimes) {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    if (t === time) opt.selected = true;
    select.appendChild(opt);
  }
}

function addBatch() {
  const list = document.getElementById('batch-list');
  const lastTime = list.querySelector('.batch-time:last-child')?.value || '12:00';
  addBatchItem(1, lastTime);
}

function renumberBatches() {
  const list = document.getElementById('batch-list');
  list.querySelectorAll('div').forEach((div, i) => {
    div.querySelector('span').textContent = `第${i+1}批:`;
  });
}

function getBatchParams() {
  const mode = document.querySelector('[name="f-publish-mode"]:checked')?.value || 'once';
  if (mode !== 'batch') return { publish_mode: 'once', batches: null };
  const list = document.getElementById('batch-list');
  const batches = [];
  list.querySelectorAll('div').forEach(div => {
    const count = parseInt(div.querySelector('.batch-count').value) || 1;
    const time = div.querySelector('.batch-time').value || '12:00';
    batches.push({ count, time });
  });
  return { publish_mode: 'batch', batches };
}

// 更新startTask函数中的params
const _origStartTask = startTask;
startTask = async function() {
  const batchParams = getBatchParams();
  const params = buildFormTaskPayload(batchParams);
  if (!validateTaskPayload(params)) return;
  if (!await ensurePricingShadowApprovedBeforeTask()) return;
  logFrontendTaskPayload(params, 'form');
  const res = await demoRequest('/api/task/create', {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(params)
  });
  const data = await res.json();
  if (data.error) { alert(data.error); return; }
  currentTaskId = data.task_id;
  showProgressModal('正在启动任务...');
  await demoRequest('/api/task/' + currentTaskId + '/execute', {method: 'POST'});
  pollTaskStatus();
};

// 站点选择变化时刷新黄金时段
document.querySelectorAll('.check-btn input').forEach(cb => {
  cb.addEventListener('change', () => {
    if (document.querySelector('[name="f-publish-mode"]:checked')?.value === 'batch') {
      loadGoldenHours();
    }
  });
});

// === 关键词库（完整版）===
let keywordsData = [];
let editingKwId = null;
let kwSortField = 'blueOceanScore';
let kwSortDir = 'desc';

// 蓝海评分算法
function calcBlueOceanScore(k) {
  const sv = k.searchVolume || 0, cc = k.competitionCount || 99999;
  let score = 0;
  if (sv >= 1000 && sv <= 10000) score += 20; else if (sv >= 500 && sv <= 20000) score += 14; else if (sv > 20000) score += 8; else score += 4;
  if (cc > 0 && cc < 1000) score += 20; else if (cc < 5000) score += 14; else if (cc < 20000) score += 8; else score += 3;
  if (cc > 0 && sv > 0) { const r = sv/cc; score += r>5?20:r>2?15:r>1?10:r>0.5?6:3; } else score += 8;
  if (k.trend === 'rising') score += 20; else if (k.trend === 'stable') score += 12; else score += 5;
  const range = (k.priceHigh||0) - (k.priceLow||0);
  score += range>100?18:range>40?12:range>10?7:3;
  return Math.min(100, Math.round(score));
}

function getHeatBadge(score) {
  if (score >= 80) return '<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">🔵'+score+'</span>';
  if (score >= 60) return '<span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">🟢'+score+'</span>';
  if (score >= 40) return '<span style="background:#fef9c3;color:#a16207;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">🟡'+score+'</span>';
  return '<span style="background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">⚪'+score+'</span>';
}

function getKeywordHealthBadge(health) {
  const status = (health && health.status) || 'review';
  const decision = (health && health.score_decision) || '';
  let label = (health && health.label) || '\u5f85\u5ba1\u6838';
  if (status === 'review' && decision === 'caution') label = '\u8c28\u614e\u590d\u6838';
  if (status === 'review' && decision === 'observe') label = '\u89c2\u5bdf\u590d\u6838';
  if (status === 'review' && decision === 'skip') label = '\u4e0d\u5efa\u8bae';
  const styles = {
    ready: 'background:#dcfce7;color:#15803d;',
    review: 'background:#fef9c3;color:#a16207;',
    high_risk: 'background:#fee2e2;color:#b91c1c;',
    silent: 'background:#f1f5f9;color:#64748b;'
  };
  return '<span class="kw-health-badge" style="' + (styles[status] || styles.review) + '">' + label + '</span>';
}

function getStrategyBadge(s) {
  const value = String(s || '');
  if (value.includes('引流') || value === 'traffic') return '<span class="kw-strategy-badge traffic">引流款</span>';
  if (value.includes('走量') || value === 'sales') return '<span class="kw-strategy-badge sales">走量款</span>';
  if (value.includes('利润') || value === 'profit') return '<span class="kw-strategy-badge profit">利润款</span>';
  return '<span style="color:#999;">-</span>';
}

function getTrendIcon(t) {
  if (t === 'rising') return '<span style="color:#16a34a;">↑上升</span>';
  if (t === 'declining') return '<span style="color:#e74c3c;">↓下降</span>';
  return '<span style="color:#94a3b8;">→平稳</span>';
}

async function loadKeywords() {
  try {
    const res = await demoRequest('/api/keywords');
    keywordsData = await res.json();
    // 计算蓝海评分
    keywordsData.forEach(k => { if (!k.blueOceanScore) k.blueOceanScore = calcBlueOceanScore(k); });
    renderKeywordStats();
    filterKeywords();
    loadKeywordAnalysis();
  } catch(e) { console.error(e); }
}

function kwAnalysisEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

async function loadKeywordAnalysis() {
  const summaryEl = document.getElementById('kw-analysis-summary');
  const samplesEl = document.getElementById('kw-analysis-samples');
  if (!summaryEl || !samplesEl) return;
  summaryEl.innerHTML = '<span class="kw-analysis-muted">分析中...</span>';
  try {
    const res = await demoRequest('/api/keywords/analysis');
    const data = await res.json();
    renderKeywordAnalysis(data);
  } catch (e) {
    console.error(e);
    summaryEl.innerHTML = '<span class="kw-analysis-muted">分析失败，请稍后重试</span>';
    samplesEl.innerHTML = '';
  }
}

function renderKeywordAnalysis(data) {
  const summaryEl = document.getElementById('kw-analysis-summary');
  const samplesEl = document.getElementById('kw-analysis-samples');
  if (!summaryEl || !samplesEl) return;
  const health = data.health || {};
  const scoring = data.scoring || {};
  const cleanup = data.cleanup || {};
  const score = data.score_summary || {};
  const reviewBreakdown = data.review_breakdown || {};
  const chips = [
    ['\u603b\u8bcd\u6570', data.total || 0, 'neutral'],
    ['\u53ef\u6295\u653e', health.ready || 0, 'good'],
    ['\u8c28\u614e\u590d\u6838', reviewBreakdown.caution || 0, 'warn'],
    ['\u89c2\u5bdf\u590d\u6838', reviewBreakdown.observe || 0, 'warn'],
    ['\u9ad8\u98ce\u9669', health.high_risk || 0, 'bad'],
    ['\u5efa\u8bae\u6e05\u7406', cleanup.would_remove || 0, 'bad'],
    ['\u5e73\u5747\u5206', score.avg || 0, 'neutral'],
    ['\u8fdb\u5165\u6c60', scoring.go || 0, 'good']
  ];
  summaryEl.innerHTML = chips.map(([label, value, tone]) =>
    '<span class="kw-analysis-chip ' + tone + '"><b>' + kwAnalysisEscape(value) + '</b>' + kwAnalysisEscape(label) + '</span>'
  ).join('');

  const sampleGroups = [
    ['\u8c28\u614e\u590d\u6838\uff08caution\uff09', (data.samples && data.samples.review_caution) || []],
    ['\u89c2\u5bdf\u590d\u6838\uff08observe\uff09', (data.samples && data.samples.review_observe) || []],
    ['\u9ad8\u98ce\u9669\u6837\u672c', (data.samples && data.samples.high_risk) || []],
    ['\u6e05\u7406\u9884\u89c8', (data.samples && data.samples.cleanup) || []]
  ].filter(([, items]) => items.length);

  if (!sampleGroups.length) {
    samplesEl.innerHTML = '<span class="kw-analysis-muted">\u6682\u65e0\u9700\u8981\u4f18\u5148\u5904\u7406\u7684\u6837\u672c</span>';
    return;
  }

  samplesEl.innerHTML = sampleGroups.map(([title, items]) => {
    const rows = items.slice(0, 4).map(item => {
      const reason = (item.reasons || []).concat(item.cleanup_reason ? [item.cleanup_reason] : []).join(', ');
      return '<li><b>' + kwAnalysisEscape(item.buyerKeyword || '-') + '</b><span>' +
        kwAnalysisEscape(item.category || '-') + ' · ' + kwAnalysisEscape(item.decision || '-') +
        ' · ' + kwAnalysisEscape(reason || 'needs_review') + '</span></li>';
    }).join('');
    return '<div class="kw-analysis-group"><h4>' + kwAnalysisEscape(title) + '</h4><ul>' + rows + '</ul></div>';
  }).join('');
}
let keywordIntakeCandidate = null;

async function analyzeKeywordForIntake() {
  const seedEl = document.getElementById('kw-ai-seed');
  const resultEl = document.getElementById('kw-ai-intake-result');
  if (!seedEl || !resultEl) return;
  const keyword = seedEl.value.trim();
  if (!keyword) { alert('请输入关键词'); return; }
  keywordIntakeCandidate = null;
  resultEl.innerHTML = '<span class="kw-analysis-muted">AI 分析中...</span>';
  try {
    const res = await demoRequest('/api/keywords/ai-analyze', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        keyword,
        category: document.getElementById('kw-ai-category')?.value || '',
        site: document.getElementById('kw-ai-site')?.value || 'SG',
        strategy_mode: document.getElementById('kw-ai-strategy-mode')?.value || 'auto'
      })
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || '分析失败');
    keywordIntakeCandidate = data.candidate || null;
    renderKeywordIntakeResult(data);
  } catch (e) {
    resultEl.innerHTML = '<span class="kw-analysis-muted">分析失败：' + kwAnalysisEscape(e.message) + '</span>';
  }
}

function renderKeywordIntakeResult(data) {
  const resultEl = document.getElementById('kw-ai-intake-result');
  if (!resultEl) return;
  const c = data.candidate || {};
  const final = (data.score && data.score.final) || {};
  const health = data.health || {};
  const canImport = !!data.can_import;
  const btn = canImport
    ? '<button class="btn btn-primary btn-sm" onclick="importKeywordIntakeCandidate()">确认入库</button>'
    : '<button class="btn btn-sm" disabled>不建议入库</button>';
  resultEl.innerHTML =
    '<div class="kw-ai-intake-card">' +
      '<div class="kw-ai-intake-main"><b>' + kwAnalysisEscape(c.buyerKeyword || '-') + '</b><span>' + kwAnalysisEscape(c.buyerKeywordEN || '-') + '</span></div>' +
      '<div class="kw-ai-intake-grid">' +
        '<div><label>找品词</label><strong>' + kwAnalysisEscape(c.supplierKeyword || '-') + '</strong></div>' +
        '<div><label>类目/站点</label><strong>' + kwAnalysisEscape(c.category || '-') + ' / ' + kwAnalysisEscape(c.site || '-') + '</strong></div>' +
        '<div><label>策略</label><strong>' + kwAnalysisEscape(c.productStrategy || '-') + '</strong></div>' +
        '<div><label>决策</label><strong>' + kwAnalysisEscape(final.decision_en || '-') + ' · ' + kwAnalysisEscape(final.final_score || '-') + '</strong></div>' +
        '<div><label>健康</label><strong>' + kwAnalysisEscape(health.status || '-') + '</strong></div>' +
        '<div><label>AI</label><strong>' + kwAnalysisEscape(data.ai_used ? (data.ai_provider || 'used') : ('fallback' + (data.ai_error ? ': ' + data.ai_error : ''))) + '</strong></div>' +
      '</div>' +
      '<div class="kw-ai-intake-note">' + kwAnalysisEscape(c.notes || '请确认货源和站点热度后入库') + '</div>' +
      '<div class="kw-ai-intake-actions">' + btn + '</div>' +
    '</div>';
}

async function importKeywordIntakeCandidate() {
  if (!keywordIntakeCandidate) { alert('请先分析关键词'); return; }
  const res = await demoRequest('/api/keywords/import', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({keywords: [keywordIntakeCandidate]})
  });
  const data = await res.json();
  if (!res.ok || data.error) { alert(data.error || '入库失败'); return; }
  document.getElementById('kw-ai-intake-result').innerHTML = '<span class="kw-analysis-muted">已入库：新增 ' + (data.added || 0) + '，更新 ' + (data.updated || 0) + '</span>';
  keywordIntakeCandidate = null;
  loadKeywords();
}
function renderKeywordStats() {
  const total = keywordsData.length;
  const traffic = keywordsData.filter(k => k.productStrategy === '引流款').length;
  const volume = keywordsData.filter(k => k.productStrategy === '走量款').length;
  const profit = keywordsData.filter(k => k.productStrategy === '利润款').length;
  const blue = keywordsData.filter(k => (k.blueOceanScore || calcBlueOceanScore(k)) >= 80).length;
  const cats = {};
  keywordsData.forEach(k => { cats[k.category] = (cats[k.category]||0) + 1; });
  const topCat = Object.entries(cats).sort((a,b) => b[1]-a[1])[0];
  document.getElementById('kw-stats').innerHTML = `
    <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">总关键词</div></div>
    <div class="stat-card"><div class="stat-value" style="color:#1d4ed8;">${blue}</div><div class="stat-label">🔵 蓝海词</div></div>
    <div class="stat-card"><div class="stat-value" style="color:var(--primary);">${traffic}</div><div class="stat-label">🔴 引流款</div></div>
    <div class="stat-card"><div class="stat-value" style="color:var(--blue);">${volume}</div><div class="stat-label">🔵 走量款</div></div>
    <div class="stat-card"><div class="stat-value" style="color:#7c3aed;">${profit}</div><div class="stat-label">🟣 利润款</div></div>
  `;
  // 策略比例条
  const sum = traffic + volume + profit || 1;
  document.getElementById('kw-strategy-bar').innerHTML = `
    <div style="width:${Math.round(traffic/sum*100)}%;background:#ee4d2d;height:100%;"></div>
    <div style="width:${Math.round(volume/sum*100)}%;background:#0088cc;height:100%;"></div>
    <div style="width:${Math.round(profit/sum*100)}%;background:#7c3aed;height:100%;"></div>
  `;
  document.getElementById('kw-t-count').textContent = traffic;
  document.getElementById('kw-v-count').textContent = volume;
  document.getElementById('kw-p-count').textContent = profit;
  // 类目分布
  const catStats = {};
  keywordsData.forEach(k => { catStats[k.category] = (catStats[k.category]||0) + 1; });
  document.getElementById('kw-cat-stats').innerHTML = Object.entries(catStats).sort((a,b) => b[1]-a[1]).map(([c,n]) =>
    `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e8e8e8;font-size:13px;"><span>${c}</span><b>${n}</b></div>`
  ).join('');
  // Top10蓝海词
  const top10 = [...keywordsData].sort((a,b) => (b.blueOceanScore||calcBlueOceanScore(b)) - (a.blueOceanScore||calcBlueOceanScore(a))).slice(0,10);
  document.getElementById('kw-top10').innerHTML = top10.map((k,i) =>
    `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e8e8e8;font-size:12px;"><span>${i+1}. ${k.buyerKeyword||''}</span><span style="color:#1d4ed8;font-weight:700;">${k.blueOceanScore||calcBlueOceanScore(k)}</span></div>`
  ).join('');
  // 分析历史
  loadHistory();
}

function filterKeywords() {
  const cat = document.getElementById('kw-filter-cat').value;
  const strategy = document.getElementById('kw-filter-strategy').value;
  const health = document.getElementById('kw-filter-health')?.value || '';
  const search = document.getElementById('kw-search').value.toLowerCase();
  let filtered = [...keywordsData];
  if (cat) filtered = filtered.filter(k => k.category === cat);
  if (strategy) filtered = filtered.filter(k => k.productStrategy === strategy);
  if (health) filtered = filtered.filter(k => {
    const kh = k.health || {};
    if (health.startsWith('review:')) return kh.status === 'review' && kh.score_decision === health.split(':')[1];
    return kh.status === health;
  });
  if (search) filtered = filtered.filter(k =>
    (k.buyerKeyword||'').toLowerCase().includes(search) ||
    (k.supplierKeyword||'').toLowerCase().includes(search) ||
    (k.buyerKeywordEN||'').toLowerCase().includes(search)
  );
  // 排序
  filtered.sort((a, b) => {
    let va, vb;
    switch(kwSortField) {
      case 'blueOceanScore': va = a.blueOceanScore||0; vb = b.blueOceanScore||0; break;
      case 'searchVolume': va = a.searchVolume||0; vb = b.searchVolume||0; break;
      case 'competitionCount': va = a.competitionCount||0; vb = b.competitionCount||0; break;
      default: va = a.blueOceanScore||0; vb = b.blueOceanScore||0;
    }
    return kwSortDir === 'desc' ? vb - va : va - vb;
  });
  renderKeywordTable(filtered);
}

function toggleKwSort(field) {
  if (kwSortField === field) kwSortDir = kwSortDir === 'desc' ? 'asc' : 'desc';
  else { kwSortField = field; kwSortDir = 'desc'; }
  filterKeywords();
}

function renderKeywordTable(list) {
  const tbody = document.getElementById('kw-tbody');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:40px;">No keywords</td></tr>'; return; }
  tbody.innerHTML = list.map(k => {
    const score = k.blueOceanScore || calcBlueOceanScore(k);
    const checked = selectedKwIds.has(k.id) ? 'checked' : '';
    const searchVolume = k.searchVolume ? k.searchVolume.toLocaleString() : '-';
    const competition = k.competitionCount ? k.competitionCount.toLocaleString() : '-';
    const category = escapeHtml(k.category || '');
    const site = escapeHtml(k.site || '-');
    return `<tr>
      <td><input type="checkbox" ${checked} data-id="${k.id}" onchange="toggleKwSelect('${k.id}',this)"></td>
      <td class="kw-status-cell">${getKeywordHealthBadge(k.health)}</td>
      <td class="kw-main-cell"><div class="kw-keyword-stack"><div class="kw-keyword-title">${escapeHtml(k.buyerKeyword||'')}</div><div class="kw-meta-line"><span class="kw-category-pill">${category}</span><span>${site}</span></div></div></td>
      <td class="kw-strategy-cell">${getStrategyBadge(k.productStrategy)}</td>
      <td class="kw-market-cell"><b>${searchVolume}</b><span>竞 ${competition}</span><span>${getTrendIcon(k.trend)}</span></td>
      <td class="kw-score-cell">${score}</td>
      <td class="kw-action-cell">
        <button class="btn btn-sm" onclick="editKeyword('${k.id}')" style="font-size:11px;">✏️</button>
        <button class="btn btn-sm" onclick="useKeyword('${k.id}')" style="font-size:11px;background:var(--primary);color:#fff;">🚀使用</button>
        <button class="btn btn-sm" onclick="deleteKeyword('${k.id}')" style="font-size:11px;color:red;">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function showAddKeyword() {
  editingKwId = null;
  document.getElementById('kw-modal-title').textContent = '➕ 添加关键词';
  ['kw-f-buyer','kw-f-supplier'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('kw-f-strategy').value = '';
  document.getElementById('kw-f-category').value = '时尚饰品';
  document.getElementById('kw-f-volume').value = '';
  document.getElementById('kw-f-competition').value = '';
  document.getElementById('kw-f-trend').value = 'stable';
  document.getElementById('kw-f-site').value = 'SG';
  document.getElementById('kw-modal').style.display = 'flex';
}

function editKeyword(id) {
  const k = keywordsData.find(x => x.id === id);
  if (!k) return;
  editingKwId = id;
  document.getElementById('kw-modal-title').textContent = '✏️ 编辑关键词';
  document.getElementById('kw-f-buyer').value = k.buyerKeyword || '';
  document.getElementById('kw-f-supplier').value = k.supplierKeyword || '';
  document.getElementById('kw-f-strategy').value = k.productStrategy || '';
  document.getElementById('kw-f-category').value = k.category || '时尚饰品';
  document.getElementById('kw-f-volume').value = k.searchVolume || '';
  document.getElementById('kw-f-competition').value = k.competitionCount || '';
  document.getElementById('kw-f-trend').value = k.trend || 'stable';
  document.getElementById('kw-f-site').value = k.site || 'SG';
  document.getElementById('kw-modal').style.display = 'flex';
}

function closeKwModal() { document.getElementById('kw-modal').style.display = 'none'; }

async function saveKeyword() {
  const buyer = document.getElementById('kw-f-buyer').value.trim();
  const supplier = document.getElementById('kw-f-supplier').value.trim();
  if (!buyer || !supplier) { alert('请输入买家搜索词和简洁中文找品词'); return; }
  const data = {
    buyerKeyword: buyer, supplierKeyword: supplier,
    productStrategy: document.getElementById('kw-f-strategy').value,
    category: document.getElementById('kw-f-category').value,
    searchVolume: parseInt(document.getElementById('kw-f-volume').value) || 0,
    competitionCount: parseInt(document.getElementById('kw-f-competition').value) || 0,
    trend: document.getElementById('kw-f-trend').value,
    site: document.getElementById('kw-f-site').value
  };
  try {
    if (editingKwId) {
      await demoRequest('/api/keywords/' + editingKwId, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    } else {
      await demoRequest('/api/keywords', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    }
    closeKwModal();
    loadKeywords();
  } catch(e) { alert('保存失败'); }
}

async function deleteKeyword(id) {
  if (!confirm('确定删除？')) return;
  await demoRequest('/api/keywords/' + id, { method: 'DELETE' });
  loadKeywords();
}

// 使用关键词 → 自动填充任务表单
function useKeyword(id) {
  const k = keywordsData.find(x => x.id === id);
  if (!k) return;
  goPage('task');
  if (k.buyerKeyword) document.getElementById('f-keywords').value = k.buyerKeyword;
  if (k.category) document.getElementById('f-category').value = k.category;
  if (k.productStrategy) document.getElementById('f-strategy').value = k.productStrategy === '引流款' ? 'traffic' : k.productStrategy === '走量款' ? 'sales' : 'profit';
  if (k.site) {
    document.querySelectorAll('.check-btn input').forEach(cb => { cb.checked = false; cb.parentElement.classList.remove('active'); });
    const sites = k.site.split(/[,，\s]+/);
    document.querySelectorAll('.check-btn input').forEach(cb => {
      if (sites.some(s => cb.value.includes(s) || s.includes(cb.value))) {
        cb.checked = true; cb.parentElement.classList.add('active');
      }
    });
  }
}

// 导入导出
async function importKeywords() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : (data.keywords || []);
      const res = await demoRequest('/api/keywords/import', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({keywords: arr}) });
      const result = await res.json();
      loadKeywords();
      alert(`导入完成：新增${result.added}条，更新${result.updated}条，共${result.total}条`);
    } catch(e) { alert('导入失败: ' + e.message); }
  };
  input.click();
}

async function exportKeywords() {
  const res = await demoRequest('/api/keywords/export');
  const data = await res.json();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = 'keywords_' + new Date().toISOString().slice(0,10) + '.json';
  a.click(); URL.revokeObjectURL(url);
}

// CSV导出（选品助手格式）
function exportCSV() {
  const headers = ['买家搜索词','找品词','类目','策略','蓝海分','搜索量','竞争数','趋势','站点'];
  const rows = keywordsData.map(k => [k.buyerKeyword||'', k.supplierKeyword||'', k.category||'', k.productStrategy||'', k.blueOceanScore||calcBlueOceanScore(k), k.searchVolume||'', k.competitionCount||'', k.trend||'', k.site||'']);
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = 'keywords_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click(); URL.revokeObjectURL(url);
}

// === 批量操作 ===
let selectedKwIds = new Set();

function toggleSelectAll(el) {
  const checked = el.checked;
  document.querySelectorAll('#kw-tbody input[type="checkbox"]').forEach(cb => {
    cb.checked = checked;
    const id = cb.dataset.id;
    if (checked) selectedKwIds.add(id); else selectedKwIds.delete(id);
  });
  updateBatchBar();
}

function toggleKwSelect(id, el) {
  if (el.checked) selectedKwIds.add(id); else selectedKwIds.delete(id);
  updateBatchBar();
}

function updateBatchBar() {
  const bar = document.getElementById('kw-batch-bar');
  const count = selectedKwIds.size;
  document.getElementById('kw-sel-count').textContent = count;
  bar.style.display = count > 0 ? 'flex' : 'none';
}

function clearSelection() {
  selectedKwIds.clear();
  document.querySelectorAll('#kw-tbody input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('kw-select-all').checked = false;
  updateBatchBar();
}

async function batchSetStrategy(strategy) {
  if (!selectedKwIds.size) return;
  for (const id of selectedKwIds) {
    await demoRequest('/api/keywords/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({productStrategy: strategy}) });
  }
  clearSelection();
  loadKeywords();
}

async function batchDelete() {
  if (!confirm(`确定删除 ${selectedKwIds.size} 条关键词？`)) return;
  for (const id of selectedKwIds) {
    await demoRequest('/api/keywords/' + id, { method: 'DELETE' });
  }
  clearSelection();
  loadKeywords();
}

// === 一键4:3:3自动分配 ===
async function autoAssignStrategy() {
  const unassigned = keywordsData.filter(k => !k.productStrategy);
  if (!unassigned.length) { alert('所有关键词已设置策略'); return; }
  // 按蓝海分排序，高分优先
  unassigned.sort((a,b) => (b.blueOceanScore||calcBlueOceanScore(b)) - (a.blueOceanScore||calcBlueOceanScore(a)));
  const total = unassigned.length;
  const tCount = Math.round(total * 0.4);  // 引流40%
  const vCount = Math.round(total * 0.3);  // 走量30%
  let idx = 0;
  for (const k of unassigned) {
    let strategy;
    if (idx < tCount) strategy = '引流款';
    else if (idx < tCount + vCount) strategy = '走量款';
    else strategy = '利润款';
    await demoRequest('/api/keywords/' + k.id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({productStrategy: strategy}) });
    idx++;
  }
  loadKeywords();
  alert(`已分配 ${total} 条：引流${tCount} / 走量${vCount} / 利润${total-tCount-vCount}`);
}

// === 分析历史 ===
function loadHistory() {
  try {
    const raw = localStorage.getItem('tianji_history');
    if (raw) tianjiHistory = JSON.parse(raw);
  } catch(e) {}
  renderHistory();
}

function saveHistory() {
  localStorage.setItem('tianji_history', JSON.stringify(tianjiHistory.slice(-20)));
}

function renderHistory() {
  const el = document.getElementById('kw-history-list');
  if (!el) return;
  if (!tianjiHistory.length) { el.innerHTML = '<span style="color:#999;">暂无分析记录</span>'; return; }
  el.innerHTML = tianjiHistory.slice(-10).reverse().map(h => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e8e8e8;">
      <span><b>${h.keyword}</b> → ${h.recommendation} | 价格带${h.priceRange||''}</span>
      <span style="color:#999;font-size:12px;">${h.time}</span>
    </div>
  `).join('');
}

// === 田忌赛马分析 ===
let tianjiHistory = [];

function runTianJi() {
  const keyword = document.getElementById('tj-keyword').value.trim();
  const rawData = document.getElementById('tj-rawdata').value.trim();
  const cost = parseFloat(document.getElementById('tj-cost').value) || 0;
  if (!keyword || !rawData) { alert('请输入关键词和竞品数据'); return; }

  // 解析竞品数据
  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const products = [];
  for (const line of lines) {
    const cols = line.split(/[,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 3) continue;
    const name = cols[0];
    const price = parseFloat(cols[1].replace(/[¥$₱RM￥]/g, '').replace(/,/g, ''));
    const sales = parseInt(cols[2].replace(/[,+万kK]/g, m => m === '万' ? '0000' : m === 'k' || m === 'K' ? '000' : '')) || 0;
    if (isNaN(price) || price <= 0) continue;
    products.push({ name, price, sales, shopType: cols[3] || '普通' });
  }

  if (products.length < 3) { alert('至少需要3条有效竞品数据'); return; }

  // 分级
  const maxSales = Math.max(...products.map(p => p.sales), 1);
  const maxPrice = Math.max(...products.map(p => p.price), 1);
  const scored = products.map(p => ({
    ...p,
    composite: (p.price/maxPrice)*0.4 + (p.sales/maxSales)*0.4 + 0.2
  })).sort((a,b) => b.composite - a.composite);

  const n = scored.length;
  const topCut = Math.max(1, Math.round(n * 0.25));
  const lowCut = Math.max(topCut + 1, Math.round(n * 0.75));
  const top = scored.slice(0, topCut);
  const mid = scored.slice(topCut, lowCut);
  const low = scored.slice(lowCut);

  // 推荐策略
  const avgMid = mid.length ? mid.reduce((s,p) => s+p.price, 0) / mid.length : 0;
  const avgLow = low.length ? low.reduce((s,p) => s+p.price, 0) / low.length : 0;
  const recPrice = Math.round(avgMid * 0.85);
  const margin = cost > 0 ? Math.round((1 - cost / recPrice) * 100) : 0;

  const result = {
    keyword, time: new Date().toLocaleString('zh-CN'),
    topCount: top.length, midCount: mid.length, lowCount: low.length,
    recommendation: '利润款',
    priceRange: `¥${Math.round(recPrice*0.8)} - ¥${Math.round(recPrice*1.1)}`,
    recPrice, margin, cost
  };
  tianjiHistory.push(result);
  saveHistory();
  renderHistory();

  // 显示结果
  document.getElementById('tj-result').innerHTML = `
    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:8px;padding:16px;text-align:center;margin-bottom:12px;border:2px solid #f59e0b;">
      <div style="font-size:13px;color:#92400e;">🎯 推荐策略</div>
      <div style="font-size:28px;font-weight:900;color:#7c3aed;margin:4px 0;">🟣 利润款</div>
      <div style="font-size:16px;font-weight:700;color:var(--primary);">推荐售价：${result.priceRange}</div>
      <div style="font-size:12px;color:#92400e;margin-top:4px;">预估毛利率 ${margin}% · 对手中等马均价¥${Math.round(avgMid)}</div>
      <button class="btn btn-sm" style="margin-top:8px;background:#7c3aed;color:#fff;" onclick="saveTianJiToLibrary('${keyword.replace(/'/g,"\\'")}','利润款',${recPrice})">💾 一键入库</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
      <div style="background:#f5f0ff;padding:10px;border-radius:6px;"><b style="color:#7c3aed;">上等马 (${top.length})</b><br><span style="font-size:12px;color:#666;">${top.map(p=>'¥'+p.price).join(', ')||'无'}</span></div>
      <div style="background:#e8f4fd;padding:10px;border-radius:6px;"><b style="color:#0088cc;">中等马 (${mid.length})</b><br><span style="font-size:12px;color:#666;">${mid.map(p=>'¥'+p.price).join(', ')||'无'}</span></div>
      <div style="background:#fff3ed;padding:10px;border-radius:6px;"><b style="color:#ee4d2d;">下等马 (${low.length})</b><br><span style="font-size:12px;color:#666;">${low.map(p=>'¥'+p.price).join(', ')||'无'}</span></div>
    </div>
  `;
}

function saveTianJiToLibrary(keyword, strategy, price) {
  editingKwId = null;
  document.getElementById('kw-modal-title').textContent = '⚡ 田忌赛马 → 入库';
  document.getElementById('kw-f-buyer').value = keyword;
  document.getElementById('kw-f-strategy').value = strategy;
  document.getElementById('kw-f-category').value = '时尚饰品';
  document.getElementById('kw-f-volume').value = '';
  document.getElementById('kw-f-competition').value = '';
  document.getElementById('kw-f-trend').value = 'rising';
  document.getElementById('kw-f-site').value = 'SG';
  document.getElementById('kw-f-supplier').value = '';
  document.getElementById('kw-modal').style.display = 'flex';
}

// 田忌赛马演示数据
function loadTianjiDemo() {
  document.getElementById('tj-keyword').value = 'ins风串珠手链';
  document.getElementById('tj-cost').value = '12';
  document.getElementById('tj-rawdata').value = `ins风星星串珠手链, 19, 890, 普通
韩版珍珠串珠手链, 35, 620, Mall
复古Y2K串珠手链, 25, 450, 普通
天然水晶弹力手链, 59, 380, 优选
日系糖果色串珠手链, 15, 1200, 普通
14K镀金字母手链, 89, 210, Mall
DIY散珠材料包礼盒, 39, 560, 优选
ins风星座串珠手链, 22, 720, 普通
钛钢情侣编织手链, 69, 180, Mall
醋酸亚克力花朵手链, 45, 340, 普通
波西米亚多层串珠链, 55, 290, 优选
韩系极细锁骨手链, 29, 680, 普通
天然石弹力手串套装, 42, 420, 普通
小众设计感字母手链, 95, 150, Mall
彩色琉璃古风手链, 32, 510, 优选
简约纯银细手链, 129, 95, Mall
ins风透明珠子手链, 18, 950, 普通
个性硬币吊坠手链, 49, 310, 普通
定制刻字情侣手链, 79, 230, 优选
复古做旧金属手链, 38, 480, 普通`;
  alert('演示数据已加载，点击"开始分析"');
}

// 订单数据导入
function importOrderData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // 匹配关键词并回填销售数据
      let matched = 0;
      for (const k of keywordsData) {
        const bk = (k.buyerKeyword||'').toLowerCase();
        for (const p of (data.allProducts || data.products || [])) {
          const pk = (p.cnKeyword || p.name || '').toLowerCase();
          if (pk && (pk.includes(bk) || bk.includes(pk))) {
            k.salesData = { verified: true, salesCount: p.salesCount||0, profitMargin: p.profitMargin||'' };
            matched++;
            break;
          }
        }
      }
      await demoRequest('/api/keywords/import', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({keywords: keywordsData}) });
      loadKeywords();
      alert(`订单数据已融合：${matched} 条关键词获得销售验证`);
    } catch(err) { alert('导入失败: ' + err.message); }
  };
  input.click();
}

// 重置关键词库
async function resetKeywords() {
  if (!confirm('确定重置所有关键词为初始数据？此操作不可恢复！')) return;
  await demoRequest('/api/keywords/import', { method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({keywords: []}) });
  // 重新加载种子数据
  const res = await demoRequest('/api/keywords/export');
  const data = await res.json();
  if (data.length === 0) {
    alert('已清空，请手动导入种子数据');
  }
  loadKeywords();
}

// === AI智能扩展 ===
async function aiExpand() {
  const input = document.getElementById('ai-seed').value.trim();
  if (!input) { alert('请输入种子关键词'); return; }
  const statusEl = document.getElementById('ai-status');
  const resultsEl = document.getElementById('ai-results');
  statusEl.textContent = '⏳ AI正在分析...';
  resultsEl.innerHTML = '';

  try {
    const res = await demoRequest('/api/ai/chat', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        prompt: `你是Shopee跨境电商选品专家。输入种子词"${input}"，生成两组关键词：1.买家搜索词(10个) 2.简洁中文找品词(10个，每个只保留一个核心商品名，不要堆砌多个词)。返回JSON格式：{"buyerKeywords":["词1",...],"supplierKeywords":["词1",...]}`,
        system: '返回纯JSON，不要其他文字'
      })
    });
    const data = await res.json();
    let result;
    try { result = JSON.parse(data.text.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch(e) { result = {}; }

    if (result.buyerKeywords || result.supplierKeywords) {
      resultsEl.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="background:#e8f4fd;padding:12px;border-radius:8px;"><b style="color:#0088cc;">🛍️ 买家搜索词</b><div style="margin-top:8px;">${(result.buyerKeywords||[]).map(w=>`<span style="display:inline-block;padding:3px 10px;margin:2px;background:#dbeafe;border-radius:12px;font-size:12px;cursor:pointer;" onclick="quickAddAI('${w.replace(/'/g,"\\'")}','buyer')">${w}</span>`).join('')}</div></div>
          <div style="background:#f5f0ff;padding:12px;border-radius:8px;"><b style="color:#7c3aed;">🏭 找品词</b><div style="margin-top:8px;">${(result.supplierKeywords||[]).map(w=>`<span style="display:inline-block;padding:3px 10px;margin:2px;background:#ede9fe;border-radius:12px;font-size:12px;cursor:pointer;" onclick="quickAddAI('${w.replace(/'/g,"\\'")}','supplier')">${w}</span>`).join('')}</div></div>
        </div>
        <div style="margin-top:8px;font-size:12px;color:#16a34a;">✅ 扩展完成 · 点击词汇可添加到关键词库</div>
      `;
    } else {
      statusEl.textContent = '⚠️ AI返回格式异常，请重试';
    }
  } catch(e) { statusEl.textContent = '❌ ' + e.message; }
}

function quickAddAI(word, type) {
  editingKwId = null;
  document.getElementById('kw-modal-title').textContent = '⚡ AI快速添加';
  document.getElementById('kw-f-buyer').value = type === 'buyer' ? word : '';
  document.getElementById('kw-f-supplier').value = type === 'supplier' ? word : '';
  document.getElementById('kw-f-strategy').value = '';
  document.getElementById('kw-f-category').value = '时尚饰品';
  document.getElementById('kw-f-volume').value = '';
  document.getElementById('kw-f-competition').value = '';
  document.getElementById('kw-f-trend').value = 'stable';
  document.getElementById('kw-f-site').value = 'SG';
  document.getElementById('kw-modal').style.display = 'flex';
}

// === 妙手热销采集 ===
var hotpickResults = [];
var hotTerms = [];
var selectedPlatform = '';

function selectPlatform(el, platform) {
  if (!el) return;
  document.querySelectorAll('.hp-platform-card').forEach(c => {
    c.style.borderColor = '#e8e8e8';
    c.style.background = '#fff';
  });
  el.style.borderColor = '#ee4d2d';
  el.style.background = '#fff5f5';
  selectedPlatform = platform;
}

function parseHotpickCmd() {
  var cmd = document.getElementById('hp-command').value.trim();
  if (!cmd) { alert('请输入采集指令'); return; }
  var cmdLower = cmd.toLowerCase();
  if (cmdLower.includes('shopee')) { selectPlatform(document.querySelector('[data-platform="shopee"]'), 'shopee'); }
  else if (cmdLower.includes('temu')) { selectPlatform(document.querySelector('[data-platform="temu"]'), 'temu'); }
  else if (cmdLower.includes('tiktok') || cmdLower.includes('tk')) { selectPlatform(document.querySelector('[data-platform="tiktok"]'), 'tiktok'); }
  else if (cmdLower.includes('amazon')) { selectPlatform(document.querySelector('[data-platform="amazon"]'), 'amazon'); }
  var sites = ['SG','MY','TH','PH','VN','BR'];
  for (var i = 0; i < sites.length; i++) {
    if (cmd.includes(sites[i])) { document.getElementById('hp-site').value = sites[i]; break; }
  }
  var cats = ['3C数码','时尚饰品','家居生活','母婴玩具','美妆个护','五金园艺'];
  for (var i = 0; i < cats.length; i++) {
    if (cmd.includes(cats[i])) { document.getElementById('hp-category').value = cats[i]; break; }
  }
  startHotpick();
}

function quickHotpick(site, category) {
  selectPlatform(document.querySelector('[data-platform="shopee"]'), 'shopee');
  document.getElementById('hp-site').value = site;
  document.getElementById('hp-category').value = category;
  document.getElementById('hp-command').value = 'Shopee ' + site + ' ' + category + ' 热销';
  startHotpick();
}

async function startHotpick() {
  var platform = selectedPlatform;
  if (!platform) { alert('请先选择平台'); return; }
  var site = document.getElementById('hp-site').value;
  var category = document.getElementById('hp-category').value;
  var limit = document.getElementById('hp-limit').value;
  var cmd = document.getElementById('hp-command').value.trim();
  var resultsEl = document.getElementById('hp-results');
  if (!resultsEl) { alert('页面未加载完成，请刷新页面重试'); return; }
  resultsEl.style.display = 'block';
  var listEl = document.getElementById('hp-results-list');
  var summaryEl = document.getElementById('hp-results-summary');
  if (listEl) listEl.innerHTML = '<div style="text-align:center;padding:30px;">⏳ 正在打开浏览器采集' + platform + '热销数据...<br><small style="color:#999;">请在弹出的浏览器窗口中登录妙手（首次需要），登录后自动采集<br>采集完成后浏览器保持打开，可手动查看数据</small></div>';
  if (summaryEl) summaryEl.innerHTML = '';
  try {
    var body = {platform: platform, site: site, category: category, limit: parseInt(limit) || 15};
    if (cmd) body.command = cmd;
    var controller = new AbortController();
    var timer = setTimeout(function() { controller.abort(); }, 300000);
    var res = await demoRequest('/api/hotpick/collect', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body), signal: controller.signal });
    clearTimeout(timer);
    var data = await res.json();
    if (data.error) { if (listEl) listEl.innerHTML = '<div style="color:red;padding:12px;">❌ ' + data.error + '</div>'; return; }
    hotpickResults = data.products || [];
    hotTerms = data.hot_terms || [];
    renderHotpickResults();
  } catch(e) {
    if (e.name === 'AbortError') { if (listEl) listEl.innerHTML = '<div style="color:red;padding:12px;">❌ 采集超时(5分钟)，请重试</div>'; }
    else { if (listEl) listEl.innerHTML = '<div style="color:red;padding:12px;">❌ ' + e.message + '</div>'; }
  }
}

function renderHotpickResults() {
  var listEl = document.getElementById('hp-results-list');
  var summaryEl = document.getElementById('hp-results-summary');
  if (!listEl || !summaryEl) return;
  if (!hotpickResults.length && !hotTerms.length) { listEl.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">暂无采集结果</div>'; summaryEl.innerHTML = ''; return; }

  // 热搜词展示
  var termsHtml = '';
  if (hotTerms.length > 0) {
    termsHtml = '<div style="margin-bottom:12px;padding:10px;background:#fff5f5;border-radius:8px;"><b style="font-size:13px;">🔥 热搜词：</b> ' + hotTerms.map(function(t) { return '<span style="display:inline-block;padding:2px 8px;margin:2px;background:#fee2e2;border-radius:4px;font-size:12px;">' + t + '</span>'; }).join(' ') + '</div>';
  }

  // 竞品分析表格
  var traffic = 0, volume = 0, profit = 0;
  hotpickResults.forEach(function(k) { if (k.strategy === '引流款') traffic++; else if (k.strategy === '走量款') volume++; else profit++; });
  var rows = hotpickResults.map(function(k, idx) {
    var strat = k.strategy || '';
    var badge = strat === '引流款' ? '<span style="color:#ee4d2d;font-weight:700;background:#fef2f2;padding:1px 6px;border-radius:3px;">引流</span>' : strat === '走量款' ? '<span style="color:#0088cc;font-weight:700;background:#eff6ff;padding:1px 6px;border-radius:3px;">走量</span>' : '<span style="color:#7c3aed;font-weight:700;background:#f5f3ff;padding:1px 6px;border-radius:3px;">利润</span>';
    var cnTitle = k.cn_title || k.title || '';
    var buyerKw = k.buyer_keywords || '';
    var sourceKw = k.source_keywords_1688 || '';
    var storeTag = (k.storeType||'').includes('跨境') ? '<span style="color:#f59e0b;font-size:10px;">跨境</span>' : (k.storeType||'').includes('本土') ? '<span style="color:#9ca3af;font-size:10px;">本土</span>' : '';
    var trendIcon = k.trend === '上升' ? '<span style="color:#10b981;">📈</span>' : k.trend === '下降' ? '<span style="color:#ef4444;">📉</span>' : '<span style="color:#9ca3af;">➡️</span>';
    var compColor = k.competition === '低' ? '#10b981' : k.competition === '高' ? '#ef4444' : '#f59e0b';
    var verdict = k.verdict || '';
    return '<tr style="border-bottom:1px solid #f0f0f0;">' +
      '<td style="padding:6px;"><input type="checkbox" class="hp-result-cb" data-idx="' + idx + '" checked></td>' +
      '<td style="padding:6px;">' + badge + '</td>' +
      '<td style="padding:6px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + cnTitle.replace(/"/g,'&quot;') + '">' + cnTitle.substring(0,28) + '</td>' +
      '<td style="padding:6px;font-size:11px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#0088cc;" title="' + sourceKw.replace(/"/g,'&quot;') + '">' + sourceKw.substring(0,22) + '</td>' +
      '<td style="padding:6px;white-space:nowrap;">' + (k.price||'-') + ' ' + storeTag + '</td>' +
      '<td style="padding:6px;text-align:right;">' + (k.totalSales || k.sales || '-') + '</td>' +
      '<td style="padding:6px;text-align:right;">' + (k.monthSales || '-') + '</td>' +
      '<td style="padding:6px;text-align:right;">' + (k.reviews||'-') + '</td>' +
      '<td style="padding:6px;">' + (k.rating||'-') + '</td>' +
      '<td style="padding:6px;"><span style="color:' + compColor + ';font-size:11px;">' + (k.competition||'中') + '</span> ' + trendIcon + '</td>' +
      '<td style="padding:6px;font-size:11px;color:#7c3aed;" title="成本:'+(k.cost_1688||'-')+' 利润:'+(k.margin||'-')+'">' + (k.suggest_price || '-') + '</td>' +
      '<td style="padding:6px;font-size:11px;color:#666;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + verdict.replace(/"/g,'&quot;') + '">' + verdict.substring(0,20) + '</td>' +
      '</tr>';
  }).join('');
  listEl.innerHTML = termsHtml + '<table style="width:100%;font-size:12px;border-collapse:collapse;"><thead><tr style="background:#f8fafc;text-align:left;">' +
    '<th style="padding:6px;"><input type="checkbox" id="hp-select-all" checked onchange="toggleAllHpResults(this.checked)"></th>' +
    '<th style="padding:6px;">策略</th><th style="padding:6px;">中文标题</th>' +
    '<th style="padding:6px;">找品词</th>' +
    '<th style="padding:6px;">价格</th><th style="padding:6px;text-align:right;">总销量</th>' +
    '<th style="padding:6px;text-align:right;">月销量</th><th style="padding:6px;text-align:right;">评论</th><th style="padding:6px;">评分</th>' +
    '<th style="padding:6px;">竞争/趋势</th><th style="padding:6px;">定价建议</th><th style="padding:6px;">选品结论</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>';
  summaryEl.innerHTML = '<div style="display:flex;gap:16px;flex-wrap:wrap;">' +
    '<span>共 <b>' + hotpickResults.length + '</b> 个竞品</span>' +
    '<span style="color:#ee4d2d;">引流款 ' + traffic + '</span>' +
    '<span style="color:#0088cc;">走量款 ' + volume + '</span>' +
    '<span style="color:#7c3aed;">利润款 ' + profit + '</span>' +
    '<span style="color:#666;">本土 ' + hotpickResults.filter(function(k){return (k.storeType||'').includes('本土')}).length + '</span>' +
    '<span style="color:#666;">跨境 ' + hotpickResults.filter(function(k){return (k.storeType||'').includes('跨境')}).length + '</span>' +
    '</div>';

  // 更新右侧最近采集记录
  updateRecentCollect();
}

function updateRecentCollect() {
  var recentEl = document.getElementById('hp-recent');
  var statsEl = document.getElementById('hp-stats');
  if (!recentEl || !statsEl) return;
  // 存到localStorage
  var history = JSON.parse(localStorage.getItem('hp_history') || '[]');
  var site = document.getElementById('hp-site').value || '全部';
  var cat = document.getElementById('hp-category').value || '全部';
  var limit = document.getElementById('hp-limit').value || '15';
  var entry = {platform: selectedPlatform, site: site, category: cat, limit: limit, count: hotpickResults.length, time: new Date().toLocaleTimeString()};
  history.unshift(entry);
  if (history.length > 5) history = history.slice(0, 5);
  localStorage.setItem('hp_history', JSON.stringify(history));
  // 渲染最近记录
  recentEl.innerHTML = history.map(function(h) {
    return '<div style="padding:4px 0;border-bottom:1px solid #eee;">' +
      '<b>' + h.platform + '</b> ' + h.site + '/' + h.category + ' ' + h.count + '条' +
      '<br><span style="color:#aaa;font-size:10px;">' + h.time + '</span></div>';
  }).join('') || '暂无记录';
  // 渲染统计
  var today = new Date().toLocaleDateString();
  var todayCount = history.filter(function(h) { return h.time && new Date().toLocaleDateString() === today; }).length;
  statsEl.innerHTML = '<div style="display:flex;justify-content:space-between;">' +
    '<span>今日采集 <b>' + history.length + '</b> 次</span>' +
    '<span>最新 <b>' + (history[0] ? history[0].count : 0) + '</b> 条</span>' +
    '</div>';
}

function selectAllHpResults() { document.querySelectorAll('.hp-result-cb').forEach(cb => cb.checked = true); document.getElementById('hp-select-all').checked = true; }
function deselectAllHpResults() { document.querySelectorAll('.hp-result-cb').forEach(cb => cb.checked = false); document.getElementById('hp-select-all').checked = false; }
function toggleAllHpResults(checked) { document.querySelectorAll('.hp-result-cb').forEach(cb => cb.checked = checked); }

async function importSelectedHpResults() {
  var checked = document.querySelectorAll('.hp-result-cb:checked');
  if (!checked.length) { alert('请先勾选要导入的关键词'); return; }
  var toImport = [];
  checked.forEach(cb => { var idx = parseInt(cb.getAttribute('data-idx')); if (hotpickResults[idx]) {
    var k = hotpickResults[idx];
    toImport.push({
      buyerKeyword: k.buyer_keywords || k.cn_title || k.title || '',
      supplierKeyword: k.source_keywords_1688 || k.buyer_keywords || '',
      category: k.ai_category || k.category || '',
      productStrategy: k.strategy || '走量款',
      site: k.site || '',
      source: '热销采集',
      sales: k.totalSales || k.sales,
      price: k.price,
      rating: k.rating,
      cnTitle: k.cn_title || '',
      competition: k.competition || '',
      trend: k.trend || '',
      cost1688: k.cost_1688 || '',
      suggestPrice: k.suggest_price || '',
      margin: k.margin || ''
    });
  }});
  if (!toImport.length) return;
  try {
    var res = await demoRequest('/api/hotpick/import', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({keywords: toImport}) });
    var data = await res.json();
    if (data.ok) { alert('成功导入 ' + data.added + ' 个关键词到关键词库（共 ' + data.total + ' 个）'); }
    else { alert('导入失败: ' + (data.error || '未知错误')); }
  } catch(e) { alert('导入失败: ' + e.message); }
}

async function batchCreateFromHotpick() {
  var checked = document.querySelectorAll('.hp-result-cb:checked');
  if (!checked.length) { alert('请先勾选要创建任务的商品'); return; }
  var site = document.getElementById('hp-site').value || '';
  var category = document.getElementById('hp-category') ? document.getElementById('hp-category').value : '';
  var group = 'G1';
  var strategy = 'sales';
  var discount = 0.6;
  var count = checked.length;
  if (!site) { alert('请先选择目标站点'); return; }
  var sites = site ? [site] : [];
  if (sites.length === 0) { alert('请先选择目标站点'); return; }
  var confirmed = confirm('将为 ' + count + ' 个商品创建上架任务\n站点: ' + sites.join(',') + '\n组别: ' + group + '\n策略: ' + strategy);
  if (!confirmed) return;
  for (var i = 0; i < checked.length; i++) {
    var idx = parseInt(checked[i].getAttribute('data-idx'));
    var k = hotpickResults[idx];
    if (!k) continue;
    var keyword = k.buyer_keywords || k.cn_title || k.title || '';
    if (!keyword) continue;
    try {
      var hpPayload = {mode:'form', keywords: keyword, group: group, strategy: strategy, category: category, quantity: 1, discount: discount, sites: sites, profit_override: parseFloat(document.getElementById('f-profit')?.value) || STRATEGY_PROFIT[strategy] || 15, audit_mode: 'lenient', saturation_filter: document.getElementById('f-saturation')?.value || '', grade_filter: Array.from(document.querySelectorAll('[name="f-grades"]:checked')).map(cb => cb.value), ...collectSourcePayload()};
      logFrontendTaskPayload(hpPayload, 'hotpick');
      var res = await demoRequest('/api/task/create', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify(hpPayload)
      });
      var data = await res.json();
      if (data.task_id) {
        demoRequest('/api/task/' + data.task_id + '/execute', {method:'POST'});
      }
    } catch(e) {}
  }
  alert('已提交 ' + count + ' 个任务到执行队列');
}

// === 智能优化 ===
var optGroup = 'G1';
var optType = '';

function switchOptGroup(g) {
  optGroup = g;
  document.querySelectorAll('#page-optimize .btn-sm').forEach(b => b.classList.remove('active'));
  document.getElementById('opt-' + g.toLowerCase()).classList.add('active');
  var groupLabel = document.getElementById('opt-active-group-label');
  if (groupLabel) groupLabel.textContent = g;
}

function parseOptCmd() {
  var cmd = document.getElementById('opt-command').value.trim();
  if (!cmd) { alert('请输入指令'); return; }
  var cmdLower = cmd.toLowerCase();
  // 解析操作类型
  if (cmdLower.includes('改价') || cmdLower.includes('价格')) selectOptType('price');
  else if (cmdLower.includes('清理') || cmdLower.includes('滞销') || cmdLower.includes('下架')) selectOptType('cleanup');
  else if (cmdLower.includes('优化') || cmdLower.includes('listing') || cmdLower.includes('标题')) selectOptType('listing');
  else if (cmdLower.includes('库存') || cmdLower.includes('同步')) selectOptType('stock');
  // 解析店铺
  if (cmdLower.includes('g1')) switchOptGroup('G1');
  else if (cmdLower.includes('g2')) switchOptGroup('G2');
}

var imagePreviewObjectUrl = '';
var imageSkuObjectUrls = [];
var imageMainPreviewJob = null;
var imageSkuPreviewJob = null;
var imageWriteBatch = null;
var imageWriteConfirmationNonce = '';
var imageAuthorityMode = 'plan_only';
var imageExecuteReleased = false;

var imageWriteReasonCopy = {
  authority_mode_plan_only: '当前为计划模式，不能执行写回',
  capability_not_released: '图片写回能力尚未发布',
  acceptance_evidence_missing: '图片写回验收证据不可用',
  acceptance_evidence_stale: '图片写回验收证据已失效',
  image_write_lock_unavailable: '该店铺或商品正在执行其他任务',
  browser_ownership_mismatch: '浏览器与目标店铺不匹配',
  preview_job_stale: '预览已变化，请重新生成并审核',
  canonical_target_stale: '店铺或站点已变化，请重新选择',
  confirmation_conflict: '该批次已由另一份确认锁定',
  verification_failed: '平台回读与确认图片不一致，需要人工核对',
  write_outcome_unknown: '平台写入结果不明确，需要人工核对',
  blocked: '写回在平台修改前已阻止',
  batch_not_executable: '该批次已结束或正在处理，不能再次执行'
};

function imageWriteReason(code) {
  return imageWriteReasonCopy[code] || '操作未完成，请核对批次状态';
}

function setImageWriteStatus(message, state) {
  var progress = document.getElementById('image-write-progress');
  if (!progress) return;
  progress.textContent = message || '';
  progress.dataset.state = state || '';
}

function setImageWriteResult(message, state) {
  var result = document.getElementById('image-write-result');
  if (!result) return;
  result.textContent = message || '';
  result.dataset.state = state || '';
}

function resetImageWriteBatchState() {
  imageWriteBatch = null;
  imageWriteConfirmationNonce = '';
  var confirmButton = document.getElementById('image-final-confirm');
  var executeButton = document.getElementById('image-write-execute');
  var store = document.getElementById('image-target-store');
  var mainDecision = document.getElementById('image-main-decision');
  var skuDecisions = document.querySelectorAll('.image-sku-decision');
  if (store) store.disabled = false;
  if (mainDecision) mainDecision.disabled = !imageMainPreviewJob;
  skuDecisions.forEach(function(input) { input.disabled = false; });
  if (confirmButton) confirmButton.disabled = true;
  if (executeButton) executeButton.disabled = true;
  setImageWriteStatus('等待完整审核', '');
  setImageWriteResult('', '');
}

function syncImageTargetSite() {
  var store = document.getElementById('image-target-store');
  var site = document.getElementById('image-target-site');
  if (!store || !site) return;
  var option = store.options[store.selectedIndex];
  site.value = option && option.dataset.site ? option.dataset.site : '';
}

function syncImageWriteConfirmation() {
  syncImageTargetSite();
  if (imageWriteBatch) return;
  var store = document.getElementById('image-target-store');
  var mainDecision = document.getElementById('image-main-decision');
  var skuDecisions = Array.from(
    document.querySelectorAll('.image-sku-decision')
  );
  var mainAccepted = !imageMainPreviewJob || (
    mainDecision && !mainDecision.disabled && mainDecision.checked
  );
  var skuAccepted = !imageSkuPreviewJob || (
    skuDecisions.length === (imageSkuPreviewJob.artifacts || []).length
    && skuDecisions.every(function(input) { return input.checked; })
  );
  var hasPreview = Boolean(imageMainPreviewJob || imageSkuPreviewJob);
  var confirmButton = document.getElementById('image-final-confirm');
  if (confirmButton) {
    confirmButton.disabled = !(
      hasPreview && store && store.value && mainAccepted && skuAccepted
    );
  }
}

async function loadImageWriteSetup() {
  var storeSelect = document.getElementById('image-target-store');
  if (!storeSelect) return;
  try {
    var responses = await Promise.all([
      demoRequest('/api/stores'),
      demoRequest('/api/supervisor/authority'),
      demoRequest('/api/supervisor/authority/releases')
    ]);
    var stores = await responses[0].json();
    var authority = await responses[1].json();
    var releases = await responses[2].json();
    stores.slice().sort(function(left, right) {
      return String(left.id).localeCompare(String(right.id));
    }).forEach(function(store) {
      var option = document.createElement('option');
      option.value = store.id;
      option.dataset.site = store.site;
      option.textContent = store.id + ' · ' + store.group + ' · ' + store.site;
      storeSelect.appendChild(option);
    });
    imageAuthorityMode = authority.authority_mode || 'plan_only';
    imageExecuteReleased = (releases.released_capabilities || []).includes(
      'image.execute'
    );
  } catch (error) {
    setImageWriteResult('店铺或权限状态加载失败', 'error');
  }
}

function renderImagePreviewFrame(frame, src, alt) {
  frame.innerHTML = '';
  var image = document.createElement('img');
  image.src = src;
  image.alt = alt;
  frame.appendChild(image);
}

function setImagePreviewStatus(message, state) {
  var status = document.getElementById('image-preview-status');
  if (!status) return;
  status.textContent = message || '';
  status.dataset.state = state || '';
}

function switchImageTab(tab) {
  var sku = tab === 'sku';
  document.getElementById('image-main-panel').hidden = sku;
  document.getElementById('image-sku-panel').hidden = !sku;
  document.getElementById('image-main-tab').classList.toggle('active', !sku);
  document.getElementById('image-sku-tab').classList.toggle('active', sku);
  document.getElementById('image-main-tab').setAttribute(
    'aria-selected', String(!sku)
  );
  document.getElementById('image-sku-tab').setAttribute(
    'aria-selected', String(sku)
  );
}

function renderSkuBindingRows(files) {
  imageSkuObjectUrls.forEach(function(url) { URL.revokeObjectURL(url); });
  imageSkuObjectUrls = [];
  var container = document.getElementById('image-sku-bindings');
  container.innerHTML = '';
  files.forEach(function(file, index) {
    var row = document.createElement('div');
    row.className = 'image-sku-binding-row';
    row.dataset.position = String(index);
    var image = document.createElement('img');
    var imageUrl = URL.createObjectURL(file);
    imageSkuObjectUrls.push(imageUrl);
    image.src = imageUrl;
    image.alt = file.name;
    var name = document.createElement('span');
    name.textContent = file.name;
    var sku = document.createElement('input');
    sku.type = 'text';
    sku.dataset.field = 'platform-sku-id';
    sku.placeholder = '平台 SKU ID';
    sku.setAttribute('aria-label', '平台 SKU ID');
    var variant = document.createElement('input');
    variant.type = 'text';
    variant.dataset.field = 'variant-identity';
    variant.placeholder = '变体名称';
    variant.setAttribute('aria-label', '变体名称');
    row.append(image, name, sku, variant);
    container.appendChild(row);
  });
  document.getElementById('image-sku-results').innerHTML = '';
  document.getElementById('image-sku-status').textContent = '';
  imageSkuPreviewJob = null;
  resetImageWriteBatchState();
  syncImageWriteConfirmation();
}

function bindImagePreviewInput() {
  var fileInput = document.getElementById('image-main-file');
  document.getElementById('image-mode-conservative').classList.add('active');
  document.getElementById('image-mode-marketing').setAttribute('aria-disabled', 'true');
  document.getElementById('image-main-tab').setAttribute('aria-selected', 'true');
  document.getElementById('image-sku-tab').setAttribute('aria-selected', 'false');
  document.getElementById('image-sku-files').addEventListener(
    'change',
    function(event) {
      renderSkuBindingRows(Array.from(event.target.files || []));
    }
  );
  fileInput.addEventListener('change', function() {
    if (imagePreviewObjectUrl) URL.revokeObjectURL(imagePreviewObjectUrl);
    var file = fileInput.files && fileInput.files[0];
    imageMainPreviewJob = null;
    var decision = document.getElementById('image-main-decision');
    decision.checked = false;
    decision.disabled = true;
    resetImageWriteBatchState();
    syncImageWriteConfirmation();
    if (!file) return;
    imagePreviewObjectUrl = URL.createObjectURL(file);
    renderImagePreviewFrame(
      document.getElementById('image-preview-before'),
      imagePreviewObjectUrl,
      '原始主图'
    );
    document.getElementById('image-preview-after').innerHTML = '<span>未生成</span>';
    setImagePreviewStatus('', '');
  });
  loadImageWriteSetup();
}

async function imageFileSha256(file) {
  var digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map(function(value) { return value.toString(16).padStart(2, '0'); })
    .join('');
}

function setSkuPreviewStatus(message, state) {
  var status = document.getElementById('image-sku-status');
  if (!status) return;
  status.textContent = message || '';
  status.dataset.state = state || '';
}

function renderSkuPreviewResults(job) {
  var container = document.getElementById('image-sku-results');
  container.innerHTML = '';
  job.artifacts.forEach(function(artifact) {
    var binding = artifact.sku_binding;
    var row = document.createElement('div');
    row.className = 'image-sku-result-row';
    row.dataset.position = String(binding.position);

    var identity = document.createElement('div');
    identity.className = 'image-sku-result-identity';
    var sku = document.createElement('strong');
    sku.textContent = binding.platform_sku_id;
    var variant = document.createElement('span');
    variant.textContent = binding.variant_identity;
    identity.append(sku, variant);
    var decision = document.createElement('label');
    decision.className = 'image-decision-control';
    var decisionInput = document.createElement('input');
    decisionInput.type = 'checkbox';
    decisionInput.className = 'image-sku-decision';
    decisionInput.dataset.artifactId = artifact.artifact_id;
    decisionInput.addEventListener('change', syncImageWriteConfirmation);
    var decisionLabel = document.createElement('span');
    decisionLabel.textContent = '接受此预览';
    decision.append(decisionInput, decisionLabel);
    identity.appendChild(decision);

    var previews = document.createElement('div');
    previews.className = 'image-sku-result-previews';
    [
      ['原图', imageSkuObjectUrls[binding.position]],
      ['预览', artifact.url]
    ].forEach(function(entry) {
      var figure = document.createElement('figure');
      var caption = document.createElement('figcaption');
      caption.textContent = entry[0];
      var image = document.createElement('img');
      image.src = entry[1];
      image.alt = binding.platform_sku_id + ' ' + entry[0];
      figure.append(caption, image);
      previews.appendChild(figure);
    });

    row.append(identity, previews);
    container.appendChild(row);
  });
}

async function runSkuImagePreview() {
  var fileInput = document.getElementById('image-sku-files');
  var files = Array.from(fileInput.files || []);
  var rows = Array.from(
    document.querySelectorAll('#image-sku-bindings .image-sku-binding-row')
  );
  var sourceId = document.getElementById('image-source-item-id').value.trim();
  var detailId = document.getElementById('image-collect-box-detail-id').value.trim();
  var commonId = document.getElementById('image-common-collect-box-detail-id').value.trim();
  var button = document.getElementById('image-sku-preview-run');
  var results = document.getElementById('image-sku-results');

  if (!files.length || rows.length !== files.length) {
    setSkuPreviewStatus('请选择 SKU 图片', 'error');
    return;
  }
  if (!sourceId || !detailId || !commonId) {
    setSkuPreviewStatus('请补齐商品身份', 'error');
    return;
  }
  if (files.some(function(file) {
    return !['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
  })) {
    setSkuPreviewStatus('图片格式不受支持', 'error');
    return;
  }

  var skuBindings = [];
  for (var index = 0; index < files.length; index += 1) {
    var platformSkuId = rows[index].querySelector(
      '[data-field="platform-sku-id"]'
    ).value.trim();
    var variantIdentity = rows[index].querySelector(
      '[data-field="variant-identity"]'
    ).value.trim();
    if (!platformSkuId || !variantIdentity) {
      setSkuPreviewStatus('请补齐每个 SKU 的身份', 'error');
      return;
    }
    skuBindings.push({
      platform_sku_id: platformSkuId,
      variant_identity: variantIdentity,
      position: index,
      input_sha256: await imageFileSha256(files[index])
    });
  }

  button.disabled = true;
  results.innerHTML = '<div class="image-sku-result-loading">正在生成预览</div>';
  results.classList.add('loading');
  setSkuPreviewStatus('正在处理', 'loading');
  try {
    var manifest = {
      product_identity: {
        source_item_id: sourceId,
        collect_box_detail_id: detailId,
        common_collect_box_detail_id: commonId
      },
      slot: 'sku',
      sku_bindings: skuBindings
    };
    var form = new FormData();
    form.append('manifest', JSON.stringify(manifest));
    form.append('target_size', '1024');
    files.forEach(function(file) {
      form.append('images', file, file.name);
    });
    var response = await demoRequest('/api/optimize/images/sku-preview', {
      method: 'POST',
      body: form
    });
    var payload = await response.json();
    if (!response.ok || !payload.ok) {
      var reason = payload.job && payload.job.blocked_reason;
      throw new Error(reason || payload.error || 'SKU 预览失败');
    }
    var job = payload.job;
    job.artifacts = (job.artifacts || []).slice().sort(function(left, right) {
      return left.sku_binding.position - right.sku_binding.position;
    });
    renderSkuPreviewResults(job);
    imageSkuPreviewJob = job;
    resetImageWriteBatchState();
    syncImageWriteConfirmation();
    setSkuPreviewStatus(
      'SKU 预览已生成 · ' + job.artifacts.length + ' 张',
      'success'
    );
  } catch (error) {
    imageSkuPreviewJob = null;
    resetImageWriteBatchState();
    syncImageWriteConfirmation();
    results.innerHTML = '';
    setSkuPreviewStatus(error.message || 'SKU 预览失败', 'error');
  } finally {
    results.classList.remove('loading');
    button.disabled = false;
  }
}

async function runImagePreview() {
  var fileInput = document.getElementById('image-main-file');
  var file = fileInput.files && fileInput.files[0];
  var sourceId = document.getElementById('image-source-item-id').value.trim();
  var detailId = document.getElementById('image-collect-box-detail-id').value.trim();
  var commonId = document.getElementById('image-common-collect-box-detail-id').value.trim();
  var button = document.getElementById('image-preview-run');
  var after = document.getElementById('image-preview-after');
  if (!file || !sourceId || !detailId || !commonId) {
    setImagePreviewStatus('请补齐图片与商品身份', 'error');
    return;
  }
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    setImagePreviewStatus('图片格式不受支持', 'error');
    return;
  }

  button.disabled = true;
  after.innerHTML = '';
  after.classList.add('loading');
  setImagePreviewStatus('正在处理', 'loading');
  try {
    var manifest = {
      product_identity: {
        source_item_id: sourceId,
        collect_box_detail_id: detailId,
        common_collect_box_detail_id: commonId
      },
      slot: 'main',
      media_type: file.type,
      input_sha256: await imageFileSha256(file)
    };
    var form = new FormData();
    form.append('manifest', JSON.stringify(manifest));
    form.append('target_size', '1024');
    form.append('image', file, file.name);
    var response = await demoRequest('/api/optimize/images/preview', {
      method: 'POST',
      body: form
    });
    var payload = await response.json();
    if (!response.ok || !payload.ok) {
      var reason = payload.job && payload.job.blocked_reason;
      throw new Error(reason || payload.error || '预览失败');
    }
    var job = payload.job;
    imageMainPreviewJob = job;
    var decision = document.getElementById('image-main-decision');
    decision.checked = false;
    decision.disabled = false;
    resetImageWriteBatchState();
    syncImageWriteConfirmation();
    renderImagePreviewFrame(
      after,
      job.artifacts[0].url,
      '保守处理预览'
    );
    setImagePreviewStatus(
      '预览已生成 · ' + job.provider.provider + ' / ' + job.provider.model,
      'success'
    );
  } catch (error) {
    imageMainPreviewJob = null;
    var decision = document.getElementById('image-main-decision');
    decision.checked = false;
    decision.disabled = true;
    resetImageWriteBatchState();
    syncImageWriteConfirmation();
    after.innerHTML = '<span>生成失败</span>';
    setImagePreviewStatus(error.message || '预览失败', 'error');
  } finally {
    after.classList.remove('loading');
    button.disabled = false;
  }
}

function newImageConfirmationNonce() {
  var bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return 'image-confirm-' + Array.from(bytes, function(value) {
    return value.toString(16).padStart(2, '0');
  }).join('');
}

function lockImageWriteReview() {
  var store = document.getElementById('image-target-store');
  var mainDecision = document.getElementById('image-main-decision');
  var skuDecisions = document.querySelectorAll('.image-sku-decision');
  var confirmButton = document.getElementById('image-final-confirm');
  if (store) store.disabled = true;
  if (mainDecision) mainDecision.disabled = true;
  skuDecisions.forEach(function(input) { input.disabled = true; });
  if (confirmButton) confirmButton.disabled = true;
}

function imageDecisionForArtifact(artifact) {
  if (artifact.role === 'main') {
    return document.getElementById('image-main-decision');
  }
  return Array.from(document.querySelectorAll('.image-sku-decision')).find(
    function(input) {
      return input.dataset.artifactId === artifact.artifact_id;
    }
  );
}

function renderImageWriteBatchState(batch, reasonCode) {
  var executeButton = document.getElementById('image-write-execute');
  if (!batch || !executeButton) return;
  var status = batch.status || '';
  executeButton.disabled = true;
  if (status === 'confirmed') {
    setImageWriteStatus('整批图片已确认', 'success');
    executeButton.disabled = !(
      imageAuthorityMode === 'controlled_execution' && imageExecuteReleased
    );
    if (imageAuthorityMode !== 'controlled_execution') {
      setImageWriteResult(imageWriteReason('authority_mode_plan_only'), 'error');
    } else if (!imageExecuteReleased) {
      setImageWriteResult(imageWriteReason('capability_not_released'), 'error');
    } else {
      setImageWriteResult('确认已锁定，可以执行一次写回', '');
    }
    return;
  }
  lockImageWriteReview();
  if (status === 'verified') {
    setImageWriteStatus('独立回读已验证', 'success');
    setImageWriteResult('图片写回完成', 'success');
    return;
  }
  if (status === 'writing') {
    setImageWriteStatus('正在写回并等待独立回读', '');
    setImageWriteResult('', '');
    return;
  }
  setImageWriteStatus('批次需要人工核对', 'error');
  setImageWriteResult(imageWriteReason(reasonCode || status), 'error');
}

async function finalizeImageWriteBatch() {
  if (imageWriteBatch) return;
  var confirmButton = document.getElementById('image-final-confirm');
  var store = document.getElementById('image-target-store');
  var site = document.getElementById('image-target-site');
  if (!confirmButton || confirmButton.disabled || !store || !site) return;
  confirmButton.disabled = true;
  setImageWriteStatus('正在锁定整批确认', '');
  setImageWriteResult('', '');
  try {
    var createResponse = await demoRequest('/api/optimize/images/write-batches', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        main_job_id: imageMainPreviewJob ? imageMainPreviewJob.job_id : null,
        sku_job_id: imageSkuPreviewJob ? imageSkuPreviewJob.job_id : null,
        store_id: store.value,
        site: site.value
      })
    });
    var createPayload = await createResponse.json();
    if (!createResponse.ok || !createPayload.ok) {
      throw {imageWriteCode: createPayload.code};
    }
    var nonce = newImageConfirmationNonce();
    var decisions = (createPayload.batch.artifacts || []).map(function(artifact) {
      var input = imageDecisionForArtifact(artifact);
      if (!input || !input.checked) {
        throw {imageWriteCode: 'confirmation_invalid'};
      }
      return {
        job_id: artifact.job_id,
        artifact_id: artifact.artifact_id,
        output_sha256: artifact.output_sha256,
        decision: 'accept'
      };
    });
    var confirmResponse = await demoRequest(
      '/api/optimize/images/write-batches/' + createPayload.batch.batch_id + '/confirm',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          confirmation_nonce: nonce,
          decisions: decisions
        })
      }
    );
    var confirmPayload = await confirmResponse.json();
    if (!confirmResponse.ok || !confirmPayload.ok) {
      throw {imageWriteCode: confirmPayload.code};
    }
    imageWriteBatch = confirmPayload.batch;
    imageWriteConfirmationNonce = nonce;
    lockImageWriteReview();
    renderImageWriteBatchState(imageWriteBatch);
  } catch (error) {
    setImageWriteStatus('整批确认未完成', 'error');
    setImageWriteResult(imageWriteReason(error.imageWriteCode), 'error');
    syncImageWriteConfirmation();
  }
}

async function executeImageWriteBatch() {
  var executeButton = document.getElementById('image-write-execute');
  if (!imageWriteBatch || !executeButton || executeButton.disabled) return;
  executeButton.disabled = true;
  setImageWriteStatus('正在写回并等待独立回读', '');
  setImageWriteResult('', '');
  try {
    var response = await demoRequest(
      '/api/optimize/images/write-batches/' + imageWriteBatch.batch_id + '/execute',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          confirmation_sha256: imageWriteBatch.confirmation_sha256,
          confirmation_nonce: imageWriteConfirmationNonce
        })
      }
    );
    var payload = await response.json();
    if (payload.batch) imageWriteBatch = payload.batch;
    renderImageWriteBatchState(imageWriteBatch, payload.code);
  } catch (error) {
    lockImageWriteReview();
    setImageWriteStatus('写回结果不可用', 'error');
    setImageWriteResult(imageWriteReason('write_outcome_unknown'), 'error');
  }
}

function selectOptType(type) {
  optType = type;
  var paramsEl = document.getElementById('opt-params');
  var titleEl = document.getElementById('opt-params-title');
  var bodyEl = document.getElementById('opt-params-body');
  paramsEl.style.display = 'block';

  if (type === 'image') {
    titleEl.textContent = '图片处理';
    bodyEl.innerHTML = document.getElementById('image-optimize-template').innerHTML;
    bindImagePreviewInput();
    return;
  }

  if (type === 'price') {
    titleEl.textContent = '💰 批量改价 - 参数配置';
    bodyEl.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
      '<div class="form-group"><label>改价模式</label><select id="price-mode"><option value="pricing">按商品策略定价</option><option value="stop_loss">已完成订单止损改价</option></select></div>' +
      '<div class="form-group"><label>目标利润 CNY</label><input type="number" id="opt-margin" value="30" min="0" max="200"></div>' +
      '<div class="form-group"><label>折扣比例</label><select id="opt-discount"><option value="0.5">5折</option><option value="0.6" selected>6折</option><option value="0.7">7折</option><option value="0.8">8折</option></select></div>' +
      '<div class="form-group"><label>最低价格</label><input type="number" id="opt-min-price" value="5" min="0"></div>' +
      '<div class="form-group"><label>最高价格</label><input type="number" id="opt-max-price" value="500" min="0"></div>' +
      '<div class="form-group"><label>只调</label><select id="opt-strategy-filter"><option value="">全部策略</option><option value="引流款">引流款</option><option value="走量款">走量款</option><option value="利润款">利润款</option></select></div>' +
      '<div class="form-group"><label>站点</label><select id="opt-site-filter"><option value="">全部</option><option value="SG">新加坡</option><option value="MY">马来西亚</option><option value="TH">泰国</option><option value="PH">菲律宾</option><option value="VN">越南</option><option value="BR">巴西</option></select></div>' +
      '<div class="form-group"><label>原销售价(当地币)</label><input type="number" id="stop-loss-old-price" value="0" min="0" step="0.01"></div>' +
      '<div class="form-group"><label>亏损金额 CNY</label><input type="number" id="stop-loss-loss-cny" value="0" min="0" step="0.01"></div>' +
      '<div class="form-group"><label>补亏目标利润 CNY（0=自动策略）</label><input type="number" id="stop-loss-profit-cny" value="0" min="0" step="0.01"></div>' +
      '</div>' +
      '<div style="margin-top:8px;padding:8px;background:#eef4ff;border-radius:6px;font-size:12px;color:#31527a;">策略定价调用矩阵经营定价计算器和商品策略；止损改价按工具箱公式：原销售价 +（亏损金额 + 目标利润）× 1.59，并执行站点尾数处理。</div>';
    var priceModeEl = document.getElementById('price-mode');
    if (priceModeEl) {
      priceModeEl.innerHTML = '<option value="online_products" selected>全店在线商品改价</option><option value="order_loss">已完成订单亏损改价</option><option value="pricing">按商品策略定价</option><option value="stop_loss">手工止损单品试算</option>';
    }
    var priceGridEl = bodyEl.querySelector('div');
    if (priceGridEl && !document.getElementById('opt-store-id')) {
      priceGridEl.insertAdjacentHTML('beforeend', '<div class="form-group"><label>指定店铺</label><input type="text" id="opt-store-id" placeholder="可选，如 xjujs666.sg"></div>');
    }
    bodyEl.insertAdjacentHTML('beforeend', '<div style="margin-top:8px;padding:8px;background:#eef4ff;border-radius:6px;font-size:12px;color:#31527a;">order_loss 只筛选已完成订单，按利润从小到大进入订单详情，再点订单商品图片进入产品编辑页改价；有折扣、优惠、活动、加购或套装时标记 cancel_before_price_update，先取消再改价。</div>');
  } else if (type === 'cleanup') {
    titleEl.textContent = '🗑 滞销清理 - 参数配置';
    bodyEl.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
      '<div class="form-group"><label>浏览量低于</label><input type="number" id="opt-view-threshold" value="100" min="0"></div>' +
      '<div class="form-group"><label>饱和率高于 (%)</label><input type="number" id="opt-sat-threshold" value="70" min="0" max="100"></div>' +
      '<div class="form-group"><label>店铺等级</label><div style="display:flex;gap:8px;">' +
        '<label class="check-btn active"><input type="checkbox" name="opt-grade" value="P0" checked> P0</label>' +
        '<label class="check-btn active"><input type="checkbox" name="opt-grade" value="P1" checked> P1</label>' +
        '<label class="check-btn active"><input type="checkbox" name="opt-grade" value="P2" checked> P2</label>' +
        '<label class="check-btn active"><input type="checkbox" id="opt-use-battle-plan" checked> 使用作战计划</label>' +
      '</div></div>' +
      '<div class="form-group"><label>执行模式</label><select id="opt-cleanup-mode"><option value="sync_locked_metrics">同步锁定商品指标</option><option value="preview">预览清理计划</option><option value="select_only">只选中商品</option><option value="auto_down">自动下架，需确认</option></select></div>' +
      '<div class="form-group"><label>指标统计周期</label><select id="opt-metrics-period"><option value="近7日">近7日</option></select></div>' +
      '<div class="form-group"><label>浏览器</label><select id="opt-browser"><option value="chrome">Chrome 9222</option></select></div>' +
      '<div class="form-group"><label>目标饱和率 (%)</label><input type="number" id="opt-target-saturation" value="70" min="0" max="100"></div>' +
      '<div class="form-group"><label>清理数量</label><input type="number" id="opt-max-per-store" value="0" min="0" max="5000"><small style="display:block;color:#666;">0 = 不限量，按饱和率清到 70%</small></div>' +
      '<div class="form-group"><label>指定店铺</label><input type="text" id="opt-store-id" placeholder="可选，如 xjujs666.sg"></div>' +
      '<div class="form-group"><label>上架天数 > </label><input type="number" id="opt-age-days" value="30" min="1"></div>' +
      '</div>' +
      '<div style="margin-top:8px;padding:8px;background:#fff8e9;border-radius:6px;font-size:12px;color:#666;">锁定指标同步会读取滞销清理中的锁定商品，并把销量、浏览量、收藏量、评论数和星级写入商品数据库；清理模式仍按饱和率、浏览量和上架时间执行。</div>';
  } else if (type === 'capacity') {
    titleEl.textContent = '📊 上架量采集 - 参数配置';
    bodyEl.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
      '<div class="form-group"><label>浏览器</label><select id="opt-browser"><option value="chrome">Chrome 9222 / 广州</option><option value="zhanfu_shanghai">战斧上海</option><option value="zhanfu_shandong">战斧山东</option><option value="zhanfu_danyang">战斧丹阳</option><option value="all">全部浏览器</option></select></div>' +
      '<div class="form-group"><label>指定店铺</label><input type="text" id="opt-store-id" placeholder="可选，如 bxynn5885.br"></div>' +
      '</div>' +
      '<div style="margin-top:8px;padding:8px;background:#eefaf7;border-radius:6px;font-size:12px;color:#37635b;">执行后会实际采集并写入 data/listing_capacity/latest.json，同时同步同一份数据到全局 stores.json。</div>';
  } else if (type === 'listing') {
    titleEl.textContent = '📝 Listing优化 - 参数配置';
    bodyEl.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
      '<div class="form-group"><label>优化类型</label><select id="opt-listing-type"><option value="desc" selected>描述优化</option><option value="title">标题优化</option><option value="both">标题+描述</option></select></div>' +
      '<div class="form-group"><label>目标语言</label><select id="opt-lang"><option value="auto" selected>按站点自动</option></select></div>' +
      '<div class="form-group"><label>优化范围</label><select id="opt-listing-scope"><option value="all" selected>锁定有互动优先</option></select></div>' +
      '<div class="form-group"><label>站点</label><select id="opt-site-filter"><option value="">全部</option><option value="SG">新加坡</option><option value="MY">马来西亚</option><option value="TH">泰国</option><option value="PH">菲律宾</option><option value="VN">越南</option><option value="BR">巴西</option></select></div>' +
      '</div>';
    var listingGridEl = bodyEl.querySelector('div');
    if (listingGridEl) {
      listingGridEl.insertAdjacentHTML('beforeend', '<input type="hidden" id="opt-listing-mode" value="run">');
      listingGridEl.insertAdjacentHTML('beforeend', '<div class="form-group"><label>处理上限</label><input type="number" id="opt-listing-limit" value="10" min="1" max="50"></div>');
      listingGridEl.insertAdjacentHTML('beforeend', '<div class="form-group"><label>指定店铺</label><input type="text" id="opt-store-id" placeholder="可选，如 xjujs666.sg"></div>');
      listingGridEl.insertAdjacentHTML('beforeend', '<div class="form-group"><label>浏览器</label><select id="opt-browser"><option value="">自动</option><option value="chrome_g1">G1 Chrome 9222</option><option value="chrome_g2">G2 Chrome 9223</option></select></div>');
      listingGridEl.insertAdjacentHTML('beforeend', '<div class="form-group"><label>写回范围</label><select id="opt-listing-scope"><option value="all" selected>锁定有互动优先</option></select></div>');
    }
    var listingScopeEls = bodyEl.querySelectorAll('#opt-listing-scope');
    if (listingScopeEls.length > 1) {
      listingScopeEls[listingScopeEls.length - 1].closest('.form-group').remove();
    }
    var listingScopeEl = document.getElementById('opt-listing-scope');
    if (listingScopeEl) {
      listingScopeEl.innerHTML = '<option value="all" selected>锁定有互动优先</option>';
    }
  } else if (type === 'stock') {
    titleEl.textContent = '📦 库存同步 - 参数配置';
    bodyEl.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
      '<div class="form-group"><label>同步范围</label><select id="opt-stock-scope"><option value="all">全部商品</option><option value="low-stock">库存<10的商品</option><option value="out-of-stock">已售罄商品</option></select></div>' +
      '<div class="form-group"><label>更新方式</label><select id="opt-stock-method"><option value="direct">直接更新妙手</option><option value="preview">预览后确认</option></select></div>' +
      '</div>';
  } else if (type === 'categorize') {
    titleEl.textContent = '📁 商品分类 - 新品/全店双模式';
    var catGroupsHtml = '<div style="margin-bottom:12px;">';
    catGroupsHtml += '<input type="hidden" id="opt-cat-flow" value="new">';
    catGroupsHtml += '<input type="hidden" id="opt-category-mode" value="run">';
    catGroupsHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">';
    catGroupsHtml += '<button type="button" id="cat-flow-new" class="btn btn-sm btn-primary" onclick="setCategoryFlow(\'new\')" style="text-align:left;padding:10px;">新品上新分类<br><span style="font-size:12px;font-weight:400;">日常默认：读取商品库待分类队列，一键生成并写入</span></button>';
    catGroupsHtml += '<button type="button" id="cat-flow-scan" class="btn btn-sm" onclick="setCategoryFlow(\'scan\')" style="text-align:left;padding:10px;">全店扫描分类<br><span style="font-size:12px;font-weight:400;">初次使用建议：扫描 ERP 全店商品后生成计划</span></button>';
    catGroupsHtml += '</div>';
    catGroupsHtml += '<div id="cat-flow-hint" style="margin:8px 0;padding:8px;background:#eef4ff;border-radius:6px;font-size:12px;color:#31527a;">当前为新品上新分类：点击“一键执行新品分类”会读取商品库待分类队列、生成任务、写入 ERP 并回查验证。</div>';
    catGroupsHtml += '<div style="display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px;margin-bottom:8px;align-items:end;">';
    catGroupsHtml += '<div class="form-group" style="margin:0;"><label>当前组</label><span style="display:block;padding:7px 8px;border:1px solid #d9d9d9;border-radius:6px;font-size:12px;color:#31527a;">G: <b id="opt-active-group-label">' + optGroup + '</b></span></div>';
    catGroupsHtml += '<div class="form-group" style="margin:0;"><label>本次处理上限</label><input type="number" id="opt-cat-limit" value="50" min="1" max="1000" title="本次最多处理数量"></div>';
    catGroupsHtml += '<div class="form-group" style="margin:0;"><label>写入上限</label><input type="number" id="opt-cat-write-limit" value="200" min="1" max="5000" title="执行写入时最多写入数量"></div>';
    catGroupsHtml += '<div class="form-group" style="margin:0;"><label>置信度</label><select id="opt-min-confidence"><option value="0.6">标准 0.60</option><option value="0.75">稳妥 0.75</option><option value="0.45">放宽 0.45</option></select></div>';
    catGroupsHtml += '</div>';
    catGroupsHtml += '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">';
    catGroupsHtml += '<button class="btn btn-primary btn-sm" onclick="document.getElementById(\'opt-cat-flow\').value=\'new\';document.getElementById(\'opt-category-mode\').value=\'run\';runOptimize()">一键执行新品分类</button>';
    catGroupsHtml += '<button class="btn btn-sm" onclick="document.getElementById(\'opt-cat-flow\').value=\'scan\';document.getElementById(\'opt-category-mode\').value=\'preview\';previewCategorize()">扫描并生成计划</button>';
    catGroupsHtml += '<button class="btn btn-sm" onclick="document.getElementById(\'opt-cat-flow\').value=\'scan\';document.getElementById(\'opt-category-mode\').value=\'run\';runOptimize()">执行扫描计划</button>';
    catGroupsHtml += '</div>';
    catGroupsHtml += '<details style="margin-bottom:8px;"><summary style="cursor:pointer;font-size:12px;color:#31527a;">高级参数</summary>';
    catGroupsHtml += '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap;">';
    catGroupsHtml += '<label style="font-size:12px;">批量数量 <input type="number" id="opt-cat-batch-size" value="20" min="1" max="100" style="width:80px;" title="同店铺同分类每批写入数量"></label>';
    catGroupsHtml += '<label class="check-btn" title="用于排查单品问题，会走浏览器可视化点击流程，速度较慢"><input type="checkbox" id="erp_ui"> 可视化 UI 调试</label>';
    catGroupsHtml += '<label style="font-size:12px;">UI延迟 <input type="number" id="opt-cat-ui-delay" value="0.45" min="0" max="3" step="0.05" style="width:80px;" title="UI 调试每步等待秒数"></label>';
    catGroupsHtml += '<select id="opt-cat-main" title="可选类目筛选"><option value="">全部类目</option><option>时尚饰品</option><option>家居生活</option><option>母婴玩具</option><option>美妆个护</option><option>五金园艺</option><option>3C数码</option></select>';
    catGroupsHtml += '</div></details>';
    catGroupsHtml += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
    catGroupsHtml += '<button class="btn btn-sm" onclick="loadCatGroups().then(function(){renderCatGroupManager(document.getElementById(\'opt-cat-groups-list\'))})">🔄 刷新分组</button>';
    catGroupsHtml += '</div>';
    catGroupsHtml += '<div id="opt-cat-groups-list" style="max-height:200px;overflow-y:auto;"></div>';
    catGroupsHtml += '</div>';
    bodyEl.innerHTML = catGroupsHtml;
    loadCatGroups().then(function() { renderCatGroupManager(document.getElementById('opt-cat-groups-list')); });
  } else if (type === 'marketing') {
    titleEl.textContent = '🎯 营销管理 - 活动推荐';
    bodyEl.innerHTML = '<input type="hidden" id="marketing-mode" value="run">' +
      '<div style="display:flex;gap:10px;align-items:end;margin-bottom:12px;flex-wrap:wrap;">' +
      '<div class="form-group" style="margin:0;"><label>方案数量</label><input type="number" id="marketing-limit" value="20" min="1" max="200" style="width:110px;"></div>' +
      '<div class="form-group" style="margin:0;"><label>job_id</label><input type="text" id="marketing-job-id" placeholder="自动生成" style="width:150px;"></div>' +
      '<div class="form-group" style="margin:0;"><label>站点</label><select id="opt-site-filter"><option value="">全部</option><option value="SG">新加坡</option><option value="MY">马来西亚</option><option value="TH">泰国</option><option value="PH">菲律宾</option><option value="VN">越南</option><option value="BR">巴西</option></select></div>' +
      '<div class="form-group" style="margin:0;"><label>指定店铺</label><input type="text" id="opt-store-id" placeholder="可选，如 xjujs666.sg" style="width:160px;"></div>' +
      '<div class="form-group" style="margin:0;"><label>重试</label><input type="number" id="marketing-retries" value="1" min="0" max="5" style="width:80px;"></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
      '<div class="card" style="margin:0;cursor:pointer;border:2px solid #eb2f96;" onclick="runMarketingPreview(\'add_on\')">' +
        '<div class="card-body" style="text-align:center;padding:20px;">' +
          '<div style="font-size:28px;margin-bottom:8px;">🛒</div>' +
          '<h4 style="margin:0 0 4px;">加购优惠</h4>' +
          '<p style="font-size:12px;color:#666;margin:0;">主品+低价副品，提升连带率</p>' +
          '<div id="addon-result" style="margin-top:8px;font-size:12px;"></div>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="margin:0;cursor:pointer;border:2px solid #7c3aed;" onclick="runMarketingPreview(\'bundle\')">' +
        '<div class="card-body" style="text-align:center;padding:20px;">' +
          '<div style="font-size:28px;margin-bottom:8px;">📦</div>' +
          '<h4 style="margin:0 0 4px;">套装优惠</h4>' +
          '<p style="font-size:12px;color:#666;margin:0;">同类目商品组合，提升客单价</p>' +
          '<div id="bundle-result" style="margin-top:8px;font-size:12px;"></div>' +
        '</div>' +
      '</div>' +
      '</div>';
  }
  // 绑定check-btn事件
  paramsEl.querySelectorAll('.check-btn').forEach(cb => { cb.addEventListener('click', () => cb.classList.toggle('active')); });
}

async function runOptimize() {
  var progressEl = document.getElementById('opt-progress');
  var fillEl = document.getElementById('opt-progress-fill');
  var resultEl = document.getElementById('opt-result');
  progressEl.style.display = 'block';
  fillEl.style.width = '10%';
  resultEl.innerHTML = '<span style="color:#999;">⏳ 正在启动浏览器...</span>';

  // 收集参数
  var params = { group: optGroup, type: optType };
  document.querySelectorAll('#opt-params-body input, #opt-params-body select').forEach(el => {
    if (el.name && el.name.startsWith('opt-')) {
      params[el.name] = el.checked ? 'checked' : el.value;
    } else if (el.id) {
      params[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    }
  });

  try {
    var res = await demoRequest('/api/optimize/run', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params)
    });
    var data = await res.json();
    if (data.store_sync) {
      data.message = (data.message || '执行完成') + ' | 已同步店铺: ' + data.store_sync.updated + '/' + data.store_sync.total;
      if ((optType === 'capacity' || optType === 'cleanup') && typeof loadStores === 'function') loadStores();
      if (optType === 'capacity' || optType === 'cleanup') loadDashboardSummary();
    }
    if (data.error) { resultEl.innerHTML = '<span style="color:red;">❌ ' + data.error + '</span>'; fillEl.style.width = '0%'; return; }
    fillEl.style.width = '100%';
    resultEl.innerHTML = '<span style="color:#00bfa5;">✅ ' + (data.message || '执行完成') + '</span>';
    if (optType === 'categorize') renderCategorizeOptimizeResult(data);
  } catch(e) {
    resultEl.innerHTML = '<span style="color:red;">❌ ' + e.message + '</span>';
    fillEl.style.width = '0%';
  }
}

// ═══════════════════════════════════════════════
// IP/品牌侵权防护
// ═══════════════════════════════════════════════

let ipData = null;

async function loadIPData() {
  try {
    const res = await demoRequest('/api/ip-brands');
    ipData = await res.json();
    renderBrandList();
    renderDangerList();
    renderSafeMapList();
    renderDesignList();
    renderWhitelist();
    const bd = ipData.brands;
    document.getElementById('ip-brand-count').textContent = (bd.high || []).length;
    document.getElementById('ip-danger-count').textContent = (bd.dangerWords || []).length;
    document.getElementById('ip-safemap-count').textContent = Object.keys(bd.safeMap || {}).length;
    document.getElementById('ip-design-count').textContent = (ipData.designs || []).length;
  } catch(e) { console.error('加载IP数据失败:', e); }
}

function renderBrandList() {
  const el = document.getElementById('brand-list');
  if (!el || !ipData) return;
  const q = (document.getElementById('brand-search')?.value || '').toLowerCase();
  let brands = ipData.brands.high || [];
  if (q) brands = brands.filter(b => (b.n + ' ' + (b.a || []).join(' ')).toLowerCase().includes(q));
  el.innerHTML = brands.map((b, i) => {
    const ri = (ipData.brands.high || []).indexOf(b);
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;">
      <b style="min-width:80px;">${b.n}</b>
      <span style="flex:1;color:#999;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${(b.a || []).join(', ')}</span>
      <span style="font-size:11px;color:#666;background:#f5f5f5;padding:2px 6px;border-radius:4px;">${b.cat || '-'}</span>
      <span style="font-size:11px;color:#fff;background:#ee4d2d;padding:2px 6px;border-radius:4px;">高危</span>
      <button onclick="deleteBrand(${ri})" style="border:none;background:none;color:#999;cursor:pointer;font-size:14px;">×</button>
    </div>`;
  }).join('') || '<p style="color:#999;font-size:12px;">暂无品牌</p>';
}
function filterBrands() { renderBrandList(); }

function showAddBrandModal() { document.getElementById('brand-modal').style.display = 'flex'; }
function showAddDesignModal() { document.getElementById('design-modal').style.display = 'flex'; }
async function addBrand() {
  const name = document.getElementById('brand-name').value.trim();
  const aliases = document.getElementById('brand-aliases').value.trim();
  const cat = document.getElementById('brand-cat').value;
  if (!name) { alert('输入品牌名'); return; }
  const res = await demoRequest('/api/ip-brands/add', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, aliases, cat })
  });
  const data = await res.json();
  if (data.error) { alert(data.error); return; }
  closeModal('brand-modal');
  document.getElementById('brand-name').value = '';
  document.getElementById('brand-aliases').value = '';
  loadIPData();
}

async function deleteBrand(idx) {
  if (!confirm('删除该品牌?')) return;
  await demoRequest(`/api/ip-brands/${idx}`, { method: 'DELETE' });
  loadIPData();
}

function renderDangerList() {
  const el = document.getElementById('danger-list');
  if (!el || !ipData) return;
  el.innerHTML = (ipData.brands.dangerWords || []).map((w, i) =>
    `<span style="display:inline-flex;align-items:center;gap:4px;background:#fef2f2;border:1px solid #fecaca;padding:3px 8px;border-radius:4px;font-size:12px;margin:0 4px 4px 0;">
      ${w}<button onclick="deleteDangerWord('${w}')" style="border:none;background:none;color:#dc2626;cursor:pointer;font-size:14px;line-height:1;">×</button>
    </span>`
  ).join('') || '<p style="color:#999;font-size:12px;">暂无</p>';
}

async function addDangerWord() {
  const word = document.getElementById('danger-word-input').value.trim();
  if (!word) return;
  await demoRequest('/api/ip-danger/add', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ word })
  });
  document.getElementById('danger-word-input').value = '';
  loadIPData();
}

async function deleteDangerWord(word) {
  await demoRequest(`/api/ip-danger/${encodeURIComponent(word)}`, { method: 'DELETE' });
  loadIPData();
}

function renderSafeMapList() {
  const el = document.getElementById('safemap-list');
  if (!el || !ipData) return;
  const entries = Object.entries(ipData.brands.safeMap || {});
  el.innerHTML = entries.map(([old, rep]) =>
    `<span style="display:inline-flex;align-items:center;gap:4px;background:#eff6ff;border:1px solid #bfdbfe;padding:3px 8px;border-radius:4px;font-size:12px;margin:0 4px 4px 0;color:#1e40af;">
      ${old} → ${rep}<button onclick="deleteSafeMap('${old.replace(/'/g, "\\'")}')" style="border:none;background:none;color:#2563eb;cursor:pointer;font-size:14px;line-height:1;">×</button>
    </span>`
  ).join('') || '<p style="color:#999;font-size:12px;">暂无</p>';
}

async function addSafeMap() {
  const old = document.getElementById('safemap-old').value.trim();
  const rep = document.getElementById('safemap-new').value.trim();
  if (!old || !rep) { alert('填写原文和替换词'); return; }
  await demoRequest('/api/ip-safemap/add', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ old, new: rep })
  });
  document.getElementById('safemap-old').value = '';
  document.getElementById('safemap-new').value = '';
  loadIPData();
}

async function deleteSafeMap(key) {
  await demoRequest(`/api/ip-safemap/${encodeURIComponent(key)}`, { method: 'DELETE' });
  loadIPData();
}

function renderDesignList() {
  const el = document.getElementById('design-list');
  if (!el || !ipData) return;
  el.innerHTML = (ipData.designs || []).map((d, i) =>
    `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;">
      <b style="min-width:100px;">${d.name}</b>
      <span style="font-size:11px;color:#666;">${d.brand || ''}</span>
      <span style="font-size:11px;color:#666;background:#f5f5f5;padding:2px 6px;border-radius:4px;">${d.cat || ''}</span>
      <span style="font-size:11px;padding:2px 6px;border-radius:4px;${d.risk === 'high' ? 'color:#fff;background:#ee4d2d;' : 'color:#92400e;background:#fef3c7;'}">${d.risk === 'high' ? '高危' : '中风险'}</span>
      <button onclick="deleteDesign(${i})" style="border:none;background:none;color:#999;cursor:pointer;font-size:14px;">×</button>
    </div>`
  ).join('') || '<p style="color:#999;font-size:12px;">暂无</p>';
}

async function addDesign() {
  const name = document.getElementById('design-name').value.trim();
  const kw = document.getElementById('design-kw').value.trim();
  if (!name || !kw) { alert('设计名和关键词不能为空'); return; }
  await demoRequest('/api/ip-design/add', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name, kw,
      brand: document.getElementById('design-brand').value.trim(),
      cat: document.getElementById('design-cat').value.trim(),
      risk: document.getElementById('design-risk').value,
      note: document.getElementById('design-note').value.trim()
    })
  });
  closeModal('design-modal');
  ['design-name','design-brand','design-cat','design-kw','design-note'].forEach(id => document.getElementById(id).value = '');
  loadIPData();
}

async function deleteDesign(idx) {
  if (!confirm('删除该设计风险?')) return;
  await demoRequest(`/api/ip-design/${idx}`, { method: 'DELETE' });
  loadIPData();
}

function renderWhitelist() {
  const el = document.getElementById('whitelist-display');
  if (!el || !ipData) return;
  el.innerHTML = (ipData.brands.whitelist || []).map(w =>
    `<span style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;padding:3px 8px;border-radius:4px;font-size:12px;color:#166534;margin:0 4px 4px 0;">${w}</span>`
  ).join('');
}

async function scanIPTest() {
  const title = document.getElementById('ip-test-title').value.trim();
  const desc = document.getElementById('ip-test-desc').value.trim();
  if (!title) { alert('输入标题'); return; }
  const resultEl = document.getElementById('ip-test-result');
  resultEl.style.display = 'block';

  try {
    const res = await demoRequest('/api/ip-scan', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, desc })
    });
    const data = await res.json();

    const colors = { safe: '#f0fdf4', info: '#eff6ff', warn: '#fffbeb', block: '#fef2f2' };
    const borders = { safe: '#bbf7d0', info: '#bfdbfe', warn: '#fde68a', block: '#fecaca' };
    const icons = { safe: '✅', info: '💡', warn: '⚠️', block: '❌' };
    const labels = { safe: '安全', info: '兼容(低风险)', warn: '有风险(需确认)', block: '高危(阻断)' };

    resultEl.style.background = colors[data.level] || colors.safe;
    resultEl.style.border = '1px solid ' + (borders[data.level] || borders.safe);

    let html = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <span style="font-size:20px;">${icons[data.level] || '✅'}</span>
      <b style="font-size:15px;">${labels[data.level] || data.level}</b>
    </div>`;

    if (data.hits && data.hits.length) {
      html += '<div style="margin-bottom:8px;">';
      data.hits.forEach(h => {
        const riskColor = h.risk === 'high' ? '#ee4d2d' : h.risk === 'medium' ? '#f59e0b' : '#2563eb';
        html += `<div style="padding:4px 0;font-size:12px;color:${riskColor};">• ${h.msg}</div>`;
      });
      html += '</div>';
    }

    if (data.auto_replace && data.auto_replace !== title) {
      html += `<div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.5);border-radius:6px;">
        <div style="font-size:12px;color:#666;margin-bottom:4px;">🔄 自动替换建议:</div>
        <div style="font-size:13px;font-weight:600;color:#059669;">${data.auto_replace}</div>
        <button onclick="document.getElementById('ip-test-title').value='${data.auto_replace.replace(/'/g, "\\'")}';scanIPTest()" style="margin-top:4px;font-size:11px;padding:4px 8px;background:#059669;color:#fff;border:none;border-radius:4px;cursor:pointer;">应用替换</button>
      </div>`;
    }

    resultEl.innerHTML = html;
  } catch(e) {
    resultEl.style.background = '#fef2f2';
    resultEl.style.border = '1px solid #fecaca';
    resultEl.innerHTML = `<span style="color:#ee4d2d;">❌ 扫描失败: ${e.message}</span>`;
  }
}

// 页面切换时加载IP数据
const _origShowPage = showPage;
showPage = function(page, el) {
  _origShowPage(page, el);
  if (page === 'ipcontrol') loadIPData();
  if (page === 'optimize') loadCatGroups();
};

// ═══════════════════════════════════════════════
// 组合指令
// ═══════════════════════════════════════════════

let batchPlan = null;

function quickBatch(cmd) {
  document.getElementById('batch-command').value = cmd;
  parseBatch();
}

async function parseBatch() {
  const cmd = document.getElementById('batch-command').value.trim();
  if (!cmd) return;
  const el = document.getElementById('batch-result');
  el.style.display = 'none';

  try {
    const res = await demoRequest('/api/batch/parse', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({command: cmd})
    });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }

    batchPlan = data;
    batchPlan._raw = cmd;

    const sum = data.stores_summary;
    let ratio = data.strategy_ratio;
    let ratioText = Math.round(ratio.traffic * 100) + ':' + Math.round(ratio.sales * 100) + ':' + Math.round(ratio.profit * 100);

    let summaryHtml = '<div style="display:flex;gap:16px;flex-wrap:wrap;">';
    summaryHtml += '<div><b>范围:</b> ' + (data.scope.all ? '全部' : (data.scope.group || '') + (data.scope.category ? ' ' + data.scope.category : '') + (data.scope.site ? ' ' + data.scope.site : '')) + '</div>';
    summaryHtml += '<div><b>每店:</b> ' + data.quantity + '个 (' + ratioText + ')</div>';
    summaryHtml += '<div><b>店铺数:</b> ' + sum.total_stores + '</div>';
    summaryHtml += '<div><b>总商品:</b> ' + sum.total_products + '</div>';
    if (sum.by_group) summaryHtml += '<div><b>分组:</b> ' + Object.entries(sum.by_group).map(([k, v]) => k + ':' + v + '店').join(' / ') + '</div>';
    if (sum.by_category) summaryHtml += '<div><b>类目:</b> ' + Object.entries(sum.by_category).map(([k, v]) => k + '(' + v + ')').join(' / ') + '</div>';
    summaryHtml += '</div>';
    document.getElementById('batch-summary').innerHTML = summaryHtml;

    let storesHtml = '<div class="table-shell"><table class="data-table"><thead><tr><th>分组</th><th>类目</th><th>店铺数</th><th>站点</th><th>饱和率</th><th>引流</th><th>走量</th><th>利润</th><th>每店</th><th>合计</th></tr></thead><tbody>';
    data.tasks_preview.forEach(function(t) {
      const stores = t.stores || [];
      const sites = Array.from(new Set(stores.map(function(store) { return store.site; }).filter(Boolean))).join(', ') || '-';
      const saturations = stores.map(function(store) { return Number(store.saturation); }).filter(function(value) { return !Number.isNaN(value); });
      const minSat = saturations.length ? Math.min.apply(null, saturations) : null;
      const maxSat = saturations.length ? Math.max.apply(null, saturations) : null;
      const satText = minSat === null ? '-' : (minSat === maxSat ? minSat + '%' : minSat + '%-' + maxSat + '%');
      const satColor = maxSat === null ? '#64748b' : maxSat < 25 ? '#00bfa5' : maxSat < 50 ? '#f59e0b' : '#ee4d2d';
      storesHtml += '<tr><td>' + (t.group || '-') + '</td>';
      storesHtml += '<td>' + t.category + '</td>';
      storesHtml += '<td>' + (t.store_count || stores.length || '-') + '</td>';
      storesHtml += '<td>' + sites + '</td>';
      storesHtml += '<td style="color:' + satColor + ';">' + satText + '</td>';
      storesHtml += '<td>' + ((t.keywords && t.keywords.traffic) ? t.keywords.traffic.length : 0) + '</td>';
      storesHtml += '<td>' + ((t.keywords && t.keywords.sales) ? t.keywords.sales.length : 0) + '</td>';
      storesHtml += '<td>' + ((t.keywords && t.keywords.profit) ? t.keywords.profit.length : 0) + '</td>';
      storesHtml += '<td>' + (t.per_store || data.quantity || '-') + '</td>';
      storesHtml += '<td><b>' + t.total + '</b></td></tr>';
    });
    if (data.task_count > data.tasks_preview.length) storesHtml += '<tr><td colspan="10" style="text-align:center;color:#999;">共 ' + data.task_count + ' 家店铺</td></tr>';
    storesHtml += '</tbody></table></div>';
    document.getElementById('batch-stores').innerHTML = storesHtml;

    el.style.display = 'block';
  } catch(e) {
    alert('解析失败: ' + e.message);
  }
}

async function executeBatch() {
  if (!batchPlan || !batchPlan._raw) return;
  if (!confirm('确认创建并执行 ' + batchPlan.task_count + ' 个任务？\n将按顺序逐个执行（排队模式）')) return;
  const btn = document.getElementById('batch-execute-btn');
  btn.disabled = true;
  btn.textContent = '⏳ 创建并启动中...';

  try {
    const res = await demoRequest('/api/batch/execute', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({command: batchPlan._raw})
    });
    const data = await res.json();
    if (data.error) { alert(data.error); btn.disabled = false; btn.textContent = '🚀 批量创建任务'; return; }
    alert('✅ 已创建 ' + data.created + ' 个任务并开始排队执行！\n总商品: ' + data.summary.total_products + '\n请到「任务历史」查看进度');
    document.getElementById('batch-result').style.display = 'none';
    document.getElementById('batch-command').value = '';
  } catch(e) {
    alert('创建失败: ' + e.message);
  }
  btn.disabled = false;
  btn.textContent = '🚀 批量创建任务';
}

// ═══════════════════════════════════════════════
// 商品分类
// ═══════════════════════════════════════════════

let catGroupsData = null;
let catTemplatesData = null;

function setCategoryFlow(flow) {
  var normalized = flow === 'scan' ? 'scan' : 'new';
  var flowInput = document.getElementById('opt-cat-flow');
  var modeInput = document.getElementById('opt-category-mode');
  var newBtn = document.getElementById('cat-flow-new');
  var scanBtn = document.getElementById('cat-flow-scan');
  var hint = document.getElementById('cat-flow-hint');
  if (flowInput) flowInput.value = normalized;
  if (modeInput) modeInput.value = normalized === 'new' ? 'run' : 'preview';
  if (newBtn) newBtn.className = normalized === 'new' ? 'btn btn-sm btn-primary' : 'btn btn-sm';
  if (scanBtn) scanBtn.className = normalized === 'scan' ? 'btn btn-sm btn-primary' : 'btn btn-sm';
  if (hint) {
    hint.textContent = normalized === 'new'
      ? '当前为新品上新分类：点击“一键执行新品分类”会读取商品库待分类队列、生成任务、写入 ERP 并回查验证。'
      : '当前为全店扫描分类：初次使用建议先“扫描并生成计划”，确认后再执行扫描计划。';
  }
}

async function previewCategorize() {
  var category = document.getElementById('opt-cat-main')?.value || '';
  var limit = document.getElementById('opt-cat-limit')?.value || 50;
  var minConfidence = document.getElementById('opt-min-confidence')?.value || 0.6;
  var flow = document.getElementById('opt-cat-flow')?.value || 'new';
  var resultEl = document.getElementById('opt-cat-groups-list');
  if (resultEl) resultEl.innerHTML = '<div style="color:#999;padding:8px;">分类中...</div>';
  try {
    const res = await demoRequest('/api/optimize/run', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({type: 'categorize', group: optGroup, 'opt-cat-flow': flow, erp_unclassified: flow === 'scan', 'opt-category-mode': 'preview', 'opt-cat-main': category, 'opt-cat-limit': limit, 'opt-min-confidence': minConfidence})
    });
    const data = await res.json();
    renderCategorizeOptimizeResult(data);
  } catch(e) {
    if (resultEl) resultEl.innerHTML = '<div style="color:red;">分类失败: ' + e.message + '</div>';
  }
}

function renderCategorizeOptimizeResult(data) {
  var resultEl = document.getElementById('opt-cat-groups-list');
  if (!resultEl) return;
  var summary = data.summary || {};
  var erp = data.erp || {};
  function safeText(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(ch) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function firstValue(obj, keys) {
    if (!obj) return '';
    for (var i = 0; i < keys.length; i++) {
      var value = obj[keys[i]];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  }
  function productPlan(row) {
    return row.erp_product_plan || row.erp_plan || row.product_plan || row.erp_product || row;
  }
  function collectRows() {
    var source = data.results || data.erp_product_plan || data.product_plans || data.erp_products || [];
    if (!source.length && erp.product_plan) source = erp.product_plan;
    if (!source.length && erp.products) source = erp.products;
    return source || [];
  }
  function statusText(row, plan) {
    var status = firstValue(plan, ['execution_status', 'status', 'action_status']);
    var executionReason = (plan.execution_result && (plan.execution_result.reason || plan.execution_result.message)) ||
      (row.execution_result && (row.execution_result.reason || row.execution_result.message)) || '';
    var skip = executionReason || firstValue(plan, ['skip_reason', 'reason']) || firstValue(row, ['skip_reason', 'reason']);
    if (skip) return '<span style="color:#d46b08;">' + safeText(skip) + '</span>';
    if (status) return '<span style="color:#1677ff;">' + safeText(status) + '</span>';
    if (row.erp_actionable) return '<span style="color:#389e0d;font-weight:700;">' + '\u53ef\u6267\u884c\u9884\u89c8' + '</span>';
    if (row.applied) return '<span style="color:#389e0d;">' + '\u5df2\u5199\u5165' + '</span>';
    if (row.review_required) return '<span style="color:#d46b08;">' + '\u5f85\u786e\u8ba4' + '</span>';
    return '<span style="color:#8c8c8c;">' + '\u5b89\u5168\u9884\u89c8' + '</span>';
  }
  var erpStatus = erp.blocked
    ? '<span style="color:#d46b08;">ERP\u9700\u8981\u767b\u5f55/\u9a8c\u8bc1\u7801</span>'
    : '<span style="color:#389e0d;">ERP\u5df2\u8fde\u63a5</span>';
  var planCount = summary.erp_product_plans || summary.erp_products || summary.erp_actionable || 0;
  var execution = erp.execution || {};
  var writeRequested = !!data.erp_write_requested;
  var executionResults = execution.results || [];
  var attemptedCount = summary.erp_attempted;
  if (attemptedCount === undefined || attemptedCount === null || attemptedCount === '') attemptedCount = execution.attempted;
  if (attemptedCount === undefined || attemptedCount === null || attemptedCount === '') attemptedCount = executionResults.length || 0;
  var pendingCount = summary.erp_pending_after_stop;
  if (pendingCount === undefined || pendingCount === null || pendingCount === '') pendingCount = execution.pending;
  if (pendingCount === undefined || pendingCount === null || pendingCount === '') pendingCount = Math.max(0, (execution.requested || 0) - (attemptedCount || 0));
  function firstFailureReason() {
    for (var i = 0; i < executionResults.length; i++) {
      var item = executionResults[i] || {};
      var reason = item.message || item.reason || '';
      if (reason) return reason;
    }
    var rows = collectRows();
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j] || {};
      var plan = productPlan(row);
      var result = (plan && plan.execution_result) || row.execution_result || {};
      var rowReason = result.message || result.reason || plan.skip_reason || row.skip_reason || '';
      if (rowReason) return rowReason;
    }
    return '';
  }
  var html = '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;font-size:12px;">' +
    '<span>\u5171' + (summary.total || 0) + '\u6761</span>' +
    '<span>\u672c\u5730\u901a\u8fc7 ' + (summary.auto_pass || 0) + '\u6761</span>' +
    '<span>\u5f85\u786e\u8ba4 ' + (summary.need_review || 0) + '\u6761</span>' +
    '<span>\u5df2\u5199\u5165 ' + (summary.updated || 0) + '\u6761</span>' +
    '<span>ERP\u5206\u7c7b\u6811 ' + (erp.categories_total || summary.erp_categories || 0) + '\u6761</span>' +
    '<span>ERP\u5546\u54c1\u8ba1\u5212 ' + planCount + '\u6761</span>' +
    (writeRequested ? '<span>计划 ' + (execution.requested || 0) + '\u4e2a</span>' : '') +
    (writeRequested ? '<span>实际尝试 ' + (attemptedCount || 0) + '\u4e2a</span>' : '') +
    (writeRequested ? '<span>ERP\u5199\u5165 ' + (summary.erp_executed || 0) + '\u4e2a</span>' : '') +
    (writeRequested ? '<span>ERP\u9a8c\u8bc1 ' + (summary.erp_verified || 0) + '\u4e2a</span>' : '') +
    (writeRequested ? '<span>ERP\u5931\u8d25 ' + (summary.erp_write_failed || 0) + '\u4e2a</span>' : '') +
    (writeRequested ? '<span>未执行 ' + (pendingCount || 0) + '\u4e2a</span>' : '') +
    erpStatus +
    '</div>';
  if (writeRequested && execution.stopped) {
    html += '<div style="margin-bottom:8px;padding:6px 8px;background:#fff1f0;border:1px solid #ffa39e;border-radius:6px;font-size:12px;color:#a8071a;">' +
      '安全停止：' + safeText(execution.stop_reason || 'stopped') +
      (execution.stop_detail ? '，明细 ' + safeText(execution.stop_detail) : '') +
      '。实际尝试 ' + (attemptedCount || 0) + ' 个，未执行 ' + (pendingCount || 0) + ' 个。' +
      (firstFailureReason() ? '<br>首个失败原因：' + safeText(firstFailureReason()) : '') +
      '</div>';
  }
  if (writeRequested) {
    html += '<div style="margin-bottom:8px;padding:6px 8px;background:#f6ffed;border:1px solid #b7eb8f;border-radius:6px;font-size:12px;color:#237804;">' +
      'ERP\u5199\u5165\u5df2\u542f\u7528\uff1a\u4ec5\u6267\u884c ready \u72b6\u6001\u3001\u6709\u5e73\u53f0ID\u3001\u6709\u76ee\u6807\u5206\u7c7b\u7684\u5546\u54c1\uff0c\u5e76\u5728\u5199\u5165\u540e\u56de\u67e5\u76ee\u6807\u5206\u7c7b\u3002' +
      '</div>';
  } else {
    html += '<div style="margin-bottom:8px;padding:6px 8px;background:#fff7e6;border:1px solid #ffd591;border-radius:6px;font-size:12px;color:#ad6800;">' +
      'ERP\u5546\u54c1\u5206\u7c7b\u5f53\u524d\u4e3a\u5b89\u5168\u9884\u89c8\uff0c\u53ea\u751f\u6210\u8ba1\u5212\uff0c\u4e0d\u4fdd\u5b58\u5230ERP\u3002' +
      '</div>';
  }
  var shopSummaries = erp.shop_summaries || data.shop_summaries || [];
  if (shopSummaries.length) {
    html += '<div style="margin-bottom:10px;border:1px solid #e8e8e8;border-radius:6px;overflow:hidden;">';
    html += '<div style="padding:6px 8px;background:#fafafa;font-weight:700;font-size:12px;">按店铺扫描汇总</div>';
    html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
    html += '<tr style="background:#f8f8f8;"><th style="padding:4px;text-align:left;">店铺</th><th>站点</th><th>扫描</th><th>可执行</th><th>已正确</th><th>待复核</th></tr>';
    shopSummaries.forEach(function(item) {
      html += '<tr style="border-top:1px solid #eee;">';
      html += '<td style="padding:4px;">' + safeText(item.shop_name || item.shop_id || '-') + '</td>';
      html += '<td style="text-align:center;">' + safeText(item.site || '-') + '</td>';
      html += '<td style="text-align:center;">' + (item.total || 0) + '</td>';
      html += '<td style="text-align:center;color:#389e0d;font-weight:700;">' + (item.ready || 0) + '</td>';
      html += '<td style="text-align:center;color:#1677ff;">' + (item.already_classified || 0) + '</td>';
      html += '<td style="text-align:center;color:#d46b08;">' + (item.need_review || 0) + '</td>';
      html += '</tr>';
    });
    html += '</table></div>';
  }
  html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
  html += '<tr style="background:#f5f5f5;"><th style="padding:4px;text-align:left;">\u5e73\u53f0ID</th><th>\u5e97\u94fa/\u7ad9\u70b9</th><th>\u8d27\u53f7</th><th style="text-align:left;">\u5546\u54c1</th><th>\u5927\u7c7b</th><th>ERP\u8def\u5f84</th><th>\u6267\u884c\u72b6\u6001</th></tr>';
  collectRows().forEach(function(r) {
    var plan = productPlan(r);
    var title = firstValue(plan, ['title', 'product_title', 'name']) || firstValue(r, ['title', 'keyword', 'name']);
    var platformId = firstValue(plan, ['platform_item_id', 'platformItemId', 'product_id', 'item_id']) || firstValue(r, ['platform_item_id', 'platformItemId', 'product_id', 'item_id']);
    var shopName = firstValue(plan, ['shop_name', 'store_name', 'shopName', 'storeName']) || firstValue(r, ['shop_name', 'store_name', 'shopName', 'storeName']);
    var site = firstValue(plan, ['site', 'region']) || firstValue(r, ['site', 'region']);
    var itemNum = firstValue(plan, ['item_num', 'itemNum', 'sku', 'seller_sku']) || firstValue(r, ['item_num', 'itemNum', 'sku', 'seller_sku']);
    var erpPath = firstValue(plan, ['erp_category_path', 'category_path', 'target_category_path']) || firstValue(r, ['erp_category_path', 'category_path', 'target_category_path']);
    var major = firstValue(plan, ['major_category', 'category']) || firstValue(r, ['major_category', 'category']);
    var shopText = shopName && site ? shopName + ' / ' + site : (shopName || site || '-');
    html += '<tr style="border-bottom:1px solid #eee;">';
    html += '<td style="padding:4px;white-space:nowrap;">' + safeText(platformId || '-') + '</td>';
    html += '<td style="max-width:130px;white-space:normal;">' + safeText(shopText) + '</td>';
    html += '<td style="white-space:nowrap;">' + safeText(itemNum || '-') + '</td>';
    html += '<td style="padding:4px;max-width:260px;white-space:normal;">' + safeText(String(title || '').substring(0, 42)) + '</td>';
    html += '<td>' + safeText(major || '-') + '</td>';
    html += '<td style="max-width:220px;white-space:normal;color:#31527a;">' + safeText(erpPath || '-') + '</td>';
    html += '<td>' + statusText(r, plan) + '</td>';
    html += '</tr>';
  });
  html += '</table>';
  resultEl.innerHTML = html;
}
async function runMarketingPreview(type) {
  var resultId = type === 'add_on' ? 'addon-result' : 'bundle-result';
  var el = document.getElementById(resultId);
  var mode = document.getElementById('marketing-mode')?.value || 'run';
  var limit = document.getElementById('marketing-limit')?.value || 20;
  var jobId = document.getElementById('marketing-job-id')?.value || '';
  var site = document.getElementById('opt-site-filter')?.value || '';
  var storeId = document.getElementById('opt-store-id')?.value || '';
  var retries = document.getElementById('marketing-retries')?.value || 1;
  if (el) el.innerHTML = '<span style="color:#999;">生成中...</span>';
  try {
    const res = await demoRequest('/api/optimize/run', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({type: 'marketing', group: optGroup, campaign_type: type, 'marketing-mode': mode, 'marketing-limit': limit, 'marketing-job-id': jobId, 'opt-site-filter': site, 'opt-store-id': storeId, 'marketing-retries': retries, ui_progress: true})
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (res.status === 202 && data.job_id) {
      optimizeJobId = data.job_id;
      var box = _optRunnerNode();
      if (box) box.style.display = 'block';
      if (optimizeJobPollTimer) clearInterval(optimizeJobPollTimer);
      renderOptimizeJob({ job_id: data.job_id, type: 'marketing', status: 'queued', progress: { stage: 'starting', label: '营销任务已加入队列', percent: 8 } });
      optimizeJobPollTimer = setInterval(function() { pollOptimizeJob(optimizeJobId); }, 1500);
      pollOptimizeJob(optimizeJobId);
      if (el) el.innerHTML = '<span style="color:#1677ff;font-weight:700;">任务已启动: ' + data.job_id + '</span>';
      return;
    }
    var summary = data.summary || {};
    var text = mode === 'run'
      ? '已生成 ' + (summary.queued || 0) + ' 个执行方案'
      : '推荐 ' + (summary.recommended || 0) + ' 个活动方案';
    if (el) el.innerHTML = '<span style="color:#389e0d;font-weight:700;">' + text + '</span>';
  } catch(e) {
    if (el) el.innerHTML = '<span style="color:red;">失败: ' + e.message + '</span>';
  }
}

async function runCategorize() {
  var resultEl = document.getElementById('opt-cat-groups-list');
  if (resultEl) resultEl.innerHTML = '<div style="color:#999;">执行分类中...</div>';
  try {
    const res = await demoRequest('/api/category/classify/run', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (resultEl) resultEl.innerHTML = '<div style="color:#389e0d;font-weight:700;">分类完成: 更新' + data.updated + '个, 待确认' + data.review_queue + '个</div>';
  } catch(e) {
    if (resultEl) resultEl.innerHTML = '<div style="color:red;">执行失败: ' + e.message + '</div>';
  }
}

async function loadCatGroups() {
  try {
    const [groupsRes, templatesRes] = await Promise.all([
      demoRequest('/api/cat-groups'),
      demoRequest('/api/cat-templates')
    ]);
    catGroupsData = await groupsRes.json();
    catTemplatesData = await templatesRes.json();
  } catch(e) { console.error('加载分类数据失败:', e); }
}

function renderCatGroupManager(el) {
  if (!el) return;
  var html = renderCatTemplateTable();
  if (!catGroupsData || !Object.keys(catGroupsData).length) {
    el.innerHTML = html + '<p style="color:#999;font-size:13px;">暂无分组数据。请先从矩阵工具箱导入或手动添加。</p>';
    return;
  }
  html += '<div style="display:flex;gap:8px;margin-bottom:12px;">';
  html += '<button class="btn btn-sm" onclick="showAddCatGroupModal()">+ 添加分组</button>';
  html += '<button class="btn btn-sm" onclick="exportCatGroups()">📤 导出</button>';
  html += '<button class="btn btn-sm" onclick="importCatGroups()">📥 导入</button>';
  html += '</div>';

  Object.entries(catGroupsData).forEach(function(group) {
    const gName = group[0];
    const cats = group[1];
    html += '<div style="margin-bottom:12px;"><h4 style="font-size:13px;margin-bottom:6px;">' + gName + '</h4>';
    Object.entries(cats).forEach(function(catEntry) {
      const catName = catEntry[0];
      const subcats = catEntry[1];
      html += '<div style="margin-left:12px;margin-bottom:8px;"><b style="font-size:12px;">' + catName + '</b> (' + Object.keys(subcats).length + '个分组)';
      Object.entries(subcats).forEach(function(subEntry) {
        const subName = subEntry[0];
        const kws = subEntry[1];
        html += '<div style="display:inline-flex;align-items:center;gap:4px;background:#f5f7fa;border:1px solid #e8e8e8;padding:3px 8px;border-radius:4px;font-size:11px;margin:2px 4px 2px 12px;">';
        html += subName + ' <span style="color:#999;">(' + kws.length + '词)</span>';
        html += '<button onclick="deleteCatGroup(\'' + gName + '\',\'' + catName + '\',\'' + subName.replace(/'/g, "\\'") + '\')" style="border:none;background:none;color:#999;cursor:pointer;font-size:12px;">×</button>';
        html += '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
  });
  el.innerHTML = html;
}

function renderCatTemplateTable() {
  if (!catTemplatesData || !catTemplatesData.rows || !catTemplatesData.rows.length) return '';
  function safeText(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(ch) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  var rows = catTemplatesData.rows;
  var html = '<div style="margin:0 0 14px;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;background:#fff;">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#fafafa;border-bottom:1px solid #e8e8e8;">';
  html += '<div style="font-weight:700;font-size:13px;color:#333;">修正后店内分类模板</div>';
  html += '<div style="font-size:11px;color:#8c8c8c;">' + safeText(catTemplatesData.version || '') + '</div>';
  html += '</div>';
  html += '<div style="max-height:360px;overflow:auto;">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:12px;line-height:1.35;">';
  html += '<thead><tr style="background:#fff7f2;color:#6b3a24;">';
  html += '<th style="position:sticky;top:0;background:#fff7f2;padding:6px;border-bottom:1px solid #ead8cc;text-align:left;width:64px;">G组</th>';
  html += '<th style="position:sticky;top:0;background:#fff7f2;padding:6px;border-bottom:1px solid #ead8cc;text-align:left;width:92px;">二级组</th>';
  html += '<th style="position:sticky;top:0;background:#fff7f2;padding:6px;border-bottom:1px solid #ead8cc;text-align:left;width:120px;">中文类目</th>';
  html += '<th style="position:sticky;top:0;background:#fff7f2;padding:6px;border-bottom:1px solid #ead8cc;text-align:left;">新马菲 EN</th>';
  html += '<th style="position:sticky;top:0;background:#fff7f2;padding:6px;border-bottom:1px solid #ead8cc;text-align:left;">泰国 TH</th>';
  html += '<th style="position:sticky;top:0;background:#fff7f2;padding:6px;border-bottom:1px solid #ead8cc;text-align:left;">越南 VN</th>';
  html += '<th style="position:sticky;top:0;background:#fff7f2;padding:6px;border-bottom:1px solid #ead8cc;text-align:left;">巴西 PT</th>';
  html += '</tr></thead><tbody>';
  rows.forEach(function(row) {
    html += '<tr style="border-bottom:1px solid #f0f0f0;">';
    html += '<td style="padding:6px;color:#8c8c8c;">' + safeText(row.group) + '</td>';
    html += '<td style="padding:6px;font-weight:700;color:#333;">' + safeText(row.major) + '</td>';
    html += '<td style="padding:6px;font-weight:700;color:#ee4d2d;">' + safeText(row.category) + '</td>';
    html += '<td style="padding:6px;">' + safeText(row.en) + '</td>';
    html += '<td style="padding:6px;">' + safeText(row.th) + '</td>';
    html += '<td style="padding:6px;">' + safeText(row.vn) + '</td>';
    html += '<td style="padding:6px;">' + safeText(row.br) + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

async function deleteCatGroup(group, category, subcat) {
  if (!confirm('删除分组: ' + subcat + '?')) return;
  await demoRequest('/api/cat-groups/delete', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({group: group, category: category, subCategory: subcat})
  });
  loadCatGroups();
}

function exportCatGroups() {
  if (!catGroupsData) return;
  const blob = new Blob([JSON.stringify(catGroupsData, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'category_groups.json';
  a.click();
}

function importCatGroups() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      await demoRequest('/api/cat-groups/save', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: text
      });
      loadCatGroups();
      alert('导入成功');
    } catch(err) {
      alert('格式错误: ' + err.message);
    }
  };
  input.click();
}

function showAddCatGroupModal() {
  // Reuse the brand modal pattern
  const m = document.getElementById('brand-modal');
  const b = document.getElementById('modal-body-brand');
  m.style.display = 'flex';
  b.innerHTML = '<div class="modal-header"><h2>添加子类目分组</h2><button class="modal-close" onclick="document.getElementById(\'brand-modal\').style.display=\'none\'">&times;</button></div>' +
    '<div class="modal-body">' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>组别</label><select id="cg-group"><option>G1</option><option>G2</option></select></div>' +
    '<div class="form-group"><label>类目</label><select id="cg-category"><option>时尚饰品</option><option>家居生活</option><option>母婴玩具</option><option>美妆个护</option><option>五金园艺</option><option>3C数码</option></select></div>' +
    '<div class="form-group"><label>分组名</label><input type="text" id="cg-subcat" placeholder="如: 📿 时尚项链"></div>' +
    '<div class="form-group full-row"><label>匹配关键词(逗号分隔)</label><input type="text" id="cg-keywords" placeholder="如: 项链, choker, necklace, 串珠链"></div>' +
    '</div></div>' +
    '<div class="modal-footer"><button class="btn" onclick="document.getElementById(\'brand-modal\').style.display=\'none\'">取消</button>' +
    '<button class="btn btn-primary" onclick="addCatGroup()">添加</button></div>';
}

async function addCatGroup() {
  const group = document.getElementById('cg-group').value;
  const category = document.getElementById('cg-category').value;
  const subcat = document.getElementById('cg-subcat').value.trim();
  const kws = document.getElementById('cg-keywords').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  if (!subcat || !kws.length) { alert('填写分组名和关键词'); return; }
  await demoRequest('/api/cat-groups/add', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({group: group, category: category, subCategory: subcat, keywords: kws})
  });
  document.getElementById('brand-modal').style.display = 'none';
  loadCatGroups();
}

// ═══════════════════════════════════════════════
// 订单数据分析
// ═══════════════════════════════════════════════

let orderData = null;

async function loadSyncedOrderAnalysis() {
  const res = await demoRequest('/api/orders');
  const data = await readApiJson(res);
  if (!res.ok || data.error) throw new Error(data.error || '\u8ba2\u5355\u5206\u6790\u7ed3\u679c\u52a0\u8f7d\u5931\u8d25');
  orderData = data;
  renderOrderFeedbackSummary(data.feedback);
  renderOrderStats(data.stats || {});
  renderOrderTable(data.products || []);
  return data;
}

async function syncAndAnalyzeOrders() {
  const statusEl = document.getElementById('order-sync-status');
  if (statusEl) statusEl.textContent = '\u6b63\u5728\u542f\u52a8\u8ba2\u5355\u540c\u6b65...';
  try {
    const res = await demoRequest('/api/orders/sync', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        group: 'ALL',
        sync_mode: 'auto',
        import_keywords: true,
        ui_progress: true
      })
    });
    const data = await readApiJson(res);
    if (!res.ok || data.error) throw new Error(data.error || '\u8ba2\u5355\u540c\u6b65\u542f\u52a8\u5931\u8d25');
    if (data.job_id) {
      optType = 'order_analysis';
      optimizeJobId = data.job_id;
      renderOptimizeJob({
        job_id: data.job_id,
        type: 'order_analysis',
        status: 'queued',
        progress: {stage: 'starting_browser', label: '\u6b63\u5728\u8fde\u63a5\u8c03\u8bd5\u6d4f\u89c8\u5668', percent: 8}
      });
      stopOptimizeJobPolling();
      optimizeJobPollTimer = setInterval(function() { pollOptimizeJob(data.job_id); }, 1500);
      pollOptimizeJob(data.job_id);
      if (statusEl) statusEl.textContent = '\u4efb\u52a1\u5df2\u542f\u52a8: ' + data.job_id;
    }
  } catch (e) {
    if (statusEl) statusEl.textContent = e.message;
  }
}

async function uploadOrders() {
  const fileInput = document.getElementById('order-file');
  if (!fileInput.files.length) { alert('请选择文件'); return; }
  const file = fileInput.files[0];
  const minProfit = document.getElementById('order-min-profit').value || 0;
  const minSales = document.getElementById('order-min-sales').value || 1;

  const statusEl = document.getElementById('upload-status');
  statusEl.innerHTML = '<span style="color:#f59e0b;">⏳ 正在解析...</span>';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('min_profit', minProfit);
  formData.append('min_sales', minSales);

  try {
    const res = await demoRequest('/api/orders/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) { statusEl.innerHTML = '<span style="color:red;">❌ ' + data.error + '</span>'; return; }

    orderData = data;
    statusEl.innerHTML = '<span style="color:#00bfa5;">✅ 解析完成: ' + data.stats.totalOrders + '订单, ' + data.stats.filteredCount + '个热销品</span>';
    renderOrderFeedbackSummary(data.feedback);
    renderOrderStats(data.stats);
    renderOrderTable(data.products);
  } catch(e) {
    statusEl.innerHTML = '<span style="color:red;">❌ ' + e.message + '</span>';
  }
}

function renderOrderFeedbackSummary(feedback) {
  const el = document.getElementById('order-feedback-summary');
  const link = document.getElementById('order-feedback-history-link');
  if (!el) return;
  const info = feedback || {};
  const source = info.source_count || 0;
  const candidates = info.candidate_count || 0;
  const rejected = info.rejected_count || 0;
  el.style.display = 'grid';
  el.innerHTML = '<div class=order-feedback-stat><b>' + candidates + '</b><span>可入库候选</span></div>' +
    '<div class=order-feedback-stat><b>' + rejected + '</b><span>需人工复核</span></div>' +
    '<div class=order-feedback-stat><b>' + source + '</b><span>订单回流商品</span></div>';
  if (link) link.style.display = 'inline-flex';
}

function renderOrderStats(stats) {
  const el = document.getElementById('order-stats');
  el.style.display = 'grid';
  el.innerHTML =
    '<div class="stat-card"><div class="stat-icon">📦</div><div class="stat-info"><div class="stat-value">' + stats.totalOrders + '</div><div class="stat-label">总订单</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon">🔍</div><div class="stat-info"><div class="stat-value">' + stats.filteredCount + '</div><div class="stat-label">热销品</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">¥' + (stats.totalRevenue / 10000).toFixed(1) + '万</div><div class="stat-label">总营收</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon">📈</div><div class="stat-info"><div class="stat-value">¥' + (stats.totalProfit / 10000).toFixed(1) + '万</div><div class="stat-label">总利润</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-info"><div class="stat-value">' + (stats.totalProfit / stats.totalRevenue * 100 || 0).toFixed(1) + '%</div><div class="stat-label">利润率</div></div></div>';
}

function renderOrderTable(products) {
  const el = document.getElementById('order-results');
  el.style.display = 'block';
  const tbody = document.getElementById('order-tbody');
  tbody.innerHTML = products.map(function(p, i) {
    var strategyClass = p.strategy === '引流款' ? 'background:#fff3ed;color:#ff6b35;' : p.strategy === '走量款' ? 'background:#e8f4fd;color:#0088cc;' : 'background:#f5f0ff;color:#7c3aed;';
    var marginClass = p.profitMargin >= 20 ? 'color:#16a34a;' : p.profitMargin >= 10 ? 'color:#a16207;' : 'color:#e74c3c;';
    var sourceLink = p.sourceLinks && p.sourceLinks[0] ? '<a href="' + p.sourceLinks[0] + '" target="_blank" style="font-size:11px;color:#2673dd;">🔗 查看</a>' : '<span style="color:#999;font-size:11px;">-</span>';
    return '<tr>' +
      '<td style="text-align:center;font-weight:700;">' + (i + 1) + '</td>' +
      '<td style="font-weight:600;">' + p.keyword + '</td>' +
      '<td><span style="' + strategyClass + 'padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">' + p.strategy + '</span></td>' +
      '<td style="text-align:right;">' + p.totalSales + '</td>' +
      '<td style="text-align:right;">¥' + p.totalRevenue.toFixed(2) + '</td>' +
      '<td style="text-align:right;font-weight:600;color:#16a34a;">¥' + p.totalProfit.toFixed(2) + '</td>' +
      '<td style="text-align:right;' + marginClass + '">' + p.profitMargin + '%</td>' +
      '<td style="font-size:11px;">' + (p.sites || []).join('/') + '</td>' +
      '<td>' + sourceLink + '</td></tr>';
  }).join('');
}

function filterOrders() {
  if (!orderData) return;
  var strategy = document.getElementById('order-filter-strategy').value;
  var filtered = strategy ? orderData.products.filter(function(p) { return p.strategy === strategy; }) : orderData.products;
  renderOrderTable(filtered);
}

async function importOrdersToKeywords() {
  if (!orderData) { alert('请先上传订单数据'); return; }
  try {
    const res = await demoRequest('/api/orders/import-keywords', { method: 'POST' });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }
    alert('导入完成！新增' + data.added + '个关键词，跳过' + data.skipped + '个');
  } catch(e) {
    alert('导入失败: ' + e.message);
  }
}

// ═══════════════════════════════════════════════
// 店铺数据自动查询
// ═══════════════════════════════════════════════

async function scanStores() {
  if (!confirm('将通过CDP连接浏览器查询店铺架上数量。\n请确保Chrome已加 --remote-debugging-port=9222 启动。\n\n开始查询？')) return;

  const tbody = document.getElementById('stores-tbody');
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells[6]) cells[6].innerHTML = '<span style="color:#f59e0b;">⏳ 查询中...</span>';
  });

  try {
    const res = await demoRequest('/api/store-scan/query-all', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}' });
    const data = await res.json();
    if (data.error) { alert('查询失败: ' + data.error); return; }

    alert('查询完成！' + data.scanned + '/' + data.total + '个店铺成功');
    loadStores(); // 刷新表格
  } catch(e) {
    alert('查询失败: ' + e.message);
  }
}

// ═══════════════════════════════════════════════
// 标题学习中心
// ═══════════════════════════════════════════════

let titleCandidates = [];

async function loadTitleCandidates() {
  try {
    const res = await demoRequest('/api/title-library/candidates');
    const data = await res.json();
    titleCandidates = data.items || [];
    const s = data.summary || {};
    document.getElementById('tl-pending').textContent = s.pending || 0;
    document.getElementById('tl-approved').textContent = s.approved || 0;
    document.getElementById('tl-rejected').textContent = s.rejected || 0;
    document.getElementById('tl-merged').textContent = s.merged || 0;

    const tbody = document.getElementById('title-candidate-list');
    const empty = document.getElementById('tl-empty');
    if (!titleCandidates.length) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = titleCandidates.map(item => {
      const st = item.review_status || 'pending';
      const stColor = st === 'approved' ? '#16a34a' : st === 'rejected' ? '#dc2626' : '#999';
      const score = item.demo_fallback_score != null ? item.demo_fallback_score : '-';
      const comment = (item.demo_fallback_comment || '').slice(0, 80);
      const merged = item.merged ? ' <span style="color:#7c3aed;">✓已合并</span>' : '';
      return `<tr>
        <td><input type="checkbox" class="tl-check" value="${item.id}"></td>
        <td>${item.category || ''}</td>
        <td>${item.site || ''}</td>
        <td style="max-width:220px;white-space:normal;font-size:13px;">${item.title_zh || ''}</td>
        <td style="max-width:340px;white-space:normal;font-weight:600;">${item.title_en || ''}</td>
        <td style="text-align:center;font-weight:700;color:${score >= 8 ? '#16a34a' : score >= 6 ? '#d97706' : '#dc2626'};">${score}</td>
        <td style="max-width:260px;white-space:normal;color:#666;font-size:12px;">${comment}</td>
        <td style="color:${stColor};font-weight:600;">${st}${merged}</td>
      </tr>`;
    }).join('');
  } catch(e) {
    console.error('loadTitleCandidates error:', e);
  }
}

function getSelectedTitleCandidateIds() {
  return Array.from(document.querySelectorAll('.tl-check:checked')).map(x => x.value);
}

function toggleAllTitleCandidates(checked) {
  document.querySelectorAll('.tl-check').forEach(x => x.checked = checked);
}

async function reloadTitleCandidates() {
  await loadTitleCandidates();
}

async function rebuildTitleCandidates() {
  if (!confirm('重建候选池将从反馈日志重新生成，已有审核状态会保留。继续？')) return;
  try {
    const res = await demoRequest('/api/title-library/candidates/rebuild', { method: 'POST' });
    const data = await res.json();
    if (data.error) { alert('错误: ' + data.error); return; }
    await loadTitleCandidates();
    alert('候选池已重建，共 ' + data.total + ' 条');
  } catch(e) { alert('重建失败: ' + e.message); }
}

async function reviewSelectedCandidates(status) {
  const ids = getSelectedTitleCandidateIds();
  if (!ids.length) { alert('请先选择候选标题'); return; }
  const label = status === 'approved' ? '通过' : '忽略';
  if (!confirm('确认批量' + label + ' ' + ids.length + '条？')) return;
  try {
    const res = await demoRequest('/api/title-library/candidates/review', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ ids, review_status: status })
    });
    const data = await res.json();
    if (data.error) { alert('错误: ' + data.error); return; }
    await loadTitleCandidates();
  } catch(e) { alert('操作失败: ' + e.message); }
}

async function scoreSelectedCandidates() {
  const ids = getSelectedTitleCandidateIds();
  if (!ids.length) { alert('请先选择候选标题'); return; }
  if (!confirm('将对 ' + ids.length + ' 条标题调用本地演示兜底评分，继续？')) return;
  try {
    const res = await demoRequest('/api/title-library/candidates/score', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ ids })
    });
    const data = await res.json();
    if (data.error) { alert('错误: ' + data.error); return; }
    await loadTitleCandidates();
    alert('评分完成，已更新 ' + data.updated + ' 条');
  } catch(e) { alert('评分失败: ' + e.message); }
}

async function mergeApprovedCandidates() {
  if (!confirm('将已通过的候选标题合并到高分标题主库，继续？')) return;
  try {
    const res = await demoRequest('/api/title-library/candidates/merge', { method: 'POST' });
    const data = await res.json();
    if (data.error) { alert('错误: ' + data.error); return; }
    await loadTitleCandidates();
    alert('合并完成');
  } catch(e) { alert('合并失败: ' + e.message); }
}

// ═══════════════════════════════════════════════
// 采集来源控制
// ═══════════════════════════════════════════════

let multiplatformSelectionJob = null;
const MULTIPLATFORM_SELECTION_PLATFORMS = ['shopee', 'temu', 'tiktok', 'amazon'];

function safeQuerylessHttpImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (url.username || url.password || url.search || url.hash) return '';
    return url.href;
  } catch (error) {
    return '';
  }
}

function quoteHtmlAttribute(value) {
  const quote = String.fromCharCode(34);
  return quote + escapeHtml(value) + quote;
}

function selectedMultiplatformOpportunityId() {
  return document.querySelector(
    '.multiplatform-opportunity-check:checked'
  )?.dataset.opportunityId || '';
}

function selectedMultiplatformSourceOfferId() {
  return document.querySelector(
    '.multiplatform-source-candidate-check:checked'
  )?.dataset.offerId || '';
}

function renderMultiplatformMarketOpportunities(job) {
  const target = document.getElementById('multiplatform-opportunity-list');
  if (!target) return;
  const opportunities = Array.isArray(job?.market_opportunities)
    ? job.market_opportunities
    : [];
  const boundId = job?.source_review?.opportunity_id
    || job?.source_confirmation?.opportunity_id
    || '';
  const locked = job?.status !== 'market_ready';

  if (!opportunities.length) {
    target.innerHTML = '<div class=multiplatform-review-empty>没有可审阅的市场机会。</div>';
    return;
  }

  target.innerHTML = opportunities.map((opportunity, index) => {
    const observations = Array.isArray(opportunity?.observations)
      ? opportunity.observations
      : [];
    const observation = observations[0] || {};
    const image = safeQuerylessHttpImageUrl(
      observation?.images?.[0]?.queryless_url
    );
    const platforms = observations
      .map(row => [
        row?.platform,
        row?.site,
        row?.source_product_id
      ].filter(Boolean).join(' / '))
      .filter(Boolean)
      .join(' · ');
    const attributes = observations.map(row => {
      const identity = [row?.platform, row?.site]
        .filter(Boolean)
        .join('/');
      const values = Object.entries(row?.key_attributes || {})
        .map(([key, value]) => key + ': ' + value)
        .join(', ');
      return values
        ? (identity ? identity + ': ' : '') + values
        : '';
    }).filter(Boolean).join(' · ');
    const variants = observations
      .flatMap(row => Array.isArray(row?.variant_hints) ? row.variant_hints : [])
      .filter(Boolean)
      .slice(0, 4)
      .join(' · ');
    const opportunityId = opportunity?.opportunity_id || '';
    const checked = boundId
      ? opportunityId === boundId
      : index === 0;
    return '<label class=multiplatform-review-choice>' +
      '<input type=radio name=multiplatform-market-opportunity class=multiplatform-opportunity-check data-opportunity-id=' +
      quoteHtmlAttribute(opportunityId) +
      (checked ? ' checked' : '') +
      (locked ? ' disabled' : '') +
      ' onchange=updateMultiplatformSourceActions()>' +
      (image
        ? '<img class=multiplatform-review-image src=' + quoteHtmlAttribute(image) + ' alt=市场商品图>'
        : '<span class=multiplatform-review-image-placeholder>无图</span>') +
      '<span class=multiplatform-review-copy>' +
      '<strong>' + escapeHtml(observation?.title || opportunityId || '-') + '</strong>' +
      '<small>' + escapeHtml(platforms || '-') + '</small>' +
      (attributes ? '<span>' + escapeHtml(attributes) + '</span>' : '') +
      (variants ? '<span>' + escapeHtml(variants) + '</span>' : '') +
      '</span></label>';
  }).join('');
}

function renderMultiplatformSourceReview(job) {
  const target = document.getElementById('multiplatform-source-candidate-list');
  const meta = document.getElementById('multiplatform-source-review-meta');
  if (!target) return;
  const review = job?.source_review || null;
  const candidates = Array.isArray(review?.source_candidates)
    ? review.source_candidates
    : [];
  const confirmedOfferId = job?.source_confirmation?.offer_id || '';
  const locked = job?.status !== 'source_review_required';

  if (!candidates.length) {
    target.innerHTML = '<div class=multiplatform-review-empty>尚未读取 1688 候选。</div>';
    if (meta) meta.textContent = '等待查找';
    return;
  }

  if (meta) {
    meta.textContent = job?.status === 'sourcing'
      ? '已确认 offer ' + confirmedOfferId
      : candidates.length + ' 个候选';
  }
  target.innerHTML = candidates.map(candidate => {
    const image = safeQuerylessHttpImageUrl(
      candidate?.image?.queryless_url
    );
    const offerId = candidate?.offer_id || '';
    const checked = confirmedOfferId && offerId === confirmedOfferId;
    const minimum = candidate?.displayed_price_min_cny;
    const maximum = candidate?.displayed_price_max_cny;
    const price = minimum === maximum
      ? minimum
      : minimum + ' - ' + maximum;
    const observed = candidate?.observed_at
      ? new Date(candidate.observed_at).toLocaleString('zh-CN')
      : '-';
    return '<label class=multiplatform-review-choice>' +
      '<input type=radio name=multiplatform-source-candidate class=multiplatform-source-candidate-check data-offer-id=' +
      quoteHtmlAttribute(offerId) +
      (checked ? ' checked' : '') +
      (locked ? ' disabled' : '') +
      ' onchange=updateMultiplatformSourceActions()>' +
      (image
        ? '<img class=multiplatform-review-image src=' + quoteHtmlAttribute(image) + ' alt=1688货源图>'
        : '<span class=multiplatform-review-image-placeholder>无图</span>') +
      '<span class=multiplatform-review-copy>' +
      '<strong>' + escapeHtml(candidate?.title_excerpt || offerId || '-') + '</strong>' +
      '<small>offer ' + escapeHtml(offerId) + ' · CNY ' + escapeHtml(price || '-') + '</small>' +
      '<span>' + escapeHtml(observed) + '</span>' +
      '</span></label>';
  }).join('');
}

function updateMultiplatformSourceActions() {
  const status = multiplatformSelectionJob?.status;
  const phraseInput = document.getElementById('multiplatform-supplier-phrase');
  const discover = document.getElementById('multiplatform-discover-sources');
  const confirm = document.getElementById('multiplatform-confirm-source');
  const phrase = (phraseInput?.value || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ');
  const marketReady = status === 'market_ready';
  const reviewReady = status === 'source_review_required';
  const sourcing = status === 'sourcing';

  if (phraseInput) {
    phraseInput.disabled = !marketReady;
    if (!marketReady && !phraseInput.value) {
      phraseInput.placeholder = '搜索词已由来源证据哈希绑定';
    }
  }
  if (discover) {
    discover.disabled = !marketReady
      || !selectedMultiplatformOpportunityId()
      || phrase.length < 1
      || phrase.length > 80;
    discover.textContent = sourcing ? '货源已确认' : '查找 1688 货源';
  }
  if (confirm) {
    confirm.disabled = !reviewReady
      || !selectedMultiplatformSourceOfferId();
    confirm.textContent = sourcing
      ? '已确认 offer ' + (multiplatformSelectionJob?.source_confirmation?.offer_id || '')
      : '确认所选货源';
  }
}

function setMultiplatformPreviewState(state, message) {
  const status = document.getElementById('multiplatform-preview-status');
  if (!status) return;
  status.dataset.state = state;
  status.textContent = message;
}

function setMultiplatformPlatformState(platform, state, message) {
  const target = document.getElementById('multiplatform-platform-' + platform);
  if (!target) return;
  target.dataset.state = state;
  target.textContent = message;
}

function buildMultiplatformPreviewPayload() {
  const group = document.getElementById('multiplatform-group')?.value || 'G1';
  const category = document.getElementById('multiplatform-category')?.value || '';
  const quantity = Number.parseInt(document.getElementById('multiplatform-quantity')?.value || '0', 10);
  return {
    market_schema_version: 2,
    group: group,
    category: category,
    quantity: quantity,
    target_sites: {
      shopee: document.getElementById('multiplatform-site-shopee')?.value || 'SG',
      temu: document.getElementById('multiplatform-site-temu')?.value || 'US',
      tiktok: document.getElementById('multiplatform-site-tiktok')?.value || 'US',
      amazon: document.getElementById('multiplatform-site-amazon')?.value || 'US'
    },
    allowed_categories: {
      G1: category ? [category] : [],
      G2: category ? [category] : []
    }
  };
}

function updateMultiplatformSelectionCount() {
  const selected = Array.from(document.querySelectorAll('.multiplatform-candidate-check:checked'));
  const count = document.getElementById('multiplatform-selection-count');
  const button = document.getElementById('multiplatform-create-pending');
  const selectAll = document.getElementById('multiplatform-select-all');
  const all = Array.from(document.querySelectorAll('.multiplatform-candidate-check'));
  if (count) count.textContent = '已选 ' + selected.length + ' 项';
  if (button) button.disabled = selected.length === 0 || multiplatformSelectionJob?.status !== 'preview_ready';
  if (selectAll) {
    selectAll.checked = all.length > 0 && selected.length === all.length;
    selectAll.indeterminate = selected.length > 0 && selected.length < all.length;
  }
}

function toggleAllMultiplatformCandidates(checked) {
  document.querySelectorAll('.multiplatform-candidate-check').forEach(input => {
    input.checked = checked;
  });
  updateMultiplatformSelectionCount();
}

function selectedMultiplatformCandidateIds() {
  return Array.from(document.querySelectorAll('.multiplatform-candidate-check:checked'))
    .map(input => input.dataset.candidateId)
    .filter(Boolean);
}

function renderMultiplatformRejections(rejections) {
  const target = document.getElementById('multiplatform-rejections');
  if (!target) return;
  const rows = Array.isArray(rejections) ? rejections : [];
  if (!rows.length) {
    target.hidden = true;
    target.innerHTML = '';
    return;
  }
  const counts = {};
  rows.forEach(row => {
    const reason = row?.reason || 'unknown';
    counts[reason] = (counts[reason] || 0) + 1;
  });
  target.hidden = false;
  target.innerHTML = '<strong>已拒绝 ' + rows.length + ' 项</strong><span>' +
    Object.entries(counts).map(([reason, count]) => escapeHtml(reason) + ' × ' + count).join(' · ') +
    '</span>';
}

function renderMultiplatformSelectionJob(job) {
  multiplatformSelectionJob = job || null;
  const result = document.getElementById('multiplatform-results');
  const empty = document.getElementById('multiplatform-empty');
  const body = document.getElementById('multiplatform-candidate-body');
  const hash = document.getElementById('multiplatform-result-sha');
  const sourceErrors = job?.source_errors || {};
  const scanned = [
    'preview_ready',
    'market_ready',
    'source_review_required',
    'sourcing',
    'blocked'
  ].includes(job?.status);

  MULTIPLATFORM_SELECTION_PLATFORMS.forEach(platform => {
    if (sourceErrors[platform]) {
      setMultiplatformPlatformState(platform, 'error', '失败');
    } else if (job?.status === 'partial') {
      setMultiplatformPlatformState(platform, 'success', '完成');
    } else if (scanned) {
      setMultiplatformPlatformState(platform, 'success', '完成');
    } else {
      setMultiplatformPlatformState(platform, 'idle', '待扫描');
    }
  });

  renderMultiplatformRejections(job?.rejections || []);
  const candidates = Array.isArray(job?.candidates) ? job.candidates : [];
  const reviewStates = [
    'market_ready',
    'source_review_required',
    'sourcing'
  ];
  const marketReview = document.getElementById('multiplatform-market-review');
  if (marketReview) {
    marketReview.hidden = !reviewStates.includes(job?.status);
  }
  renderMultiplatformMarketOpportunities(job);
  renderMultiplatformSourceReview(job);
  if (hash) hash.textContent = job?.result_sha256 || '-';
  if (body) {
    body.innerHTML = candidates.map(candidate => {
      const observation = candidate.observations?.[0] || {};
      const platforms = Array.isArray(candidate.platforms)
        ? candidate.platforms.join(', ')
        : (observation.platform || '-');
      const price = candidate.pricing_proof?.storefront_usd;
      return '<tr>' +
        '<td class="multiplatform-check-cell"><input type="checkbox" class="multiplatform-candidate-check" data-candidate-id="' + escapeHtml(candidate.candidate_id || '') + '" onchange="updateMultiplatformSelectionCount()" aria-label="选择候选"></td>' +
        '<td><strong>' + escapeHtml(observation.title || candidate.candidate_id || '-') + '</strong><small>' + escapeHtml(candidate.candidate_id || '-') + '</small></td>' +
        '<td>' + escapeHtml(platforms) + '</td>' +
        '<td><b>' + escapeHtml(String(candidate.score ?? '-')) + '</b></td>' +
        '<td>' + escapeHtml(candidate.assigned_role || '-') + '</td>' +
        '<td>' + (price == null ? '-' : '$' + escapeHtml(String(price))) + '</td>' +
        '</tr>';
    }).join('');
  }

  if (result) result.hidden = job?.status !== 'preview_ready';
  if (empty) {
    empty.hidden = reviewStates.includes(job?.status) || candidates.length > 0;
    empty.textContent = job?.status === 'partial'
      ? '四平台扫描不完整，不能创建待处理任务。'
      : (job?.status === 'blocked' ? '没有通过完整证据门槛的候选。' : '暂无候选。');
    empty.dataset.state = job?.status === 'partial' ? 'partial' : 'empty';
  }
  updateMultiplatformSelectionCount();

  if (job?.status === 'preview_ready') {
    setMultiplatformPreviewState('success', '预览就绪 · ' + candidates.length + ' 项');
  } else if (job?.status === 'market_ready') {
    setMultiplatformPreviewState('success', '市场机会就绪');
  } else if (job?.status === 'source_review_required') {
    setMultiplatformPreviewState('success', '等待确认 1688 货源');
  } else if (job?.status === 'sourcing') {
    setMultiplatformPreviewState('success', '货源已确认');
  } else if (job?.status === 'partial') {
    setMultiplatformPreviewState('partial', '扫描不完整');
  } else if (job?.status === 'blocked') {
    setMultiplatformPreviewState('error', '证据未通过');
  }
  updateMultiplatformSourceActions();
}

async function runMultiplatformPreview() {
  const button = document.getElementById('multiplatform-preview-button');
  const result = document.getElementById('multiplatform-results');
  const empty = document.getElementById('multiplatform-empty');
  const marketReview = document.getElementById('multiplatform-market-review');
  const payload = buildMultiplatformPreviewPayload();
  if (!payload.category || !Number.isInteger(payload.quantity) || payload.quantity < 1 || payload.quantity > 20) {
    setMultiplatformPreviewState('error', '请检查类目和候选数量');
    return;
  }

  multiplatformSelectionJob = null;
  if (result) result.hidden = true;
  if (empty) empty.hidden = true;
  if (marketReview) marketReview.hidden = true;
  renderMultiplatformRejections([]);
  setMultiplatformPreviewState('loading', '扫描中');
  MULTIPLATFORM_SELECTION_PLATFORMS.forEach(platform => {
    setMultiplatformPlatformState(platform, 'loading', '扫描中');
  });
  if (button) {
    button.disabled = true;
    button.textContent = '正在扫描四个平台';
  }

  try {
    const response = await demoRequest('/api/new-task/multiplatform/preview', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await readApiJson(response);
    if (!data.job) throw new Error(data.error || 'preview_failed');
    renderMultiplatformSelectionJob(data.job);
  } catch (error) {
    setMultiplatformPreviewState('error', error.message || '预览失败');
    MULTIPLATFORM_SELECTION_PLATFORMS.forEach(platform => {
      setMultiplatformPlatformState(platform, 'error', '未完成');
    });
    if (empty) {
      empty.hidden = false;
      empty.dataset.state = 'error';
      empty.textContent = '预览请求失败，请检查服务状态后重试。';
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = '生成预览';
    }
  }
}

async function refreshMultiplatformPreview() {
  if (!multiplatformSelectionJob?.job_id) return;
  setMultiplatformPreviewState('loading', '刷新中');
  try {
    const response = await demoRequest(
      '/api/new-task/multiplatform/jobs/' + encodeURIComponent(multiplatformSelectionJob.job_id)
    );
    const data = await readApiJson(response);
    if (!response.ok || !data.job) throw new Error(data.error || 'job_refresh_failed');
    renderMultiplatformSelectionJob(data.job);
  } catch (error) {
    setMultiplatformPreviewState('error', error.message || '刷新失败');
  }
}

function multiplatformSourceErrorMessage(reason) {
  const messages = {
    source_login_required: '妙手登录已失效，请登录后重试',
    source_candidates_missing: '没有读取到可确认的 1688 候选',
    source_candidate_identity_invalid: '货源证据不完整，请重新查找',
    source_discovery_state_invalid: '当前作业状态不能重新查找货源',
    source_discovery_stale: '市场机会已变化，请刷新后重试',
    source_discovery_failed: '货源读取失败，请稍后重试',
    source_confirmation_stale: '货源审阅已过期，请刷新后重试'
  };
  return messages[reason] || '来源审阅请求失败';
}

async function discoverMultiplatformSources() {
  if (multiplatformSelectionJob?.status !== 'market_ready') return;
  const opportunityId = selectedMultiplatformOpportunityId();
  const phraseInput = document.getElementById('multiplatform-supplier-phrase');
  const phrase = (phraseInput?.value || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ');
  if (!opportunityId || phrase.length < 1 || phrase.length > 80) {
    setMultiplatformPreviewState('error', '请选择市场机会并填写 1688 搜索词');
    return;
  }
  const button = document.getElementById('multiplatform-discover-sources');
  if (button) {
    button.disabled = true;
    button.textContent = '正在读取 1688 候选';
  }
  setMultiplatformPreviewState('loading', '正在读取 1688 候选');

  try {
    const response = await demoRequest(
      '/api/new-task/multiplatform/jobs/' +
        encodeURIComponent(multiplatformSelectionJob.job_id) +
        '/discover-sources',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          market_result_sha256: multiplatformSelectionJob.market_result_sha256,
          opportunity_id: opportunityId,
          supplier_phrase: phrase
        })
      }
    );
    const data = await readApiJson(response);
    if (!response.ok || !data.job) {
      throw new Error(data.error || 'source_discovery_failed');
    }
    renderMultiplatformSelectionJob(data.job);
  } catch (error) {
    setMultiplatformPreviewState(
      'error',
      multiplatformSourceErrorMessage(error.message)
    );
  } finally {
    updateMultiplatformSourceActions();
  }
}

async function confirmMultiplatformSource() {
  if (multiplatformSelectionJob?.status !== 'source_review_required') return;
  const review = multiplatformSelectionJob.source_review;
  const offerId = selectedMultiplatformSourceOfferId();
  const candidate = review?.source_candidates?.find(
    row => row?.offer_id === offerId
  );
  if (!review || !candidate) return;
  const button = document.getElementById('multiplatform-confirm-source');
  if (button) {
    button.disabled = true;
    button.textContent = '正在确认';
  }
  setMultiplatformPreviewState('loading', '正在绑定所选货源');

  try {
    const response = await demoRequest(
      '/api/new-task/multiplatform/jobs/' +
        encodeURIComponent(multiplatformSelectionJob.job_id) +
        '/confirm-source',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          market_result_sha256: review.market_result_sha256,
          source_candidate_set_sha256: review.source_candidate_set_sha256,
          opportunity_id: review.opportunity_id,
          semantic_fingerprint: review.semantic_fingerprint,
          offer_id: candidate.offer_id,
          candidate_evidence_sha256: candidate.candidate_evidence_sha256,
          confirmation_nonce: review.confirmation_nonce
        })
      }
    );
    const data = await readApiJson(response);
    if (!response.ok || !data.job) {
      throw new Error(data.error || 'source_confirmation_stale');
    }
    renderMultiplatformSelectionJob(data.job);
  } catch (error) {
    setMultiplatformPreviewState(
      'error',
      multiplatformSourceErrorMessage(error.message)
    );
  } finally {
    updateMultiplatformSourceActions();
  }
}

async function createMultiplatformPendingTask() {
  if (
    multiplatformSelectionJob?.status !== 'preview_ready'
    || !multiplatformSelectionJob?.job_id
    || !multiplatformSelectionJob?.result_sha256
  ) return;
  const candidateIds = selectedMultiplatformCandidateIds();
  if (!candidateIds.length) return;
  const button = document.getElementById('multiplatform-create-pending');
  if (button) {
    button.disabled = true;
    button.textContent = '正在创建';
  }
  try {
    const response = await demoRequest(
      '/api/new-task/multiplatform/jobs/' +
        encodeURIComponent(multiplatformSelectionJob.job_id) +
        '/create-pending',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          result_sha256: multiplatformSelectionJob.result_sha256,
          candidate_ids: candidateIds
        })
      }
    );
    const data = await readApiJson(response);
    if (!response.ok || data.error) throw new Error(data.error || 'pending_task_failed');
    setMultiplatformPreviewState('success', '待处理任务 ' + data.task_id + ' 已创建');
    if (button) button.textContent = data.created === false ? '待处理任务已存在' : '待处理任务已创建';
  } catch (error) {
    setMultiplatformPreviewState('error', error.message || '创建失败');
    if (button) {
      button.disabled = false;
      button.textContent = '创建待处理任务';
    }
  }
}


function onSourceTypeChange() {
  const type = document.getElementById('source-type')?.value || '1688';
  const isMultiplatform = type === 'miaoshou_multiplatform';
  const panel = document.getElementById('multiplatform-selection-panel');
  const legacy = document.getElementById('task-legacy-workbench');
  const targetRow = document.getElementById('source-target-row');
  ['source-mode-wrap', 'source-intent-wrap', 'source-site-wrap', 'cross-border-wrap'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.hidden = isMultiplatform;
  });
  if (panel) panel.hidden = !isMultiplatform;
  if (legacy) legacy.hidden = isMultiplatform;
  if (isMultiplatform) {
    if (targetRow) targetRow.style.display = 'none';
    const manualActions = document.getElementById('collect-box-manual-actions');
    if (manualActions) manualActions.style.display = 'none';
    return;
  }

  const sourceSite = document.getElementById('source-site');
  const crossWrap = document.getElementById('cross-border-wrap');
  const crossOnly = document.getElementById('cross-border-only');

  if (type === 'shopee') {
    if (sourceSite) sourceSite.value = 'SG';
    if (crossOnly) crossOnly.value = 'true';
    if (crossWrap) crossWrap.style.display = '';
  } else if (type === 'pdd') {
    if (sourceSite) sourceSite.value = 'CN';
    if (crossWrap) crossWrap.style.display = 'none';
  } else {
    if (sourceSite) sourceSite.value = 'CN';
    if (crossWrap) crossWrap.style.display = 'none';
  }
  onSourceModeChange();
}

function onSourceModeChange() {
  const type = document.getElementById('source-type')?.value || '1688';
  const mode = document.getElementById('source-mode')?.value || 'keyword';
  const targetRow = document.getElementById('source-target-row');
  const targetLabel = document.getElementById('source-target-label');
  const targetInput = document.getElementById('source-target');
  const manualActions = document.getElementById('collect-box-manual-actions');
  const nlCommand = document.getElementById('nl-command');
  if (type === 'miaoshou_multiplatform') {
    if (targetRow) targetRow.style.display = 'none';
    return;
  }


  if (!targetRow || !targetLabel || !targetInput) return;

  if (mode === 'collect_box') {
    const typeEl = document.getElementById('source-type');
    if (typeEl && typeEl.value !== '1688') typeEl.value = '1688';
    targetRow.style.display = '';
    targetLabel.textContent = '采集箱商品ID';
    targetInput.placeholder = '\u7c98\u8d34\u91c7\u96c6\u7bb1\u5185\u76841688\u8d27\u6e90ID\uff0c\u6bcf\u884c\u4e00\u4e2a\uff1b\u4e5f\u652f\u63011688\u5546\u54c1\u94fe\u63a5';
    if (manualActions) manualActions.style.display = '';
    if (nlCommand) nlCommand.style.display = 'none';
    return;
  }

  if (manualActions) manualActions.style.display = 'none';

  if (type !== 'shopee' || mode === 'keyword') {
    targetRow.style.display = 'none';
    if (nlCommand) nlCommand.style.display = '';
    return;
  }

  targetRow.style.display = '';
  if (nlCommand) nlCommand.style.display = 'none';

  if (mode === 'shop_url') {
    targetLabel.textContent = '店铺链接 / 店铺 ID';
    targetInput.placeholder = '输入 Shopee 店铺链接、shopid 或用户名';
  } else if (mode === 'product_url') {
    targetLabel.textContent = '商品链接';
    targetInput.placeholder = '输入 Shopee 商品详情链接';
  }
}

function collectSourcePayload() {
  const type = document.getElementById('source-type')?.value || '1688';
  if (type === 'miaoshou_multiplatform') {
    return {
      source_type: 'miaoshou_multiplatform',
      source_mode: 'selected_products',
      source_site: document.getElementById('multiplatform-site-shopee')?.value || 'SG',
      cross_border_only: false,
      source_target: '',
      source_intent: 'listing'
    };
  }

  const mode = document.getElementById('source-mode')?.value || 'keyword';
  return {
    source_type: mode === 'collect_box' ? '1688' : (document.getElementById('source-type')?.value || '1688'),
    source_mode: mode,
    source_site: document.getElementById('source-site')?.value || 'SG',
    cross_border_only: (document.getElementById('cross-border-only')?.value || 'false') === 'true',
    source_target: document.getElementById('source-target')?.value?.trim() || '',
    source_intent: document.getElementById('source-intent')?.value || 'listing'
  };
}

// ═══════════════════════════════════════════════
// 选品决策
// ═══════════════════════════════════════════════

async function runScoring() {
  const category = document.getElementById('sc-category-filter')?.value || '';
  const status = document.getElementById('sc-status');
  status.textContent = '评分中...';
  try {
    const res = await demoRequest('/api/scoring/score', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({category})
    });
    const data = await res.json();
    document.getElementById('sc-total').textContent = data.total;
    document.getElementById('sc-go').textContent = data.go;
    document.getElementById('sc-caution').textContent = data.caution;
    document.getElementById('sc-observe').textContent = data.observe;
    document.getElementById('sc-skip').textContent = data.skip;

    // Show source breakdown
    const srcDiv = document.getElementById('sc-source-breakdown');
    if (srcDiv && data.by_source) {
      srcDiv.innerHTML = Object.entries(data.by_source).map(([k,v]) =>
        `<span style="display:inline-block;background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:11px;margin:2px;">${k}: ${v}</span>`
      ).join('');
    }
    const catDiv = document.getElementById('sc-category-breakdown');
    if (catDiv && data.by_category) {
      catDiv.innerHTML = Object.entries(data.by_category).map(([k,v]) =>
        `<span style="display:inline-block;background:#fff4e8;padding:2px 8px;border-radius:4px;font-size:11px;margin:2px;color:#d46b08;">${k}: ${v}</span>`
      ).join('');
    }

    renderScoringTable(data.results || []);
    status.textContent = '评分完成';
  } catch(e) {
    status.textContent = '评分失败: ' + e.message;
  }
}

function renderScoringTable(results) {
  const tbody = document.getElementById('sc-tbody');
  if (!tbody) return;
  tbody.innerHTML = results.map((r, i) => {
    const f = r.final;
    const decColor = f.decision_en === 'go' ? 'var(--success)' : f.decision_en === 'caution' ? '#faad14' : f.decision_en === 'observe' ? '#1677ff' : '#ff4d4f';
    const reasons = (r.rule.reasons || []).join(', ');
    const srcColor = r.source === '订单回流' ? '#389e0d' : r.source === '妙手热销采集' ? '#722ed1' : r.source === '知虾热词' ? '#1677ff' : '#666';
    return `<tr>
      <td>${i+1}</td>
      <td><b>${r.buyerKeyword||''}</b></td>
      <td><span style="background:#feeee9;color:#ee4d2d;padding:1px 6px;border-radius:8px;font-size:11px;">${r.category||''}</span></td>
      <td>${r.productStrategy||''}</td>
      <td>${r.searchVolume||0}</td>
      <td>${r.competitionCount||0}</td>
      <td>${r.rule.score}</td>
      <td style="font-weight:700;">${f.final_score}</td>
      <td style="color:${decColor};font-weight:700;">${f.decision}</td>
      <td style="font-size:11px;"><span style="color:${srcColor};">${r.source||''}</span></td>
      <td style="font-size:11px;color:#666;" title="${reasons}">${reasons.substring(0,30)}${reasons.length>30?'...':''}</td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════
// 商品分类

async function openCollectBoxManual() {
  const group = document.querySelector('[name="f-group"]:checked')?.value || 'G1';
  const res = await demoRequest('/api/collect-box/manual/open', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({group})
  });
  const data = await res.json();
  if (data.error) { alert(data.error); return; }
  alert('\u91c7\u96c6\u7bb1\u5df2\u6253\u5f00\u3002\u8bf7\u5728\u81ea\u52a8\u5316\u6d4f\u89c8\u5668\u91cc\u52fe\u9009\u8981\u53d1\u5e03\u7684\u5546\u54c1\uff0c\u7136\u540e\u56de\u5230\u8fd9\u91cc\u70b9\u51fb\u201c\u8bfb\u53d6\u5df2\u9009\u5e76\u521b\u5efa\u4efb\u52a1\u201d\u3002');
}

async function createTaskFromSelectedCollectBox() {
  const params = buildFormTaskPayload({ publish_mode: 'once', batches: null });
  params.source_type = '1688';
  params.source_mode = 'collect_box';
  params.keywords = '[COLLECT_BOX_RESUME]';
  if (params.sites.length === 0) { alert('\u8bf7\u9009\u62e9\u81f3\u5c11\u4e00\u4e2a\u7ad9\u70b9'); return; }
  if (!params.category) { alert('\u8bf7\u9009\u62e9\u7c7b\u76ee'); return; }

  const res = await demoRequest('/api/collect-box/manual/create-task', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (data.error) { alert(data.error); return; }
  if (data.manual_selected && data.manual_selected.source_ids) {
    document.getElementById('source-target').value = data.manual_selected.source_ids.join('\\n');
  }
  currentTaskId = data.task_id;
  showProgressModal('\u5df2\u8bfb\u53d6\u91c7\u96c6\u7bb1\u5df2\u9009\u5546\u54c1\uff0c\u6b63\u5728\u542f\u52a8\u4efb\u52a1...');
  await demoRequest('/api/task/' + currentTaskId + '/execute', {method: 'POST'});
  pollTaskStatus();
}

// ═══════════════════════════════════════════════

async function runClassify() {
  const category = document.getElementById('cls-category-filter')?.value || '';
  const status = document.getElementById('cls-status');
  status.textContent = '分类中...';
  try {
    const res = await demoRequest('/api/category/classify/preview', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({category, limit: 50})
    });
    const data = await res.json();
    document.getElementById('cls-total').textContent = data.total;
    document.getElementById('cls-pass').textContent = data.auto_pass;
    document.getElementById('cls-review').textContent = data.need_review;
    renderClassifyTable(data.results || []);
    status.textContent = '预览完成';
  } catch(e) {
    status.textContent = '分类失败: ' + e.message;
  }
}

async function runClassifyApply() {
  const status = document.getElementById('cls-status');
  status.textContent = '执行分类...';
  try {
    const res = await demoRequest('/api/category/classify/run', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({})
    });
    const data = await res.json();
    status.textContent = `完成: 更新${data.updated}个, 待确认${data.review_queue}个`;
    runClassify();
  } catch(e) {
    status.textContent = '执行失败: ' + e.message;
  }
}

function renderClassifyTable(results) {
  const tbody = document.getElementById('cls-tbody');
  if (!tbody) return;
  tbody.innerHTML = results.map((r, i) => {
    const confColor = r.confidence >= 0.85 ? '#389e0d' : r.confidence >= 0.6 ? '#d46b08' : '#ff4d4f';
    const statusText = r.review_required ? '待确认' : '已分类';
    const statusColor = r.review_required ? '#d46b08' : '#389e0d';
    return `<tr>
      <td>${i+1}</td>
      <td><b>${r.title||''}</b></td>
      <td><span style="background:#feeee9;color:#ee4d2d;padding:1px 6px;border-radius:8px;font-size:11px;">${r.major_category||''}</span></td>
      <td style="font-size:12px;">${r.sub_category||'-'}</td>
      <td style="color:${confColor};font-weight:700;">${r.confidence}</td>
      <td style="font-size:11px;">${r.source||''}</td>
      <td style="font-size:11px;color:#666;">${(r.matched_terms||[]).join(', ')}</td>
      <td style="color:${statusColor};font-weight:700;font-size:12px;">${statusText}</td>
    </tr>`;
  }).join('');
}


// === 2026-07-12 dashboard overview + optimize job progress runner ===
var optimizeJobPollTimer = null;
var optimizeJobId = null;

async function loadDashboardSummary() {
  if (!document.getElementById('page-dashboard')) return;
  try {
    const res = await demoRequest('/api/dashboard/overview');
    const data = await res.json();
    renderDashboardOverview(data);
  } catch (e) {
    const risks = document.getElementById('dashboard-risks');
    if (risks) risks.innerHTML = dashEmpty('\u63a7\u5236\u53f0\u6570\u636e\u52a0\u8f7d\u5931\u8d25');
  }
}

function renderDashboardOverview(data) {
  renderDashboardSummary(data.dashboard || {});
  if (data.product_catalog && data.product_catalog.ok !== false) {
    renderDashboardProductCatalog((data.product_catalog && data.product_catalog.summary) || {});
  } else {
    loadDashboardProductCatalog();
  }
  if (data.supervisor && data.supervisor.ok !== false) {
    renderDashboardSupervisorReport((data.supervisor && data.supervisor.summary) || {}, (data.supervisor && data.supervisor.markdown) || '');
  } else {
    loadDashboardSupervisorReport();
  }
}

function stopOptimizeJobPolling() {
  if (optimizeJobPollTimer) {
    clearInterval(optimizeJobPollTimer);
    optimizeJobPollTimer = null;
  }
}

function loadDashboardOverview() {
  return loadDashboardSummary();
}

function _optRunnerNode() {
  return document.getElementById('opt-task-runner') || document.getElementById('dashboard-task-runner');
}

function renderOptimizeJob(job) {
  const box = _optRunnerNode();
  const title = document.getElementById('opt-task-runner-title');
  const percent = document.getElementById('opt-task-runner-percent');
  const stage = document.getElementById('opt-task-runner-stage');
  const log = document.getElementById('opt-task-runner-log');
  const summary = document.getElementById('opt-task-runner-summary');
  const fill = document.getElementById('opt-progress-fill');
  if (!box) return;
  const progress = job && job.progress ? job.progress : {};
  const lines = (job && job.log_lines) || [];
  box.style.display = 'block';
  if (title) title.textContent = job && job.type ? ('\u4efb\u52a1\u8fdb\u5ea6 - ' + job.type) : '\u4efb\u52a1\u8fdb\u5ea6';
  if (percent) percent.textContent = (progress.percent ?? 0) + '%';
  if (stage) stage.textContent = progress.label || job.status || '';
  if (log) log.textContent = lines.length ? lines.join('\n') : (job.last_line || progress.label || '');
  if (summary) {
    const result = job.result || {};
    const payload = job.summary || result.summary || {};
    const parts = [];
    if (payload.stores !== undefined) parts.push('店铺: ' + payload.stores);
    if (payload.total !== undefined) parts.push('\u603b\u6570: ' + payload.total);
    if (payload.success !== undefined) parts.push('\u6210\u529f: ' + payload.success);
    if (payload.failed !== undefined) parts.push('\u5931\u8d25: ' + payload.failed);
    if (payload.collected !== undefined) parts.push('采集商品: ' + payload.collected);
    if (payload.updated !== undefined) parts.push('\u5df2\u540c\u6b65: ' + payload.updated);
    if (payload.created !== undefined) parts.push('新增底账: ' + payload.created);
    if (payload.skipped !== undefined) parts.push('跳过: ' + payload.skipped);
    if (job.error) parts.push('\u9519\u8bef: ' + job.error);
    summary.textContent = parts.join(' | ');
  }
  if (fill && progress.percent !== undefined) fill.style.width = Math.min(100, Math.max(0, Number(progress.percent || 0))) + '%';
}

async function retryFailedOptimizeJob(jobId) {
  try {
    const res = await demoRequest('/api/optimize/jobs/' + jobId + '/retry-failed', {method: 'POST'});
    const data = await readApiJson(res);
    if (!res.ok || data.error) throw new Error(data.error || '\u91cd\u8bd5\u4efb\u52a1\u542f\u52a8\u5931\u8d25');
    optimizeJobId = data.job_id;
    renderOptimizeJob({
      job_id: data.job_id,
      status: 'queued',
      progress: {stage: 'starting_browser', label: '\u6b63\u5728\u91cd\u8bd5\u5931\u8d25\u9879', percent: 5}
    });
    stopOptimizeJobPolling();
    optimizeJobPollTimer = setInterval(function() { pollOptimizeJob(data.job_id); }, 1500);
    pollOptimizeJob(data.job_id);
  } catch (e) {
    alert(e.message);
  }
}

async function pollOptimizeJob(jobId) {
  if (!jobId) return;
  try {
    const res = await demoRequest('/api/optimize/jobs/' + jobId);
    const job = await res.json();
    renderOptimizeJob(job);
    if (job.type === 'order_analysis') {
      const orderStatus = document.getElementById('order-sync-status');
      if (orderStatus) {
        const progress = job.progress || {};
        orderStatus.textContent = progress.label || progress.stage || job.status || '';
      }
    }
    if (['completed', 'partial_success', 'blocked', 'failed', 'cancelled'].includes(job.status)) {
      stopOptimizeJobPolling();
      const resultEl = document.getElementById('opt-result');
      if (resultEl) {
        if (['completed', 'partial_success'].includes(job.status)) {
          resultEl.innerHTML = '<span style="color:#00bfa5;">\u5b8c\u6210</span>';
          if (job.result && job.result.message) {
            resultEl.innerHTML = '<span style="color:#00bfa5;">' + job.result.message + '</span>';
          }
          if (job.result && job.result.store_sync) {
            if ((optType === 'capacity' || optType === 'cleanup') && typeof loadStores === 'function') loadStores();
            if (optType === 'capacity' || optType === 'cleanup') loadDashboardSummary();
          }
          if (optType === 'categorize' && job.result) renderCategorizeOptimizeResult(job.result);
          if (job.type === 'order_analysis') loadSyncedOrderAnalysis();
        } else {
          resultEl.innerHTML = '<span style="color:red;">' + (job.error || '\u4efb\u52a1\u5931\u8d25') + '</span>';
        }
        if (['partial_success', 'blocked', 'failed'].includes(job.status)) {
          const retryButton = document.createElement('button');
          retryButton.className = 'btn btn-secondary';
          retryButton.type = 'button';
          retryButton.textContent = '\u91cd\u8bd5\u5931\u8d25\u9879';
          retryButton.style.marginLeft = '8px';
          retryButton.onclick = function() { retryFailedOptimizeJob(job.job_id); };
          resultEl.appendChild(retryButton);
        }
      }
    }
  } catch (e) {
    const box = _optRunnerNode();
    if (box) box.style.display = 'block';
  }
}

async function runOptimize() {
  var progressEl = document.getElementById('opt-progress');
  var fillEl = document.getElementById('opt-progress-fill');
  var resultEl = document.getElementById('opt-result');
  var runnerEl = _optRunnerNode();
  progressEl.style.display = 'block';
  if (runnerEl) runnerEl.style.display = 'block';
  fillEl.style.width = '8%';
  resultEl.innerHTML = '<span style="color:#999;">\u6b63\u5728\u542f\u52a8\u4efb\u52a1...</span>';
  var titleEl = document.getElementById('opt-task-runner-title');
  var percentEl = document.getElementById('opt-task-runner-percent');
  var stageEl = document.getElementById('opt-task-runner-stage');
  var logEl = document.getElementById('opt-task-runner-log');
  var summaryEl = document.getElementById('opt-task-runner-summary');
  if (titleEl) titleEl.textContent = '\u4efb\u52a1\u8fdb\u5ea6';
  if (percentEl) percentEl.textContent = '0%';
  if (stageEl) stageEl.textContent = '\u6b63\u5728\u542f\u52a8\u6d4f\u89c8\u5668';
  if (logEl) logEl.textContent = '';
  if (summaryEl) summaryEl.textContent = '';
  stopOptimizeJobPolling();
  optimizeJobId = null;

  var params = { group: optGroup, type: optType, ui_progress: true };
  document.querySelectorAll('#opt-params-body input, #opt-params-body select').forEach(function(el) {
    if (el.name && el.name.startsWith('opt-')) {
      params[el.name] = el.checked ? 'checked' : el.value;
    } else if (el.id) {
      params[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    }
  });

  try {
    var res = await demoRequest('/api/optimize/run', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params)
    });
    var data = await res.json();
    if (res.status === 202 && data.job_id) {
      optimizeJobId = data.job_id;
      renderOptimizeJob({ job_id: data.job_id, type: optType, status: 'queued', progress: { stage: 'starting_browser', label: '\u6b63\u5728\u542f\u52a8\u6d4f\u89c8\u5668', percent: 8 } });
      optimizeJobPollTimer = setInterval(function() { pollOptimizeJob(optimizeJobId); }, 1500);
      pollOptimizeJob(optimizeJobId);
      return;
    }
    if (data.store_sync) {
      data.message = (data.message || '\u6267\u884c\u5b8c\u6210') + ' | \u5df2\u540c\u6b65\u5e97\u94fa ' + data.store_sync.updated + '/' + data.store_sync.total;
      if ((optType === 'capacity' || optType === 'cleanup') && typeof loadStores === 'function') loadStores();
      if (optType === 'capacity' || optType === 'cleanup') loadDashboardSummary();
    }
    if (data.error) { resultEl.innerHTML = '<span style="color:red;">' + data.error + '</span>'; fillEl.style.width = '0%'; return; }
    fillEl.style.width = '100%';
    resultEl.innerHTML = '<span style="color:#00bfa5;">' + (data.message || '\u6267\u884c\u5b8c\u6210') + '</span>';
    if (optType === 'categorize') renderCategorizeOptimizeResult(data);
  } catch(e) {
    resultEl.innerHTML = '<span style="color:red;">' + e.message + '</span>';
    fillEl.style.width = '0%';
  }
}
