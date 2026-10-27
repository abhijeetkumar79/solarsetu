const STORAGE_KEY = 'solarsetu_v7';
let state = loadState() || {
  user: null, coins: 0, onboarded: false,
  arData: null, scanData: null, pools: [], joinedPools: [], callbacks: [],
  tasks: {}, taskDay: null, streak: 0, bestStreak: 0,
  redeemed: [], achieved: [], vendorFilter: 'all', vendorSearch: '',
};

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

const MOCK_LEADERBOARD = [
  { name: 'Priya Shah', area: 'Satellite', coins: 1240 },
  { name: 'Anil Mehta', area: 'Bopal', coins: 980 },
  { name: 'Kavita Joshi', area: 'Maninagar', coins: 870 },
  { name: 'Rohit Desai', area: 'Vastrapur', coins: 720 },
  { name: 'Meera Patel', area: 'Navrangpura', coins: 650 },
  { name: 'Sanjay Kumar', area: 'Chandkheda', coins: 510 },
];

const MOCK_POOLS = [
  { id: 'p1', name: 'Green Heights Society', type: 'Apartment Society', members: 4, target: 5, discount: 12 },
  { id: 'p2', name: 'Shivalik Villas', type: 'Villa Community', members: 6, target: 8, discount: 15 },
];

const DAILY_TASKS = [
  { id: 't1', icon: '❄️', title: 'AC 24°C par set kiya', desc: 'Har 1°C kam karne se 6% bijli bachti hai', coins: 30 },
  { id: 't2', icon: '💡', title: 'LED bulbs use kiye', desc: 'Purane bulbs ko LED se replace karein', coins: 20 },
  { id: 't3', icon: '⚡', title: 'Peak hour avoid kiya', desc: '6–10 PM heavy appliances band rakhein', coins: 50 },
  { id: 't4', icon: '🔌', title: 'Standby power cut kiya', desc: 'TV, charger, router off karein', coins: 25 },
  { id: 't5', icon: '🚶', title: 'Short distance walk ki', desc: '1 km tak paidal ya cycle', coins: 40 },
  { id: 't6', icon: '🌱', title: 'Plant ko paani diya', desc: 'Ghar ke paudhon ki dekhbhaal', coins: 15 },
  { id: 't7', icon: '☀️', title: 'Solar feasibility check ki', desc: 'Rooftop solar potential dekha', coins: 35 },
];

const REWARDS = [
  { id: 'r1', icon: '☕', name: 'Chai Discount', desc: 'Local café par ₹30 off', cost: 100 },
  { id: 'r2', icon: '🌱', name: 'Plant a Sapling', desc: 'Ek paudha aapke naam', cost: 200 },
  { id: 'r3', icon: '🎬', name: 'Movie Voucher', desc: '₹100 off on tickets', cost: 400 },
  { id: 'r4', icon: '☀️', name: 'Solar Vendor Coupon', desc: '₹500 off on installation', cost: 500 },
  { id: 'r5', icon: '🛍️', name: 'Eco Bag', desc: 'Handmade jute bag', cost: 300 },
  { id: 'r6', icon: '📚', name: 'Sustainability Book', desc: 'Mission LiFE handbook', cost: 250 },
];

const ACHIEVEMENTS = [
  { id: 'a1', icon: '🌱', name: 'First Step', desc: 'Onboarding complete', condition: (s) => s.onboarded },
  { id: 'a2', icon: '🔥', name: 'On Fire', desc: '3-day streak', condition: (s) => s.bestStreak >= 3 },
  { id: 'a3', icon: '🏆', name: 'Champion', desc: '1000+ coins earned', condition: (s) => s.coins >= 1000 },
  { id: 'a4', icon: '📸', name: 'Rooftop Pro', desc: 'SolarLens analyzed', condition: (s) => !!s.arData },
  { id: 'a5', icon: '🤖', name: 'AI Analyst', desc: 'Bill scanned', condition: (s) => !!s.scanData },
  { id: 'a6', icon: '🤝', name: 'Community Leader', desc: 'Created a pool', condition: (s) => (s.pools || []).length > 0 },
  { id: 'a7', icon: '🎯', name: 'Mission Master', desc: 'All tasks done in a day', condition: (s) => Object.keys(s.tasks || {}).length >= DAILY_TASKS.length },
  { id: 'a8', icon: '☀️', name: 'Solar Ready', desc: 'Requested vendor callback', condition: (s) => (s.callbacks || []).length > 0 },
];

