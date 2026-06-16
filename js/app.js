// ===== EcoCity Main Application =====

let currentUser = null;
let map = null;
let userMarker = null;
let routingControl = null;
let selectedPoint = null;
let allMarkers = [];
let regData = {};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    hideSplash();
    checkSession();
  }, 2500);
});

function hideSplash() {
  const splash = document.getElementById('splash-screen');
  splash.style.transition = 'opacity .5s ease';
  splash.style.opacity = '0';
  setTimeout(() => splash.classList.add('hidden'), 500);
}

function checkSession() {
  const saved = localStorage.getItem('ecocity_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    openApp();
  } else {
    const seen = localStorage.getItem('ecocity_onboard');
    if (seen) showAuth();
    else showOnboarding();
  }
}

// ===== ONBOARDING =====
let currentSlide = 0;
function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
}

document.getElementById('onboard-next').addEventListener('click', () => {
  const slides = document.querySelectorAll('.onboard-slide');
  const dots = document.querySelectorAll('.onboard-dots .dot');
  if (currentSlide < slides.length - 1) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide++;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    if (currentSlide === slides.length - 1) {
      document.getElementById('onboard-next').innerHTML = 'Начать <i class="fas fa-arrow-right"></i>';
    }
  } else {
    localStorage.setItem('ecocity_onboard', '1');
    document.getElementById('onboarding').classList.add('hidden');
    showAuth();
  }
});

// ===== AUTH =====
function showAuth() {
  document.getElementById('auth-page').classList.remove('hidden');
  showAuthScreen('welcome');
}

function showAuthScreen(name) {
  document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
  const map_ = { welcome:'auth-welcome', register:'auth-register', passport:'auth-passport', confirm:'auth-confirm', login:'auth-login', otp:'auth-otp' };
  const el = document.getElementById(map_[name]);
  if (el) el.classList.add('active');
}

function updatePhoneCode() {
  const sel = document.getElementById('reg-country');
  const code = sel.value;
  document.getElementById('phone-code').textContent = code;
}

function regStep1() {
  const phone = document.getElementById('reg-phone').value.trim();
  const city = document.getElementById('reg-city').value;
  if (!phone || phone.length < 7) { showToast('Введите корректный номер телефона', 'error'); return; }
  const code = document.getElementById('phone-code').textContent;
  regData.phone = code + ' ' + phone;
  regData.city = city;
  document.getElementById('otp-phone-display').textContent = regData.phone;
  showAuthScreen('otp');
}

function verifyOTP() {
  const inputs = document.querySelectorAll('.otp-input');
  const code = Array.from(inputs).map(i => i.value).join('');
  if (code === '1234' || code.length === 4) {
    showToast('Номер подтверждён! ✓', 'success');
    showAuthScreen('passport');
  } else {
    showToast('Неверный код. Попробуйте 1234', 'error');
  }
}

function otpMove(el, idx) {
  if (el.value.length >= 1) {
    const inputs = document.querySelectorAll('.otp-input');
    if (idx < inputs.length - 1) inputs[idx + 1].focus();
  }
}

function regStep2() {
  const passport = document.getElementById('reg-passport').value.trim();
  const first = document.getElementById('reg-firstname').value.trim();
  const last = document.getElementById('reg-lastname').value.trim();
  const dob = document.getElementById('reg-dob').value;
  if (!passport || passport.length < 5) { showToast('Введите номер паспорта / ID', 'error'); return; }
  if (!first || !last) { showToast('Введите имя и фамилию', 'error'); return; }
  if (!dob) { showToast('Введите дату рождения', 'error'); return; }

  regData.passport = passport;
  regData.firstName = first;
  regData.lastName = last;
  regData.dob = dob;

  const status = document.getElementById('verify-status');
  status.style.display = 'flex';

  setTimeout(() => {
    status.style.display = 'none';
    document.getElementById('verified-name').textContent = first + ' ' + last;
    showToast('Верификация успешна! ✓', 'success');
    showAuthScreen('confirm');
  }, 2500);
}

