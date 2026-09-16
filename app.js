// Jack Tan Personal Page Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // State
  let is24Hour = false;
  let currentTheme = localStorage.getItem('theme') || 'dark';

  // DOM Elements
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const formatToggleBtn = document.getElementById('formatToggle');
  
  const digitalTimeEl = document.getElementById('digitalTime');
  const digitalDateEl = document.getElementById('digitalDate');
  const tzOffsetEl = document.getElementById('tzOffset');

  const canvas = document.getElementById('analogClock');
  const ctx = canvas ? canvas.getContext('2d') : null;

  // Initialize Theme
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('theme', currentTheme);
      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    if (themeIcon) {
      themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  // Format Toggle
  if (formatToggleBtn) {
    formatToggleBtn.addEventListener('click', () => {
      is24Hour = !is24Hour;
      formatToggleBtn.textContent = is24Hour ? '24H Format' : '12H Format';
      updateClocks();
    });
  }

  // Update Clocks Engine
  function updateClocks() {
    const now = new Date();

    // 1. Digital Clock
    if (digitalTimeEl) {
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      let ampm = '';

      if (!is24Hour) {
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // hour 0 is 12
      }
      const formattedHours = String(hours).padStart(2, '0');
      digitalTimeEl.innerHTML = `${formattedHours}:${minutes}:<span style="font-size:0.6em; opacity:0.8;">${seconds}</span><span style="font-size:0.4em; opacity:0.7; margin-left:8px;">${ampm}</span>`;
    }

    // Date
    if (digitalDateEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      digitalDateEl.textContent = now.toLocaleDateString('en-US', options);
    }

    // Timezone Offset
    if (tzOffsetEl) {
      const offset = -now.getTimezoneOffset() / 60;
      const sign = offset >= 0 ? '+' : '';
      tzOffsetEl.textContent = `GMT${sign}${offset}`;
    }

    // 2. Analog Clock
    if (canvas && ctx) {
      drawAnalogClock(now);
    }

    // 3. World Clocks
    updateWorldClocks(now);
  }

  // Analog Canvas Clock Renderer
  function drawAnalogClock(now) {
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    // Clock Face Outer Border Glow
    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.2)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Clock Background
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dial Marks
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30;
      const isHourMark = i % 5 === 0;
      const markLength = isHourMark ? 14 : 6;
      
      const x1 = center + (radius - markLength) * Math.sin(angle);
      const y1 = center - (radius - markLength) * Math.cos(angle);
      const x2 = center + (radius - 2) * Math.sin(angle);
      const y2 = center - (radius - 2) * Math.cos(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isHourMark 
        ? (isDark ? '#38bdf8' : '#0284c7') 
        : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');
      ctx.lineWidth = isHourMark ? 3 : 1.5;
      ctx.stroke();
    }

    // Time calculations
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();

    const smoothSecond = seconds + ms / 1000;
    const smoothMinute = minutes + smoothSecond / 60;
    const smoothHour = hours + smoothMinute / 60;

    // Hour Hand
    drawHand(ctx, center, center, (smoothHour * Math.PI) / 6, radius * 0.5, 6, isDark ? '#f8fafc' : '#1e293b');
    // Minute Hand
    drawHand(ctx, center, center, (smoothMinute * Math.PI) / 30, radius * 0.72, 4, isDark ? '#38bdf8' : '#0284c7');
    // Second Hand
    drawHand(ctx, center, center, (smoothSecond * Math.PI) / 30, radius * 0.85, 2, '#f43f5e');

    // Center Pivot
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(center, center, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  function drawHand(ctx, cx, cy, angle, length, width, color) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + length * Math.sin(angle), cy - length * Math.cos(angle));
    ctx.stroke();
    ctx.restore();
  }

  // World Clocks Data
  const worldCities = [
    { name: 'Tokyo', zone: 'Asia/Tokyo' },
    { name: 'London', zone: 'Europe/London' },
    { name: 'New York', zone: 'America/New_York' },
    { name: 'Singapore', zone: 'Asia/Singapore' },
    { name: 'Sydney', zone: 'Australia/Sydney' },
    { name: 'Paris', zone: 'Europe/Paris' }
  ];

  function updateWorldClocks(now) {
    const grid = document.getElementById('worldClockGrid');
    if (!grid) return;

    if (grid.children.length === 0) {
      grid.innerHTML = worldCities.map(city => `
        <div class="world-clock-item" id="wc-${city.name.replace(/\s+/g, '')}">
          <div class="world-city">${city.name}</div>
          <div class="world-time" id="time-${city.name.replace(/\s+/g, '')}">--:--</div>
          <div class="world-diff" id="diff-${city.name.replace(/\s+/g, '')}">--</div>
        </div>
      `).join('');
    }

    worldCities.forEach(city => {
      const timeEl = document.getElementById(`time-${city.name.replace(/\s+/g, '')}`);
      const diffEl = document.getElementById(`diff-${city.name.replace(/\s+/g, '')}`);

      if (timeEl) {
        try {
          const cityTimeStr = now.toLocaleTimeString('en-US', {
            timeZone: city.zone,
            hour12: !is24Hour,
            hour: '2-digit',
            minute: '2-digit'
          });
          timeEl.textContent = cityTimeStr;
        } catch (e) {
          timeEl.textContent = '--:--';
        }
      }

      if (diffEl) {
        try {
          const cityDate = new Date(now.toLocaleString('en-US', { timeZone: city.zone }));
          const localDate = new Date(now.toLocaleString('en-US'));
          const diffHours = Math.round((cityDate - localDate) / (1000 * 60 * 60));
          const diffText = diffHours === 0 ? 'Same time' : (diffHours > 0 ? `+${diffHours} hrs` : `${diffHours} hrs`);
          diffEl.textContent = diffText;
        } catch (e) {
          diffEl.textContent = '';
        }
      }
    });
  }

  // Initial call and set 100ms interval for smooth second hand analog clock
  updateClocks();
  setInterval(updateClocks, 100);

  // Tab Navigation
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(target);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Stopwatch Logic
  let swInterval = null;
  let swStartTime = 0;
  let swElapsed = 0;
  let swRunning = false;

  const swDisplay = document.getElementById('swDisplay');
  const swStartBtn = document.getElementById('swStart');
  const swResetBtn = document.getElementById('swReset');

  if (swStartBtn && swDisplay) {
    swStartBtn.addEventListener('click', () => {
      if (!swRunning) {
        swRunning = true;
        swStartTime = Date.now() - swElapsed;
        swInterval = setInterval(updateStopwatch, 10);
        swStartBtn.textContent = 'Pause';
        swStartBtn.style.background = '#f43f5e';
      } else {
        swRunning = false;
        clearInterval(swInterval);
        swStartBtn.textContent = 'Start';
        swStartBtn.style.background = 'var(--accent-primary)';
      }
    });

    if (swResetBtn) {
      swResetBtn.addEventListener('click', () => {
        swRunning = false;
        clearInterval(swInterval);
        swElapsed = 0;
        swDisplay.textContent = '00:00.00';
        swStartBtn.textContent = 'Start';
        swStartBtn.style.background = 'var(--accent-primary)';
      });
    }
  }

  function updateStopwatch() {
    swElapsed = Date.now() - swStartTime;
    const mins = Math.floor(swElapsed / 60000);
    const secs = Math.floor((swElapsed % 60000) / 1000);
    const ms = Math.floor((swElapsed % 1000) / 10);

    swDisplay.textContent = 
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  // Focus Timer Logic (Pomodoro 25 min)
  let timerInterval = null;
  let timerSeconds = 25 * 60;
  let timerRunning = false;

  const timerDisplay = document.getElementById('timerDisplay');
  const timerStartBtn = document.getElementById('timerStart');
  const timerResetBtn = document.getElementById('timerReset');

  if (timerStartBtn && timerDisplay) {
    timerStartBtn.addEventListener('click', () => {
      if (!timerRunning) {
        timerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
        timerStartBtn.textContent = 'Pause';
        timerStartBtn.style.background = '#f43f5e';
      } else {
        timerRunning = false;
        clearInterval(timerInterval);
        timerStartBtn.textContent = 'Start Focus';
        timerStartBtn.style.background = 'var(--accent-primary)';
      }
    });

    if (timerResetBtn) {
      timerResetBtn.addEventListener('click', () => {
        timerRunning = false;
        clearInterval(timerInterval);
        timerSeconds = 25 * 60;
        renderTimerDisplay();
        timerStartBtn.textContent = 'Start Focus';
        timerStartBtn.style.background = 'var(--accent-primary)';
      });
    }
  }

  function updateTimer() {
    if (timerSeconds > 0) {
      timerSeconds--;
      renderTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerRunning = false;
      alert('Focus session complete! Take a break.');
    }
  }

  function renderTimerDisplay() {
    if (!timerDisplay) return;
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
});
