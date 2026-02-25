/* =================== ۱. مدیریت تم پیشرفته با گزینه‌های بیشتر =================== */
function setThemeWithExpiry(theme, days = 30) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  localStorage.setItem('theme', JSON.stringify({ value: theme, expiry: expiry.getTime() }));
}

function getThemeWithExpiry() {
  const itemStr = localStorage.getItem('theme');
  if (!itemStr) return detectAutoTheme();
  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem('theme');
      return detectAutoTheme();
    }
    return item.value === 'auto' ? detectAutoTheme() : item.value;
  } catch {
    return detectAutoTheme();
  }
}

function detectAutoTheme() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? 'light' : 'dark';
}

const savedTheme = getThemeWithExpiry();
document.body.setAttribute('data-theme', savedTheme);

/* =================== ۲. ذرات نور پیشرفته با فیزیک بهبود یافته =================== */
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
let particles = [];
let mouse = { x: null, y: null, radius: 200 };
let animationFrame, lastTime = 0, fps = 60, interval = 1000 / fps;
let gravity = 0.008;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
}

window.addEventListener('resize', debounce(resizeCanvas, 200));

canvas.addEventListener('mousemove', e => { 
  mouse.x = e.clientX; 
  mouse.y = e.clientY; 
});

canvas.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  mouse.x = touch.clientX;
  mouse.y = touch.clientY;
});

canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
canvas.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });

class SmartParticle {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 4 + 1;
    this.speedX = Math.random() * 1.5 - 0.75;
    this.speedY = Math.random() * 1.5 - 0.75;
    this.color = getThemeColor();
    this.glow = Math.random() * 0.8 + 0.4;
    this.trail = [];
    this.life = 1;
    this.maxLife = 1;
  }
  
  update() {
    this.speedY += gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    
    if (this.x < 0 || this.x > canvas.width) {
      this.speedX *= -0.95;
      this.color = `rgba(255,150,150,${Math.random()*0.6+0.4})`;
      this.x = Math.max(0, Math.min(this.x, canvas.width));
    }
    if (this.y < 0 || this.y > canvas.height) {
      this.speedY *= -0.95;
      this.color = `rgba(150,255,150,${Math.random()*0.6+0.4})`;
      this.y = Math.max(0, Math.min(this.y, canvas.height));
    }
    
    if (mouse.x && mouse.y) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < mouse.radius) {
        const angle = Math.atan2(dy, dx);
        const force = (mouse.radius - dist) / mouse.radius * 6;
        this.speedX -= Math.cos(angle) * force * 0.5;
        this.speedY -= Math.sin(angle) * force * 0.5;
        this.color = `rgba(255,223,0,${force * 0.7 + 0.4})`;
      }
    }
    
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();
  }
  
  draw() {
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = this.color.replace('0.6', '0.2');
      ctx.lineWidth = this.size * 0.5;
      ctx.stroke();
    }
    
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.glow * 20;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function getThemeColor() {
  const theme = document.body.getAttribute('data-theme');
  return theme === 'light' 
    ? `rgba(0,102,204,${Math.random()*0.6+0.4})` 
    : `rgba(0,212,255,${Math.random()*0.6+0.4})`;
}

