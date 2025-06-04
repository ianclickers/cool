let data = {
  clicks: 0,
  rebirths: { world1: 0, world2: 0 },
  upgrades: {
    world1: {
      cursor: { level: 0, baseCost: 10, basePower: 1 },
      miner: { level: 0, baseCost: 100, basePower: 5 },
      robot: { level: 0, baseCost: 500, basePower: 10 }
    },
    world2: {
      alien: { level: 0, baseCost: 50, basePower: 2 },
      spaceship: { level: 0, baseCost: 85, basePower: 10 },
      ufo: { level: 0, baseCost: 125, basePower: 20 }
    }
  },
  world: 'world1',
  lastOnline: new Date().toISOString(),
  multiplier: 1
};

const upgradeNames = {
  cursor: "Ian Cursor",
  miner: "Ian Miner",
  robot: "Ian Robot",
  alien: "Ian Alien",
  spaceship: "Ian Spaceship",
  ufo: "Ian UFO"
};

function saveGame() {
  data.lastOnline = new Date().toISOString();
  localStorage.setItem("ianClicker", JSON.stringify(data));
}

function loadGame() {
  let saved = localStorage.getItem("ianClicker");
  if (saved) {
    data = JSON.parse(saved);
    offlineEarnings();
  }
  updateUI();
}

function offlineEarnings() {
  const last = new Date(data.lastOnline);
  const now = new Date();
  const seconds = Math.floor((now - last) / 1000);
  const cps = getCPS();
  const earned = Math.floor(seconds * cps);
  if (earned > 0) {
    data.clicks += earned;
    showOfflinePopup(`You earned ${earned} clicks while offline (${seconds} secs).`);
  }
}

function showOfflinePopup(msg) {
  const popup = document.getElementById('offline-popup');
  popup.innerText = msg;
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("hidden"), 5000);
}

function setMultiplier(mult) {
  data.multiplier = mult;
  updateUI();
}

function getCPS() {
  let cps = 0;
  const upgrades = data.upgrades[data.world];
  for (let key in upgrades) {
    let u = upgrades[key];
    cps += (u.basePower + u.level * 0.5) * u.level;
  }
  return cps * (1 + data.rebirths[data.world] * 0.5);
}

function handleClick() {
  data.clicks += 1 * (1 + data.rebirths[data.world] * 0.5);
  updateUI();
}

function calculateCost(u, n) {
  let cost = 0;
  for (let i = 0; i < n; i++) {
    cost += u.baseCost * Math.pow(2, u.level + i);
  }
  return cost;
}

function buyUpgrade(key) {
  const u = data.upgrades[data.world][key];
  const cost = calculateCost(u, data.multiplier);
  if (data.clicks >= cost) {
    data.clicks -= cost;
    u.level += data.multiplier;
    updateUI();
  }
}

function createUpgradeButtons() {
  const container = document.getElementById("upgrades");
  container.innerHTML = "";
  const upgrades = data.upgrades[data.world];
  for (let key in upgrades) {
    const u = upgrades[key];
    const cost = calculateCost(u, data.multiplier);
    const power = (u.basePower + u.level * 0.5).toFixed(1);
    const btn = document.createElement("button");
    btn.innerText = `${upgradeNames[key]} (${u.level}) - ${cost} clicks (+${power} each)`;
    btn.disabled = data.clicks < cost;
    btn.onclick = () => buyUpgrade(key);
    container.appendChild(btn);
  }
}

function rebirth() {
  if (data.clicks >= 100000) {
    data.rebirths[data.world]++;
    data.clicks = 0;
    for (let key in data.upgrades[data.world]) {
      data.upgrades[data.world][key].level = 0;
    }
    updateUI();
  }
}

function switchWorld() {
  if (data.world === "world1" && data.clicks < 10000000) {
    alert("You need 10,000,000 clicks to unlock World 2!");
    return;
  }
  data.world = data.world === "world1" ? "world2" : "world1";
  document.body.className = data.world;
  updateUI();
}

function updateUI() {
  document.getElementById("clicks").innerText = `Clicks: ${Math.floor(data.clicks)}`;
  document.getElementById("rebirths").innerText = `Rebirths W1: ${data.rebirths.world1} | W2: ${data.rebirths.world2}`;
  createUpgradeButtons();
  saveGame();
}

// Game loop
setInterval(() => {
  data.clicks += getCPS();
  updateUI();
}, 1000);

// Save every 10 seconds
setInterval(saveGame, 10000);

window.onload = loadGame;
