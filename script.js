let clicks = 0;
let currentUser = null;

function updateDisplay() {
  document.getElementById("clicksDisplay").innerText = "Clicks: " + Math.floor(clicks);
  document.getElementById("loginStatus").innerText = currentUser ? currentUser : "Log In / Sign Up";
  document.getElementById("usernameDisplay").innerText = currentUser ? `Welcome, ${currentUser}` : "";
}

function addClick() {
  clicks++;
  updateDisplay();
  if (currentUser) {
    localStorage.setItem("clicks_" + currentUser, clicks);
  }
}

function toggleLogin() {
  const gui = document.getElementById("loginGUI");
  gui.classList.toggle("hidden");
}

function login() {
  const user = document.getElementById("usernameInput").value;
  const pass = document.getElementById("passwordInput").value;
  const savedPass = localStorage.getItem("user_" + user);
  if (savedPass === pass) {
    currentUser = user;
    clicks = parseInt(localStorage.getItem("clicks_" + user)) || 0;
    localStorage.setItem("ian_user", user);
    updateDisplay();
    document.getElementById("loginGUI").classList.add("hidden");
  } else {
    alert("Invalid login.");
  }
}

function signUp() {
  const user = document.getElementById("usernameInput").value;
  const pass = document.getElementById("passwordInput").value;
  if (!localStorage.getItem("user_" + user)) {
    localStorage.setItem("user_" + user, pass);
    localStorage.setItem("clicks_" + user, 0);
    alert("Account created. Now log in.");
    document.getElementById("loginGUI").classList.add("hidden");
  } else {
    alert("Username already exists.");
  }
}

function logout() {
  if (currentUser) {
    localStorage.setItem("clicks_" + currentUser, clicks);
  }
  currentUser = null;
  localStorage.removeItem("ian_user");
  updateDisplay();
  document.getElementById("loginGUI").classList.add("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("ian_user");
  if (savedUser) {
    currentUser = savedUser;
    clicks = parseInt(localStorage.getItem("clicks_" + savedUser)) || 0;
  }
  updateDisplay();
});