function regComplete() {
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  if (!pass || pass.length < 6) { showToast('Пароль должен содержать минимум 6 символов', 'error'); return; }
  if (pass !== pass2) { showToast('Пароли не совпадают', 'error'); return; }
  if (!document.getElementById('agree-terms').checked) { showToast('Примите условия использования', 'error'); return; }

  const uid = 'ECO-' + Math.floor(100000 + Math.random() * 900000);
  const qrData = generateQRData(uid);

  currentUser = {
    uid, firstName: regData.firstName, lastName: regData.lastName,
    phone: regData.phone, city: regData.city, passport: regData.passport,
    dob: regData.dob, password: pass, qrData,
    coins: 10, bags: 0, level: 1, streak: 1,
    joinDate: new Date().toLocaleDateString('ru'), dailyClaimed: false,
    history: [], earnedAchievements: [],
    notifications: 3
  };
  saveUser();
  showToast('Аккаунт EcoCity создан! 🎉', 'success');
  setTimeout(() => { document.getElementById('auth-page').classList.add('hidden'); openApp(); }, 800);
}

function doLogin() {
  const phone = document.getElementById('login-phone').value.trim();
  const pass = document.getElementById('login-pass').value;
  const saved = localStorage.getItem('ecocity_user');
  if (saved) {
    const u = JSON.parse(saved);
    if ((phone && pass && u.password === pass) || (!phone && !pass)) {
      currentUser = u;
      document.getElementById('auth-page').classList.add('hidden');
      openApp();
    } else {
      showToast('Неверный телефон или пароль', 'error');
    }
  } else {
    showToast('Аккаунт не найден. Зарегистрируйтесь', 'error');
  }
}

function demoLogin() {
  const uid = 'ECO-DEMO01';
  currentUser = {
    uid, firstName:'Эко', lastName:'Гражданин',
    phone:'+992 90 123 4567', city:'Душанбе',
    passport:'A 1234567', dob:'1995-01-01',
    qrData: generateQRData(uid),
    coins: 245, bags: 18, level: 2, streak: 5,
    joinDate:'01.06.2026', dailyClaimed: false,
    history: [
      { date:'15.06.2026', bags:3, coins:30, point:'Центральный пункт' },
      { date:'12.06.2026', bags:5, coins:50, point:'Пункт №2 — Шохмансур' },
      { date:'10.06.2026', bags:2, coins:20, point:'Завод переработки' },
      { date:'08.06.2026', bags:4, coins:40, point:'Пункт №3 — Сино' },
      { date:'05.06.2026', bags:4, coins:40, point:'Центральный пункт' },
    ],
    earnedAchievements: ['first_bag','bags_10','coins_100'],
    notifications: 3
  };
  saveUser();
  document.getElementById('auth-page').classList.add('hidden');
  openApp();
}

function doLogout() {
  if (!confirm('Выйти из аккаунта EcoCity?')) return;
  currentUser = null;
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-page').classList.remove('hidden');
  showAuthScreen('welcome');
}

// ===== APP OPEN =====
function openApp() {
  document.getElementById('main-app').classList.remove('hidden');
  updateUI();
  renderNews();
  renderAchievements();
  renderScanHistory();
  renderNotifications();
  initMap();
  generateQRCode();
  setEcoTip();
  updateGreeting();
}

function saveUser() {
  localStorage.setItem('ecocity_user', JSON.stringify(currentUser));
}

function generateQRData(uid) {
  return `ECOCITY|${uid}|${Date.now()}|${Math.random().toString(36).substr(2,9).toUpperCase()}`;
}

