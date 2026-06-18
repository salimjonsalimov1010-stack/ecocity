// ===== EcoCity App =====
let user = null;
let regTemp = {};

const LEVELS = [
  {n:1,name:'Эко Новичок',icon:'🌱',min:0,max:100},
  {n:2,name:'Эко Помощник',icon:'🌿',min:100,max:300},
  {n:3,name:'Эко Воин',icon:'♻️',min:300,max:600},
  {n:4,name:'Эко Чемпион',icon:'🌍',min:600,max:1000},
  {n:5,name:'Эко Легенда',icon:'👑',min:1000,max:99999},
];

const TIPS = ['Сортируйте мусор — получайте ×2 бонусы!','Пластик → в синий контейнер, стекло → в зелёный','Батарейки только в специальные пункты!','Каждый пакет с QR кодом = автоматические бонусы','Приглашайте друзей — получайте 50 EcoCoin'];

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('splash-screen').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('splash-screen').classList.add('hidden');
      const saved = localStorage.getItem('eco_user');
      if (saved) { user = JSON.parse(saved); openApp(); }
      else { document.getElementById('auth-page').classList.remove('hidden'); }
    }, 400);
  }, 1800);
});

// ===== AUTH =====
function showScreen(name) {
  document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('auth-' + name).classList.add('active');
}

function otpNext(el, i) {
  if (el.value.length >= 1) {
    const boxes = document.querySelectorAll('.otp-box');
    if (i < boxes.length - 1) boxes[i+1].focus();
  }
}

function doVerify() {
  const first = document.getElementById('reg-first').value.trim();
  const last = document.getElementById('reg-last').value.trim();
  if (!first || !last) { toast('Введите имя и фамилию', 'error'); return; }
  regTemp.firstName = first; regTemp.lastName = last;
  document.getElementById('verify-anim').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('verify-anim').classList.add('hidden');
    document.getElementById('verified-name').textContent = first + ' ' + last;
    toast('Демо-верификация пройдена ✓', 'success');
    showScreen('register-3');
  }, 2000);
}

function doRegister() {
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  if (pass.length < 6) { toast('Пароль минимум 6 символов', 'error'); return; }
  if (pass !== pass2) { toast('Пароли не совпадают', 'error'); return; }
  const uid = 'ECO-' + Math.floor(100000 + Math.random() * 900000);
  user = {
    uid, firstName: regTemp.firstName || 'Эко', lastName: regTemp.lastName || 'Пользователь',
    city: document.getElementById('reg-city')?.value || 'Душанбе',
    coins: 10, bags: 0, streak: 1, dailyClaimed: false,
    history: [], achievements: [], joinDate: new Date().toLocaleDateString('ru')
  };
  saveUser();
  document.getElementById('auth-page').classList.add('hidden');
  openApp();
  toast('Добро пожаловать в EcoCity! 🎉', 'success');
}

function demoLogin() {
  user = {
    uid: 'ECO-DEMO01', firstName: 'Салимжон', lastName: 'Салимов',
    city: 'Душанбе', coins: 245, bags: 18, streak: 5, dailyClaimed: false,
    history: [
      {date:'15.06.2026',bags:3,coins:30,point:'Пункт Б — Шохмансур'},
      {date:'12.06.2026',bags:5,coins:50,point:'Пункт В — Сино'},
      {date:'10.06.2026',bags:4,coins:40,point:'Пункт Г — Авиценна'},
      {date:'08.06.2026',bags:2,coins:20,point:'Пункт Б — Шохмансур'},
      {date:'05.06.2026',bags:4,coins:40,point:'Завод переработки'},
    ],
    achievements: ['first_bag','bags_10','coins_100'],
    joinDate: '01.06.2026'
  };
  saveUser();
  document.getElementById('auth-page').classList.add('hidden');
  openApp();
}

function doLogout() {
  if (!confirm('Выйти из аккаунта?')) return;
  user = null;
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-page').classList.remove('hidden');
  showScreen('welcome');
}

function saveUser() { localStorage.setItem('eco_user', JSON.stringify(user)); }

