let supervisorCurrentPlanId = '';
let supervisorPendingCommand = '';
let supervisorCurrentCommandId = '';
let supervisorHighRiskPendingId = '';
let supervisorAuthorityMode = 'plan_only';

function renderSupervisorAuthority(payload) {
  supervisorAuthorityMode = payload.authority_mode || 'plan_only';
  const current = document.getElementById('supervisor-authority-current');
  if (current) current.textContent = supervisorAuthorityMode;
  document.querySelectorAll('[data-authority-mode]').forEach(button => {
    const active = button.dataset.authorityMode === supervisorAuthorityMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

async function loadSupervisorAuthority() {
  const response = await demoRequest('/api/supervisor/authority');
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'authority mode unavailable');
  renderSupervisorAuthority(payload);
  return payload;
}

async function setSupervisorAuthority(mode) {
  const response = await demoRequest('/api/supervisor/authority', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({authority_mode: mode, operator: 'web'})
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'authority mode update failed');
  renderSupervisorAuthority(payload);
  await refreshSupervisorCurrentCommand();
  return payload;
}

async function refreshSupervisorCurrentCommand() {
  if (!supervisorCurrentCommandId) return;
  const commandId = supervisorCurrentCommandId;
  const response = await demoRequest(
    `/api/supervisor/commands/${encodeURIComponent(commandId)}`,
    {method: 'GET'}
  );
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'command status unavailable');
  }
  if (supervisorCurrentCommandId === commandId) {
    renderSupervisorCommandPlan(payload.command || {});
  }
}


function supervisorReplaceText(id, text) {
  const node = document.getElementById(id);
  if (node) node.textContent = text == null ? '' : String(text);
}

function supervisorList(id, rows, formatter) {
  const node = document.getElementById(id);
  if (!node) return;
  const items = Array.isArray(rows) ? rows : [];
  node.replaceChildren(...items.map((row, index) => {
    const item = document.createElement('div');
    item.className = 'supervisor-evidence-row';
    item.textContent = formatter(row, index);
    return item;
  }));
  if (!items.length) node.textContent = '无';
}

function appendSupervisorConversation(role, text) {
  const transcript = document.getElementById('supervisor-conversation-transcript');
  if (!transcript) return;
  const row = document.createElement('div');
  row.className = `supervisor-message supervisor-message-${role}`;
  row.textContent = text || '';
  transcript.append(row);
  transcript.scrollTop = transcript.scrollHeight;
}

function renderSupervisorAnalysisBlock(analysis, payload) {
  const section = document.getElementById('supervisor-answer');
  const plan = document.getElementById('supervisor-command-plan');
  if (section) section.hidden = false;
  if (plan) plan.hidden = true;
  supervisorReplaceText('supervisor-answer-authority', payload.authority_mode || 'analysis_only');
  supervisorReplaceText('supervisor-answer-text', analysis.message || 'This authority mode is read-only.');
  supervisorList('supervisor-answer-sources', [], source => String(source));
  supervisorList('supervisor-answer-unknowns', analysis.required_mode ? ['Required mode: ' + analysis.required_mode] : [], unknown => String(unknown));
  appendSupervisorConversation('assistant', analysis.message || 'Action requires a higher authority mode.');
}

function renderSupervisorAnswer(answer) {
  const section = document.getElementById('supervisor-answer');
  const plan = document.getElementById('supervisor-command-plan');
  if (section) section.hidden = false;
  if (plan) plan.hidden = true;
  supervisorReplaceText('supervisor-answer-authority', answer.authority_mode || supervisorAuthorityMode);
  supervisorReplaceText('supervisor-answer-text', answer.answer || '缺少可验证答案');
  supervisorList('supervisor-answer-sources', answer.sources, source => (
    `${source.path || '-'} · ${source.observed_at || '时间未知'}${source.freshness ? ` · ${source.freshness}` : ''}`
  ));
  supervisorList('supervisor-answer-unknowns', answer.unknowns, unknown => String(unknown));
  appendSupervisorConversation('assistant', answer.answer || '缺少可验证答案');
}

function supervisorScopeText(scope) {
  const store_allocations = scope.store_allocations || {};
  const allocations = Object.entries(store_allocations)
    .map(([storeId, quantity]) => `${storeId} ${quantity}`)
    .join('，');
  return [
    scope.group,
    (scope.sites || []).join('/'),
    scope.category,
    scope.quantity == null ? '' : `总量 ${scope.quantity}`,
    allocations
  ].filter(Boolean).join(' · ') || '未指定';
}