const VENDORS = [
  { id: 'v1', name: 'Surja Solar Pvt Ltd', district: 'Ahmedabad', rating: 4.8, reviews: 342, installs: 850, experience: 12, phone: '+91 98765 43210', services: ['Residential Rooftop', 'Subsidy Filing', 'Net Metering'] },
  { id: 'v2', name: 'GreenVolt Energy', district: 'Ahmedabad', rating: 4.6, reviews: 218, installs: 520, experience: 8, phone: '+91 98765 43211', services: ['Residential Rooftop', 'Battery Storage'] },
  { id: 'v3', name: 'Suryam Power Systems', district: 'Gandhinagar', rating: 4.9, reviews: 156, installs: 410, experience: 10, phone: '+91 98765 43212', services: ['Residential Rooftop', 'Commercial', 'Subsidy Filing'] },
  { id: 'v4', name: 'Nexus Renewables', district: 'Vadodara', rating: 4.7, reviews: 289, installs: 680, experience: 9, phone: '+91 98765 43213', services: ['Residential Rooftop', 'Net Metering', 'AMC'] },
  { id: 'v5', name: 'Solaris India', district: 'Surat', rating: 4.5, reviews: 198, installs: 450, experience: 7, phone: '+91 98765 43214', services: ['Residential Rooftop', 'Battery Storage'] },
  { id: 'v6', name: 'Sunrise Energies', district: 'Rajkot', rating: 4.8, reviews: 245, installs: 610, experience: 11, phone: '+91 98765 43215', services: ['Residential Rooftop', 'Subsidy Filing', 'AMC'] },
  { id: 'v7', name: 'Aravalli Solar Tech', district: 'Ahmedabad', rating: 4.4, reviews: 167, installs: 380, experience: 6, phone: '+91 98765 43216', services: ['Residential Rooftop', 'Net Metering'] },
  { id: 'v8', name: 'Gujarat Green Watts', district: 'Gandhinagar', rating: 4.7, reviews: 203, installs: 490, experience: 8, phone: '+91 98765 43217', services: ['Residential Rooftop', 'Commercial', 'Subsidy Filing'] },
  { id: 'v9', name: 'Saurashtra Sun Power', district: 'Rajkot', rating: 4.6, reviews: 178, installs: 420, experience: 9, phone: '+91 98765 43218', services: ['Residential Rooftop', 'Battery Storage', 'AMC'] },
  { id: 'v10', name: 'Diamond City Solar', district: 'Surat', rating: 4.5, reviews: 154, installs: 350, experience: 5, phone: '+91 98765 43219', services: ['Residential Rooftop', 'Net Metering'] },
  { id: 'v11', name: 'Baroda Solar Works', district: 'Vadodara', rating: 4.8, reviews: 267, installs: 580, experience: 10, phone: '+91 98765 43220', services: ['Residential Rooftop', 'Subsidy Filing'] },
  { id: 'v12', name: 'Amdavad Energy Solutions', district: 'Ahmedabad', rating: 4.6, reviews: 189, installs: 440, experience: 7, phone: '+91 98765 43221', services: ['Residential Rooftop', 'Battery Storage', 'AMC'] },
];

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function checkDayRollover() {
  const today = getTodayKey();
  if (state.taskDay !== today) {
    const yesterday = new Date(Date.now() - 86400000);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const lastDayHadTasks = state.taskDay === yKey && Object.keys(state.tasks || {}).length > 0;
    if (lastDayHadTasks) {
      state.streak = (state.streak || 0) + 1;
      if (state.streak > (state.bestStreak || 0)) state.bestStreak = state.streak;
    } else if (state.taskDay && state.taskDay !== today) {
      state.streak = 0;
    }
    state.tasks = {};
    state.taskDay = today;
    state.streakStartedToday = false;
    saveState();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkDayRollover();

  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    if (state.onboarded && state.user) showDashboard();
  }, 1500);

  document.getElementById('btn-onboard').addEventListener('click', handleOnboard);
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  ['pool-modal', 'callback-modal'].forEach(mid => {
    const m = document.getElementById(mid);
    if (m) m.addEventListener('click', (e) => { if (e.target.id === mid) m.classList.add('hidden'); });
  });

  initAR();
  initScan();
});

function handleOnboard() {
  const name = document.getElementById('inp-name').value.trim();
  const [pincode, city] = document.getElementById('inp-pincode').value.split('|');
  const bill = Number(document.getElementById('inp-bill').value);

  if (!name) { showToast('❌ Naam enter karein'); return; }
  if (!bill || bill < 100) { showToast('❌ Valid bill amount enter karein'); return; }

  const TARIFF = 7, GEN_PER_KW = 4, CARBON_FACTOR = 0.82, COST_PER_KW = 55000;
  const units = Math.round(bill / TARIFF);
  const dailyUnits = units / 30;
  const systemSize = Math.min(10, Math.max(1, Math.round(dailyUnits / GEN_PER_KW)));
  const cost = systemSize * COST_PER_KW;
  const subsidy = systemSize >= 3 ? 78000 : systemSize === 2 ? 60000 : 30000;
  const net = cost - subsidy;
  const annualUnits = systemSize * GEN_PER_KW * 365;
  const annualSavings = Math.round(annualUnits * TARIFF);
  const payback = annualSavings > 0 ? (net / annualSavings).toFixed(1) : '—';
  const carbon = Math.round(units * CARBON_FACTOR);

  state.user = { name, pincode, city, bill, units, systemSize, cost, subsidy, net, annualSavings, payback, carbon };
  state.onboarded = true;
  saveState();
  showDashboard();
  showToast(`✅ Welcome, ${name}!`);
}

