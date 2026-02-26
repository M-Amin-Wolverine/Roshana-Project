// music-player.js
import WaveSurfer from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/wavesurfer.esm.js';

let wavesurfer = null;

const playerContainer = document.getElementById('musicPlayerContainer');
const toggleBtn = document.getElementById('musicToggleBtn');
const closeBtn = document.getElementById('musicClose');
const playPauseBtn = document.getElementById('musicPlayPause');
const playPath = document.getElementById('playPath');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeControl = document.getElementById('volumeControl');
const muteBtn = document.getElementById('muteBtn');
const volumeIcon = document.getElementById('volumeIcon');

const audioUrl = 'https://dl.musicdel.ir/Music/1400/05/naser_chashmazar_barane_eshghe.mp3'; // یا از CONFIG اگر بعداً ادغام شد

function formatTime(seconds) {
  if (!seconds) return '00:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function initWaveSurfer() {
  if (wavesurfer) return;

  wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#888cf8',
    progressColor: '#5060ff',
    cursorColor: '#ffffff',
    barWidth: 3,
    barGap: 2,
    height: 48,
    normalize: true,
    backend: 'WebAudio',
    barRadius: 4,
  });

  wavesurfer.load(audioUrl);

  wavesurfer.on('ready', () => {
    durationEl.textContent = formatTime(wavesurfer.getDuration());
    if (volumeControl) volumeControl.value = wavesurfer.getVolume() || 0.5;
  });

  wavesurfer.on('audioprocess', () => {
    currentTimeEl.textContent = formatTime(wavesurfer.getCurrentTime());
  });

  wavesurfer.on('play', () => {
    playPath.setAttribute('d', 'M6,19H10V5H6V19M14,5V19H18V5H14Z');
  });

  wavesurfer.on('pause', () => {
    playPath.setAttribute('d', 'M8,5.14V19.14L19,12.14L8,5.14Z');
  });

  wavesurfer.on('finish', () => {
    playPath.setAttribute('d', 'M8,5.14V19.14L19,12.14L8,5.14Z');
  });
}

// اتصال دکمه‌ها
toggleBtn?.addEventListener('click', () => {
  playerContainer.classList.add('active');
  initWaveSurfer();
});

closeBtn?.addEventListener('click', () => {
  playerContainer.classList.remove('active');
  wavesurfer?.pause();
});

playPauseBtn?.addEventListener('click', () => {
  if (!wavesurfer) initWaveSurfer();
  wavesurfer?.playPause();
});

volumeControl?.addEventListener('input', (e) => {
  wavesurfer?.setVolume(parseFloat(e.target.value));
});

muteBtn?.addEventListener('click', () => {
  if (!wavesurfer) return;
  const isMuted = wavesurfer.getMuted();
  wavesurfer.setMuted(!isMuted);

  if (!isMuted) {
    volumeIcon.innerHTML = '<path fill="currentColor" d="M3,9V15H7L12,20V4L7,9H3M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.03C15.5,15.29 16.5,13.77 16.5,12Z" />';
  } else {
    volumeIcon.innerHTML = '<path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.07,19.86 21,16.28 21,12C21,7.72 18.07,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.03C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />';
  }
});
