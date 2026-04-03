const storageKey = 'beaconFinanceData';
const state = {transactions: [], goals: [], checkins: [], budgets: [], subscriptions: [], investments: [], settings: {theme:'auto', currency:'USD', alerts:true}};
let isPrivacyMode = false;
const tabs = document.querySelectorAll('.nav-btn');
const viewTitle = document.getElementById('page-title');
const lastSync = document.getElementById('last-sync');

function init() {
  loadState();
  bindNav();
  bindSearch();
  bindPrivacyToggle();
  bindGlobalUX();
  bindTransactionForm();
  bindQuickAddBtn();
  bindTransactionFilters();
  bindGoalForm();
  bindCheckinForm();
  bindBudgetForm();
  bindSubscriptionForm();
  bindDataManagement();
  bindSettings();
  bindMoodSlider();
  bindChat();
  bindCalendar();
  bindBankSync();
  bindCards();
  bindDrawer();
  startLiveClock();
  applyTheme();
  renderApp();
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    Object.assign(state, JSON.parse(saved));
    if (!state.budgets) state.budgets = [];
    if (!state.subscriptions) state.subscriptions = [];
    if (!state.investments) state.investments = [];
  } else {
    loadDemoData(false);
  }
}

function loadDemoData(triggerRender = true) {
  state.transactions = [
    {id:1, date: today(), type:'income', category:'Salary', desc:'April salary', amount: 3000},
    {id:2, date: today(), type:'expense', category:'Rent', desc:'Apartment', amount: 1200},
    {id:3, date: today(), type:'expense', category:'Food', desc:'Groceries', amount: 210.75},
    {id:4, date: today(), type:'expense', category:'Entertainment', desc:'Movies', amount: 45.00},
    {id:5, date: today(), type:'expense', category:'Transport', desc:'Uber rides', amount: 85.50},
    {id:6, date: today(), type:'expense', category:'Utilities', desc:'Electricity bill', amount: 120.00},
    {id:7, date: today(), type:'expense', category:'Health', desc:'Doctor visit', amount: 150.00},
    {id:8, date: today(), type:'expense', category:'Food', desc:'Dinner out', amount: 65.25},
    {id:9, date: today(), type:'expense', category:'Transport', desc:'Gas', amount: 60.00},
    {id:10, date: today(), type:'expense', category:'Entertainment', desc:'Concert', amount: 80.00}
  ];
  state.goals = [{id:1,name:'Emergency Buffer',target:3000,saved:600, by:'2026-09-30'}];
  state.budgets = [{id:1, category:'Food', limit:400}, {id:2, category:'Entertainment', limit:150}];
  state.subscriptions = [{id:1, name:'Netflix', cost:15.49}, {id:2, name:'Gym', cost:40.00}];
  state.investments = [
    {id:1, name:'S&P 500 Index', ticker:'VOO', units: 12.5, avgPrice: 400.00, currentPrice: 425.50},
    {id:2, name:'Apple Inc.', ticker:'AAPL', units: 20, avgPrice: 150.00, currentPrice: 175.25},
    {id:3, name:'Bitcoin', ticker:'BTC', units: 0.15, avgPrice: 30000, currentPrice: 62000}
  ];
  state.checkins = [];
  state.settings = {theme:'auto', currency:'USD', alerts:true, includeHeaders:true};
  if(triggerRender){ saveState(); renderApp(); }
}

function saveState() { localStorage.setItem(storageKey, JSON.stringify(state)); }

function bindSearch() {
  const searchInput = document.getElementById('global-search');
  const searchResults = document.getElementById('search-results');
  if(!searchInput || !searchResults) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    searchResults.innerHTML = '';
    if (!query) {
      searchResults.classList.remove('active');
      return;
    }
    
    const matches = state.transactions.filter(tx => 
       (tx.desc && tx.desc.toLowerCase().includes(query)) || 
       (tx.category && tx.category.toLowerCase().includes(query)) || 
       (tx.amount && tx.amount.toString().includes(query))
    ).slice(0, 5);

    if (matches.length > 0) {
      matches.forEach(tx => {
        const div = document.createElement('div');
        div.className = 'search-item';
        div.innerHTML = `<strong style="color:var(--primary)">${tx.category}</strong>: ${tx.desc||'No description'} <span style="float:right;font-weight:bold">${formatUsd(tx.amount)}</span>`;
        div.addEventListener('click', () => {
           document.querySelector('[data-view="transactions"]').click();
           searchInput.value = ''; searchResults.classList.remove('active');
        });
        searchResults.appendChild(div);
      });
    } else {
      searchResults.innerHTML = '<div class="search-item" style="color:var(--text-muted)">No matches found</div>';
    }
    searchResults.classList.add('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) searchResults.classList.remove('active');
  });
}

function bindNav() {
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    showView(btn.dataset.view);
  }));
}

function showView(view) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active-screen'));
  document.getElementById(view).classList.add('active-screen');
  const titles = {dashboard: 'Dashboard', transactions:'Transactions', calendar:'Calendar', cards:'My Virtual Cards', goals:'Goals', budgets:'Budgets & Bills', insights:'Insights', investments:'Investments', checkin:'Weekly Check-In', settings:'Settings'}
  viewTitle.textContent = titles[view] || 'Beacon Finance';
  renderApp();
}

function bindTransactionForm() {
  const form = document.getElementById('transaction-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const type = document.getElementById('tx-type').value;
    const category = document.getElementById('tx-category').value;
    const amount = Number(document.getElementById('tx-amount').value);
    const desc = document.getElementById('tx-desc').value.trim();
    if (!amount || amount <=0) return;
    state.transactions.unshift({id:Date.now(), date: today(), type, category, desc, amount});
    saveState();
    form.reset();
    renderApp();
  });
}