function renderSupervisorSteps(steps) {
  const container = document.getElementById('supervisor-plan-steps');
  if (!container) return;
  container.replaceChildren();
  (steps || []).forEach(step => {
    const row = document.createElement('article');
    row.className = 'supervisor-step';
    const title = supervisorText('strong', 'supervisor-step-title', `${step.order || '-'} · ${step.title || step.capability_id}`);
    const status = supervisorText('span', 'supervisor-step-status', step.status || 'pending');
    const parameters = step.parameters || {};
    const store_allocations = parameters.store_allocations || {};
    const quantity = parameters.quantity;
    const meta = supervisorText('div', 'supervisor-step-meta', [
      step.capability_id,
      step.browser_role,
      quantity == null ? '' : `总量 ${quantity}`,
      parameters.limit == null ? '' : `上限 ${parameters.limit}`,
      parameters.erp_write_limit == null ? '' : `ERP写入上限 ${parameters.erp_write_limit}`,
      parameters.target_saturation == null ? '' : `目标饱和率 ${parameters.target_saturation}%`,
      Object.entries(store_allocations).map(([id, count]) => `${id} ${count}`).join('，'),
      (step.depends_on || []).length ? `依赖 ${step.depends_on.join(', ')}` : '无依赖',
      `风险 ${step.risk || '-'}`,
      step.job_id ? `job_id ${step.job_id}` : ''
    ].filter(Boolean).join(' · '));
    const acceptance = supervisorText('div', 'supervisor-step-acceptance', `验收 ${(step.acceptance || []).join('，') || '-'}`);
    const preconditions = supervisorText('div', 'supervisor-step-preconditions', `前置 ${(step.preconditions || []).join('，') || '-'}`);
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = '技术参数';
    const code = document.createElement('pre');
    code.textContent = JSON.stringify(step.parameters || {}, null, 2);
    details.append(summary, code);
    row.append(title, status, meta, preconditions, acceptance, details);
    container.append(row);
  });
}

function renderSupervisorCommandResult(command) {
  const result = document.getElementById('supervisor-plan-result');
  if (!result) return;
  const rows = command.step_results || [];
  const summary = rows.map(row => (
    `${row.step_id || '-'}: ${row.business_status || row.status || '-'}${row.job_id ? ` (${row.job_id})` : ''}`
  )).join('；');
  const terminalReason = command.blocked_reason || command.error;
  result.textContent = `${command.status || '-'}${summary ? ` · ${summary}` : ''}${terminalReason ? ` · ${terminalReason}` : ''}`;
}