// ===== APP =====
function openApp() {
  document.getElementById('main-app').classList.remove('hidden');
  updateUI();
  renderNews();
  renderAchievements();
  renderScanHistory();
  renderNotifs();
  renderLeaderboard();
  renderCompetition('city');
  generateQR();
  updateLevelTable();
  document.getElementById('tip-txt').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
}

function getLvl(coins) {
  for (let i = LEVELS.length-1; i >= 0; i--) if (coins >= LEVELS[i].min) return LEVELS[i];
  return LEVELS[0];
}

function getProgress(coins, lv) {
  if (lv.n === 5) return 100;
  return Math.min(100, Math.round(((coins - lv.min) / (lv.max - lv.min)) * 100));
}

function updateUI() {
  if (!user) return;
  const lv = getLvl(user.coins);
  const prog = getProgress(user.coins, lv);
  const name = user.firstName + ' ' + user.lastName;
  const initials = (user.firstName[0]||'Э') + (user.lastName[0]||'Г');
  const nextLv = LEVELS[lv.n] || lv;
  const coinsLeft = lv.n < 5 ? lv.max - user.coins : 0;

  document.getElementById('h-city').textContent = user.city || 'Душанбе';
  document.getElementById('h-coins').textContent = user.coins;
  const h = new Date().getHours();
  const greet = h<12?'Доброе утро':h<18?'Добрый день':'Добрый вечер';
  document.getElementById('hero-greet').innerHTML = `${greet}, <strong>${user.firstName}</strong>!`;
  document.getElementById('s-bags').textContent = user.bags;
  document.getElementById('s-coins').textContent = user.coins;
  document.getElementById('s-lvl').textContent = lv.n;
  document.getElementById('hero-lvl-tag').innerHTML = `${lv.icon} ${lv.name}`;
  document.getElementById('lv-cur').textContent = lv.name;
  document.getElementById('lv-nxt').textContent = lv.n < 5 ? '→ ' + nextLv.name : '→ Макс.';
  document.getElementById('pbar-fill').style.width = prog + '%';
  document.getElementById('lv-hint').textContent = lv.n < 5 ? coinsLeft + ' EcoCoin до следующего уровня' : 'Максимальный уровень!';

  // QR
  document.getElementById('qr-av').textContent = initials;
  document.getElementById('qr-name').textContent = name;
  document.getElementById('qr-id').textContent = user.uid;
  document.getElementById('qr-city-txt').textContent = user.city + ', Центральная Азия';
  document.getElementById('qr-coins-val').textContent = user.coins;

  // Profile
  document.getElementById('prof-av').textContent = initials;
  document.getElementById('prof-name').textContent = name;
  document.getElementById('prof-id-txt').textContent = 'ID: ' + user.uid;
  document.getElementById('prof-lvl-tag').textContent = lv.icon + ' ' + lv.name;
  document.getElementById('p-bags').textContent = user.bags;
  document.getElementById('p-coins').textContent = user.coins;
  document.getElementById('p-lvl').textContent = lv.n;
  document.getElementById('p-lv-cur').textContent = lv.name;
  document.getElementById('p-lv-nxt').textContent = lv.n < 5 ? '→ ' + nextLv.name : '→ Макс.';
  document.getElementById('p-pbar').style.width = prog + '%';
  document.getElementById('p-xp').textContent = user.coins;
  document.getElementById('p-xp-max').textContent = lv.max < 99999 ? lv.max : '∞';
}

function updateLevelTable() {
  if (!user) return;
  const lv = getLvl(user.coins);
  LEVELS.forEach(l => {
    const el = document.getElementById('lt-' + l.n);
    if (!el) return;
    el.classList.remove('active-level');
    if (l.n === lv.n) el.classList.add('active-level');
  });
}

// ===== QR =====
function generateQR() {
  if (!user) return;
  drawQR('qr-canvas', user.uid + '|' + user.firstName + '|' + user.city);
}

function downloadQR() {
  const canvas = document.getElementById('qr-canvas');
  const link = document.createElement('a');
  link.download = 'EcoCity_QR_' + user.uid + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  toast('QR-код скачан! ✅', 'success');
}