function bindQuickAddBtn() {
  const modal = document.getElementById('quick-add-modal');
  const fab = document.getElementById('fab-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const form = document.getElementById('quick-transaction-form');

  if (!modal || !fab) return;

  fab.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  const scanBtn = document.getElementById('scan-receipt-btn');
  const scanAnim = document.getElementById('scanner-animation');
  
  if (scanBtn && scanAnim) {
    scanBtn.addEventListener('click', () => {
       scanBtn.classList.add('hidden');
       scanAnim.classList.remove('hidden');
       
       setTimeout(() => {
          document.getElementById('quick-tx-type').value = 'expense';
          document.getElementById('quick-tx-category').value = 'Food';
          document.getElementById('quick-tx-amount').value = '45.10';
          document.getElementById('quick-tx-desc').value = 'Dinner parsing via AI';
          
          scanAnim.classList.add('hidden');
          scanBtn.classList.remove('hidden');
          scanBtn.innerHTML = '<span>✅</span> Scanned Successfully!';
          setTimeout(() => scanBtn.innerHTML = '<span>📸</span> Auto-scan Receipt (AI)', 4000);
       }, 2200);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const type = document.getElementById('quick-tx-type').value;
    const category = document.getElementById('quick-tx-category').value;
    const amount = Number(document.getElementById('quick-tx-amount').value);
    const desc = document.getElementById('quick-tx-desc').value.trim() || 'Quick Add';
    
    if (!amount || amount <= 0) return;
    
    state.transactions.unshift({
      id: Date.now(),
      date: today(),
      type,
      category,
      desc,
      amount
    });
    
    saveState();
    form.reset();
    modal.classList.add('hidden');
    renderApp();
    shootConfetti();
    
    // Tiny UX detail: wiggle the total balance text
    const balText = document.getElementById('total-balance');
    balText.style.transition = 'transform 0.2s';
    balText.style.transform = 'scale(1.1)';
    setTimeout(() => balText.style.transform = 'scale(1)', 200);
  });
}

function bindTransactionFilters() {
  ['filter-type','filter-cat','filter-date'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => renderApp());
  });
  document.getElementById('clear-filter').addEventListener('click', () => {
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-cat').value = 'all';
    document.getElementById('filter-date').value = '';
    renderApp();
  });
}

function bindGoalForm() {
  const form = document.getElementById('goal-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const target = Number(document.getElementById('goal-amount').value);
    const by = document.getElementById('goal-by').value;
    if (!name || !target || target<=0) return;
    state.goals.push({id:Date.now(), name, target, saved:0, by});
    saveState();
    form.reset();
    renderApp();
  });
}

function bindBudgetForm() {
  const form = document.getElementById('budget-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const category = document.getElementById('budget-category').value;
    const limit = Number(document.getElementById('budget-limit').value);
    if (!limit || limit<=0) return;
    // ensure singular
    state.budgets = state.budgets.filter(b=>b.category!==category);
    state.budgets.push({id:Date.now(), category, limit});
    saveState();
    form.reset();
    renderApp();
  });
}

function bindSubscriptionForm() {
  const form = document.getElementById('sub-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('sub-name').value;
    const cost = Number(document.getElementById('sub-cost').value);
    if (!name || !cost || cost<=0) return;
    state.subscriptions.push({id:Date.now(), name, cost});
    saveState();
    form.reset();
    renderApp();
  });
}

function bindCheckinForm() {
  const form = document.getElementById('checkin-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const date = document.getElementById('checkin-date').value;
    const mood = Number(document.getElementById('checkin-mood').value);
    const note = document.getElementById('checkin-note').value.trim();
    if (!date) return;
    state.checkins.unshift({id:Date.now(), date, mood, note});
    saveState();
    form.reset();
    document.getElementById('mood-label').textContent = moodLabel(5);
    renderApp();
  });
}