function showDashboard() {
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('user-chip').classList.remove('hidden');
  if (state.user) {
    document.getElementById('user-name-display').textContent = state.user.name;
    document.getElementById('user-pincode-display').textContent = `${state.user.city} · ${state.user.pincode}`;
    document.getElementById('user-avatar').textContent = state.user.name[0].toUpperCase();
    renderHome();
  }
}

function animateCount(el, target, duration = 1400) {
  if (!el) return;
  const start = 0;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = value.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

let chartInst = null;

function renderHome() {
  const u = state.user;
  if (!u) return;
  animateCount(document.getElementById('stat-units'), u.units);
  animateCount(document.getElementById('stat-carbon'), u.carbon);
  animateCount(document.getElementById('stat-coins'), state.coins);
  document.getElementById('solar-size').textContent = u.systemSize;
  document.getElementById('solar-cost').textContent = u.cost.toLocaleString('en-IN');
  document.getElementById('solar-subsidy').textContent = u.subsidy.toLocaleString('en-IN');
  document.getElementById('solar-net').textContent = u.net.toLocaleString('en-IN');
  document.getElementById('solar-savings').textContent = u.annualSavings.toLocaleString('en-IN');
  document.getElementById('solar-payback').textContent = u.payback;
  drawChart();
}

function drawChart() {
  const u = state.user;
  if (!u) return;
  const labels = [], data = [];
  let cumulative = -u.net;
  let breakeven = null;
  for (let y = 1; y <= 25; y++) {
    cumulative += u.annualSavings;
    labels.push('Y' + y);
    data.push(cumulative);
    if (breakeven === null && cumulative >= 0) breakeven = y;
  }
  const ctx = document.getElementById('savingsChart');
  if (!ctx) return;
  if (chartInst) chartInst.destroy();
  chartInst = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ data, borderColor: '#10b981',
      backgroundColor: (context) => { const c = context.chart.ctx; const g = c.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, 'rgba(16,185,129,0.45)'); g.addColorStop(1, 'rgba(16,185,129,0)'); return g; },
      fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6, pointHoverBackgroundColor: '#10b981', pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2, borderWidth: 2.5 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(17,26,46,0.95)', borderColor: 'rgba(16,185,129,0.4)', borderWidth: 1, padding: 12, titleColor: '#f8fafc', bodyColor: '#10b981', callbacks: { label: (c) => '₹' + c.parsed.y.toLocaleString('en-IN') } } },
      scales: { x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 6 } }, y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: (v) => v < 0 ? '−₹' + Math.abs(v / 1000).toFixed(0) + 'k' : '₹' + (v / 1000).toFixed(0) + 'k' } } },
      interaction: { intersect: false, mode: 'index' }
    }
  });
  document.getElementById('breakeven').textContent = breakeven || '—';
  document.getElementById('total-savings').textContent = data[24].toLocaleString('en-IN');
}