function shareQR() {
  const text = `Мой EcoCity QR-код\nID: ${user.uid}\nСкачайте EcoCity и начните зарабатывать бонусы за мусор!`;
  if (navigator.share) navigator.share({title:'EcoCity QR', text});
  else { navigator.clipboard.writeText(user.uid); toast('ID скопирован: ' + user.uid, 'success'); }
}

// ===== MAP =====
// SVG city map routes: from А (166,228) to each point
const ROUTES = {
  'Б': { mx:47, my:155, path:'M166,228 L166,200 L86,200 L86,170 L62,155', addr:'пр. Дусти, 8', accepts:'Пластик, Стекло, Бумага' },
  'В': { mx:320, my:165, path:'M166,228 L166,200 L260,200 L260,170 L305,165', addr:'ул. Фирдавси, 22', accepts:'Металл, Электроника' },
  'Г': { mx:130, my:385, path:'M166,228 L166,295 L86,295 L86,370 L130,385', addr:'ул. Айни, 45', accepts:'Все виды отходов' },
};

function selectPoint(letter, mx, my, meters, addr, accepts) {
  const km = meters >= 1000 ? (meters/1000).toFixed(1) + ' км' : meters + ' м';
  const walkMin = Math.ceil(meters / 80);
  const r = ROUTES[letter];

  // Draw route on SVG
  const routePath = document.getElementById('svg-route');
  if (routePath) {
    routePath.setAttribute('d', r ? r.path : '');
    routePath.style.display = 'block';
    // Animate dash offset
    routePath.style.strokeDashoffset = '200';
    routePath.style.transition = 'stroke-dashoffset 0s';
    setTimeout(() => {
      routePath.style.transition = 'stroke-dashoffset 1.2s ease';
      routePath.style.strokeDashoffset = '0';
    }, 50);
  }

  const panel = document.getElementById('map-panel');
  document.getElementById('mp-content').innerHTML = `
    <h4 style="margin-bottom:10px;font-size:16px">🗑️ Пункт ${letter} — ${addr || 'Душанбе'}</h4>
    <div style="display:flex;gap:10px;margin-bottom:8px">
      <div style="flex:1;background:#e8f5e9;border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:20px;font-weight:900;color:#1a6b3c">${km}</div>
        <div style="font-size:11px;color:#6b7c6b">Расстояние</div>
      </div>
      <div style="flex:1;background:#e3f2fd;border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:20px;font-weight:900;color:#2980b9">${walkMin} мин</div>
        <div style="font-size:11px;color:#6b7c6b">Пешком</div>
      </div>
    </div>
    <p style="color:#6b7c6b;font-size:13px"><i class="fas fa-recycle" style="color:#1a6b3c;margin-right:6px"></i>Принимает: <strong>${accepts || 'Все виды'}</strong></p>
    <p style="color:#6b7c6b;font-size:12px;margin-top:4px"><i class="fas fa-clock" style="color:#f39c12;margin-right:6px"></i>Режим работы: 08:00 – 20:00</p>
  `;
  document.getElementById('btn-route').innerHTML = `<i class="fas fa-check-circle"></i> Маршрут до точки ${letter} построен`;
  panel.classList.remove('hidden');
}

// ===== NEWS =====
function renderNews() {
  document.getElementById('news-wrap').innerHTML = NEWS_DATA.map(n => `
    <div class="news-card">
      <div class="news-img" style="background:${n.bg}">${n.emoji}</div>
      <div class="news-body">
        <div class="news-tag">${n.tag}</div>
        <h4>${n.title}</h4>
        <p>${n.text}</p>
        <div class="news-meta"><span><i class="fas fa-clock"></i> ${n.date}</span></div>
      </div>
    </div>
  `).join('');
}