function bindDataManagement() {
  document.getElementById('wipe-data-btn').addEventListener('click', () => {
    if(confirm('Are you sure you want to permanently delete all your data?')){
      localStorage.removeItem(storageKey);
      state.transactions=[]; state.goals=[]; state.budgets=[]; state.subscriptions=[]; state.checkins=[];
      saveState(); renderApp();
    }
  });

  document.getElementById('load-demo-btn').addEventListener('click', () => {
    if(confirm('This will replace your current data with demo data. Continue?')){
      loadDemoData();
    }
  });

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    let csv = "Date,Type,Category,Description,Amount\n";
    state.transactions.forEach(tx => {
      csv += `${tx.date},${tx.type},${tx.category},"${tx.desc}",${tx.amount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transactions.csv'; a.click();
    window.URL.revokeObjectURL(url);
  });
}

function bindSettings() {
  const themeSelect = document.getElementById('theme-select');
  const currencySelect = document.getElementById('currency-select');
  const alertToggle = document.getElementById('alert-toggle');

  themeSelect.value = state.settings.theme;
  currencySelect.value = state.settings.currency;
  alertToggle.checked = state.settings.alerts;

  themeSelect.addEventListener('change', () => {
    state.settings.theme = themeSelect.value;
    applyTheme();
    saveState();
  });
  currencySelect.addEventListener('change', () => {
    state.settings.currency = currencySelect.value;
    renderApp();
    saveState();
  });
  alertToggle.addEventListener('change', () => {
    state.settings.alerts = alertToggle.checked;
    renderApp();
    saveState();
  });
}

function bindMoodSlider() {
  const mood = document.getElementById('checkin-mood');
  const label = document.getElementById('mood-label');
  const emoji = document.getElementById('mood-emoji');
  if(!mood) return;

  mood.addEventListener('input', () => {
    const val = Number(mood.value);
    label.textContent = moodLabel(val);
    
    // Animate emoji based on value
    const emojis = ['😫','😟','😐','😊','🤑'];
    const index = Math.min(Math.floor(val/2.2), 4);
    emoji.textContent = emojis[index];
    emoji.style.transform = `scale(${1 + val/15}) rotate(${val * 2}deg)`;
  });

  // Mouse Flare Effect for all panels
  document.addEventListener('mousemove', (e) => {
    const flares = document.querySelectorAll('.panel-flare');
    flares.forEach(f => {
       const rect = f.parentElement.getBoundingClientRect();
       const x = ((e.clientX - rect.left) / rect.width) * 100;
       const y = ((e.clientY - rect.top) / rect.height) * 100;
       f.parentElement.style.setProperty('--mouse-x', `${x}%`);
       f.parentElement.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

function moodLabel(val){
  if(val<3)return 'Stressed';
  if(val<5)return 'Cautious';
  if(val<7)return 'Balanced';
  if(val<9)return 'Optimistic';
  return 'Wealth Manifested';
}

function applyTheme(){
  const theme = state.settings.theme;
  document.body.classList.remove('dark-theme','light-theme');
  if(theme==='dark') document.body.classList.add('dark-theme');
  else if(theme==='light') document.body.classList.add('light-theme');
  else {
    const hour=new Date().getHours();
    if(hour<6||hour>=19) document.body.classList.add('dark-theme');
    else document.body.classList.add('light-theme');
  }
}

function renderAchievements() {
  const container = document.getElementById('achievements-list');
  if(!container) return;
  container.innerHTML = '';
  
  const badges = [
    { id: 'first_tx', icon: '💸', name: 'First Spend', condition: state.transactions.length >= 1 },
    { id: 'heavy_tracker', icon: '🔥', name: '10 Transactions', condition: state.transactions.length >= 10 },
    { id: 'goal_setter', icon: '🎯', name: 'Goal Maker', condition: state.goals.length >= 1 },
    { id: 'budgetizer', icon: '🛡️', name: 'Budget Master', condition: state.budgets.length >= 2 },
    { id: 'checkin_pro', icon: '🧘', name: 'Mindful', condition: state.checkins.length >= 1 }
  ];

  badges.forEach(b => {
    const el = document.createElement('div');
    el.className = `badge ${b.condition ? '' : 'locked'}`;
    el.innerHTML = `<span>${b.icon}</span> ${b.name}`;
    container.appendChild(el);
  });
}

function renderForecastAndHeatmap() {
  const fBox = document.getElementById('forecast-savings');
  const fText = document.getElementById('forecast-text');
  const hGrid = document.getElementById('spending-heatmap');
  if(!fBox || !hGrid) return;
  
  const todayDate = new Date();
  const currentMonth = todayDate.getMonth();
  const currentYear = todayDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = todayDate.getDate() || 1;
  const daysLeft = daysInMonth - daysPassed;

  const mSpend = state.transactions.filter(t=>t.type==='expense' && new Date(t.date).getMonth()===currentMonth).reduce((a,t)=>a+t.amount,0);
  const mIncome = state.transactions.filter(t=>t.type==='income' && new Date(t.date).getMonth()===currentMonth).reduce((a,t)=>a+t.amount,0);
  const subCosts = state.subscriptions.reduce((a,s)=>a+s.cost,0);
  
  const averageDailySpend = mSpend / daysPassed;
  const projectedExtraSpend = averageDailySpend * daysLeft;
  
  const projectedSavings = mIncome - (mSpend + projectedExtraSpend + subCosts);
  fBox.textContent = formatUsd(projectedSavings);

  if (projectedSavings > 0) {
    fBox.style.color = 'var(--secondary)';
    fText.textContent = `Looking great! On track to save ${formatUsd(projectedSavings)} by month end.`;
  } else {
    fBox.style.color = '#ef4444';
    fText.textContent = `Projected deficit. Try to cut daily spend by ${formatUsd(Math.abs(projectedSavings)/Math.max(1,daysLeft))}.`;
  }

  hGrid.innerHTML = '';
  const amountsByDate = {};
  state.transactions.filter(t=>t.type==='expense').forEach(t=>{ amountsByDate[t.date] = (amountsByDate[t.date]||0) + t.amount; });

  const oneDay = 24*60*60*1000;
  for (let i = 27; i >= 0; i--) {
     const d = new Date(todayDate.getTime() - i*oneDay);
     const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
     const amount = amountsByDate[dStr] || 0;
     
     const cell = document.createElement('div');
     cell.className = 'heatmap-cell';
     
     if (amount > 0) {
        let intensity = amount > 100 ? 1 : amount > 50 ? 0.7 : amount > 15 ? 0.4 : 0.2;
        cell.style.background = `rgba(192, 132, 252, ${intensity})`;
     }
     const displayDate = d.toLocaleDateString(undefined, {month:'short', day:'numeric'});
     cell.setAttribute('data-tooltip', `${displayDate}: ${amount>0 ? formatUsd(amount) : 'No spend'}`);
     hGrid.appendChild(cell);
  }
}

function renderApp() {
  renderDashboard();
  renderTransactions();
  renderGoals();
  renderBudgetsAndSubs();
  renderInsights();
  renderForecastAndHeatmap();
  renderAchievements();
  renderCheckins();
  if (typeof renderInvestments === 'function') renderInvestments();
  if (typeof renderCalendarView === 'function') renderCalendarView();
  lastSync.textContent = new Date().toLocaleString();
}

function renderDashboard() {
  updateGreeting();
  const totalBalance = state.transactions.reduce((acc,t)=> acc + (t.type==='income'?t.amount:-t.amount),0);
  const month = new Date().getMonth();
  const monthlySpend = state.transactions.filter(t=>t.type==='expense' && new Date(t.date).getMonth()===month).reduce((a,t)=>a+t.amount,0);
  const goalProgress = state.goals.length ? Math.round((state.goals.reduce((a,g)=>a+g.saved,0) / state.goals.reduce((a,g)=>a+g.target,0))*100) : 0;
  const score = Math.max(30, Math.min(100, 80 - (monthlySpend / Math.max(totalBalance,1))*12));
  document.getElementById('total-balance').textContent = formatUsd(totalBalance);
  document.getElementById('monthly-spend').textContent = formatUsd(monthlySpend);
  document.getElementById('goal-progress').textContent = `${goalProgress}%`;
  document.getElementById('finance-score').textContent = `${Math.round(score)}/100`;

  const sparkPath = document.getElementById('sparkline-path');
  if (sparkPath) {
     let runBal = totalBalance;
     const points = [];
     const steps = 14;
     for (let i=0; i<steps; i++) {
        points.unshift(runBal);
        const d = new Date(new Date().getTime() - i*24*60*60*1000);
        const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const txs = state.transactions.filter(t=>t.date===dStr);
        const dayNet = txs.reduce((acc,t)=> acc + (t.type==='income'?t.amount:-t.amount), 0);
        runBal -= dayNet; 
     }
     
     const maxB = Math.max(...points) || 1;
     const minB = Math.min(...points) || 0;
     const range = maxB - minB || 1;
     
     let dStr = '';
     points.forEach((val, i) => {
        const x = (i / (steps-1)) * 200;
        const y = 35 - ((val - minB) / range) * 30; 
        dStr += `${i===0?'M':'L'} ${x} ${y} `;
     });
     sparkPath.setAttribute('d', dStr);
  }

  const categories = {};
  state.transactions.filter(t=>t.type==='expense').forEach(t=>{ categories[t.category]=(categories[t.category]||0)+t.amount; });
  const chart = document.getElementById('spending-breakdown');
  chart.innerHTML = '';
  const totalExpense = Object.values(categories).reduce((a,b)=>a+b,0) || 1;
  Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,5).forEach(([cat,val])=>{
    const pct = Math.max(8, Math.round((val/totalExpense)*100));
    const item = document.createElement('div');
    item.className='breakdown-bar';
    item.style.height = `${pct}%`;
    item.style.background = randomColor(cat);
    item.setAttribute('data-label', `${cat}: ${pct}% - ${formatUsd(val)}`);
    const label = document.createElement('div');
    label.className='bar-label';
    label.textContent = cat;
    item.appendChild(label);
    chart.appendChild(item);
  });
  const ring = document.getElementById('gauge-circle');
  const text = document.getElementById('gauge-text');
  const gauge = Math.min(100, Math.max(0, Math.round(score)));
  const circumference = 2 * Math.PI * 44;
  const dash = circumference - (circumference * gauge / 100);
  if(ring) {
     ring.style.strokeDasharray = `${circumference}`;
     ring.style.strokeDashoffset = `${dash}`;
  }
  if(text) text.textContent = `${gauge}%`;
  const hint = document.getElementById('gauge-hint');
  if(hint) hint.textContent = gauge > 0 ? (gauge > 70 ? 'On track: keep good habits!' : 'Room to grow: check your financial habits weekly.') : 'Start tracking to get your score.';

  const insights = computeInsights(totalBalance, monthlySpend);
  const list = document.getElementById('latest-insights');
  if(list){
    list.innerHTML = '';
    insights.slice(0,3).forEach(x=>{ const li=document.createElement('li'); li.textContent=x; list.appendChild(li); });
  }
}

function renderTransactions(){
  const filterType = document.getElementById('filter-type').value;
  const filterCat = document.getElementById('filter-cat').value;
  const filterDate = document.getElementById('filter-date').value;

  let filtered = state.transactions;
  if (filterType !== 'all') filtered = filtered.filter(tx => tx.type === filterType);
  if (filterCat !== 'all') filtered = filtered.filter(tx => tx.category === filterCat);
  if (filterDate) filtered = filtered.filter(tx => tx.date === filterDate);

  const container = document.getElementById('tx-list'); if(!container) return; 
  container.innerHTML = '';
  filtered.slice(0, 50).forEach(tx=>{
    const tr = document.createElement('tr');
     tr.innerHTML = `<td>${tx.date}</td><td>${tx.type}</td><td>${tx.category}</td><td>${tx.desc || '-'}</td><td class='${tx.type==='income'?'tx-positive':'tx-negative'}'>${tx.type==='income'?'+':'-'}${formatUsd(tx.amount)}</td><td><button data-id='${tx.id}' class='delete-tx' style='background:#ef4444;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;'>Delete</button></td>`;
    
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', (e) => {
       if(e.target.classList.contains('delete-tx')) return;
       openTxDrawer(tx);
    });

    tr.addEventListener('contextmenu', (e) => {
       e.preventDefault();
       ctxTargetTx = tx;
       const ctxMenu = document.getElementById('custom-context-menu');
       if(ctxMenu) {
         ctxMenu.style.left = `${e.pageX}px`;
         ctxMenu.style.top = `${e.pageY}px`;
         ctxMenu.classList.remove('hidden');
       }
    });

    container.appendChild(tr);
  });

  document.querySelectorAll('.delete-tx').forEach(btn => btn.addEventListener('click', e => {
    const txId = Number(e.target.dataset.id);
    state.transactions = state.transactions.filter(tx => tx.id !== txId);
    saveState(); renderApp();
  }));
}

function renderGoals(){
  const list = document.getElementById('goal-list'); if(!list) return;
  list.innerHTML='';
  if (!state.goals.length) return list.innerHTML='<p style="color:var(--text-muted)">No active goals yet. Add one to get started.</p>';
  state.goals.forEach(goal=>{
    const percent = Math.round((goal.saved/goal.target)*100);
    const item = document.createElement('div'); item.className='goal-item';
    item.innerHTML = `<h3>${goal.name}</h3><p>${formatUsd(goal.saved)} of ${formatUsd(goal.target)}${goal.by?` by ${goal.by}`:''}</p><div class='progress'><div class='progress-inner' style='width:${Math.min(percent,100)}%'></div></div><p style='font-size:.8rem;color:var(--text-muted);margin:8px 0 0;'>${Number.isNaN(percent)?0:percent}% achieved</p><div style="margin-top:10px;display:flex;gap:8px;"><button data-id='${goal.id}' class='btn-topup' style='background:rgba(255,255,255,0.1);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:6px 12px;cursor:pointer'>+ $50 Top-up</button><button data-id='${goal.id}' class='btn-complete' style='background:var(--primary);color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer'>Mark done</button></div>`;
    list.appendChild(item);
  });

  document.querySelectorAll('.btn-topup').forEach(btn => btn.addEventListener('click', e => {
    const id = Number(e.target.dataset.id);
    const goal = state.goals.find(g=>g.id===id);
    if(goal){ goal.saved = Math.min(goal.target, goal.saved + 50); saveState(); renderApp(); }
  }));
  document.querySelectorAll('.btn-complete').forEach(btn => btn.addEventListener('click', e => {
    const id = Number(e.target.dataset.id);
    state.goals = state.goals.filter(g=>g.id!==id);
    saveState(); renderApp();
  }));
}

function renderBudgetsAndSubs(){
  const bList = document.getElementById('budget-list');
  const sList = document.getElementById('sub-list');
  if(bList) bList.innerHTML='';
  if(sList) sList.innerHTML='';

  // Render Budgets
  if(bList){
      if (!state.budgets.length) bList.innerHTML='<p style="color:var(--text-muted)">No budgets created.</p>';
      state.budgets.forEach(b=>{
        const month = new Date().getMonth();
        const spent = state.transactions.filter(t=>t.type==='expense' && t.category===b.category && new Date(t.date).getMonth()===month).reduce((acc,t)=>acc+t.amount,0);
        const percent = Math.round((spent/b.limit)*100);
        const warningColor = percent>90 ? '#ef4444' : percent>75 ? '#f59e0b' : 'var(--primary)';
        
        const item = document.createElement('div'); item.className='goal-item relative';
        item.innerHTML = `<h3>${b.category}</h3><p>${formatUsd(spent)} spent of ${formatUsd(b.limit)} limit</p><div class='progress'><div class='progress-inner' style='width:${Math.min(percent,100)}%; background:${warningColor}'></div></div><p style='font-size:.8rem;color:${percent>90?'#ef4444':'var(--text-muted)'};margin:8px 0 0;'>${percent}% utilized</p><button data-id='${b.id}' class='delete-budget' style='position:absolute; top:20px; right:20px; background:transparent; border:none; color:var(--text-muted); cursor:pointer;'>✕</button>`;
        bList.appendChild(item);
      });

      document.querySelectorAll('.delete-budget').forEach(btn => btn.addEventListener('click', e => {
         state.budgets = state.budgets.filter(b=>b.id!==Number(e.target.dataset.id));
         saveState(); renderApp();
      }));
  }

  // Render Subscriptions
  if(sList){
      if (!state.subscriptions.length) sList.innerHTML='<p style="color:var(--text-muted)">No subscriptions tracked.</p>';
      let totalCost = 0;
      state.subscriptions.forEach(s=>{
        totalCost += s.cost;
        const item = document.createElement('div'); item.className='goal-item relative flex-row space-between items-center';
        item.innerHTML = `<h3 style="margin:0">${s.name}</h3> <p style="margin:0; font-weight:600; font-size:1.1rem">${formatUsd(s.cost)}/mo</p>
        <button data-id='${s.id}' class='delete-sub' style='background:transparent; border:none; color:var(--text-muted); cursor:pointer;'>✕</button>`;
        sList.appendChild(item);
      });
      const lbl = document.getElementById('sub-total');
      if(lbl) lbl.textContent = formatUsd(totalCost);

      document.querySelectorAll('.delete-sub').forEach(btn => btn.addEventListener('click', e => {
         state.subscriptions = state.subscriptions.filter(s=>s.id!==Number(e.target.dataset.id));
         saveState(); renderApp();
      }));
  }
}

