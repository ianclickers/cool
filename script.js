let clicks = 0;
let rebirths = 0;
let world = 1;
let clickers = [0, 0, 0];
let clickerNames = [["Clicker", "Auto Clicker", "Super Clicker"], ["Ian Alien", "Ian Spaceship", "Ian UFO"]];
let clickerBasePrices = [10, 100, 1000];
let lastActive = Date.now();
let user = null;
let storageKey = "ian_clicker_guest";
let buyAmount = 1;

// Load state
function loadGame() {
  const data = JSON.parse(localStorage.getItem(storageKey));
  if (data) {
    clicks = data.clicks || 0;
    rebirths = data.rebirths || 0;
    world = data.world || 1;
    clickers = data.clickers || [0, 0, 0];
    lastActive = data.lastActive || Date.now();
    showOfflineEarnings();
  }
  updateDisplay();
}

// Save state
function saveGame() {
  const data = {
    clicks,
    rebirths,
    world,
    clickers,
    lastActive: Date.now()
  };
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function showOfflineEarnings() {
  const now = Date.now();
  const seconds = Math.floor((now - lastActive) / 1000);
  const rate = getClickPerSecond();
  const earned = seconds * rate;
  clicks += earned;
  if (earned > 0) {
    const popup = document.getElementById("offline-popup");
    popup.textContent = `You earned ${earned.toFixed(0)} clicks while offline.`;
    popup.classList.remove("hidden");
    setTimeout(() => popup.classList.add("hidden"), 4000);
  }
}

function getClickPerSecond() {
  let baseRate = clickers[0] * 2 + clickers[1] * 15 + clickers[2] * 30;
  return baseRate * (1 + rebirths * 0.05);
}

function updateDisplay() {
  document.getElementById("clicks").textContent = Math.floor(clicks);
  document.getElementById("rebirths").textContent = rebirths;
  document.getElementById("world").textContent = world;
  updateClickers();
  saveGame();
}

function updateClickers() {
  const container = document.getElementById("clickerButtons");
  container.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const price = clickerBasePrices[i] * Math.pow(2, clickers[i]);
    const btn = document.createElement("button");
    btn.className = "clicker-button";
    const name = clickerNames[world - 1][i];
    const owned = clickers[i];
    btn.textContent = `${name} (${owned}) - ${price * buyAmount} clicks`;
    btn.disabled = clicks < price * buyAmount;
    btn.onclick = () => buyClicker(i);
    container.appendChild(btn);
  }
}

function buyClicker(index) {
  const base = clickerBasePrices[index];
  let totalCost = 0;
  for (let i = 0; i < buyAmount; i++) {
    totalCost += base * Math.pow(2, clickers[index] + i);
  }
  if (clicks >= totalCost) {
    clicks -= totalCost;
    clickers[index] += buyAmount;
    updateDisplay();
  }
}

document.getElementById("ian").addEventListener("click", () => {
  clicks += 1 + rebirths * 0.1;
  
  updateDisplay();
});

document.getElementById("buyAmount").addEventListener("change", (e) => {
  buyAmount = parseInt(e.target.value);
  updateClickers();
});

function rebirth() {
  if (clicks >= 100000) {
    rebirths += 1;
    clicks = 0;
    clickers = [0, 0, 0];
    if (clicks >= 1000000 && world === 1) {
      world = 2;
      document.getElementById("planet").src = "world2.png";
    }
    updateDisplay();
  }
}

setInterval(() => {
  clicks += getClickPerSecond();
  updateDisplay();
}, 1000);

setInterval(saveGame, 5000);

// Basic Login System (No server backend â localStorage only)
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Enter username and password");

  const saved = JSON.parse(localStorage.getItem("ian_users")) || {};
  if (saved[username] && saved[username].password !== password) {
    return alert("Wrong password");
  }
  saved[username] = {
    password,
    data: saved[username]?.data || {}
  };
  user = username;
  storageKey = "ian_clicker_" + username;
  localStorage.setItem("ian_users", JSON.stringify(saved));
  closeLogin();
  document.getElementById("username-display").textContent = user;
  document.getElementById("logout-btn").classList.remove("hidden");
  loadGame();
}

function logout() {
  user = null;
  storageKey = "ian_clicker_guest";
  document.getElementById("username-display").textContent = "Log In / Sign up";
  document.getElementById("logout-btn").classList.add("hidden");
  loadGame();
}

function toggleLogin() {
  if (!user) openLogin();
}

function openLogin() {
  document.getElementById("login-modal").classList.remove("hidden");
}

function closeLogin() {
  document.getElementById("login-modal").classList.add("hidden");
}

function showLeaderboard() {
  const saved = JSON.parse(localStorage.getItem("ian_users")) || {};
  const scores = Object.entries(saved).map(([name, val]) => ({
    name,
    clicks: val.data?.clicks || 0
  }));
  scores.sort((a, b) => b.clicks - a.clicks);
  const place = scores.findIndex(s => s.name === user);
  alert("Leaderboard Top 10:\n" + scores.slice(0, 10).map((s, i) => `${i + 1}. ${s.name}: ${s.clicks}`).join("\n") +
    (place >= 10 ? `\n\nYou are #${place + 1}: ${user} - ${clicks}` : ""));
}

window.onload = loadGame;