// ===== SOLARLENS =====
function initAR() {
  const input = document.getElementById('ar-upload');
  const dropzone = document.getElementById('ar-dropzone');
  if (!input || !dropzone) return;
  input.addEventListener('change', (e) => { const file = e.target.files[0]; if (file) processARImage(file); });
  ['dragenter', 'dragover'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', (e) => { const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) processARImage(file); else showToast('❌ Please ek image file drop karein'); });
}

function processARImage(file) {
  if (file.size > 10 * 1024 * 1024) { showToast('❌ Image 10 MB se chhoti honi chahiye'); return; }
  showToast('🔍 Rooftop analyze ho raha hai...');
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => { drawAROverlay(img); computeARStats(); };
    img.onerror = () => showToast('❌ Image load nahi hui.');
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function drawAROverlay(img) {
  const canvas = document.getElementById('ar-canvas');
  const wrap = canvas.parentElement;
  const maxW = Math.min(900, wrap.clientWidth || 800);
  const maxH = 500;
  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const edgeGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.3, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7);
  edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
  edgeGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 6, rows = 4;
  const marginX = canvas.width * 0.08;
  const marginY = canvas.height * 0.12;
  const usableW = canvas.width - marginX * 2;
  const usableH = canvas.height - marginY * 2;
  const gap = 4;
  const panelW = (usableW - gap * (cols - 1)) / cols;
  const panelH = (usableH - gap * (rows - 1)) / rows;

  let panelIndex = 0;
  const drawPanel = () => {
    if (panelIndex >= cols * rows) return;
    const r = Math.floor(panelIndex / cols);
    const c = panelIndex % cols;
    const x = marginX + c * (panelW + gap);
    const y = marginY + r * (panelH + gap);
    const grad = ctx.createLinearGradient(x, y, x + panelW, y + panelH);
    grad.addColorStop(0, 'rgba(30, 64, 175, 0.85)');
    grad.addColorStop(1, 'rgba(6, 78, 59, 0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, panelW, panelH);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, panelW, panelH);
    ctx.strokeStyle = 'rgba(148, 233, 195, 0.4)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + (panelW / 3) * i, y); ctx.lineTo(x + (panelW / 3) * i, y + panelH); ctx.stroke(); }
    for (let j = 1; j < 2; j++) { ctx.beginPath(); ctx.moveTo(x, y + (panelH / 2) * j); ctx.lineTo(x + panelW, y + (panelH / 2) * j); ctx.stroke(); }
    ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.strokeRect(x, y, panelW, panelH);
    ctx.shadowBlur = 0;
    panelIndex++;
    if (panelIndex < cols * rows) setTimeout(drawPanel, 30);
  };
  drawPanel();

  ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(marginX - 6, marginY - 6, usableW + 12, usableH + 12);
  ctx.setLineDash([]);
  document.getElementById('ar-dropzone').classList.add('hidden');
  document.getElementById('ar-result').classList.remove('hidden');
}

function computeARStats() {
  const cols = 6, rows = 4;
  const totalPanels = cols * rows;
  const panelArea = 2.0;
  const panelWatt = 400;
  const roofArea = Math.round(totalPanels * panelArea + 8);
  const capacity = +((totalPanels * panelWatt) / 1000).toFixed(1);
  const dailyGen = +(capacity * 4).toFixed(1);
  const monthlySavings = Math.round(dailyGen * 30 * 7);
  const yearlySavings = Math.round(dailyGen * 365 * 7);
  animateCount(document.getElementById('ar-area'), roofArea);
  animateCount(document.getElementById('ar-panels'), totalPanels);
  animateCount(document.getElementById('ar-daily'), dailyGen);
  animateCount(document.getElementById('ar-monthly'), monthlySavings);
  animateCount(document.getElementById('ar-yearly'), yearlySavings);
  const capEl = document.getElementById('ar-capacity');
  if (capEl) { const st = performance.now(); function anim(now) { const p = Math.min((now - st) / 1200, 1); const e = 1 - Math.pow(1 - p, 3); capEl.textContent = (capacity * e).toFixed(1); if (p < 1) requestAnimationFrame(anim); } requestAnimationFrame(anim); }
  state.arData = { roofArea, totalPanels, capacity, dailyGen, monthlySavings, yearlySavings };
  if (!state.arRewarded) { state.coins += 40; state.arRewarded = true; }
  saveState();
  showToast('✅ +40 Green Coins · Rooftop analyzed!');
}

function resetAR() {
  document.getElementById('ar-result').classList.add('hidden');
  document.getElementById('ar-dropzone').classList.remove('hidden');
  const input = document.getElementById('ar-upload');
  if (input) input.value = '';
  const canvas = document.getElementById('ar-canvas');
  if (canvas) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

// ===== BILL SCANNER =====
function initScan() {
  const input = document.getElementById('scan-upload');
  const dropzone = document.getElementById('scan-dropzone');
  if (!input || !dropzone) return;
  input.addEventListener('change', (e) => { const file = e.target.files[0]; if (file) processScanImage(file); });
  ['dragenter', 'dragover'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', (e) => { const file = e.dataTransfer.files[0]; if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) processScanImage(file); else showToast('❌ Please ek image ya PDF drop karein'); });
}

function processScanImage(file) {
  if (file.size > 10 * 1024 * 1024) { showToast('❌ File 10 MB se chhoti honi chahiye'); return; }
  document.getElementById('scan-dropzone').classList.add('hidden');
  document.getElementById('scan-result').classList.add('hidden');
  document.getElementById('scan-loading').classList.remove('hidden');
  const steps = ['Reading bill data...', 'Extracting consumption units...', 'Detecting appliance patterns...', 'Running AI analysis...', 'Generating savings plan...'];
  let progress = 0, stepIdx = 0;
  const progressEl = document.getElementById('scan-progress-fill');
  const stepTextEl = document.getElementById('scan-step-text');
  const interval = setInterval(() => {
    progress += 4;
    if (progress > 100) progress = 100;
    progressEl.style.width = progress + '%';
    const newIdx = Math.min(Math.floor(progress / 20), steps.length - 1);
    if (newIdx !== stepIdx) { stepIdx = newIdx; stepTextEl.textContent = steps[stepIdx]; }
    if (progress >= 100) { clearInterval(interval); setTimeout(() => finishScan(), 400); }
  }, 80);
}

function finishScan() {
  document.getElementById('scan-loading').classList.add('hidden');
  document.getElementById('scan-result').classList.remove('hidden');
  const billAmount = state.user?.bill || 2500;
  const units = Math.round(billAmount / 7);
  animateCount(document.getElementById('scan-amount'), billAmount);
  animateCount(document.getElementById('scan-units'), units);
  document.getElementById('scan-bill-echo').textContent = billAmount.toLocaleString('en-IN');
  setTimeout(() => { animateCount(document.getElementById('scan-total-savings'), 930); animateCount(document.getElementById('scan-yearly-savings'), 11160); }, 400);
  const solarMonthly = Math.round(billAmount * 0.85);
  const solarNet = state.user ? state.user.net : 87000;
  animateCount(document.getElementById('scan-solar-savings'), solarMonthly);
  document.getElementById('scan-solar-net').textContent = solarNet.toLocaleString('en-IN');
  if (!state.scanRewarded) { state.coins += 30; state.scanRewarded = true; saveState(); showToast('✅ +30 Green Coins · Bill analyzed!'); }
  else showToast('✅ Bill analyzed successfully!');
}

function resetScan() {
  document.getElementById('scan-result').classList.add('hidden');
  document.getElementById('scan-loading').classList.add('hidden');
  document.getElementById('scan-dropzone').classList.remove('hidden');
  const input = document.getElementById('scan-upload');
  if (input) input.value = '';
  const pf = document.getElementById('scan-progress-fill');
  if (pf) pf.style.width = '0%';
}

// ===== COMMUNITY =====
function renderCommunity() {
  if (!state.user) return;
  const lbCity = document.getElementById('lb-city');
  if (lbCity) lbCity.textContent = state.user.city || 'your area';
  renderLeaderboard();
  renderPools();
  renderImpact();
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;
  const userRow = { name: state.user.name, area: state.user.city, coins: state.coins, isYou: true };
  const all = [...MOCK_LEADERBOARD, userRow].sort((a, b) => b.coins - a.coins);
  list.innerHTML = all.slice(0, 8).map((u, idx) => {
    const rank = idx + 1;
    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
    const youClass = u.isYou ? 'you' : '';
    const youBadge = u.isYou ? '<span class="lb-you-badge">YOU</span>' : '';
    return `<div class="lb-row ${rankClass} ${youClass}" style="animation-delay:${idx * 0.05}s"><div class="lb-rank">${rank}</div><div class="lb-avatar">${u.name[0].toUpperCase()}</div><div class="lb-body"><p class="lb-name">${u.name}${youBadge}</p><p class="lb-area">${u.area}</p></div><div class="lb-coins">🪙 ${u.coins.toLocaleString('en-IN')}</div></div>`;
  }).join('');
}

function renderPools() {
  const list = document.getElementById('pools-list');
  if (!list) return;
  const allPools = [...MOCK_POOLS, ...(state.pools || [])];
  const joined = state.joinedPools || [];
  if (allPools.length === 0) { list.innerHTML = `<div class="pool-empty"><div class="pool-empty-icon">🌱</div><p>Abhi koi pool nahi hai. Pehla pool banayein aur apne area ke neighbours ko invite karein.</p></div>`; return; }
  list.innerHTML = allPools.map((p, idx) => {
    const isJoined = joined.includes(p.id);
    const pct = Math.min(100, Math.round((p.members / p.target) * 100));
    const isFull = p.members >= p.target;
    const membersPreview = Array.from({ length: Math.min(p.members, 5) }).map(() => `<div class="pool-member-dot">👤</div>`).join('');
    let btnLabel = 'Join Pool', btnDisabled = '';
    if (isJoined) { btnLabel = '✓ Joined'; btnDisabled = 'disabled'; }
    else if (isFull) { btnLabel = 'Pool Full'; btnDisabled = 'disabled'; }
    return `<div class="pool-card ${isJoined ? 'joined' : ''}" style="animation-delay:${idx * 0.08}s"><div class="pool-top"><div><p class="pool-name">${p.name}</p><p class="pool-type">${p.type}</p></div><span class="pool-discount">${p.discount}% OFF</span></div><div class="pool-progress-wrap"><div class="pool-progress-info"><span><b>${p.members}</b> / ${p.target} members</span><div class="pool-members-preview">${membersPreview}</div></div><div class="pool-progress-bar"><div class="pool-progress-fill" style="width:${pct}%"></div></div></div><div class="pool-actions"><button class="pool-join-btn" ${btnDisabled} onclick="window.SolarSetu.joinPool('${p.id}')">${btnLabel}</button></div></div>`;
  }).join('');
}

function joinPool(poolId) {
  if (!state.joinedPools) state.joinedPools = [];
  if (state.joinedPools.includes(poolId)) return;
  state.joinedPools.push(poolId);
  const mock = MOCK_POOLS.find(p => p.id === poolId);
  if (mock) mock.members = Math.min(mock.target, mock.members + 1);
  const custom = (state.pools || []).find(p => p.id === poolId);
  if (custom) custom.members = Math.min(custom.target, custom.members + 1);
  state.coins += 25;
  saveState();
  renderPools(); renderLeaderboard(); renderImpact();
  showToast('🤝 Pool joined! +25 Green Coins');
}

function openPoolModal() {
  const modal = document.getElementById('pool-modal');
  if (modal) modal.classList.remove('hidden');
  const inp = document.getElementById('pool-name');
  if (inp) { inp.value = ''; inp.focus(); }
}
function closePoolModal() {
  const modal = document.getElementById('pool-modal');
  if (modal) modal.classList.add('hidden');
}
function createPool() {
  const name = document.getElementById('pool-name').value.trim();
  const type = document.getElementById('pool-type').value;
  const target = Number(document.getElementById('pool-target').value);
  if (!name) { showToast('❌ Pool name enter karein'); return; }
  if (name.length < 3) { showToast('❌ Pool name thoda lamba likhein'); return; }
  const discount = target === 5 ? 12 : target === 8 ? 15 : 18;
  if (!state.pools) state.pools = [];
  const newPool = { id: 'p_' + Date.now(), name, type, members: 1, target, discount };
  state.pools.unshift(newPool);
  if (!state.joinedPools) state.joinedPools = [];
  state.joinedPools.push(newPool.id);
  state.coins += 50;
  saveState();
  closePoolModal();
  renderPools(); renderLeaderboard(); renderImpact();
  showToast(`🎉 "${name}" created! +50 Green Coins`);
}

function renderImpact() {
  if (!state.user) return;
  const baseHomes = 12 + (state.joinedPools?.length || 0) * 4 + (state.pools?.length || 0) * 3;
  const userUnits = state.user.units || 350;
  const baseEnergy = baseHomes * 42 + userUnits;
  const co2 = Math.round(baseEnergy * 0.82);
  animateCount(document.getElementById('impact-homes'), baseHomes);
  animateCount(document.getElementById('impact-energy'), baseEnergy);
  animateCount(document.getElementById('impact-co2'), co2);
}

// ===== REWARDS =====
function renderRewards() {
  if (!state.user) return;
  animateCount(document.getElementById('rewards-coins'), state.coins);
  const todayEarned = Object.keys(state.tasks || {}).reduce((sum, tid) => { const t = DAILY_TASKS.find(x => x.id === tid); return sum + (t ? t.coins : 0); }, 0);
  animateCount(document.getElementById('rewards-today'), todayEarned);
  document.getElementById('redeem-balance-inline').textContent = state.coins.toLocaleString('en-IN');
  document.getElementById('streak-current').textContent = state.streak || 0;
  document.getElementById('streak-best').textContent = state.bestStreak || 0;
  renderStreakWeek();
  renderTasks();
  renderRedeemStore();
  renderAchievements();
}

function renderStreakWeek() {
  const weekEl = document.getElementById('streak-week');
  if (!weekEl) return;
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  const doneCount = Math.min(state.streak || 0, 7);
  weekEl.innerHTML = days.map((d, i) => `<div class="streak-day ${i < doneCount ? 'done' : ''} ${i === today ? 'today' : ''}"><span class="streak-day-dot">${i < doneCount ? '🔥' : '·'}</span>${d}</div>`).join('');
}

function renderTasks() {
  const list = document.getElementById('tasks-list');
  if (!list) return;
  const doneCount = Object.keys(state.tasks || {}).length;
  const totalCount = DAILY_TASKS.length;
  document.getElementById('tasks-done-count').textContent = doneCount;
  document.getElementById('tasks-total-count').textContent = totalCount;
  document.getElementById('daily-progress-fill').style.width = (totalCount > 0 ? (doneCount / totalCount) * 100 : 0) + '%';
  list.innerHTML = DAILY_TASKS.map((t, idx) => {
    const done = !!state.tasks[t.id];
    return `<div class="task-item ${done ? 'task-done' : ''}" style="animation-delay:${idx * 0.05}s" onclick="window.SolarSetu.completeTask('${t.id}')"><div class="task-checkbox">${done ? '✓' : ''}</div><div class="task-body"><p class="task-title">${t.icon} ${t.title}</p><p class="task-desc">${t.desc}</p></div><div class="task-reward">+${t.coins} 🪙</div></div>`;
  }).join('');
}

function completeTask(taskId) {
  if (!state.tasks) state.tasks = {};
  if (state.tasks[taskId]) return;
  const task = DAILY_TASKS.find(t => t.id === taskId);
  if (!task) return;
  state.tasks[taskId] = true;
  state.coins += task.coins;
  if (state.taskDay === getTodayKey() && !state.streakStartedToday) {
    state.streak = (state.streak || 0) + 1;
    state.streakStartedToday = true;
    if (state.streak > (state.bestStreak || 0)) state.bestStreak = state.streak;
  }
  saveState();
  renderRewards();
  showToast(`✅ +${task.coins} Green Coins · ${task.title}`);
  if (Object.keys(state.tasks).length === DAILY_TASKS.length) {
    setTimeout(() => { state.coins += 50; saveState(); renderRewards(); showToast('🎉 All missions complete! +50 bonus coins'); }, 800);
  }
}

function renderRedeemStore() {
  const grid = document.getElementById('redeem-store-grid');
  if (!grid) return;
  grid.innerHTML = REWARDS.map((r, idx) => {
    const already = (state.redeemed || []).includes(r.id);
    const canAfford = state.coins >= r.cost;
    const locked = !canAfford && !already;
    let btnLabel = 'Redeem', btnDisabled = '';
    if (already) { btnLabel = '✓ Redeemed'; btnDisabled = 'disabled'; }
    else if (!canAfford) { btnLabel = 'Need more coins'; btnDisabled = 'disabled'; }
    return `<div class="reward-item ${locked ? 'reward-locked' : ''} ${already ? 'reward-redeemed' : ''}" style="animation-delay:${idx * 0.05}s"><div class="reward-icon">${r.icon}</div><div class="reward-info"><p class="reward-name">${r.name}</p><p class="reward-desc">${r.desc}</p></div><div class="reward-cost">🪙 ${r.cost}</div><button class="reward-btn" ${btnDisabled} onclick="window.SolarSetu.redeemReward('${r.id}')">${btnLabel}</button></div>`;
  }).join('');
}

function redeemReward(rewardId) {
  const reward = REWARDS.find(r => r.id === rewardId);
  if (!reward) return;
  if ((state.redeemed || []).includes(rewardId)) { showToast('⚠️ Already redeemed'); return; }
  if (state.coins < reward.cost) { showToast('❌ Enough coins nahi hain'); return; }
  state.coins -= reward.cost;
  if (!state.redeemed) state.redeemed = [];
  state.redeemed.push(rewardId);
  saveState();
  renderRewards();
  showToast(`🎉 "${reward.name}" redeemed! ${reward.icon}`);
}

function renderAchievements() {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;
  grid.innerHTML = ACHIEVEMENTS.map((a, idx) => `<div class="achievement ${a.condition(state) ? 'unlocked' : ''}" style="animation-delay:${idx * 0.04}s" title="${a.desc}"><span class="ach-icon">${a.icon}</span><p class="ach-name">${a.name}</p><p class="ach-desc">${a.desc}</p></div>`).join('');
}

// ===== PART 7: VENDORS =====

function renderVendors() {
  const list = document.getElementById('vendors-list');
  const empty = document.getElementById('vendors-empty');
  const countEl = document.getElementById('vendors-count');
  if (!list) return;

  const filter = state.vendorFilter || 'all';
  const search = (state.vendorSearch || '').toLowerCase().trim();
  const requestedIds = (state.callbacks || []).map(c => c.vendorId);

  let filtered = VENDORS.filter(v => {
    if (filter !== 'all' && v.district !== filter) return false;
    if (search) {
      const hay = (v.name + ' ' + v.district + ' ' + v.services.join(' ')).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    list.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  list.innerHTML = filtered.map((v, idx) => {
    const isRequested = requestedIds.includes(v.id);
    return `<div class="vendor-card ${isRequested ? 'requested' : ''}" style="animation-delay:${idx * 0.04}s">
      <div class="vendor-head">
        <div class="vendor-logo">${v.name[0]}</div>
        <div class="vendor-head-info">
          <p class="vendor-name">${v.name}</p>
          <p class="vendor-district">📍 ${v.district}</p>
        </div>
        <span class="vendor-verified">✓ GEDA</span>
      </div>
      <div class="vendor-meta">
        <span class="vendor-rating">⭐ ${v.rating} <span class="vendor-rating-count">(${v.reviews})</span></span>
        <span class="vendor-meta-divider">·</span>
        <span class="vendor-installs">${v.installs}+ installs</span>
        <span class="vendor-meta-divider">·</span>
        <span class="vendor-experience">${v.experience} yrs</span>
      </div>
      <div class="vendor-services">${v.services.map(s => `<span class="vendor-service-tag">${s}</span>`).join('')}</div>
      <div class="vendor-actions">
        <button class="vendor-btn vendor-btn-call" ${isRequested ? 'disabled' : ''} onclick="window.SolarSetu.openCallbackModal('${v.id}')">${isRequested ? '✓ Requested' : '📞 Request Callback'}</button>
        <button class="vendor-btn vendor-btn-phone" onclick="window.SolarSetu.showToast('📱 ${v.phone}')" title="Show phone">☎️</button>
      </div>
    </div>`;
  }).join('');
}

function filterVendors() {
  const inp = document.getElementById('vendor-search');
  if (!inp) return;
  state.vendorSearch = inp.value;
  saveState();
  renderVendors();
}

function setVendorFilter(f) {
  state.vendorFilter = f;
  saveState();
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === f));
  renderVendors();
}

function resetVendorFilters() {
  state.vendorFilter = 'all';
  state.vendorSearch = '';
  saveState();
  const inp = document.getElementById('vendor-search');
  if (inp) inp.value = '';
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
  renderVendors();
}

let currentVendorId = null;

function openCallbackModal(vendorId) {
  const vendor = VENDORS.find(v => v.id === vendorId);
  if (!vendor) return;
  currentVendorId = vendorId;

  const preview = document.getElementById('callback-vendor-preview');
  if (preview) {
    preview.innerHTML = `<div class="callback-preview-logo">${vendor.name[0]}</div><div class="callback-preview-info"><p class="callback-preview-name">${vendor.name}</p><p class="callback-preview-district">📍 ${vendor.district} · ⭐ ${vendor.rating}</p></div>`;
  }
  const phone = document.getElementById('callback-phone');
  if (phone) phone.value = '';
  const msg = document.getElementById('callback-message');
  if (msg) msg.value = '';
  const modal = document.getElementById('callback-modal');
  if (modal) modal.classList.remove('hidden');
  if (phone) setTimeout(() => phone.focus(), 200);
}

function closeCallbackModal() {
  const modal = document.getElementById('callback-modal');
  if (modal) modal.classList.add('hidden');
  currentVendorId = null;
}

function submitCallback() {
  if (!currentVendorId) { showToast('❌ Vendor not found'); return; }
  const vendor = VENDORS.find(v => v.id === currentVendorId);
  const phone = document.getElementById('callback-phone').value.trim();
  const timeSlot = document.getElementById('callback-time').value;
  const message = document.getElementById('callback-message').value.trim();

  if (!phone) { showToast('❌ Phone number enter karein'); return; }
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  if (cleanPhone.length < 10) { showToast('❌ Valid phone number enter karein (10+ digits)'); return; }

  if (!state.callbacks) state.callbacks = [];
  state.callbacks.unshift({
    vendorId: vendor.id,
    vendorName: vendor.name,
    phone,
    timeSlot,
    message,
    createdAt: new Date().toISOString(),
    status: 'Pending',
  });

  if (!state.callbackRewarded) { state.coins += 20; state.callbackRewarded = true; }
  saveState();
  closeCallbackModal();
  renderVendors();
  renderCallbacks();
  showToast(`✅ ${vendor.name} aapko 24 ghante mein call karega! +20 coins`);
}

function renderCallbacks() {
  const list = document.getElementById('callbacks-list');
  const badge = document.getElementById('callbacks-count-badge');
  if (!list) return;

  const cbs = state.callbacks || [];
  if (badge) badge.textContent = `${cbs.length} ${cbs.length === 1 ? 'active' : 'active'}`;

  if (cbs.length === 0) {
    list.innerHTML = `<div class="callbacks-empty"><div class="callbacks-empty-icon">📭</div><p>Abhi koi callback request nahi hai. Upar se koi vendor choose karein aur request karein.</p></div>`;
    return;
  }

  list.innerHTML = cbs.map((c, idx) => {
    const time = new Date(c.createdAt);
    const ago = Math.round((Date.now() - time.getTime()) / 60000);
    const agoStr = ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago`;
    return `<div class="callback-item" style="animation-delay:${idx * 0.05}s">
      <div class="callback-status-icon">✓</div>
      <div class="callback-body">
        <p class="callback-vendor-name">${c.vendorName}</p>
        <p class="callback-meta">📞 ${c.phone} · 🕐 <b>${c.timeSlot}</b> · ${agoStr}</p>
      </div>
      <span class="callback-status-badge">${c.status}</span>
    </div>`;
  }).join('');
}

// ===== TABS =====
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabId));
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'community') setTimeout(() => renderCommunity(), 100);
  if (tabId === 'home') setTimeout(() => renderHome(), 100);
  if (tabId === 'rewards') setTimeout(() => renderRewards(), 100);
  if (tabId === 'vendors') setTimeout(() => { renderVendors(); renderCallbacks(); }, 100);
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

window.SolarSetu = {
  state, saveState, showToast, switchTab, renderHome, resetAR, resetScan,
  renderCommunity, joinPool, openPoolModal, closePoolModal, createPool,
  renderRewards, completeTask, redeemReward,
  renderVendors, filterVendors, setVendorFilter, resetVendorFilters,
  openCallbackModal, closeCallbackModal, submitCallback, renderCallbacks,
};