// ===== UI UPDATE =====
function updateUI() {
  if (!currentUser) return;
  const name = currentUser.firstName + ' ' + currentUser.lastName;
  const initials = (currentUser.firstName[0] || 'Э') + (currentUser.lastName[0] || 'Г');
  const level = getLevelInfo(currentUser.coins);

  // Header
  document.getElementById('header-city').textContent = currentUser.city || 'Душанбе';
  document.getElementById('header-coins').textContent = currentUser.coins;
  document.getElementById('notif-badge').textContent = currentUser.notifications || 0;

  // Hero
  document.getElementById('hero-name').textContent = currentUser.firstName;
  document.getElementById('stat-bags').textContent = currentUser.bags;
  document.getElementById('stat-coins').textContent = currentUser.coins;
  document.getElementById('stat-level-num').textContent = level.level;
  document.getElementById('hero-level-badge').innerHTML = `<i class="fas fa-leaf"></i> <span>${level.name}</span>`;

  // Level progress
  const progress = getProgress(currentUser.coins, level);
  document.getElementById('level-progress-bar').style.width = progress + '%';
  document.getElementById('level-current-name').textContent = level.name;
  const nextLv = LEVELS[level.level] || level;
  document.getElementById('level-next-name').textContent = level.level < LEVELS.length ? '→ ' + LEVELS[level.level].name : '→ Макс. уровень';
  document.getElementById('coins-to-next').textContent = level.level < LEVELS.length ? level.maxCoins - currentUser.coins : 0;

  // QR page
  document.getElementById('qr-avatar').textContent = initials;
  document.getElementById('qr-user-name').textContent = name;
  document.getElementById('qr-user-id').textContent = 'ID: ' + currentUser.uid;
  document.getElementById('qr-city').textContent = currentUser.city + ', Центральная Азия';
  document.getElementById('qr-coins').textContent = currentUser.coins;

  // Profile
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-id').textContent = 'ID: ' + currentUser.uid;
  document.getElementById('profile-level-badge').innerHTML = `<i class="fas fa-leaf"></i> ${level.name}`;
  document.getElementById('prof-bags').textContent = currentUser.bags;
  document.getElementById('prof-coins').textContent = currentUser.coins;
  document.getElementById('prof-level').textContent = level.level;
  document.getElementById('prof-rank').textContent = '#' + Math.floor(10 + Math.random() * 90);
  document.getElementById('prof-level-text').textContent = level.name;
  document.getElementById('prof-progress').style.width = progress + '%';
  document.getElementById('prof-xp').textContent = currentUser.coins;
  document.getElementById('prof-xp-max').textContent = level.maxCoins;
}

function getLevelInfo(coins) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (coins >= LEVELS[i].minCoins) return LEVELS[i];
  }
  return LEVELS[0];
}

function getProgress(coins, level) {
  const range = level.maxCoins - level.minCoins;
  const current = coins - level.minCoins;
  return Math.min(100, Math.round((current / range) * 100));
}

function updateGreeting() {
  const h = new Date().getHours();
  let g = h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
  document.getElementById('hero-greeting').innerHTML = `${g}, <strong>${currentUser.firstName}</strong>!`;
}

function setEcoTip() {
  const tip = ECO_TIPS[Math.floor(Math.random() * ECO_TIPS.length)];
  document.getElementById('eco-tip-text').textContent = tip;
}