// ===== ACHIEVEMENTS =====
const ACHS = [
  {id:'first_bag',icon:'🌱',name:'Первый шаг',desc:'1 пакет'},
  {id:'bags_10',icon:'🗑️',name:'10 пакетов',desc:'10 пакетов'},
  {id:'bags_50',icon:'♻️',name:'50 пакетов',desc:'50 пакетов'},
  {id:'coins_100',icon:'💰',name:'100 монет',desc:'100 EcoCoin'},
  {id:'level_3',icon:'⭐',name:'Уровень 3',desc:'3-й уровень'},
  {id:'legend',icon:'👑',name:'Легенда',desc:'1000 EcoCoin'},
];
function renderAchievements() {
  document.getElementById('ach-row').innerHTML = ACHS.map(a => {
    const earned = user?.achievements?.includes(a.id);
    return `<div class="ach-card ${earned?'':'locked'}" onclick="toast('${a.icon} ${a.name}: ${a.desc}')">
      <div class="ach-ico">${a.icon}</div>
      <div class="ach-nm">${a.name}</div>
      <div class="ach-ds">${earned?'✓ Получено':'🔒 '+a.desc}</div>
    </div>`;
  }).join('');
}

function checkAchievements() {
  if (!user.achievements) user.achievements = [];
  const add = (id,cond) => { if(cond && !user.achievements.includes(id)) { user.achievements.push(id); const a=ACHS.find(x=>x.id===id); if(a) setTimeout(()=>toast(`🏆 Достижение: ${a.name} ${a.icon}`,'gold'),500); } };
  add('first_bag', user.bags >= 1);
  add('bags_10', user.bags >= 10);
  add('bags_50', user.bags >= 50);
  add('coins_100', user.coins >= 100);
  add('level_3', getLvl(user.coins).n >= 3);
  add('legend', user.coins >= 1000);
  renderAchievements();
  updateLevelTable();
}

// ===== SCAN HISTORY =====
function renderScanHistory() {
  const c = document.getElementById('scan-hist');
  if (!user?.history?.length) {
    c.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>История пуста. Начните сдавать мусор!</p></div>';
    return;
  }
  c.innerHTML = user.history.map(h => `
    <div class="sh-item">
      <div class="sh-ico"><i class="fas fa-qrcode"></i></div>
      <div class="sh-info"><strong>${h.point}</strong><small>${h.date} · ${h.bags} пакет${h.bags>1?'ов':''}</small></div>
      <span class="sh-coins">+${h.coins} <i class="fas fa-coins"></i></span>
    </div>
  `).join('');
}

// ===== BONUSES =====
function simScan() {
  const coins = 10 * (Math.floor(Math.random()*3)+1);
  const bags = Math.floor(Math.random()*3)+1;
  const pts = ['Пункт Б — Шохмансур','Пункт В — Сино','Пункт Г — Авиценна'];
  user.coins += coins; user.bags += bags;
  user.history = user.history || [];
  user.history.unshift({date:new Date().toLocaleDateString('ru'), bags, coins, point:pts[Math.floor(Math.random()*pts.length)]});
  checkAchievements(); saveUser(); updateUI(); renderScanHistory();
  toast(`+${coins} EcoCoin за ${bags} пакет${bags>1?'ов':''}! 🎉`, 'gold');
  confetti();
}

function claimDaily() {
  if (user.dailyClaimed) { toast('Бонус уже получен сегодня ✓', 'error'); return; }
  user.coins += 10; user.dailyClaimed = true;
  saveUser(); updateUI();
  document.getElementById('daily-btn').textContent = 'Получено ✓';
  document.getElementById('daily-btn').style.background = '#ccc';
  toast('+10 EcoCoin ежедневный бонус! 🎉', 'gold');
  confetti();
}

function shareRef() {
  const txt = `Присоединяйся к EcoCity! Получай бонусы за мусор. Мой код: ${user.uid}`;
  if (navigator.share) navigator.share({title:'EcoCity',text:txt});
  else { navigator.clipboard.writeText(txt); toast('Реферальная ссылка скопирована!','success'); }
}

function sortBonus() {
  user.coins += 25; saveUser(); updateUI();
  toast('+25 EcoCoin за сортировку мусора! ♻️', 'gold');
  confetti();
}

