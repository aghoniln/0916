// Jack Tan Spongebob Personal Page & Sudoku Game Engine

document.addEventListener('DOMContentLoaded', () => {
    // Theme State
    let currentTheme = localStorage.getItem('spongebob-theme') || 'spongebob';
    document.documentElement.setAttribute('data-theme', currentTheme);

    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (currentTheme === 'spongebob') currentTheme = 'patrick';
            else if (currentTheme === 'patrick') currentTheme = 'deepsea';
            else currentTheme = 'spongebob';

            document.documentElement.setAttribute('data-theme', currentTheme);
            localStorage.setItem('spongebob-theme', currentTheme);
            updateThemeLabel();
        });
    }

    function updateThemeLabel() {
        const label = document.getElementById('themeLabel');
        if (!label) return;
        if (currentTheme === 'spongebob') label.textContent = '🧽 經典黃';
        else if (currentTheme === 'patrick') label.textContent = '🌸 派大星粉';
        else label.textContent = '🌊 深海藍';
    }
    updateThemeLabel();

    // ----------------------------------------------------
    // Live Clocks Engine
    // ----------------------------------------------------
    let is24Hour = false;
    const formatToggleBtn = document.getElementById('formatToggle');
    const digitalTimeEl = document.getElementById('digitalTime');
    const digitalDateEl = document.getElementById('digitalDate');
    const tzOffsetEl = document.getElementById('tzOffset');
    const canvas = document.getElementById('analogClock');
    const ctx = canvas ? canvas.getContext('2d') : null;

    if (formatToggleBtn) {
        formatToggleBtn.addEventListener('click', () => {
            is24Hour = !is24Hour;
            formatToggleBtn.textContent = is24Hour ? '24H 制' : '12H 制';
            updateClocks();
        });
    }

    function updateClocks() {
        const now = new Date();

        if (digitalTimeEl) {
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            let ampm = '';

            if (!is24Hour) {
                ampm = hours >= 12 ? ' PM' : ' AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
            }
            const formattedHours = String(hours).padStart(2, '0');
            digitalTimeEl.innerHTML = `${formattedHours}:${minutes}:<span style="font-size:0.65em; opacity:0.8;">${seconds}</span><span style="font-size:0.45em; margin-left:6px;">${ampm}</span>`;
        }

        if (digitalDateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            digitalDateEl.textContent = now.toLocaleDateString('zh-TW', options);
        }

        if (tzOffsetEl) {
            const offset = -now.getTimezoneOffset() / 60;
            const sign = offset >= 0 ? '+' : '';
            tzOffsetEl.textContent = `GMT${sign}${offset}`;
        }

        if (canvas && ctx) drawAnalogClock(now);
        updateWorldClocks(now);
    }

    function drawAnalogClock(now) {
        const size = canvas.width;
        const center = size / 2;
        const radius = center - 10;

        ctx.clearRect(0, 0, size, size);

        // Clock Face Outer Border
        ctx.beginPath();
        ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Dial Marks
        for (let i = 0; i < 60; i++) {
            const angle = (i * Math.PI) / 30;
            const isHourMark = i % 5 === 0;
            const markLength = isHourMark ? 12 : 5;

            const x1 = center + (radius - markLength) * Math.sin(angle);
            const y1 = center - (radius - markLength) * Math.cos(angle);
            const x2 = center + (radius - 2) * Math.sin(angle);
            const y2 = center - (radius - 2) * Math.cos(angle);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = isHourMark ? '#0284c7' : '#94a3b8';
            ctx.lineWidth = isHourMark ? 3 : 1.5;
            ctx.stroke();
        }

        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ms = now.getMilliseconds();

        const smoothSecond = seconds + ms / 1000;
        const smoothMinute = minutes + smoothSecond / 60;
        const smoothHour = hours + smoothMinute / 60;

        drawHand(ctx, center, center, (smoothHour * Math.PI) / 6, radius * 0.5, 6, '#1e293b');
        drawHand(ctx, center, center, (smoothMinute * Math.PI) / 30, radius * 0.72, 4, '#0284c7');
        drawHand(ctx, center, center, (smoothSecond * Math.PI) / 30, radius * 0.85, 2, '#ef4444');

        ctx.beginPath();
        ctx.arc(center, center, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
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
        <div class="world-clock-item">
          <div class="world-city">${city.name}</div>
          <div class="world-time" id="time-${city.name}">--:--</div>
          <div class="world-diff" id="diff-${city.name}">--</div>
        </div>
      `).join('');
        }

        worldCities.forEach(city => {
            const timeEl = document.getElementById(`time-${city.name}`);
            const diffEl = document.getElementById(`diff-${city.name}`);

            if (timeEl) {
                try {
                    const str = now.toLocaleTimeString('en-US', {
                        timeZone: city.zone,
                        hour12: !is24Hour,
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    timeEl.textContent = str;
                } catch (e) { timeEl.textContent = '--:--'; }
            }

            if (diffEl) {
                try {
                    const cityDate = new Date(now.toLocaleString('en-US', { timeZone: city.zone }));
                    const localDate = new Date(now.toLocaleString('en-US'));
                    const diffHours = Math.round((cityDate - localDate) / (1000 * 60 * 60));
                    diffEl.textContent = diffHours === 0 ? '時區相同' : (diffHours > 0 ? `+${diffHours} 小時` : `${diffHours} 小時`);
                } catch (e) { diffEl.textContent = ''; }
            }
        });
    }

    updateClocks();
    setInterval(updateClocks, 100);

    // Tab Switching
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

    // ----------------------------------------------------
    // 🧩 數獨遊戲 (Sudoku Game Engine)
    // ----------------------------------------------------
    const sudokuPuzzles = {
        easy: {
            puzzle: [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                [6, 0, 0, 1, 9, 5, 0, 0, 0],
                [0, 9, 8, 0, 0, 0, 0, 6, 0],
                [8, 0, 0, 0, 6, 0, 0, 0, 3],
                [4, 0, 0, 8, 0, 3, 0, 0, 1],
                [7, 0, 0, 0, 2, 0, 0, 0, 6],
                [0, 6, 0, 0, 0, 0, 2, 8, 0],
                [0, 0, 0, 4, 1, 9, 0, 0, 5],
                [0, 0, 0, 0, 8, 0, 0, 7, 9]
            ],
            solution: [
                [5, 3, 4, 6, 7, 8, 9, 1, 2],
                [6, 7, 2, 1, 9, 5, 3, 4, 8],
                [1, 9, 8, 3, 4, 2, 5, 6, 7],
                [8, 5, 9, 7, 6, 1, 4, 2, 3],
                [4, 2, 6, 8, 5, 3, 7, 9, 1],
                [7, 1, 3, 9, 2, 4, 8, 5, 6],
                [9, 6, 1, 5, 3, 7, 2, 8, 4],
                [2, 8, 7, 4, 1, 9, 6, 3, 5],
                [3, 4, 5, 2, 8, 6, 1, 7, 9]
            ]
        },
        medium: {
            puzzle: [
                [0, 0, 0, 6, 0, 0, 4, 0, 0],
                [7, 0, 0, 0, 0, 3, 6, 0, 0],
                [0, 0, 0, 0, 9, 1, 0, 8, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 5, 0, 1, 8, 0, 0, 0, 3],
                [0, 0, 0, 3, 0, 6, 0, 4, 5],
                [0, 4, 0, 2, 0, 0, 0, 6, 0],
                [9, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 0, 1, 0, 0]
            ],
            solution: [
                [5, 8, 1, 6, 7, 2, 4, 3, 9],
                [7, 9, 2, 8, 4, 3, 6, 5, 1],
                [3, 6, 4, 5, 9, 1, 7, 8, 2],
                [4, 3, 8, 9, 5, 7, 2, 1, 6],
                [6, 5, 9, 1, 8, 4, 2, 7, 3],
                [2, 1, 7, 3, 2, 6, 8, 4, 5],
                [1, 4, 5, 2, 3, 8, 9, 6, 7],
                [9, 7, 3, 4, 1, 5, 8, 2, 6],
                [8, 2, 6, 7, 6, 9, 1, 9, 4]
            ]
        },
        hard: {
            puzzle: [
                [0, 2, 0, 6, 0, 8, 0, 0, 0],
                [5, 8, 0, 0, 0, 9, 7, 0, 0],
                [0, 0, 0, 0, 4, 0, 0, 0, 0],
                [3, 7, 0, 0, 0, 0, 5, 0, 0],
                [6, 0, 0, 0, 0, 0, 0, 0, 4],
                [0, 0, 8, 0, 0, 0, 0, 1, 3],
                [0, 0, 0, 0, 2, 0, 0, 0, 0],
                [0, 0, 9, 8, 0, 0, 0, 3, 6],
                [0, 0, 0, 3, 0, 6, 0, 9, 0]
            ],
            solution: [
                [1, 2, 4, 6, 7, 8, 3, 5, 9],
                [5, 8, 3, 1, 9, 9, 7, 4, 2],
                [9, 6, 7, 2, 4, 5, 1, 8, 3],
                [3, 7, 1, 4, 8, 2, 5, 6, 9],
                [6, 9, 5, 7, 1, 3, 8, 2, 4],
                [2, 4, 8, 9, 6, 5, 8, 1, 3],
                [8, 3, 6, 5, 2, 1, 9, 7, 4],
                [4, 1, 9, 8, 5, 7, 2, 3, 6],
                [7, 5, 2, 3, 9, 6, 4, 9, 1]
            ]
        }
    };

    let currentDiff = 'easy';
    let selectedRow = -1;
    let selectedCol = -1;
    let currentBoard = [];
    let givenMask = [];
    let solutionBoard = [];
    let mistakes = 0;
    let sudokuTimerSeconds = 0;
    let sudokuTimerInterval = null;

    const sudokuBoardEl = document.getElementById('sudokuBoard');
    const mistakesEl = document.getElementById('sudokuMistakes');
    const timerEl = document.getElementById('sudokuTimer');

    function initSudoku(difficulty = 'easy') {
        currentDiff = difficulty;
        mistakes = 0;
        sudokuTimerSeconds = 0;
        selectedRow = -1;
        selectedCol = -1;

        if (mistakesEl) mistakesEl.textContent = `錯誤: 0/3`;
        if (timerEl) timerEl.textContent = `時間: 00:00`;

        clearInterval(sudokuTimerInterval);
        sudokuTimerInterval = setInterval(() => {
            sudokuTimerSeconds++;
            const m = Math.floor(sudokuTimerSeconds / 60);
            const s = sudokuTimerSeconds % 60;
            if (timerEl) timerEl.textContent = `時間: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }, 1000);

        const puzzleData = sudokuPuzzles[difficulty] || sudokuPuzzles.easy;
        currentBoard = puzzleData.puzzle.map(row => [...row]);
        solutionBoard = puzzleData.solution.map(row => [...row]);
        givenMask = puzzleData.puzzle.map(row => row.map(val => val !== 0));

        renderSudokuBoard();
    }

    function renderSudokuBoard() {
        if (!sudokuBoardEl) return;
        sudokuBoardEl.innerHTML = '';

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const val = currentBoard[r][c];
                if (val !== 0) cell.textContent = val;

                if (givenMask[r][c]) {
                    cell.classList.add('given');
                } else if (val !== 0) {
                    cell.classList.add('user-input');
                }

                if (r === selectedRow && c === selectedCol) {
                    cell.classList.add('selected');
                } else if (selectedRow !== -1 && (r === selectedRow || c === selectedCol ||
                    (Math.floor(r / 3) === Math.floor(selectedRow / 3) && Math.floor(c / 3) === Math.floor(selectedCol / 3)))) {
                    cell.classList.add('highlighted');
                }

                cell.addEventListener('click', () => {
                    selectedRow = r;
                    selectedCol = c;
                    renderSudokuBoard();
                });

                sudokuBoardEl.appendChild(cell);
            }
        }
    }

    function handleSudokuInput(num) {
        if (selectedRow === -1 || selectedCol === -1) return;
        if (givenMask[selectedRow][selectedCol]) return; // locked initial cell

        const targetVal = solutionBoard[selectedRow][selectedCol];

        if (num === 0) {
            // Erase
            currentBoard[selectedRow][selectedCol] = 0;
        } else {
            currentBoard[selectedRow][selectedCol] = num;
            if (num !== targetVal) {
                mistakes++;
                if (mistakesEl) mistakesEl.textContent = `錯誤: ${mistakes}/3`;
                if (mistakes >= 3) {
                    alert('⚠️ 錯誤達到 3 次！重新開始遊戲！');
                    initSudoku(currentDiff);
                    return;
                }
            } else {
                checkSudokuWin();
            }
        }
        renderSudokuBoard();
    }

    function checkSudokuWin() {
        let win = true;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (currentBoard[r][c] !== solutionBoard[r][c]) {
                    win = false;
                    break;
                }
            }
        }
        if (win) {
            clearInterval(sudokuTimerInterval);
            alert('🎉 恭喜！你成功完成了數獨遊戲！ (You Solved the Sudoku!)');
        }
    }

    // Bind Numpad Buttons
    const numpadBtns = document.querySelectorAll('.btn-num');
    numpadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.dataset.val);
            handleSudokuInput(val);
        });
    });

    // Difficulty Switchers
    const diffBtns = document.querySelectorAll('.btn-diff');
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            initSudoku(btn.dataset.diff);
        });
    });

    // Erase & Hint Controls
    const btnErase = document.getElementById('sudokuErase');
    const btnHint = document.getElementById('sudokuHint');

    if (btnErase) {
        btnErase.addEventListener('click', () => handleSudokuInput(0));
    }

    if (btnHint) {
        btnHint.addEventListener('click', () => {
            if (selectedRow !== -1 && selectedCol !== -1 && !givenMask[selectedRow][selectedCol]) {
                handleSudokuInput(solutionBoard[selectedRow][selectedCol]);
            }
        });
    }

    // Keyboard input listener for Sudoku
    document.addEventListener('keydown', (e) => {
        if (selectedRow === -1 || selectedCol === -1) return;
        if (e.key >= '1' && e.key <= '9') {
            handleSudokuInput(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            handleSudokuInput(0);
        }
    });

    // Initialize Sudoku Game
    initSudoku('easy');
});