function renderInsights(){
  const list = document.getElementById('insights-list'); if(!list) return;
  list.innerHTML='';
  computeInsights().forEach(item=>{
    const li=document.createElement('li'); li.innerHTML=`<strong style="color:var(--primary)">${item.split(':')[0]}:</strong> ${item.replace(/^[^:]+:/,'').trim()}`; list.appendChild(li);
  });
}

function renderCheckins(){
  const list = document.getElementById('checkin-list'); if(!list) return;
  list.innerHTML='';
  if (!state.checkins.length) return list.innerHTML='<li style="color:var(--text-muted)">No check-ins yet. Use the form to capture your mood.</li>';
  state.checkins.forEach(entry=>{
    const li=document.createElement('li');
    li.innerHTML = `<div><strong>${entry.date}</strong> &mdash; <span class='mood' style="color:var(--secondary);font-weight:600">${moodLabel(entry.mood)} (${entry.mood}/10)</span></div><p style="margin-top:8px">${entry.note||'No note provided.'}</p>`;
    list.appendChild(li);
  });
}

function computeInsights(totalBalance = null, monthlySpend = null) {
  const tBalance = totalBalance!==null ? totalBalance : state.transactions.reduce((acc,t)=> acc + (t.type==='income'?t.amount:-t.amount),0);
  const month = new Date().getMonth();
  const mSpend = monthlySpend!==null ? monthlySpend : state.transactions.filter(t=>t.type==='expense' && new Date(t.date).getMonth()===month).reduce((a,t)=>a+t.amount,0);
  const insights=[];
  if (mSpend > 0.4*(tBalance + mSpend)) insights.push('High spend alert: Expenses are over 40% of your available cash this month');
  else insights.push('Good spending discipline: monthly spending is within 40% of your available cash');
  
  const frequent = mostFrequentCategory();
  if (frequent) insights.push(`Top spend category: ${frequent.cat} (${Math.round(frequent.pct)}% of expenses)`);
  
  // Custom insight using the new Budgets feature!
  const overBudgetCat = state.budgets.find(b => {
     const spent = state.transactions.filter(t=>t.type==='expense' && t.category===b.category && new Date(t.date).getMonth()===month).reduce((acc,t)=>acc+t.amount,0);
     return spent > b.limit;
  });
  if(overBudgetCat) insights.push(`Budget Alert: You have exceeded your monthly budget for ${overBudgetCat.category}!`);

  if (state.goals.length===0) insights.push('Tip: Add a savings goal to watch your progress.');
  else {
    const next = state.goals[0];
    insights.push(`Keep momentum: To meet ${next.name}, save $${((next.target-next.saved)/3).toFixed(2)} per month for 3 months.`);
  }
  insights.push(`Mood snapshot: ${state.checkins.length ? `${state.checkins[0].mood}/10 currently` : 'Try weekly check-ins to keep your financial confidence up.'}`);
  return insights;
}

