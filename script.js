
let clicks = 0;
let rebirths = 0;
let clickers = { 'Ian Clicker': 0 };
let world = 1;
let clickerRates = { 'Ian Clicker': 1 };
let clickerPrices = { 'Ian Clicker': 10 };
let lastUpdate = Date.now();
let offlinePopupShown = false;
let currentUser = null;

const clickerNames = {
  1: ['Ian Clicker'],
  2: ['Ian Alien', 'Ian Spaceship', 'Ian UFO']
};

const clickerRateBase = {
  'Ian Clicker': 1,
  'Ian Alien': 2,
  'Ian Spaceship': 15,
  'Ian UFO': 30
};

document.addEventListener("DOMContentLoaded", () => {
  loadGame();
  createClickerButtons();
  document.getElementById("ian").addEventListener("click", clickIan);
  document.getElementById("menu-button").addEventListener("click", toggleMenu);
  window.addEventListener("beforeunload", saveGame);
  setInterval(gameLoop, 100);
});

function clickIan() {
  const ian = document.getElementById("ian");
  ian.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
  clicks++;
  updateDisplay();
}

function gameLoop() {
  const now = Date.now();
  const diff = (now - lastUpdate) / 1000;
  let cps = getTotalCPS();
  clicks += cps * diff;
  lastUpdate = now;
  updateDisplay();
}

function getTotalCPS() {
  return Object.keys(clickers).reduce((sum, name) => {
    return sum + (clickers[name] * clickerRateBase[name] * (1 + rebirths * 0.05));
  }, 0);
}

function updateDisplay() {
  document.getElementById("clicks").textContent = Math.floor(clicks);
  document.getElementById("rebirths").textContent = rebirths;
  document.getElementById("world").textContent = world;
  updatePlanet();
  updateClickerButtons();
}

function createClickerButtons() {
  const container = document.getElementById("clickerButtons");
  container.innerHTML = "";
  clickerNames[world].forEach(name => {
    clickers[name] = 0;
    clickerPrices[name] = 10;
    const btn = document.createElement("button");
    btn.className = "clicker-button";
    btn.id = `buy-${name}`;
    btn.onclick = () => buyClicker(name);
    container.appendChild(btn);
  });
  updateClickerButtons();
}

function updateClickerButtons() {
  clickerNames[world].forEach(name => {
    const btn = document.getElementById(`buy-${name}`);
    const price = clickerPrices[name];
    const amount = parseInt(document.getElementById("buyAmount").value);
    const totalCost = price * amount;
    btn.textContent = `Buy ${name} x${amount} (${totalCost} clicks)`;
    btn.disabled = clicks < totalCost;
  });
}

function buyClicker(name) {
  const amount = parseInt(document.getElementById("buyAmount").value);
  const totalCost = clickerPrices[name] * amount;
  if (clicks >= totalCost) {
    clickers[name] += amount;
    clicks -= totalCost;
    clickerPrices[name] *= 2;
    updateDisplay();
  }
}

function rebirth() {
  if (clicks >= 100000) {
    rebirths++;
    world = 2;
    clicks = 0;
    clickers = {};
    createClickerButtons();
    updateDisplay();
  }
}

function updatePlanet() {
  const planet = document.getElementById("planet");
  planet.src = world === 1 ? "world1.png" : "world2.png";
}

function saveGame() {
  const saveData = {
    clicks,
    rebirths,
    clickers,
    clickerPrices,
    world,
    lastSave: Date.now()
  };
  if (currentUser) {
    localStorage.setItem("ian_clicker_user_" + currentUser, JSON.stringify(saveData));
  } else {
    localStorage.setItem("ian_clicker_guest", JSON.stringify(saveData));
  }
}

function loadGame() {
  let save = localStorage.getItem("ian_clicker_guest");
  if (save) {
    const data = JSON.parse(save);
    clicks = data.clicks || 0;
    rebirths = data.rebirths || 0;
    clickers = data.clickers || {};
    clickerPrices = data.clickerPrices || {};
    world = data.world || 1;
    showOfflinePopup(data.lastSave);
  }
}

function showOfflinePopup(lastSaved) {
  if (offlinePopupShown || !lastSaved) return;
  const now = Date.now();
  const diff = (now - lastSaved) / 1000;
  const earned = Math.floor(getTotalCPS() * diff);
  clicks += earned;
  offlinePopupShown = true;
  const popup = document.getElementById("offline-popup");
  popup.textContent = `While you were away, you earned ${earned} clicks!`;
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("hidden"), 5000);
}

function toggleMenu() {
  const panel = document.getElementById("menu-panel");
  panel.classList.toggle("hidden");
}

function openLogin() {
  document.getElementById("login-modal").classList.remove("hidden");
}

function closeLogin() {
  document.getElementById("login-modal").classList.add("hidden");
}

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if (!user || !pass) return;
  currentUser = user;
  localStorage.setItem("ian_user_" + user, pass);
  saveGame();
  closeLogin();
  alert("Logged in as " + user);
}

function showLeaderboard() {
  const leaderboard = document.getElementById("leaderboard-panel");
  leaderboard.classList.remove("hidden");
  leaderboard.innerHTML = "<h2>Leaderboard (Mock)</h2>";
  const mockUsers = [
    { name: "Alpha", clicks: 200000 },
    { name: "Bravo", clicks: 180000 },
    { name: "Charlie", clicks: 150000 },
    { name: "Delta", clicks: 120000 },
    { name: "Echo", clicks: 100000 },
    { name: "Foxtrot", clicks: 90000 },
    { name: "Golf", clicks: 85000 },
    { name: "Hotel", clicks: 80000 },
    { name: "India", clicks: 75000 },
    { name: "Juliet", clicks: 70000 },
  ];
  mockUsers.forEach((u, i) => {
    leaderboard.innerHTML += `<p><img src="ian.png" style="width:24px;border-radius:50%;"> ${i + 1}. ${u.name} - ${u.clicks}</p>`;
  });
  leaderboard.innerHTML += `<p>Your Rank: ${currentUser || "Guest"} - ${Math.floor(clicks)}</p>`;
}
