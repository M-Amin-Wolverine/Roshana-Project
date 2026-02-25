// ۱. تم روز/شب
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// ۲. ذرات نور
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.8 + 0.6;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.fillStyle = 'rgba(0, 212, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 120; i++) particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

// ۳. ساعت و تاریخ شمسی + IP
function updateDateTime() {
  const now = new Date();
  const farsi = now.toLocaleString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  document.getElementById('datetime').textContent = farsi;
}

setInterval(updateDateTime, 1000);
updateDateTime();

fetch('https://api.ipify.org?format=json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('user-ip').textContent = `IP شما: ${data.ip}`;
  })
  .catch(() => {
    document.getElementById('user-ip').textContent = 'IP: در دسترس نیست';
  });

// ۴. چشمک رمز عبور
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.querySelector('#password');

togglePassword.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  togglePassword.textContent = type === 'password' ? '👁' : '🙈';
});