function renderSupervisorCommandPlan(command) {
  const section = document.getElementById('supervisor-command-plan');
  const answer = document.getElementById('supervisor-answer');
  if (section) section.hidden = false;
  if (answer) answer.hidden = true;
  supervisorCurrentCommandId = command.command_id || '';
  if (supervisorHighRiskPendingId !== supervisorCurrentCommandId) {
    supervisorHighRiskPendingId = '';
  }
  const plan = command.plan || {};
  const scope = plan.scope || {};
  const confirmation = plan.confirmation || {};
  supervisorReplaceText('supervisor-plan-authority', command.authority_mode || plan.authority_mode || supervisorAuthorityMode);
  supervisorReplaceText('supervisor-plan-objective', plan.objective || '-');
  supervisorReplaceText('supervisor-plan-scope', supervisorScopeText(scope));
  supervisorList('supervisor-plan-evidence', plan.evidence, evidence => (
    `${evidence.key || evidence.path || '-'} · ${evidence.observed_at || evidence.status || '时间未知'}`
  ));
  renderSupervisorSteps(plan.steps || []);
  supervisorList('supervisor-plan-blockers', plan.blockers, blocker => (
    `${blocker.code || '-'} · ${blocker.message || ''}`
  ));
  supervisorList('supervisor-plan-acceptance', plan.acceptance, row => String(row));
  const commandCurrentAuthorityMode = command.current_authority_mode || supervisorAuthorityMode;
  const effectiveAuthorityMode = (
    commandCurrentAuthorityMode === 'controlled_execution'
    && supervisorAuthorityMode === 'controlled_execution'
  ) ? 'controlled_execution' : 'plan_only';
  const retryAllowed = (
    command.status === 'partial_success'
    && !(plan.blockers || []).length
    && !command.blocked_reason
    && command.authority_mode === 'controlled_execution'
    && effectiveAuthorityMode === 'controlled_execution'
  );
  const confirmationNode = document.getElementById('supervisor-plan-confirmation');
  if (confirmationNode) {
    confirmationNode.replaceChildren();
    if (command.status === 'blocked') {
      confirmationNode.textContent = command.blocked_reason || 'authority_blocked';
    } else if (retryAllowed) {
      const retryButton = supervisorText(
        'button',
        'btn btn-primary',
        '\u4ec5\u91cd\u8bd5\u5931\u8d25\u5e97\u94fa'
      );
      retryButton.type = 'button';
      retryButton.addEventListener('click', async () => {
        try {
          await confirmAndExecuteSupervisorCommand(
            command.command_id,
            false,
            false,
            true
          );
        } catch (error) {
          appendSupervisorConversation(
            'assistant',
            error.message || '\u91cd\u8bd5\u5931\u8d25'
          );
        }
      });
      confirmationNode.append(retryButton);
    } else if (command.status === 'partial_success') {
      confirmationNode.textContent = command.blocked_reason || (
        (plan.blockers || []).length
          ? 'plan_blocked'
          : 'authority_mode_blocks_execution'
      );
    } else if (['completed', 'failed', 'running'].includes(command.status)) {
      confirmationNode.textContent = command.status;
    } else if ((plan.blockers || []).length) {
      confirmationNode.textContent = '计划被阻断，需先处理前置条件';
    } else {
      const highRisk = confirmation.level === 'high_risk';
      const button = supervisorText('button', `btn ${highRisk ? 'supervisor-confirmation-high-risk' : 'btn-primary'}`, highRisk ? '确认高风险并执行' : (confirmation.required ? '确认并执行' : '执行'));
      button.type = 'button';
      button.addEventListener('click', async () => {
        try {
          if (highRisk && supervisorHighRiskPendingId !== command.command_id) {
            supervisorHighRiskPendingId = command.command_id;
            button.textContent = '再次确认高风险执行';
            appendSupervisorConversation('assistant', '高风险操作需要再次确认');
            return;
          }
          await confirmAndExecuteSupervisorCommand(command.command_id, highRisk, confirmation.required);
        } catch (error) {
          appendSupervisorConversation('assistant', error.message || '执行失败');
        }
      });
      confirmationNode.append(button);
    }
  }
  renderSupervisorCommandResult(command);
  const conversationStatus = command.status || plan.status || '-';
  const conversationReason = command.blocked_reason || command.error;
  appendSupervisorConversation(
    'assistant',
    `${plan.objective || '操作计划'} · ${conversationStatus}${conversationReason ? ` · ${conversationReason}` : ''}`
  );
}

async function confirmAndExecuteSupervisorCommand(
  commandId,
  highRisk,
  confirmationRequired,
  retryFailedOnly = false
) {
  if (!commandId) return;
  if (confirmationRequired) {
    const confirmResponse = await demoRequest(`/api/supervisor/commands/${encodeURIComponent(commandId)}/confirm`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({confirmed: true, high_risk_ack: highRisk})
    });
    const confirmed = await confirmResponse.json();
    if (!confirmResponse.ok) throw new Error(confirmed.error || '确认失败');
  }
  const executeResponse = await demoRequest(`/api/supervisor/commands/${encodeURIComponent(commandId)}/execute`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({retry_failed_only: retryFailedOnly})
  });
  const executed = await executeResponse.json();
  if (!executeResponse.ok) throw new Error(executed.error || '执行失败');
  supervisorReplaceText('supervisor-plan-result', `running · ${executed.command_id || commandId}`);
  pollSupervisorCommand(executed.command_id || commandId);
}

async function pollSupervisorCommand(commandId) {
  const response = await demoRequest(`/api/supervisor/commands/${encodeURIComponent(commandId)}`, {method: 'GET'});
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || '读取执行状态失败');
  const command = payload.command || {};
  renderSupervisorCommandResult(command);
  if (['confirmed', 'running'].includes(command.status)) {
    setTimeout(() => pollSupervisorCommand(commandId), 1200);
  } else {
    renderSupervisorCommandPlan(command);
  }
}