function mostFrequentCategory(){
  const categories = {};
  state.transactions.filter(t=>t.type==='expense').forEach(t=>categories[t.category]=(categories[t.category]||0)+t.amount);
  const total = Object.values(categories).reduce((a,b)=>a+b,0);
  if (total<=0) return null;
  const sorted = Object.entries(categories).sort((a,b)=>b[1]-a[1]);
  return {cat:sorted[0][0], pct:(sorted[0][1]/total)*100};
}

function today(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatUsd(value){
  if (isPrivacyMode) return '****';
  const code = state.settings.currency || 'USD';
  return Number(value).toLocaleString(undefined,{style:'currency',currency:code,minimumFractionDigits:2,maximumFractionDigits:2});
}

let ctxTargetTx = null;

function bindGlobalUX() {
  document.addEventListener('keydown', (e) => {
    // Cmd+K or Ctrl+K for search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const s = document.getElementById('global-search');
      if(s) s.focus();
    }
    // N for Quick Add
    if (e.key.toLowerCase() === 'n' && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
      const flexbtn = document.getElementById('fab-btn');
      if(flexbtn && !document.getElementById('quick-add-modal').classList.contains('hidden') === false) {
         flexbtn.click();
      }
    }
  });

  const ctxMenu = document.getElementById('custom-context-menu');
  if(!ctxMenu) return;

  document.addEventListener('click', (e) => {
     if (e.target.closest('#custom-context-menu')) return;
     ctxMenu.classList.add('hidden');
  });

  const btnCopy = document.getElementById('ctx-copy');
  const btnDelete = document.getElementById('ctx-delete');
  
  if(btnCopy) btnCopy.addEventListener('click', () => {
    if(ctxTargetTx) navigator.clipboard.writeText(ctxTargetTx.amount);
    ctxMenu.classList.add('hidden');
  });
  
  if(btnDelete) btnDelete.addEventListener('click', () => {
    if(ctxTargetTx) {
       state.transactions = state.transactions.filter(t => t.id !== ctxTargetTx.id);
       saveState(); renderApp();
    }
    ctxMenu.classList.add('hidden');
  });
}