// ===== NEWS =====
function renderNews() {
  const container = document.getElementById('news-list');
  container.innerHTML = ECO_NEWS.map(n => `
    <div class="news-card" onclick="showToast('📰 ${n.title}')">
      <div class="news-card-img" style="background:${n.color}">${n.emoji}</div>
      <div class="news-card-body">
        <div class="news-tag">🌿 ${n.tag}</div>
        <h4>${n.title}</h4>
        <p>${n.text}</p>
        <div class="news-meta">
          <span><i class="fas fa-clock"></i> ${n.date}</span>
          <span><i class="fas fa-share-alt"></i> Поделиться</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== ACHIEVEMENTS =====
function renderAchievements() {
  const container = document.getElementById('achievements-row');
  container.innerHTML = ACHIEVEMENTS.map(a => {
    const earned = currentUser.earnedAchievements && currentUser.earnedAchievements.includes(a.id);
    return `
      <div class="achievement-card ${earned ? '' : 'locked'}" onclick="showToast('${a.icon} ${a.name}: ${a.desc}')">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        ${earned ? '<div class="ach-earned">✓ Получено</div>' : '<div class="ach-desc">🔒</div>'}
      </div>
    `;
  }).join('');
}

// ===== MAP =====
function initMap() {
  if (map) return;
  const dushanbe = [38.5598, 68.7870];
  map = L.map('map', { zoomControl:false, attributionControl:true }).setView(dushanbe, 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© OpenStreetMap',
    maxZoom:19
  }).addTo(map);

  L.control.zoom({ position:'bottomright' }).addTo(map);

  // User marker
  const userIcon = L.divIcon({
    html:`<div class="eco-marker user"><i class="fas fa-street-view" style="color:#fff;font-size:16px"></i></div>`,
    className:'', iconSize:[36,36], iconAnchor:[18,18]
  });
  userMarker = L.marker(dushanbe, { icon:userIcon }).addTo(map);
  userMarker.bindPopup('<b>📍 Вы здесь</b><br>Душанбе, Таджикистан').openPopup();

  // Trash/factory markers
  TRASH_POINTS.forEach(p => addMapMarker(p));

  setTimeout(() => map.invalidateSize(), 300);
}

function addMapMarker(point) {
  const isFactory = point.type === 'factory';
  const icon = L.divIcon({
    html:`<div class="eco-marker ${isFactory ? 'factory' : 'trash'}">
      <i class="fas ${isFactory ? 'fa-industry' : 'fa-trash-alt'}" style="color:#fff;font-size:14px"></i>
    </div>`,
    className:'', iconSize:[36,36], iconAnchor:[18,18]
  });
  const marker = L.marker([point.lat, point.lng], { icon }).addTo(map);
  marker.pointData = point;
  marker.on('click', () => showMapPanel(point));
  allMarkers.push({ marker, type:point.type });
}

function showMapPanel(point) {
  selectedPoint = point;
  const panel = document.getElementById('map-panel');
  const content = document.getElementById('map-panel-content');
  const isFactory = point.type === 'factory';
  content.innerHTML = `
    <h4>${isFactory ? '🏭' : '🗑️'} ${point.name}</h4>
    <p><i class="fas fa-map-marker-alt" style="color:#e74c3c;margin-right:6px"></i>${point.address}</p>
    <p><i class="fas fa-clock" style="color:#2980b9;margin-right:6px"></i>Часы работы: ${point.hours}</p>
    <div class="map-panel-badges">
      <span class="map-badge open">✓ Открыто</span>
      <span class="map-badge type">${isFactory ? '🏭 Завод' : '♻️ Сбор'}</span>
      ${point.accepts.map(a => `<span class="map-badge type">${a}</span>`).join('')}
    </div>
  `;
  panel.style.display = 'block';
}

function buildRoute() {
  if (!selectedPoint) return;
  const dushanbe = [38.5598, 68.7870];
  if (routingControl) { map.removeControl(routingControl); routingControl = null; }
  try {
    routingControl = L.Routing.control({
      waypoints: [L.latLng(dushanbe), L.latLng(selectedPoint.lat, selectedPoint.lng)],
      routeWhileDragging:false,
      show:false,
      lineOptions:{ styles:[{ color:'#1a6b3c', weight:5, opacity:.8 }] },
      createMarker:() => null,
      router: L.Routing.osrmv1({ serviceUrl:'https://router.project-osrm.org/route/v1' })
    }).addTo(map);
    map.setView([selectedPoint.lat, selectedPoint.lng], 15);
    showToast('🗺️ Маршрут построен!', 'success');
    document.getElementById('map-panel').style.display = 'none';
  } catch(e) {
    showToast('Маршрут построен (демо)', 'success');
  }
}

function locateUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const ll = [pos.coords.latitude, pos.coords.longitude];
        map.setView(ll, 16);
        if (userMarker) userMarker.setLatLng(ll);
        showToast('📍 Местоположение найдено', 'success');
      },
      () => {
        map.setView([38.5598, 68.7870], 14);
        showToast('📍 Показываем Душанбе', 'success');
      }
    );
  } else {
    map.setView([38.5598, 68.7870], 14);
  }
}

function filterMarkers(type) {
  document.querySelectorAll('[id^="filter-"]').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-' + type).classList.add('active');
  allMarkers.forEach(m => {
    if (type === 'all' || m.type === type) {
      m.marker.addTo(map);
    } else {
      map.removeLayer(m.marker);
    }
  });
}

// ===== QR CODE =====
function generateQRCode() {
  const container = document.getElementById('qr-canvas');
  container.innerHTML = '';
  if (!currentUser) return;
  try {
    new QRCode(container, {
      text: currentUser.qrData || currentUser.uid,
      width: 200, height: 200,
      colorDark:'#1a2e1a', colorLight:'#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch(e) {
    container.innerHTML = '<div style="width:200px;height:200px;display:flex;align-items:center;justify-content:center;background:#f0f4f0;border-radius:12px;font-size:60px;">📱</div>';
  }
}

function downloadQR() {
  const canvas = document.querySelector('#qr-canvas canvas');
  if (canvas) {
    const a = document.createElement('a');
    a.download = 'EcoCity_QR_' + (currentUser ? currentUser.uid : '') + '.png';
    a.href = canvas.toDataURL();
    a.click();
    showToast('✅ QR-код скачан!', 'success');
  } else {
    showToast('QR-код готов к использованию', 'success');
  }
}

function shareQR() {
  if (navigator.share) {
    navigator.share({ title:'Мой EcoCity QR-код', text:`ID: ${currentUser.uid}\nEcoCity — умная переработка мусора`, url:window.location.href });
  } else {
    navigator.clipboard.writeText(currentUser.uid).then(() => showToast('ID скопирован: ' + currentUser.uid, 'success'));
  }
}

// ===== SCAN HISTORY =====
function renderScanHistory() {
  const container = document.getElementById('scan-history');
  if (!currentUser || !currentUser.history || currentUser.history.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:30px;color:#6b7c6b;font-size:14px"><i class="fas fa-inbox" style="font-size:40px;display:block;margin-bottom:10px;opacity:.3"></i>История сканирований пуста.<br>Начните сдавать мусор!</div>';
    return;
  }
  container.innerHTML = currentUser.history.map(h => `
    <div class="scan-history-item">
      <div class="scan-icon"><i class="fas fa-qrcode"></i></div>
      <div class="scan-info">
        <strong>${h.point}</strong>
        <small>${h.date} · ${h.bags} пакет${h.bags>1?'ов':''}</small>
      </div>
      <span class="scan-coins">+${h.coins} <i class="fas fa-coins" style="font-size:12px;color:#f39c12"></i></span>
    </div>
  `).join('');
}

// ===== NOTIFICATIONS =====
function renderNotifications() {
  const list = document.getElementById('notifications-list');
  list.innerHTML = NOTIFICATIONS_DATA.map(n => `
    <div class="notif-item">
      <div class="notif-icon" style="background:${n.bg}">${n.icon}</div>
      <div class="notif-info">
        <strong>${n.title}</strong>
        <p>${n.text}</p>
        <time>${n.time}</time>
      </div>
    </div>
  `).join('');
}

// ===== LEADERBOARD =====
function showLeaderboard() {
  document.getElementById('modal-leaderboard').classList.remove('hidden');
  renderLeaderboard();
}

function renderLeaderboard() {
  const user = currentUser;
  const myEntry = { name:`${user.firstName} ${user.lastName}`, city:user.city, coins:user.coins, bags:user.bags, initials:(user.firstName[0]||'Э')+(user.lastName[0]||'Г'), isMe:true };
  let list = [...DEMO_LEADERBOARD, myEntry].sort((a,b) => b.coins - a.coins).slice(0,10);

  document.getElementById('leaderboard-list').innerHTML = list.map((u,i) => {
    const rankClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
    const rankIcon = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
    return `
      <div class="lb-item" style="${u.isMe?'background:#e8f5e9;border-radius:12px;padding:12px;margin:-4px 0':''}">
        <div class="lb-rank ${rankClass}">${rankIcon}</div>
        <div class="lb-avatar" style="${u.isMe?'background:linear-gradient(135deg,#1a6b3c,#27ae60)':''}">${u.initials}</div>
        <div class="lb-info">
          <strong>${u.name} ${u.isMe?'(Вы)':''}</strong>
          <small>📍 ${u.city} · ${u.bags} пакетов</small>
        </div>
        <span class="lb-coins"><i class="fas fa-coins"></i> ${u.coins}</span>
      </div>
    `;
  }).join('');
}

function switchLB(period) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  renderLeaderboard();
}

// ===== BONUSES =====
function claimDaily() {
  if (currentUser.dailyClaimed) { showToast('Уже получено сегодня ✓', 'error'); return; }
  currentUser.coins += 10;
  currentUser.dailyClaimed = true;
  saveUser();
  updateUI();
  document.getElementById('daily-bonus-btn').textContent = 'Получено ✓';
  document.getElementById('daily-bonus-btn').classList.add('claimed');
  showToast('+10 EcoCoin! Ежедневный бонус 🎉', 'gold');
  launchConfetti();
}

function showScanModal() {
  const coins = 10 * (Math.floor(Math.random() * 3) + 1);
  const bags = Math.floor(Math.random() * 3) + 1;
  currentUser.coins += coins;
  currentUser.bags += bags;
  currentUser.history = currentUser.history || [];
  currentUser.history.unshift({
    date: new Date().toLocaleDateString('ru'),
    bags, coins,
    point: TRASH_POINTS[Math.floor(Math.random() * TRASH_POINTS.length)].name
  });
  checkAchievements();
  saveUser();
  updateUI();
  renderScanHistory();
  showToast(`+${coins} EcoCoin за ${bags} пакет${bags>1?'ов':''}! 🎉`, 'gold');
  launchConfetti();
}

function showReferral() {
  const link = `https://ecocity.tj/join?ref=${currentUser.uid}`;
  if (navigator.share) {
    navigator.share({ title:'Присоединяйся к EcoCity!', text:'Получай бонусы за сдачу мусора!', url:link });
  } else {
    navigator.clipboard.writeText(link).then(() => showToast('Реферальная ссылка скопирована!', 'success'));
  }
}

function showSortBonus() {
  currentUser.coins += 25;
  saveUser();
  updateUI();
  showToast('+25 EcoCoin за раздельный сбор! ♻️', 'gold');
  launchConfetti();
}

function redeemItem(name, cost) {
  if (currentUser.coins < cost) {
    showToast(`Недостаточно EcoCoin. Нужно ещё ${cost - currentUser.coins}`, 'error');
    return;
  }
  currentUser.coins -= cost;
  saveUser();
  updateUI();
  showToast(`✅ ${name} получен! -${cost} EcoCoin`, 'success');
}

// ===== ACHIEVEMENTS CHECK =====
function checkAchievements() {
  if (!currentUser.earnedAchievements) currentUser.earnedAchievements = [];
  const u = currentUser;
  const check = (id, cond) => {
    if (cond && !u.earnedAchievements.includes(id)) {
      u.earnedAchievements.push(id);
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) setTimeout(() => showToast(`🏆 Достижение: ${ach.name} ${ach.icon}`, 'gold'), 500);
    }
  };
  check('first_bag', u.bags >= 1);
  check('bags_10', u.bags >= 10);
  check('bags_50', u.bags >= 50);
  check('bags_100', u.bags >= 100);
  check('coins_100', u.coins >= 100);
  check('coins_500', u.coins >= 500);
  check('level_3', getLevelInfo(u.coins).level >= 3);
  renderAchievements();
}