function initParticles() {
  particles = [];
  const density = window.innerWidth * window.innerHeight / 5000;
  const count = Math.min(400, Math.floor(density));
  for (let i = 0; i < count; i++) particles.push(new SmartParticle());
  
  const backupStr = localStorage.getItem('particles-backup');
  if (backupStr) {
    try {
      const backup = JSON.parse(backupStr);
      backup.forEach((p, i) => {
        if (particles[i]) Object.assign(particles[i], p);
      });
    } catch (e) {}
  }
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 150) {
        const opacity = (1 - dist / 150) * 0.3;
        ctx.strokeStyle = `rgba(0,212,255,${opacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function optimizedAnimate(time) {
  animationFrame = requestAnimationFrame(optimizedAnimate);
  const delta = time - lastTime;
  if (delta >= interval) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    lastTime = time - (delta % interval);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
  } else {
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(optimizedAnimate);
  }
});

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

initParticles();
animationFrame = requestAnimationFrame(optimizedAnimate);

/* =================== ۳. ساعت و تاریخ شمسی با روز هفته دقیق =================== */
const persianWeekdays = [
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه'
];

function formatPersianNumber(num) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, d => persianDigits[d]);
}

function updateDateTime() {
  const now = new Date();
  
  const weekdayIndex = now.getDay();
  const weekdayPersian = persianWeekdays[weekdayIndex];
  
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tehran'
  };
  
  let datePart = now.toLocaleString('fa-IR', dateOptions);
  
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tehran'
  };
  
  const timePart = now.toLocaleString('fa-IR', timeOptions);
  
  const fullText = `${weekdayPersian} ${datePart} ساعت ${timePart}`;
  
  const dt = document.getElementById('datetime');
  if (dt) {
    dt.textContent = fullText;
    
    dt.animate([
      { transform: 'scale(1)', opacity: 0.9 },
      { transform: 'scale(1.03)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0.9 }
    ], {
      duration: 600,
      easing: 'ease-in-out'
    });
  }
  
  const nowruz2026 = new Date('2026-03-20T00:30:00+03:30');
  const daysToNowruz = Math.ceil((nowruz2026 - now) / (1000 * 60 * 60 * 24));
  
  let countdownEl = document.getElementById('nowruz-countdown');
  if (!countdownEl && daysToNowruz > 0 && daysToNowruz < 60) {
    countdownEl = document.createElement('div');
    countdownEl.id = 'nowruz-countdown';
    countdownEl.style.fontSize = '0.9em';
    countdownEl.style.marginTop = '5px';
    countdownEl.style.opacity = '0.8';
    dt.parentNode.insertBefore(countdownEl, dt.nextSibling);
  }
  
  if (countdownEl) {
    if (daysToNowruz > 0 && daysToNowruz < 60) {
      countdownEl.textContent = `🎉 ${formatPersianNumber(daysToNowruz)} روز تا نوروز ۱۴۰۵`;
      countdownEl.style.display = 'block';
    } else {
      countdownEl.style.display = 'none';
    }
  }
}

setInterval(updateDateTime, 1000);
updateDateTime();

/* =================== ۴. دریافت IP با نمایش و نوتیفیکیشن =================== */
const ipEl = document.getElementById('user-ip');

function showNotification(msg, type = 'info') {
  const n = document.createElement('div');
  n.className = `notification ${type}`;
  n.textContent = msg;
  n.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    padding: 15px 30px;
    border-radius: 12px;
    background: ${getNotificationColor(type)};
    color: white;
    z-index: 2000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: slideIn 0.4s ease-out forwards;
    font-family: 'Vazir', sans-serif;
  `;
  document.body.appendChild(n);
  
  setTimeout(() => {
    n.style.animation = 'slideOut 0.4s ease-in forwards';
    setTimeout(() => n.remove(), 400);
  }, 3500);
}

function getNotificationColor(type) {
  switch (type) {
    case 'success': return '#4CAF50';
    case 'error': return '#f44336';
    case 'info': return '#2196F3';
    default: return '#FFC107';
  }
}

async function fetchIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    ipEl.textContent = data.ip;
    showNotification('✅ IP با موفقیت دریافت شد', 'success');
    fetchWeather(data.ip);
  } catch {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      ipEl.textContent = data.ip;
      showNotification('✅ IP از منبع جایگزین دریافت شد', 'success');
      fetchWeather(data.ip);
    } catch {
      ipEl.textContent = 'خطا در دریافت';
      showNotification('❌ خطا در دریافت IP', 'error');
    }
  }
}