function bindPrivacyToggle() {
  const btn = document.getElementById('privacy-toggle');
  if(!btn) return;
  btn.addEventListener('click', () => {
    isPrivacyMode = !isPrivacyMode;
    btn.innerHTML = isPrivacyMode ? '🙈' : '👁️';
    renderApp();
  });
}

function shootConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = 0;
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#c084fc', '#22d3ee', '#f472b6', '#34d399', '#fbbf24'];
  
  for(let i=0; i<80; i++) {
    particles.push({
      x: canvas.width / 2, y: canvas.height / 2 + 100,
      r: Math.random() * 6 + 2,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * -15 - 5,
      color: colors[Math.floor(Math.random()*colors.length)]
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.4;
      if(p.y < canvas.height) active = true;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    if(active) requestAnimationFrame(animate);
    else {
      if(document.body.contains(canvas)) document.body.removeChild(canvas);
    }
  }
  animate();
}

function randomColor(key){
  const colors = ['#c084fc','#22d3ee','#8b5cf6','#0ea5e9','#f472b6','#10b981'];
  let hash=0; for(let i=0;i<key.length;i++) hash=key.charCodeAt(i)+(hash<<5)-hash;
  return colors[Math.abs(hash)%colors.length];
}

function renderInvestments() {
  const list = document.getElementById('investments-list');
  const svgGroup = document.getElementById('allocation-svg-group');
  const legend = document.getElementById('allocation-legend');
  const totalEl = document.getElementById('portfolio-total');
  const changeEl = document.getElementById('portfolio-change');
  if(!list || !svgGroup) return;

  list.innerHTML = '';
  svgGroup.innerHTML = '';
  legend.innerHTML = '';

  if (!state.investments || state.investments.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted)">No investments added.</p>';
    totalEl.textContent = formatUsd(0);
    changeEl.textContent = '+0.00% All Time';
    return;
  }

  let totalValue = 0;
  let totalCost = 0;

  state.investments.forEach(inv => {
    const cost = inv.units * inv.avgPrice;
    const value = inv.units * inv.currentPrice;
    totalValue += value;
    totalCost += cost;

    const profit = value - cost;
    const profitPct = (profit / cost) * 100;
    const isPositive = profit >= 0;

    const el = document.createElement('div');
    el.className = 'goal-item flex-row space-between items-center relative';
    el.innerHTML = `
      <div>
         <h3 style="margin:0">${inv.name} <span style="font-size:0.8rem; color:var(--text-muted)">${inv.ticker}</span></h3>
         <p style="margin:4px 0 0; font-size:0.9rem; color:var(--text-muted)">${inv.units} units @ ${formatUsd(inv.currentPrice)}</p>
      </div>
      <div style="text-align:right">
         <p style="margin:0; font-weight:700; font-size:1.1rem">${formatUsd(value)}</p>
         <p style="margin:4px 0 0; font-size:0.85rem; color:${isPositive ? '#10b981' : '#ef4444'}">
            ${isPositive ? '+' : ''}${formatUsd(profit)} (${isPositive ? '+' : ''}${profitPct.toFixed(2)}%)
         </p>
      </div>
      <button data-id='${inv.id}' class='delete-inv' style='position:absolute; top:8px; right:8px; background:transparent; border:none; color:var(--text-muted); cursor:pointer;'>✕</button>
    `;
    list.appendChild(el);
  });

  document.querySelectorAll('.delete-inv').forEach(btn => btn.addEventListener('click', e => {
     state.investments = state.investments.filter(i => i.id !== Number(e.target.dataset.id));
     saveState(); renderApp();
  }));

  totalEl.textContent = formatUsd(totalValue);
  const totalProfit = totalValue - totalCost;
  const totalProfitPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const isPos = totalProfit >= 0;
  changeEl.style.color = isPos ? '#10b981' : '#ef4444';
  changeEl.textContent = `${isPos?'+':''}${formatUsd(totalProfit)} (${isPos?'+':''}${totalProfitPct.toFixed(2)}%) All Time`;

  let currentOffset = 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  state.investments.forEach(inv => {
     const value = inv.units * inv.currentPrice;
     const pct = value / totalValue;
     if(pct <= 0) return;
     
     const dashArray = pct * circumference;
     const color = randomColor(inv.ticker);
     
     const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
     circle.setAttribute('cx', '60');
     circle.setAttribute('cy', '60');
     circle.setAttribute('r', radius);
     circle.setAttribute('fill', 'none');
     circle.setAttribute('stroke', color);
     circle.setAttribute('stroke-width', '16');
     circle.setAttribute('stroke-dasharray', `${dashArray} ${circumference}`);
     circle.setAttribute('stroke-dashoffset', -currentOffset);
     circle.style.transition = 'stroke-dashoffset 1s ease-in-out';
     circle.setAttribute('transform', 'rotate(-90 60 60)');
     
     svgGroup.appendChild(circle);
     currentOffset += dashArray;

     const legItem = document.createElement('div');
     legItem.className = 'badge';
     legItem.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block"></span> ${inv.ticker}: ${(pct*100).toFixed(1)}%`;
     legend.appendChild(legItem);
  });
  const allocCount = document.getElementById('allocation-count');
  if(allocCount) allocCount.textContent = state.investments.length;
}