// ===== PAGE SWITCHING =====
function switchPage(page) {
  document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');
  if (page === 'map') setTimeout(() => { if(map) map.invalidateSize(); }, 100);
}

// ===== MODALS =====
function showNotifications() {
  currentUser.notifications = 0;
  document.getElementById('notif-badge').textContent = '0';
  saveUser();
  document.getElementById('modal-notifications').classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// ===== SETTINGS STUBS =====
function showEditProfile() { showToast('✏️ Редактирование профиля скоро', 'success'); }
function showLanguage() { showToast('🌐 Поддерживается: Русский, Таджикский, Узбекский', 'success'); }
function showAbout() { showToast('ℹ️ EcoCity v2.0 — Центральная Азия. Хакатон 2026 🏆', 'success'); }

// ===== TOAST =====
function showToast(msg, type='') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ===== CONFETTI =====
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({length:80}, () => ({
    x: Math.random() * canvas.width, y: Math.random() * -100,
    r: 4 + Math.random() * 6, vy: 2 + Math.random() * 4,
    vx: (Math.random() - .5) * 3,
    color: ['#1a6b3c','#27ae60','#f39c12','#2980b9','#e74c3c','#fff'][Math.floor(Math.random()*6)],
    angle: Math.random() * 360
  }));
  let frames = 0;
  function draw() {
    if (frames++ > 120) { ctx.clearRect(0,0,canvas.width,canvas.height); return; }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle * Math.PI/180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.angle += 3;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== UTILITIES =====
function togglePass(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}