/* =================== ۵. چشمک رمز عبور با انیمیشن =================== */
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.querySelector('#password');

if (togglePassword && passwordInput) {
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.textContent = type === 'password' ? '👁' : '🙈';
    togglePassword.animate([
      { transform: 'translateY(-50%) scale(1)' },
      { transform: 'translateY(-50%) scale(1.3)' },
      { transform: 'translateY(-50%) scale(1)' }
    ], {
      duration: 250,
      easing: 'ease-in-out'
    });
  });
  
  passwordInput.addEventListener('copy', e => e.preventDefault());
  passwordInput.addEventListener('cut', e => e.preventDefault());
}

/* =================== ۶. تغییر تم با ripple =================== */
const themeToggleBtn = document.getElementById('theme-toggle');

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    themeToggleBtn.appendChild(ripple);
    
    const rect = themeToggleBtn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    setTimeout(() => ripple.remove(), 700);
    
    let current = document.body.getAttribute('data-theme');
    let next;
    
    if (current === 'dark') next = 'light';
    else if (current === 'light') next = 'auto';
    else next = 'dark';
    
    document.body.setAttribute('data-theme', next);
    setThemeWithExpiry(next);
    particles.forEach(p => p.color = getThemeColor());
    
    showNotification(`تم به ${next === 'dark' ? 'تاریک' : next === 'light' ? 'روشن' : 'خودکار'} تغییر کرد`, 'success');
  });
}

/* =================== ۷. کارت شناور با افکت 3D =================== */
const card = document.querySelector('.login-box');

if (card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = (y - cy) / cy * 18;
    const ry = (cx - x) / cx * 18;
    
    card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
    card.style.boxShadow = `0 ${Math.abs(rx * 2)}px ${Math.abs(ry * 3)}px rgba(0,0,0,0.3)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
    card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
  });
}

/* =================== ۸. محافظت کلیک راست =================== */
document.addEventListener('contextmenu', e => {
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    showNotification('ℹ️ کلیک راست غیرفعال است', 'info');
  }
});

/* =================== ۹. Drag & Drop با پیش‌نمایش =================== */
if (card) {
  card.addEventListener('dragover', e => {
    e.preventDefault();
    card.style.borderColor = 'var(--accent)';
    card.style.boxShadow = '0 0 20px var(--accent)';
  });
  
  card.addEventListener('dragleave', () => {
    card.style.borderColor = 'var(--border)';
    card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
  });
  
  card.addEventListener('drop', e => {
    e.preventDefault();
    card.style.borderColor = 'var(--border)';
    card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    
    const files = e.dataTransfer.files;
    if (files.length) {
      showNotification(`📁 ${files.length} فایل دریافت شد: ${files[0].name}`, 'success');
      
      if (files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          const preview = document.createElement('div');
          preview.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 10px;
            border-radius: 10px;
            box-shadow: 0 5px 30px rgba(0,0,0,0.3);
            z-index: 3000;
          `;
          
          const img = document.createElement('img');
          img.src = ev.target.result;
          img.style.maxWidth = '300px';
          img.style.maxHeight = '300px';
          img.style.borderRadius = '5px';
          
          preview.appendChild(img);
          document.body.appendChild(preview);
          
          setTimeout(() => preview.remove(), 3000);
        };
        reader.readAsDataURL(files[0]);
      }
    }
  });
}

/* =================== ۱۰. ذخیره آمار ذرات =================== */
window.addEventListener('beforeunload', () => {
  const backup = particles.slice(0, 30).map(p => ({
    x: p.x, y: p.y, speedX: p.speedX, speedY: p.speedY, 
    size: p.size, color: p.color, glow: p.glow
  }));
  localStorage.setItem('particles-backup', JSON.stringify(backup));
});