function bindChat() {
  const fab = document.getElementById('ai-fab-btn');
  const widget = document.getElementById('ai-chat-widget');
  const close = document.getElementById('close-chat-btn');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const display = document.getElementById('chat-messages');

  if(!fab || !widget) return;

  fab.addEventListener('click', () => {
    widget.classList.toggle('hidden');
    if(!widget.classList.contains('hidden')) input.focus();
  });
  close.addEventListener('click', () => widget.classList.add('hidden'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if(!query) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg user';
    msgDiv.textContent = query;
    display.appendChild(msgDiv);
    input.value = '';
    display.scrollTo({top: display.scrollHeight, behavior: 'smooth'});

    const typingDiv = document.createElement('div');
    typingDiv.className = 'msg ai';
    typingDiv.innerHTML = '<span style="opacity:0.5">Thinking... 💡</span>';
    display.appendChild(typingDiv);
    display.scrollTo({top: display.scrollHeight, behavior: 'smooth'});

    setTimeout(() => {
       display.removeChild(typingDiv);
       let ans = generateAiResponse(query.toLowerCase());
       const ansDiv = document.createElement('div');
       ansDiv.className = 'msg ai';
       ansDiv.innerHTML = ans;
       display.appendChild(ansDiv);
       display.scrollTo({top: display.scrollHeight, behavior: 'smooth'});
    }, 1200);
  });
}

function generateAiResponse(query) {
  if (query.includes('balance') || query.includes('money') || query.includes('total')) {
     const bal = state.transactions.reduce((acc,t)=> acc + (t.type==='income'?t.amount:-t.amount),0);
     return `Your balance is <strong style="color:var(--primary)">${formatUsd(bal)}</strong>.`;
  }
  if (query.includes('spend') || query.includes('spent') || query.includes('expense')) {
     const month = new Date().getMonth();
     const mSpend = state.transactions.filter(t=>t.type==='expense' && new Date(t.date).getMonth()===month).reduce((a,t)=>a+t.amount,0);
     return `You spent <strong>${formatUsd(mSpend)}</strong> this month.`;
  }
  if (query.includes('goal') || query.includes('save') || query.includes('saving')) {
     if(state.goals.length === 0) return "You don't have any savings goals active.";
     const top = state.goals[0];
     return `Your main goal is <strong>${top.name}</strong>. Saved ${formatUsd(top.saved)} of ${formatUsd(top.target)}.`;
  }
  if (query.includes('invest') || query.includes('net worth') || query.includes('wealth')) {
     if(!state.investments || state.investments.length===0) return "No investments tracked.";
     const val = state.investments.reduce((a,i) => a + (i.units*i.currentPrice), 0);
     return `Your portfolio is valued at <strong style="color:var(--secondary)">${formatUsd(val)}</strong>.`;
  }
  if (query.includes('highest') || query.includes('biggest')) {
     const exp = state.transactions.filter(t=>t.type==='expense').sort((a,b)=>b.amount - a.amount);
     if(exp.length) return `Biggest expense: <strong>${formatUsd(exp[0].amount)}</strong> on ${exp[0].category} (${exp[0].desc||'n/a'}).`;
     return "No expenses yet.";
  }
  const facts = ["Try to limit Entertainment expenses!", "Did you know logging expenses daily increases savings by 15%?", "I can parse your receipts if you use the Quick Add 'Auto-scan' feature."];
  return facts[Math.floor(Math.random() * facts.length)];
}

let calendarCurrentDate = new Date();

function bindCalendar() {
   const prev = document.getElementById('cal-prev');
   const next = document.getElementById('cal-next');
   const todayBtn = document.getElementById('cal-today');
   if(!prev) return;
   
   prev.addEventListener('click', () => {
      calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
      renderCalendarView();
   });
   next.addEventListener('click', () => {
      calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
      renderCalendarView();
   });
   todayBtn.addEventListener('click', () => {
      calendarCurrentDate = new Date();
      renderCalendarView();
   });
}

function renderCalendarView() {
   const grid = document.getElementById('calendar-grid');
   const title = document.getElementById('calendar-month-title');
   if(!grid) return;

   const year = calendarCurrentDate.getFullYear();
   const month = calendarCurrentDate.getMonth();
   title.textContent = calendarCurrentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

   const firstDay = new Date(year, month, 1);
   const lastDay = new Date(year, month + 1, 0);
   const daysInMonth = lastDay.getDate();
   const startingDayOfWeek = firstDay.getDay(); 

   grid.innerHTML = '';
   
   const txMap = {};
   state.transactions.forEach(tx => {
      if(!txMap[tx.date]) txMap[tx.date] = [];
      txMap[tx.date].push(tx);
   });

   for (let i = 0; i < startingDayOfWeek; i++) {
       const d = document.createElement('div');
       d.className = 'calendar-day other-month';
       grid.appendChild(d);
   }

   const realToday = new Date();
   const isCurrentMonthAndYear = realToday.getMonth() === month && realToday.getFullYear() === year;

   for (let i = 1; i <= daysInMonth; i++) {
       const isToday = isCurrentMonthAndYear && realToday.getDate() === i;
       const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
       
       const dayEl = document.createElement('div');
       dayEl.className = `calendar-day ${isToday ? 'today' : ''}`;
       
       let html = `<div class="day-num">${i}</div><div class="cal-tx-list">`;
       
       let dayTotal = 0;
       if (txMap[dStr]) {
          txMap[dStr].forEach(tx => {
             dayTotal += tx.type === 'income' ? tx.amount : -tx.amount;
             html += `<div class="cal-tx-item ${tx.type}">
                         <span style="overflow:hidden; text-overflow:ellipsis;">${tx.desc || tx.category}</span>
                         <span>${formatUsd(Math.abs(tx.amount))}</span>
                      </div>`;
          });
       }
       html += `</div>`;
       
       if (txMap[dStr]) {
          html += `<div class="cal-summary ${dayTotal >= 0 ? 'positive' : 'negative'}">
            ${dayTotal >= 0 ? '+' : ''}${formatUsd(dayTotal)}
          </div>`;
       }

       dayEl.innerHTML = html;
       grid.appendChild(dayEl);
   }
}