function redeem(name, cost) {
  if (user.coins < cost) { toast(`Нужно ещё ${cost-user.coins} EcoCoin`, 'error'); return; }
  user.coins -= cost; saveUser(); updateUI();
  toast(`✅ ${name} получен! -${cost} EcoCoin`, 'success');
}

// ===== LEADERBOARD =====
function renderLeaderboard() {
  const lb = [...LB_DATA, {name:user.firstName+' '+user.lastName, city:user.city, coins:user.coins, bags:user.bags, initials:(user.firstName[0]||'Э')+(user.lastName[0]||'Г'), isMe:true}]
    .sort((a,b)=>b.coins-a.coins).slice(0,10);
  document.getElementById('lb-body').innerHTML = lb.map((u,i)=>`
    <div class="lb-item ${u.isMe?'me':''}">
      <div class="lb-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
      <div class="lb-av">${u.initials}</div>
      <div class="lb-info"><strong>${u.name}${u.isMe?' (Вы)':''}</strong><small>📍 ${u.city} · ${u.bags} пакетов</small></div>
      <span class="lb-coins"><i class="fas fa-coins"></i> ${u.coins}</span>
    </div>
  `).join('');
}

// ===== CHAT =====
const COMP_DATA = {
  city: [{n:'Душанбе',v:2840,icon:'🥇'},{n:'Ташкент',v:2310,icon:'🥈'},{n:'Бишкек',v:1950,icon:'🥉'},{n:'Алматы',v:1720,icon:'4'},{n:'Астана',v:1380,icon:'5'}],
  district: [{n:'Шохмансур',v:980,icon:'🥇'},{n:'Сино',v:870,icon:'🥈'},{n:'Фирдавси',v:760,icon:'🥉'},{n:'Исмоили Сомони',v:640,icon:'4'},{n:'Авиценна',v:520,icon:'5'}],
  street: [{n:'ул. Рудаки',v:450,icon:'🥇'},{n:'пр. Дусти',v:380,icon:'🥈'},{n:'ул. Айни',v:310,icon:'🥉'},{n:'ул. Борбад',v:280,icon:'4'},{n:'пр. Борбад',v:220,icon:'5'}],
  activist: [{n:'Акбар Рахимов',v:284,icon:'🥇'},{n:'Малика Усмонова',v:231,icon:'🥈'},{n:'Бекзод Алиев',v:195,icon:'🥉'},{n:'Зарина Касымова',v:172,icon:'4'},{n:'Фирдавс Назаров',v:154,icon:'5'}],
};

function renderCompetition(type) {
  const data = COMP_DATA[type];
  const unit = type === 'activist' ? 'пакетов' : 'EcoCoin';
  document.getElementById('comp-list').innerHTML = data.map((item,i) => `
    <div class="comp-item">
      <span class="comp-rank">${item.icon}</span>
      <div class="comp-info"><strong>${item.n}</strong></div>
      <span class="comp-val"><i class="fas fa-coins"></i> ${item.v} ${unit}</span>
    </div>
  `).join('');
}

function switchComp(type, btn) {
  document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderCompetition(type);
}

const CHAT_CONTENT = {
  complaint: {
    title:'🚨 Жалоба на коммунальщиков',
    msgs: [{from:'bot',text:'Здравствуйте! Опишите проблему с вывозом мусора.'},{from:'bot',text:'Укажите адрес и время, когда не приехала машина.'}],
    templates: ['Не вывозят мусор более 3 дней','Нарушают график вывоза','Контейнер переполнен']
  },
  violation: {
    title:'⚠️ Нарушение выброса мусора',
    msgs: [{from:'bot',text:'Зафиксируйте нарушение. Укажите адрес и описание.'},{from:'bot',text:'Фото нарушения поможет быстрее обработать жалобу.'}],
    templates: ['Выброс мусора в неположенном месте','Мусор оставлен у подъезда','Незаконная свалка']
  },
  support: {
    title:'💬 Связь с оператором EcoCity',
    msgs: [{from:'bot',text:'Здравствуйте! Я Эко-Ассистент. Чем могу помочь?'},{from:'bot',text:'Среднее время ответа оператора: 5 минут.'}],
    templates: ['Вопрос по начислению EcoCoin','Не приходят бонусы','Проблема с QR-кодом']
  }
};

