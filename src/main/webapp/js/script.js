// ==========================================
// Coffee Shop POS Login Screen
// Java Servlet Version
// ==========================================

// ---------- State Management ----------
let enteredPin = '';
let operators = [];
let selectedOperator = null;

// ---------- Initialize ----------
document.addEventListener('DOMContentLoaded', async () => {
    startClock();
    await loadOperators();

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('operator-dropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
});

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';
const FALLBACK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e49e54'%3E%3Cpath d='M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm0 4c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5zm-6 4c.22-1.42 2.87-3 6-3s5.78 1.58 6 3z'/%3E%3C/svg%3E";

function getAvatarUrl(avatar) {
    if (avatar && avatar.trim() !== '' && !avatar.includes('default-avatar')) {
        return avatar;
    }
    return DEFAULT_AVATAR;
}

// Helper: Render avatar image (supports online internet URLs, local downloaded paths & default picture)
function renderAvatarHtml(avatarUrl) {
    const src = getAvatarUrl(avatarUrl);
    return `<img class="operator-avatar" src="${src}" onerror="this.onerror=null;this.src='${FALLBACK_SVG}';" alt="Avatar">`;
}

// ==========================================
// Load Operators From Database (OperatorServlet)
// ==========================================
async function loadOperators() {
    try {
        const response = await fetch("OperatorServlet");
        if (!response.ok) throw new Error("Unable to fetch operators from database");
        operators = await response.json();
        if (Array.isArray(operators) && operators.length > 0) {
            selectedOperator = operators[0];
            updateSelectedOperator(selectedOperator);
            populateOperatorDropdown();
        } else {
            showErrorMessage("No active operators found in database.");
        }
    } catch (error) {
        console.error("LOAD OPERATORS ERROR:", error);
        showErrorMessage("Database Connection Error. Unable to load operators.");
    }
}

// ==========================================
// Update Selected Operator Card
// ==========================================
function updateSelectedOperator(operator) {
    if (!operator) return;
    const selectedProfile = document.querySelector(
        "#operator-dropdown .dropdown-selected"
    );
    if (!selectedProfile) return;
    const displayName = operator.username || operator.name || 'Operator';
    const avatarHtml = renderAvatarHtml(operator.avatar);
    selectedProfile.innerHTML = `
        <div class="operator-profile">
            ${avatarHtml}
            <div class="operator-info">
                <span class="operator-name">${displayName}</span>
                <span class="operator-role">${operator.role || ''}</span>
            </div>
        </div>
        <svg class="dropdown-arrow"
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round">
             <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    `;
}

// ==========================================
// Populate Operator List
// ==========================================
function populateOperatorDropdown() {
    const container = document.querySelector(
        "#operator-dropdown .dropdown-list"
    );
    if (!container) return;
    container.innerHTML = "";
    operators.forEach((operator, index) => {
        const displayName = operator.username || operator.name || 'Operator';
        const avatarHtml = renderAvatarHtml(operator.avatar);
        const item = document.createElement('div');
        item.className = `dropdown-item ${index === 0 ? 'active' : ''}`;
        item.onclick = () => selectOperatorByIndex(index);
        item.innerHTML = `
            <div class="operator-profile">
                ${avatarHtml}
                <div class="operator-info">
                    <span class="operator-name">${displayName}</span>
                    <span class="operator-role">${operator.role || ''}</span>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// ==========================================
// Clock
// ==========================================
function startClock() {
    const clock = document.getElementById("time-display");
    function updateTime() {
        if (!clock) return;
        const now = new Date();
        const h = String(now.getHours()).padStart(2,'0');
        const m = String(now.getMinutes()).padStart(2,'0');
        const s = String(now.getSeconds()).padStart(2,'0');
        clock.textContent = `${h}:${m}:${s}`;
    }
    updateTime();
    setInterval(updateTime,1000);
}

// ==========================================
// Dropdown
// ==========================================
function toggleDropdown() {
    const dropdown = document.getElementById("operator-dropdown");
    if (dropdown) dropdown.classList.toggle("open");
}

function selectOperatorByIndex(index) {
    if (index >= 0 && index < operators.length) {
        selectedOperator = operators[index];
        updateSelectedOperator(selectedOperator);
        const items = document.querySelectorAll(".dropdown-item");
        items.forEach((item, i) => {
            item.classList.toggle("active", i === index);
        });
        const dropdown = document.getElementById("operator-dropdown");
        if (dropdown) dropdown.classList.remove("open");
        clearPin();
    }
}

function selectOperator(username, role, avatar) {
    const found = operators.find(op => (op.username || op.name) === username);
    selectedOperator = found || { username, name: username, role, avatar };
    updateSelectedOperator(selectedOperator);
    const dropdown = document.getElementById("operator-dropdown");
    if (dropdown) dropdown.classList.remove("open");
    clearPin();
}

// ==========================================
// Interactive PIN Entry System
// ==========================================
function pressPin(digit) {
    if (enteredPin.length >= 4) return;
    enteredPin += digit;
    updatePinDots();
    if (enteredPin.length === 4) {
        setTimeout(evaluatePinCode, 250);
    }
}

function clearPin() {
    enteredPin = "";
    updatePinDots();
    resetPinFeedback();
}

function backspacePin() {
    if (enteredPin.length === 0) return;
    enteredPin = enteredPin.slice(0, -1);
    updatePinDots();
    resetPinFeedback();
}

function updatePinDots() {
    const dots = document.querySelectorAll(".pin-dot");
    dots.forEach((dot, index) => {
        if (index < enteredPin.length) {
            dot.classList.add("filled");
            dot.classList.remove("error");
        } else {
            dot.classList.remove("filled");
            dot.classList.remove("error");
        }
    });
}

function resetPinFeedback() {
    const msg = document.getElementById("pin-message");
    if (msg) {
        msg.textContent = "Enter 4-digit Passcode";
        msg.classList.remove("error-text");
    }
}

// ==========================================
// Login Verification via Database (LoginServlet)
// ==========================================
async function evaluatePinCode() {
    if (!selectedOperator) {
        triggerPinError();
        return;
    }
    const opName = selectedOperator.username || selectedOperator.name || "";
    
    try {
        const params = new URLSearchParams({
            username: opName,
            pin: enteredPin
        });

        const response = await fetch("LoginServlet", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString()
        });

        if (response.ok) {
            sessionStorage.setItem('operatorName', opName);
            sessionStorage.setItem('operatorRole', selectedOperator.role || 'Staff');
            sessionStorage.setItem('operatorAvatar', selectedOperator.avatar || 'images/default-avatar.jpg');
            sessionStorage.setItem('operatorEmail', selectedOperator.email || `${opName.toLowerCase().replace(/\s+/g, '')}@brewos.com`);
            sessionStorage.setItem('operatorId', selectedOperator.userId ? `EMP-${1000 + Number(selectedOperator.userId)}` : 'EMP-1001');
            triggerLoginSuccess("Welcome back, " + opName + "!");
        } else {
            triggerPinError();
        }
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        triggerPinError();
    }
}

// ==========================================
// Login Error
// ==========================================
function triggerPinError() {
    const dots = document.querySelectorAll(".pin-dot");
    const message = document.getElementById("pin-message");
    const wrapper = document.querySelector(".pin-display-wrapper");
    dots.forEach(dot => dot.classList.add("error"));
    if (message) {
        message.textContent = "Invalid Passcode. Try Again.";
        message.classList.add("error-text");
    }
    if (wrapper) wrapper.classList.add("shake-element");
    if (navigator.vibrate) {
        navigator.vibrate([100,50,100]);
    }
    setTimeout(() => {
        if (wrapper) wrapper.classList.remove("shake-element");
        clearPin();
    },1000);
}

// ==========================================
// Login Success Animation
// ==========================================
function triggerLoginSuccess(successMessage) {
    const overlay = document.getElementById("loading-overlay");
    const statusText = document.getElementById("loader-status-text");
    if (overlay) overlay.classList.add("active");
    const steps = [
        { text: "Validating User...", delay: 200 },
        { text: "Loading Dashboard...", delay: 500 },
        { text: "Preparing Coffee Shop POS...", delay: 800 },
        { text: successMessage, delay: 1100 }
    ];
    steps.forEach(step => {
        setTimeout(() => {
            if (statusText) statusText.textContent = step.text;
        }, step.delay);
    });
    setTimeout(() => {
        if (overlay) overlay.classList.remove("active");
        clearPin();
        window.location.href = "dashboard.html";
    }, 1400);
}

// ==========================================
// Error Message
// ==========================================
function showErrorMessage(message) {
    const msg = document.getElementById("pin-message");
    if(msg){
        msg.textContent = message;
        msg.classList.add("error-text");
    }
}

// ==========================================
// Utility Functions
// ==========================================
function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}

function resetLogin(){
    clearPin();
    selectedOperator = operators.length > 0 ? operators[0] : null;
}