async function submitSupervisorNaturalText(text) {
  appendSupervisorConversation('user', text);
  const response = await demoRequest('/api/supervisor/commands/preview', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text: text})
  });
  const payload = await response.json();
  if (payload.kind === 'ambiguity') {
    appendSupervisorConversation('assistant', payload.clarifying_question || '请补充指令范围');
    return;
  }
  if (!response.ok) throw new Error(payload.error || '主管请求失败');
  if (payload.kind === 'question') {
    renderSupervisorAnswer({...payload.answer, authority_mode: payload.authority_mode || supervisorAuthorityMode});
    return;
  }
  if (payload.kind === 'analysis_only') {
    renderSupervisorAnalysisBlock(payload.analysis || {}, payload);
    return;
  }
  renderSupervisorCommandPlan(payload.command || {});
}

const SUPERVISOR_TASK_TYPES = {
  capacity_refresh: {label: '\u5237\u65b0\u5bb9\u91cf', queue: '\u7acb\u5373\u5904\u7406'},
  cleanup_review: {label: '\u6e05\u7406\u590d\u6838', queue: '\u4eca\u65e5\u590d\u6838'},
  publish_prepare: {label: '\u4e0a\u67b6\u51c6\u5907', queue: '\u4eca\u65e5\u6267\u884c'}
};

async function loadSupervisorOperations() {
  const response = await demoRequest('/api/supervisor/operations/plans/latest');
  if (response.status === 404) return generateSupervisorPlan();
  const payload = await response.json();
  renderSupervisorPlan(payload.plan || {});
}

async function generateSupervisorPlan() {
  const response = await demoRequest('/api/supervisor/operations/plans', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({per_store_limit: 50})
  });
  const payload = await response.json();
  renderSupervisorPlan(payload.plan || {});
}

function supervisorText(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className || '';
  node.textContent = text == null ? '' : String(text);
  return node;
}

function supervisorTaskLabel(type) {
  return SUPERVISOR_TASK_TYPES[type]?.label || type || '-';
}

function supervisorQueueLabel(task) {
  if (task.status === 'completed') {
    return '\u5df2\u5b8c\u6210\u4e0e\u7ed3\u679c';
  }
  if (['partial', 'failed', 'cancelled'].includes(task.status)) {
    return '\u5f02\u5e38\u4e0e\u5f85\u5904\u7406';
  }
  return SUPERVISOR_TASK_TYPES[task.type]?.queue || '\u7b49\u5f85\u6761\u4ef6';
}

function renderSupervisorPrimaryCommand(plan, campaigns, blockers) {
  const command = document.createElement('div');
  command.className = 'supervisor-primary-command';
  const groups = [...new Set(campaigns.flatMap(campaign => (
    (campaign.store_allocations || []).map(allocation => allocation.group)
  )).filter(Boolean))];
  const sites = new Set(campaigns.flatMap(campaign => campaign.sites || []));
  const phase = campaigns[0]?.phase || '';
  const strategy = campaigns[0]?.strategy || '';
  const title = blockers.length && campaigns.length === 0
    ? `${plan.weekday || 'Today'} · 数据前置 · ${plan.focus_category || '-'}`
    : `${plan.weekday || 'Today'} · ${groups.join('+') || phase || '-'} · ${plan.focus_category || '-'}`;
  const detail = blockers.length && campaigns.length === 0
    ? `${blockers.length} 项容量刷新，完成后重新生成精准计划`
    : `${campaigns.length} 个主题 · ${sites.size} 个站点 · 计划上架 ${plan.summary?.publish || 0} · 建议补采 ${plan.summary?.collect || 0} · ${plan.readiness || '-'}${strategy ? ` · ${strategy}` : ''}`;
  command.append(
    supervisorText('strong', '', title),
    supervisorText('span', '', detail)
  );
  return command;
}

function renderSupervisorDecisionSummary(decisions) {
  const counts = new Map();
  (decisions || []).forEach(decision => {
    const code = decision.code || 'other';
    counts.set(code, (counts.get(code) || 0) + 1);
  });
  if (!counts.size) return null;
  const row = document.createElement('div');
  row.className = 'supervisor-decision-summary';
  row.append(supervisorText('strong', '', '\u4f8b\u5916\u4e0e\u963b\u585e'));
  counts.forEach((count, code) => {
    row.append(supervisorText('span', '', `${code} ${count}`));
  });
  return row;
}

function supervisorTaskForAllocation(tasks, allocation) {
  return (tasks || []).find(task => (
    allocation.task_id && task.task_id === allocation.task_id
  )) || (tasks || []).find(task => task.store_id === allocation.store_id);
}