function openChat(type) {
  const c = CHAT_CONTENT[type];
  document.getElementById('chat-modal-title').textContent = c.title;
  document.getElementById('chat-modal-body').innerHTML = `
    <div class="chat-msgs" id="chat-msgs">
      ${c.msgs.map(m=>`<div class="chat-msg bot"><div class="cm-bubble">${m.text}</div></div>`).join('')}
    </div>
    <div class="chat-quick-replies">${c.templates.map(t=>`<button class="cqr" onclick="sendMsg('${t}')">${t}</button>`).join('')}</div>
    <div class="chat-input-row">
      <input type="text" id="chat-input" class="form-control" placeholder="Написать сообщение...">
      <button class="chat-send" onclick="sendMsg(document.getElementById('chat-input').value)"><i class="fas fa-paper-plane"></i></button>
    </div>
  `;
  openModal('modal-chat');
}

function sendMsg(text) {
  if (!text?.trim()) return;
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  msgs.innerHTML += `<div class="chat-msg me"><div class="cm-bubble">${text}</div></div>`;
  const inp = document.getElementById('chat-input');
  if (inp) inp.value = '';
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    msgs.innerHTML += `<div class="chat-msg bot"><div class="cm-bubble">Ваше обращение зарегистрировано. Номер: #${Math.floor(10000+Math.random()*90000)}. Ответим в течение 24 часов.</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 1000);
}

// ===== NOTIFICATIONS =====
const NOTIFS = [
  {icon:'🎉',bg:'#e8f5e9',title:'Добро пожаловать в EcoCity!',text:'Аккаунт создан. Начните сдавать мусор!',time:'Сейчас'},
  {icon:'💰',bg:'#fff8e1',title:'+10 EcoCoin — Ежедневный бонус',text:'Получите ежедневный бонус за вход',time:'1 ч назад'},
  {icon:'📍',bg:'#e3f2fd',title:'Новый пункт сбора рядом',text:'Открылся пункт в 500м от вас',time:'2 ч назад'},
  {icon:'🏆',bg:'#fce4ec',title:'Вы в топ-100!',text:'Продолжайте сдавать мусор',time:'Вчера'},
];
function renderNotifs() {
  document.getElementById('notif-body').innerHTML = NOTIFS.map(n=>`
    <div class="notif-item">
      <div class="ni-ico" style="background:${n.bg}">${n.icon}</div>
      <div class="ni-info"><strong>${n.title}</strong><p>${n.text}</p><time>${n.time}</time></div>
    </div>
  `).join('');
}

// ===== PAGE NAVIGATION =====
function goPage(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.getElementById('pg-'+page).classList.add('active');
  document.getElementById('nb-'+page).classList.add('active');
}

// ===== MODALS =====
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ===== TOAST =====
function toast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast ' + type;
  t.classList.remove('hidden');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.add('hidden'), 3000);
}

// ===== CONFETTI =====
function confetti() {
  const cv = document.getElementById('confetti');
  const ctx = cv.getContext('2d');
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  const pts = Array.from({length:60},()=>({x:Math.random()*cv.width,y:-20,vy:2+Math.random()*4,vx:(Math.random()-.5)*3,r:4+Math.random()*5,c:['#27ae60','#f39c12','#2980b9','#e74c3c','#fff'][~~(Math.random()*5)],a:Math.random()*360}));
  let f=0;
  (function draw(){
    if(f++>100){ctx.clearRect(0,0,cv.width,cv.height);return;}
    ctx.clearRect(0,0,cv.width,cv.height);
    pts.forEach(p=>{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a*Math.PI/180);ctx.fillStyle=p.c;ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);ctx.restore();p.x+=p.vx;p.y+=p.vy;p.a+=3;});
    requestAnimationFrame(draw);
  })();
}

// ===== UTILS =====
function togglePass(id) { const e=document.getElementById(id); e.type=e.type==='password'?'text':'password'; }
