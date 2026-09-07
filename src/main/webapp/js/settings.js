// ==========================================
// Coffee Shop POS - Settings Management
// Task 1: Logged-in Operator Profile Info
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load sessionStorage operator info immediately
    loadSessionOperatorInfo();

    // 2. Fetch operator information from existing OperatorServlet
    fetchOperatorInfoFromServlet();
});

// Load operator info from sessionStorage temporarily until servlet response arrives
function loadSessionOperatorInfo() {
    const sessionName = sessionStorage.getItem('operatorName');
    const sessionRole = sessionStorage.getItem('operatorRole');
    const sessionAvatar = sessionStorage.getItem('operatorAvatar');
    const sessionEmail = sessionStorage.getItem('operatorEmail');
    const sessionId = sessionStorage.getItem('operatorId');

    const nameEl = document.getElementById('settings-operator-name');
    const roleEl = document.getElementById('settings-operator-role');
    const avatarEl = document.getElementById('settings-operator-avatar');
    const emailEl = document.getElementById('settings-operator-email');
    const statusEl = document.getElementById('settings-login-status');
    const empIdEl = document.getElementById('settings-employee-id');

    if (sessionName && nameEl) nameEl.textContent = sessionName;
    if (sessionRole && roleEl) roleEl.textContent = sessionRole;
    if (sessionAvatar && avatarEl) avatarEl.style.backgroundImage = `url('${sessionAvatar}')`;
    if (emailEl) emailEl.textContent = sessionEmail || (sessionName ? `${sessionName.toLowerCase().replace(/\s+/g, '')}@brewos.com` : 'N/A');
    if (sessionId && empIdEl) empIdEl.textContent = sessionId;
    if (statusEl) statusEl.innerHTML = '<span class="pulse-dot-green"></span> Active Session';
}

// Fetch operator details from existing OperatorServlet
async function fetchOperatorInfoFromServlet() {
    try {
        const response = await fetch("OperatorServlet");
        if (response.ok) {
            const operators = await response.json();
            const currentName = sessionStorage.getItem('operatorName') || '';

            // Match operator from servlet response by username
            const matchedOperator = (Array.isArray(operators) && operators.length > 0)
                ? (operators.find(op => (op.username || '').toLowerCase() === currentName.toLowerCase()) || operators[0])
                : null;

            if (matchedOperator) {
                updateSettingsOperatorDOM(matchedOperator);
            }
        }
    } catch (error) {
        console.warn("OperatorServlet fetch failed, preserving sessionStorage info:", error);
    }
}

// Update settings profile card DOM elements
function updateSettingsOperatorDOM(operator) {
    const nameEl = document.getElementById('settings-operator-name');
    const roleEl = document.getElementById('settings-operator-role');
    const avatarEl = document.getElementById('settings-operator-avatar');
    const emailEl = document.getElementById('settings-operator-email');
    const statusEl = document.getElementById('settings-login-status');
    const empIdEl = document.getElementById('settings-employee-id');

    const username = operator.username || sessionStorage.getItem('operatorName') || 'Operator';
    const role = operator.role || sessionStorage.getItem('operatorRole') || 'Staff';
    const avatar = operator.avatar || sessionStorage.getItem('operatorAvatar') || 'images/default-avatar.jpg';
    const email = operator.email || `${username.toLowerCase().replace(/\s+/g, '')}@brewos.com`;
    const employeeId = operator.userId ? `EMP-${1000 + Number(operator.userId)}` : 'EMP-1001';

    if (nameEl) nameEl.textContent = username;
    if (roleEl) roleEl.textContent = role;
    if (avatarEl) avatarEl.style.backgroundImage = `url('${avatar}')`;
    if (emailEl) emailEl.textContent = email;
    if (empIdEl) empIdEl.textContent = employeeId;
    if (statusEl) statusEl.innerHTML = '<span class="pulse-dot-green"></span> Active Session';
}

// Settings Tab Navigation
function switchSettingsTab(tabId, button) {
    const panels = document.querySelectorAll('.settings-panel');
    panels.forEach(p => p.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) targetPanel.classList.add('active');

    const tabs = document.querySelectorAll('.settings-tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    if (button) button.classList.add('active');
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('settings-toast');
    const toastText = document.getElementById('settings-toast-text');
    if (toastText) toastText.textContent = message;
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

function saveSettings() {
    showToast("Settings saved successfully");
}

function cancelSettings() {
    window.location.href = 'dashboard.html';
}

function resetSettingsToDefaults() {
    showToast("Settings reset to defaults");
}

// Logout & Clear Session
function logoutSession() {
    try {
        sessionStorage.clear();
    } catch (e) {
        console.warn('sessionStorage is unavailable or blocked:', e);
    }
    window.location.href = 'index.html';
}