function renderSupervisorTaskDetails(planId, campaign, tasks) {
  const body = document.createElement('div');
  body.className = 'supervisor-campaign-detail-body';
  (campaign.store_allocations || []).forEach(allocation => {
    const task = allocation.task || supervisorTaskForAllocation(tasks, allocation);
    if (task) {
      body.append(renderSupervisorTask(planId, {
        ...task,
        planned_quantity: allocation.quantity ?? task.planned_quantity
      }));
      return;
    }
    const row = document.createElement('div');
    row.className = 'supervisor-allocation-row';
    row.append(
      supervisorText('strong', '', allocation.store_id || '-'),
      supervisorText('span', '', `\u6570\u91cf ${allocation.quantity ?? '-'}`),
      supervisorText('span', '', allocation.status || '\u5f85\u4eba\u5de5\u5904\u7406')
    );
    body.append(row);
  });
  return body;
}

function renderCampaignIdentity(campaign, index) {
  const identity = document.createElement('div');
  identity.className = 'supervisor-campaign-identity';
  identity.append(
    supervisorText('span', 'supervisor-campaign-index', String(index + 1)),
    supervisorText(
      'strong',
      '',
      campaign.theme || campaign.category || campaign.campaign_id || '\u672a\u547d\u540d\u6218\u5f79'
    ),
    supervisorText(
      'span',
      '',
      [
        campaign.category,
        ...(campaign.sites || []),
        campaign.phase,
        campaign.validation_status
      ].filter(Boolean).join(' \u00b7 ')
    )
  );
  const matrix = supervisorText('button', 'btn btn-sm', '矩阵');
  matrix.type = 'button';
  matrix.title = '在矩阵经营中查看店铺';
  matrix.addEventListener('click', () => {
    const storeIds = (campaign.store_allocations || [])
      .map(allocation => allocation.store_id)
      .filter(Boolean);
    const cohort = storeIds.length
      ? `?stores=${encodeURIComponent(storeIds.join(','))}`
      : '';
    window.open(
      `./assets/matrix.html${cohort}`,
      '_blank',
      'noopener'
    );
  });
  identity.append(matrix);
  return identity;
}

function renderCampaignNumbers(campaign) {
  const numbers = document.createElement('div');
  numbers.className = 'supervisor-campaign-numbers';
  numbers.append(
    supervisorText('span', '', `\u8ba1\u5212 ${campaign.desired_publish || 0}`),
    supervisorText('span', '', `\u53ef\u7528 ${campaign.ready_publish || 0}`),
    supervisorText('span', '', `\u8865\u91c7 ${campaign.suggested_collect || 0}`)
  );
  const keywordRows = Array.isArray(campaign.keywords) ? campaign.keywords : [];
  const siteQuantities = new Map();
  (campaign.store_allocations || []).forEach(allocation => {
    const site = allocation.site || '-';
    siteQuantities.set(
      site,
      (siteQuantities.get(site) || 0) + Number(allocation.quantity || 0)
    );
  });
  if (siteQuantities.size) {
    numbers.append(
      supervisorText(
        'span',
        'supervisor-campaign-sites',
        [...siteQuantities.entries()]
          .map(([site, quantity]) => `${site} ${quantity}`)
          .join(' · ')
      )
    );
  }
  const keyword = keywordRows.map(row => (
    `${row.site || '-'}: ${row.buyer || row.supplier || '-'}`
  )).join(' \u00b7 ') || campaign.buyer_keyword || campaign.keyword || campaign.supplier_keyword;
  if (keyword) numbers.append(supervisorText('span', 'supervisor-campaign-keyword', keyword));
  return numbers;
}

function renderSupervisorCampaign(planId, campaign, tasks, index) {
  const row = document.createElement('article');
  row.className = 'supervisor-campaign-row';
  const details = document.createElement('details');
  details.className = 'supervisor-campaign-details';
  const summary = document.createElement('summary');
  const allocations = campaign.store_allocations || [];
  summary.textContent = `\u6d89\u53ca ${allocations.length} \u5e97`;
  details.append(summary, renderSupervisorTaskDetails(planId, campaign, tasks));
  const identity = renderCampaignIdentity(campaign, index);
  ['上架明细', '补采明细'].forEach(label => {
    const openDetails = supervisorText('button', 'btn btn-sm', label);
    openDetails.type = 'button';
    openDetails.addEventListener('click', () => {
      details.open = true;
      details.scrollIntoView({block: 'nearest'});
    });
    identity.append(openDetails);
  });
  row.append(
    supervisorText('span', 'supervisor-campaign-marker', String(index + 1)),
    identity,
    renderCampaignNumbers(campaign),
    details
  );
  return row;
}

