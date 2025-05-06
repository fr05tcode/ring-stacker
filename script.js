
const towers = document.querySelectorAll('.tower');
const moveCountDisplay = document.getElementById('moveCount');
const minMovesDisplay = document.getElementById('minMoves');
const timerDisplay = document.getElementById('timer');
const diskCountSelect = document.getElementById('diskCount');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const modeToggle = document.getElementById('modeToggle');
const leaderboardList = document.getElementById('leaderboard');
const winSound = document.getElementById('winSound');
const status = document.getElementById('status');

let moveCount = 0;
let timer = 0;
let timerInterval;
let draggedDisk = null;
let numDisks = 3;
let hasStarted = false;

function getDiskColor(size) {
  const colors = [
    '#00ffff', // neon cyan
    '#ff00ff', // neon magenta
    '#a020f0', // neon purple
    '#39ff14', // neon green
    '#ff5f1f', // neon orange
    '#ffd700'  // neon gold
  ];
  return colors[(size - 1) % colors.length];
}

function setupGame() {
  towers.forEach(t => t.innerHTML = '');
  numDisks = parseInt(diskCountSelect.value);
  const minMoves = Math.pow(2, numDisks) - 1;
  minMovesDisplay.textContent = minMoves;
  moveCount = 0;
  moveCountDisplay.textContent = moveCount;
  status.textContent = '';
  status.style.opacity = '0';
  clearInterval(timerInterval);
  timer = 0;
  timerDisplay.textContent = '0.0';
  hasStarted = false;

  resetBtn.classList.remove('visible');
  playAgainBtn.classList.remove('visible');

  for (let size = numDisks; size >= 1; size--) {
    const disk = document.createElement('div');
    disk.classList.add('disk');
    disk.setAttribute('draggable', true);
    disk.dataset.size = size;
    disk.style.width = (30 + size * 20) + 'px';
    disk.style.backgroundColor = getDiskColor(size);
    towers[0].appendChild(disk);
  }

  renderLeaderboard(JSON.parse(localStorage.getItem(`hanoi-leaderboard-${numDisks}`)) || []);
}

function startTimer() {
  if (!hasStarted) {
    hasStarted = true;
    timerInterval = setInterval(() => {
      timer += 0.1;
      timerDisplay.textContent = timer.toFixed(1);
    }, 100);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateLeaderboard() {
  const key = `hanoi-leaderboard-${numDisks}`;
  const current = JSON.parse(localStorage.getItem(key)) || [];
  current.push({ time: parseFloat(timer.toFixed(1)), moves: moveCount });
  current.sort((a, b) => a.time - b.time);
  const top5 = current.slice(0, 5);
  localStorage.setItem(key, JSON.stringify(top5));
  renderLeaderboard(top5);
}

function renderLeaderboard(entries) {
  leaderboardList.innerHTML = '';
  entries.forEach((entry, i) => {
    const li = document.createElement('li');
    li.textContent = `#${i + 1}: ${entry.time.toFixed(1)}s, ${entry.moves} moves`;
    leaderboardList.appendChild(li);
  });
}

function checkWin() {
  const tower3 = document.getElementById('tower3');
  if (tower3.childElementCount === numDisks) {
    stopTimer();
    updateLeaderboard();
    launchConfetti();
    winSound.play();
    status.textContent = `🎉 You won in ${moveCount} moves! Time: ${timer.toFixed(1)}s`;
    status.style.opacity = '1';
    resetBtn.classList.remove('visible');
    playAgainBtn.classList.add('visible');
  }
}

function launchConfetti() {
  confetti({ particleCount: 800, angle: 60, spread: 60, origin: { x: 0, y: 1 } });
  confetti({ particleCount: 800, angle: 120, spread: 60, origin: { x: 1, y: 1 } });
  confetti({ particleCount: 800, spread: 70, origin: { x: 0.5, y: 1 } });
}

function isTopDisk(disk) {
  return disk.parentElement.querySelector('.disk:last-child') === disk;
}

towers.forEach(tower => {
  tower.addEventListener('dragstart', e => {
    if (e.target.classList.contains('disk') && isTopDisk(e.target)) {
      draggedDisk = e.target;
    } else {
      e.preventDefault();
    }
  });

  tower.addEventListener('dragover', e => e.preventDefault());

  tower.addEventListener('drop', e => {
    if (!draggedDisk) return;
    const topDisk = tower.querySelector('.disk:last-child');
    if (!topDisk || parseInt(draggedDisk.dataset.size) < parseInt(topDisk.dataset.size)) {
      tower.appendChild(draggedDisk);
      if (moveCount === 0) resetBtn.classList.add('visible');
      moveCount++;
      moveCountDisplay.textContent = moveCount;
      startTimer();
      checkWin();
      status.textContent = '';
      status.style.opacity = '0';
    } else {
      status.textContent = 'Illegal move!';
      status.style.opacity = '1';
      setTimeout(() => status.style.opacity = '0', 2000);
    }
    draggedDisk = null;
  });
});

resetBtn.addEventListener('click', setupGame);
playAgainBtn.addEventListener('click', setupGame);
diskCountSelect.addEventListener('change', setupGame);

modeToggle.addEventListener('change', () => {
  document.body.classList.toggle('light-mode', !modeToggle.checked);
  localStorage.setItem('darkMode', modeToggle.checked ? 'true' : 'false');
});

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'false') {
    modeToggle.checked = false;
    document.body.classList.add('light-mode');
  }
  setupGame();
});