function bindBankSync() {
  const btn = document.getElementById('link-bank-btn');
  const modal = document.getElementById('bank-link-modal');
  const cancel = document.getElementById('close-bank-btn');
  const connectBtn = document.getElementById('mock-connect-btn');
  const step1 = document.getElementById('bank-step-1');
  const step2 = document.getElementById('bank-step-2');
  const statusText = document.getElementById('bank-sync-text');

  if(!btn || !modal) return;

  btn.addEventListener('click', () => {
     step1.classList.remove('hidden');
     step2.classList.add('hidden');
     modal.classList.remove('hidden');
  });
  
  cancel.addEventListener('click', () => {
      modal.classList.add('hidden');
      step1.classList.remove('hidden');
      step2.classList.add('hidden');
  });

  const badges = document.querySelectorAll('.bank-badge');
  badges.forEach(b => {
     b.addEventListener('click', () => {
        badges.forEach(x => x.style.backgroundColor = 'rgba(0,0,0,0.2)');
        b.style.backgroundColor = 'var(--primary)';
        const input = modal.querySelector('input[type="text"]');
        if(input) input.value = b.textContent.replace('• ', '');
     });
  });

  connectBtn.addEventListener('click', () => {
     step1.classList.add('hidden');
     step2.classList.remove('hidden');
     statusText.textContent = "Authenticating with provider...";
     
     setTimeout(() => {
        statusText.textContent = "Fetching 24 months of history...";
     }, 1500);

     setTimeout(() => {
        statusText.textContent = "Analyzing spending categories...";
     }, 3000);

     setTimeout(() => {
        statusText.innerHTML = "✅ Connection Successful!";
        const dStr = today();
        const newTxs = [
           {id:Date.now()+1, date:dStr, type:'income', category:'Salary', desc:'Direct Deposit TECH INC', amount:2500},
           {id:Date.now()+2, date:dStr, type:'expense', category:'Food', desc:'Starbucks', amount:8.45},
           {id:Date.now()+3, date:dStr, type:'expense', category:'Transport', desc:'Uber Trip', amount:24.90}
        ];
        state.transactions.unshift(...newTxs);
        saveState();
        renderApp();
        shootConfetti();
        showToast("Bank synced successfully!", "🏦");
        
        setTimeout(() => {
           modal.classList.add('hidden');
        }, 1500);
     }, 4500);
  });
}

function bindCards() {
   const container = document.getElementById('virtual-card-container');
   const inner = document.getElementById('virtual-card-inner');
   const showToggle = document.getElementById('show-details-toggle');
   const freezeToggle = document.getElementById('freeze-card-toggle');
   const numbers = document.getElementById('card-number-display');
   const cvv = document.getElementById('card-cvv-display');

   if(!container) return;

   container.addEventListener('click', () => {
      container.classList.toggle('flipped');
   });

   showToggle.addEventListener('change', () => {
      if(showToggle.checked) {
         numbers.textContent = '4123 8890 1234 5923';
         cvv.textContent = '842';
      } else {
         numbers.textContent = '**** **** **** 5923';
         cvv.textContent = '***';
         container.classList.remove('flipped');
      }
   });

   freezeToggle.addEventListener('change', () => {
      if(freezeToggle.checked) {
         inner.classList.add('card-frozen');
      } else {
         inner.classList.remove('card-frozen');
      }
   });
}

function showToast(msg, icon='🔔') {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000);
}

function openTxDrawer(tx) {
  const drawer = document.getElementById('tx-drawer');
  const body = document.getElementById('drawer-body');
  if(!drawer || !body) return;

  body.innerHTML = `
    <div class="flex-column items-center" style="padding: 20px 0; gap:12px;">
       <div style="background:var(--primary-glow); padding:20px; border-radius:50%; font-size:2rem;">${tx.type==='income'?'💰':'💸'}</div>
       <h1 style="margin:0">${formatUsd(tx.amount)}</h1>
       <p style="color:var(--text-muted)">${tx.category}</p>
    </div>
    <div class="detail-row"><span>Date</span><span>${tx.date}</span></div>
    <div class="detail-row"><span>Description</span><span>${tx.desc || 'No description provided'}</span></div>
    <div class="detail-row"><span>Status</span><span style="color:#10b981">Completed</span></div>
    <div class="detail-row"><span>Reference ID</span><span style="font-family:monospace; font-size:0.8rem;">#TX-${tx.id}</span></div>
  `;
  drawer.classList.remove('hidden');
}

function bindDrawer() {
  const close = document.getElementById('close-drawer');
  const overlay = document.getElementById('tx-drawer');
  if (close) close.addEventListener('click', () => overlay.classList.add('hidden'));
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.add('hidden'); });
}

function updateGreeting() {
  const el = document.getElementById('user-greeting');
  if(!el) return;
  const hour = new Date().getHours();
  let greet = "Good evening";
  if(hour < 12) greet = "Good morning";
  else if(hour < 18) greet = "Good afternoon";
  el.textContent = `${greet}, Alex! 👋`;
}

function startLiveClock() {
  const el = document.getElementById('clock-time');
  if(!el) return;
  setInterval(() => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour12: false });
  }, 1000);
}

init();