function renderSupervisorBlocker(planId, blocker, tasks, index) {
  const taskIds = new Set(blocker.task_ids || []);
  const blockerTasks = (tasks || []).filter(task => taskIds.has(task.task_id));
  const row = document.createElement('article');
  row.className = 'supervisor-blocker-row';
  const details = document.createElement('details');
  details.className = 'supervisor-campaign-details supervisor-blocker-details';
  const summary = document.createElement('summary');
  summary.textContent = `涉及 ${blocker.store_count || blockerTasks.length} 店`;
  details.append(
    summary,
    renderSupervisorTaskDetails(
      planId,
      {
        store_allocations: blockerTasks.map(task => ({
          task_id: task.task_id,
          store_id: task.store_id,
          quantity: null
        }))
      },
      tasks
    )
  );
  row.append(
    supervisorText('span', 'supervisor-campaign-marker', String(index + 1)),
    supervisorText('strong', '', `刷新 ${blocker.group || '-'} 容量`),
    supervisorText(
      'span',
      '',
      `${blocker.store_count || blockerTasks.length} 店 · 数据前置`
    ),
    details
  );
  return row;
}

function renderSupervisorPlan(plan) {
  const summary = document.getElementById('supervisor-plan-summary');
  const queue = document.getElementById('supervisor-task-queue');
  if (!summary || !queue) return;
  supervisorCurrentPlanId = plan.plan_id || '';
  const readiness = document.getElementById('supervisor-readiness');
  if (readiness) {
    readiness.textContent = plan.readiness === 'ready'
      ? '\u6570\u636e\u5df2\u5c31\u7eea\uff0c\u8bf7\u4eba\u5de5\u6267\u884c\u8ba1\u5212'
      : '\u7406\u8bba\u8ba1\u5212\uff0c\u8bf7\u5148\u5b8c\u6210\u6570\u636e\u5237\u65b0\u4efb\u52a1';
  }
  const dependencies = document.getElementById('supervisor-dependencies');
  if (dependencies) {
    dependencies.replaceChildren(
      supervisorText('span', '', `\u6a21\u5f0f ${plan.mode || '-'}`),
      supervisorText('span', '', `\u4eca\u65e5\u7c7b\u76ee ${plan.focus_category || '-'}`),
      supervisorText('span', '', `\u6570\u636e\u7248\u672c ${plan.data_version || '-'}`),
      supervisorText('span', '', `\u751f\u6210\u65f6\u95f4 ${plan.generated_at || '-'}`)
    );
  }
  summary.replaceChildren(
    supervisorText('span', 'supervisor-metric', `店铺 ${plan.summary?.stores || 0}`),
    supervisorText('span', 'supervisor-metric', `待刷新 ${plan.summary?.refresh || 0}`),
    supervisorText('span', 'supervisor-metric', `计划上架 ${plan.summary?.publish || 0}`),
    supervisorText('span', 'supervisor-metric', `建议补采 ${plan.summary?.collect || 0}`),
    supervisorText('span', 'supervisor-metric', `理论清理 ${plan.summary?.cleanup_theoretical || 0}`)
  );
  const tasks = plan.tasks || [];
  const campaigns = Array.isArray(plan.campaigns) ? plan.campaigns.slice(0, 5) : [];
  const blockers = Array.isArray(plan.blockers) ? plan.blockers : [];
  const campaignRows = campaigns.map((campaign, index) => (
    renderSupervisorCampaign(plan.plan_id, campaign, tasks, index)
  ));
  const blockerRows = blockers.map((blocker, index) => (
    renderSupervisorBlocker(plan.plan_id, blocker, tasks, index)
  ));
  const campaignTaskIds = new Set(
    campaigns.flatMap(campaign => (
      (campaign.store_allocations || []).map(allocation => allocation.task_id).filter(Boolean)
    ))
  );
  const exceptionTasks = tasks.filter(
    task => !campaignTaskIds.has(task.task_id)
      && !blockers.some(
        blocker => (blocker.task_ids || []).includes(task.task_id)
      )
  );
  const exceptions = exceptionTasks.length
    ? (() => {
        const details = document.createElement('details');
        details.className = 'supervisor-campaign-details supervisor-exception-details';
        const heading = document.createElement('summary');
        heading.textContent = `\u5176\u4ed6\u524d\u7f6e\u4e0e\u590d\u6838 ${exceptionTasks.length} \u9879`;
        const body = document.createElement('div');
        body.className = 'supervisor-campaign-detail-body';
        exceptionTasks.forEach(task => body.append(renderSupervisorTask(plan.plan_id, task)));
        details.append(heading, body);
        return details;
      })()
    : null;
  const decisionSummary = renderSupervisorDecisionSummary(plan.decisions || []);
  queue.replaceChildren(
    renderSupervisorPrimaryCommand(plan, campaigns, blockers),
    ...(decisionSummary ? [decisionSummary] : []),
    ...campaignRows,
    ...blockerRows,
    ...(!campaignRows.length && !blockerRows.length
      ? [supervisorText('p', 'supervisor-empty', '\u6682\u65e0\u4e3b\u9898\u6218\u5f79')]
      : []),
    ...(exceptions ? [exceptions] : [])
  );
}