/* =================== ۱۱. آب و هوا بر اساس IP =================== */
let weatherEl = document.getElementById('weather');
if (!weatherEl && card) {
  weatherEl = document.createElement('div');
  weatherEl.id = 'weather';
  weatherEl.style.marginTop = '15px';
  weatherEl.style.fontSize = '0.9em';
  weatherEl.style.opacity = '0.8';
  card.appendChild(weatherEl);
}

async function fetchWeather(ip) {
  if (!weatherEl) return;
  
  try {
    weatherEl.textContent = '🔄 دریافت اطلاعات آب و هوا...';
    
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=${ip}`);
    const data = await res.json();
    
    if (data.current) {
      const condition = data.current.condition.text;
      const temp = data.current.temp_c;
      const icon = data.current.condition.icon;
      
      weatherEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center;">
          <img src="https:${icon}" style="width: 30px; height: 30px;">
          <span>${condition} - ${temp}°C</span>
        </div>
      `;
      showNotification('🌤️ آب و هوا دریافت شد', 'success');
    } else {
      weatherEl.textContent = '⏰ سرویس آب و هوا موقتاً در دسترس نیست';
    }
  } catch {
    weatherEl.textContent = '⏰ سرویس آب و هوا موقتاً در دسترس نیست';
    showNotification('❌ خطا در دریافت آب و هوا', 'error');
  }
}

/* =================== ۱۲. موسیقی پس‌زمینه =================== */
const audio = new Audio();
audio.loop = true;
audio.volume = 0.2;

let musicToggle = document.getElementById('music-toggle');
if (!musicToggle) {
  musicToggle = document.createElement('button');
  musicToggle.id = 'music-toggle';
  musicToggle.textContent = '🎵';
  musicToggle.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: transform 0.3s;
  `;
  document.body.appendChild(musicToggle);
}

musicToggle.addEventListener('mouseenter', () => {
  musicToggle.style.transform = 'scale(1.1)';
});

musicToggle.addEventListener('mouseleave', () => {
  musicToggle.style.transform = 'scale(1)';
});

musicToggle.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().catch(() => {
      showNotification('🔇 برای پخش موسیقی، ابتدا فایل موسیقی را تنظیم کنید', 'info');
    });
    musicToggle.textContent = '🔊';
    showNotification('🎶 موسیقی پخش شد', 'success');
  } else {
    audio.pause();
    musicToggle.textContent = '🎵';
    showNotification('🔇 موسیقی متوقف شد', 'info');
  }
});

/* =================== ۱۳. لاگین با اعتبارسنجی =================== */
const loginForm = document.querySelector('form');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const username = document.querySelector('#username')?.value || '';
    const password = passwordInput?.value || '';
    
    if (username && password) {
      if (username === 'admin' && password === '123456') {
        showNotification('✅ ورود موفق! خوش آمدید', 'success');
        
        loginForm.reset();
        
        particles.forEach(p => {
          p.color = 'rgba(255,215,0,0.8)';
          p.glow = 1;
        });
      } else {
        showNotification('❌ نام کاربری یا رمز عبور اشتباه است', 'error');
        
        if (passwordInput) {
          passwordInput.style.borderColor = '#f44336';
          setTimeout(() => passwordInput.style.borderColor = '', 1000);
        }
      }
    } else {
      showNotification('⚠️ لطفاً نام کاربری و رمز عبور را وارد کنید', 'info');
    }
  });
}

/* =================== ۱۴. اضافه کردن انیمیشن‌های CSS =================== */
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.7s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to { transform: scale(20); opacity: 0; }
  }
  
  #datetime {
    transition: all 0.3s ease;
    direction: rtl;
    font-family: 'Vazir', sans-serif;
    text-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  
  #nowruz-countdown {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

document.head.appendChild(style);

/* =================== ۱۵. شروع اولیه =================== */
fetchIP();

console.log('🚀 پروژه نسخه نهایی ۵.۰ | تمام ویژگی‌ها فعال شدند');
console.log('📅 تاریخ امروز:', new Date().toLocaleString('fa-IR'));