async function previewSupervisorRevision(command) {
  if (!supervisorCurrentPlanId) throw new Error('No active plan');
  const response = await demoRequest(
    `/api/supervisor/operations/plans/${encodeURIComponent(supervisorCurrentPlanId)}/revisions/preview`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({command: command})
    }
  );
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Plan preview failed');
  supervisorPendingCommand = command;
  const live = document.getElementById('supervisor-live-status');
  if (live) {
    const diff = payload.diff || {};
    const originalSummary = diff.original_summary || {};
    const revisedSummary = diff.revised_summary || {};
    const excludedStores = diff.excluded_stores || [];
    live.replaceChildren(
      supervisorText(
        'span',
        'supervisor-revision-diff',
        `任务 ${diff.original_tasks || 0} -> ${diff.revised_tasks || 0}`
      ),
      supervisorText(
        'span',
        'supervisor-revision-diff',
        `上架 ${originalSummary.publish || 0} -> ${revisedSummary.publish || 0}`
      ),
      supervisorText(
        'span',
        'supervisor-revision-diff',
        excludedStores.length ? `排除 ${excludedStores.join(', ')}` : '无排除店铺'
      ),
      supervisorText(
        'span',
        'supervisor-revision-risk',
        (diff.risks || []).join('；')
      )
    );
    const apply = supervisorText('button', 'btn btn-sm', '应用调整');
    apply.type = 'button';
    apply.addEventListener('click', applySupervisorRevision);
    live.append(apply);
  }
}

async function applySupervisorRevision() {
  if (!supervisorCurrentPlanId || !supervisorPendingCommand) return;
  const response = await demoRequest(
    `/api/supervisor/operations/plans/${encodeURIComponent(supervisorCurrentPlanId)}/revisions`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({command: supervisorPendingCommand})
    }
  );
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Plan revision failed');
  supervisorPendingCommand = '';
  renderSupervisorPlan(payload.plan || {});
}

function renderSupervisorTask(planId, task) {
  const current = task.current ?? task.observed_current ?? '-';
  const target = task.target ?? '-';
  const quantityText = task.type === 'cleanup_review'
    ? `\u5f53\u524d ${current} -> \u76ee\u6807 ${target} | \u7406\u8bba\u6e05\u7406 ${task.theoretical_remove ?? 0} | \u53ef\u6267\u884c ${task.executable_remove ?? '\u5f85\u5b9e\u65f6\u590d\u6838'}`
    : (task.planned_quantity == null
      ? `\u5f53\u524d ${current} / \u5bb9\u91cf ${task.capacity ?? '-'}\uff0c\u5148\u5237\u65b0\u6570\u636e`
      : `\u5f53\u524d ${current} -> \u76ee\u6807 ${target} | \u8ba1\u5212 ${task.planned_quantity} | \u9971\u548c ${task.saturation ?? '-'}%`);
  const row = document.createElement('article');
  row.className = 'supervisor-task';
  row.append(
    supervisorText('strong', 'supervisor-task-store', task.store_id),
    supervisorText(
      'span',
      'supervisor-task-type',
      `${supervisorTaskLabel(task.type)} · ${task.status || 'proposed'}`
    ),
    supervisorText(
      'span',
      'supervisor-task-quantity',
      quantityText
    ),
    supervisorText('p', 'supervisor-task-reason', task.reason)
  );

  const open = supervisorText('button', 'btn btn-sm', '打开工具');
  open.type = 'button';
  open.addEventListener('click', () => openSupervisorShortcut(task));

  const started = supervisorText('button', 'btn btn-sm', '标记开始');
  started.type = 'button';
  started.addEventListener(
    'click',
    () => updateSupervisorManualTask(planId, task.task_id, 'manual_in_progress')
  );

  if (task.type === 'capacity_refresh') {
    const verify = supervisorText('button', 'btn btn-sm', '重新生成核验');
    verify.type = 'button';
    verify.addEventListener('click', generateSupervisorPlan);
    row.append(open, started, verify);
  } else {
    const actual = document.createElement('input');
    actual.type = 'number';
    actual.min = '0';
    actual.step = '1';
    actual.className = 'supervisor-actual-quantity';
    actual.placeholder = '实际数量';
    actual.setAttribute('aria-label', `${task.store_id} 实际完成数量`);
    const completed = supervisorText('button', 'btn btn-sm', '记录完成');
    completed.type = 'button';
    completed.addEventListener(
      'click',
      () => recordSupervisorResult(planId, task.task_id, actual)
    );
    row.append(open, started, actual, completed);
  }
  return row;
}

function recordSupervisorResult(planId, taskId, input) {
  const actualQuantity = Number(input && input.value);
  const live = document.getElementById('supervisor-live-status');
  if (!input || input.value === '' || !Number.isFinite(actualQuantity) || actualQuantity < 0) {
    if (live) live.textContent = '请输入实际完成数量';
    input?.focus();
    return;
  }
  updateSupervisorManualTask(
    planId,
    taskId,
    'completed',
    Math.floor(actualQuantity)
  );
}

async function updateSupervisorManualTask(
  planId,
  taskId,
  status,
  actualQuantity
) {
  const response = await demoRequest(
    `/api/supervisor/operations/plans/${encodeURIComponent(planId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status: status, actual_quantity: actualQuantity})
    }
  );
  const payload = await response.json();
  const live = document.getElementById('supervisor-live-status');
  if (live) {
    live.textContent = response.ok
      ? `任务已更新为 ${payload.task.status}`
      : (payload.error || '更新失败');
  }
  if (response.ok) loadSupervisorOperations();
}

function openSupervisorShortcut(task) {
  const shortcut = task.shortcut || {};
  if (shortcut.action === 'open_publish_form') {
    goPage('task');
    fillForm({
      group: shortcut.group,
      category: shortcut.category,
      quantity: shortcut.quantity,
      sites: [shortcut.site]
    });
  } else if (shortcut.action === 'open_capacity_refresh') {
    goPage('optimize');
    switchOptGroup(shortcut.group);
    selectOptType('capacity');
    const store = document.getElementById('opt-store-id');
    if (store) store.value = shortcut.store_id || '';
  } else if (shortcut.action === 'open_cleanup_preview') {
    goPage('optimize');
    switchOptGroup(shortcut.group);
    selectOptType('cleanup');
    const store = document.getElementById('opt-store-id');
    if (store) store.value = shortcut.store_id || '';
    const mode = document.getElementById('opt-cleanup-mode');
    if (mode) mode.value = 'preview';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('supervisor-natural-form')
    ?.addEventListener('submit', async event => {
      event.preventDefault();
      const input = document.getElementById('supervisor-natural-input');
      const text = input ? input.value.trim() : '';
      if (!text) return;
      const send = document.getElementById('supervisor-send');
      if (send) send.disabled = true;
      try {
        await submitSupervisorNaturalText(text);
        input.value = '';
      } catch (error) {
        appendSupervisorConversation('assistant', error.message || '请求失败');
      } finally {
        if (send) send.disabled = false;
        input?.focus();
      }
    });
  document
    .getElementById('supervisor-generate')
    ?.addEventListener('click', generateSupervisorPlan);
  document
    .getElementById('supervisor-command-form')
    ?.addEventListener('submit', async event => {
      event.preventDefault();
      const input = document.getElementById('supervisor-command');
      const command = input ? input.value.trim() : '';
      const live = document.getElementById('supervisor-live-status');
      try {
        await previewSupervisorRevision(command);
      } catch (error) {
        if (live) live.textContent = error.message || 'Plan preview failed';
      }
    });
  document.querySelectorAll('[data-authority-mode]').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        await setSupervisorAuthority(button.dataset.authorityMode);
      } catch (error) {
        appendSupervisorConversation('assistant', error.message || 'authority mode update failed');
      }
    });
  });
  loadSupervisorAuthority().catch(error => appendSupervisorConversation('assistant', error.message));
  loadSupervisorOperations();
});
