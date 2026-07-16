// --- Staff Settings Page (settings.js) ---
//
// Persists per-operator settings to localStorage and applies display
// preferences (theme / font size / high contrast) live to <body>.
// Exposes window.applyOperatorSettings so other pages (dashboard, etc.)
// can re-apply the saved preferences on their own load.

const SETTINGS_STORAGE_PREFIX = 'brewos_settings_';
const SETTINGS_AUTO_HIDE_LIMIT_MS = 2400;

const DEFAULT_SETTINGS = {
  theme: 'dark',           // 'dark' | 'light' — checkbox drives it
  fontSize: 'medium',      // 'small' | 'medium' | 'large'
  highContrast: false,
  dateFormat: 'DD/MM/YYYY',
  notifications: true,
  autoHideSeconds: 5,
  paymentAlerts: true,
  defaultPayment: 'Cash',
  showCardInfo: false
};

// Operator profile mapping (mirrors script.js so settings can render a
// useful profile card even before the user reaches the dashboard).
const OPERATOR_PROFILES = {
  'Sarah Jenkins': { role: 'Senior Barista', employeeId: 'EMP-1042', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' },
  'Marcus Thorne': { role: 'Shift Supervisor', employeeId: 'EMP-0781', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
  'Elena Rostova': { role: 'Barista', employeeId: 'EMP-1107', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
  'Devon Miller':  { role: 'Trainee', employeeId: 'EMP-1234', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' }
};

const DEFAULT_OPERATOR_NAME = 'Sarah Jenkins';

// In-memory copy of the operator's settings; populated on load and
// updated on save / cancel / reset.
let currentSettings = { ...DEFAULT_SETTINGS };
let toastTimeout = null;

// 1. Operator identity (sessionStorage, like dashboard.js)
function getActiveOperator() {
  try {
    const name = sessionStorage.getItem('operatorName');
    if (name && OPERATOR_PROFILES[name]) return name;
  } catch (e) {
    console.warn('sessionStorage unavailable:', e);
  }
  return DEFAULT_OPERATOR_NAME;
}

function getOperatorProfile(name) {
  return OPERATOR_PROFILES[name] || OPERATOR_PROFILES[DEFAULT_OPERATOR_NAME];
}

// 2. localStorage load / save (per-operator isolation)
function settingsStorageKey(operatorName) {
  return `${SETTINGS_STORAGE_PREFIX}${operatorName}`;
}

function loadSettings(operatorName) {
  try {
    const raw = localStorage.getItem(settingsStorageKey(operatorName));
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.warn('Failed to load settings:', e);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettingsToStorage(operatorName, settings) {
  try {
    localStorage.setItem(settingsStorageKey(operatorName), JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

function clearSettingsForOperator(operatorName) {
  try {
    localStorage.removeItem(settingsStorageKey(operatorName));
  } catch (e) {
    console.warn('Failed to clear settings:', e);
  }
}

// 3. Apply settings to the live DOM (theme/font/contrast)
function applySettingsToBody(settings) {
  const body = document.body;
  if (!body) return;

  // Theme
  body.classList.remove('theme-dark', 'theme-light');
  body.classList.add(settings.theme === 'light' ? 'theme-light' : 'theme-dark');

  // Font size + contrast as data attributes so CSS can target them
  body.setAttribute('data-font-size', settings.fontSize || 'medium');
  body.setAttribute('data-high-contrast', settings.highContrast ? 'true' : 'false');
}

// Public: re-apply the active operator's stored settings.
// Used by dashboard.js (and any other page) so preferences stick across
// navigation without a page reload.
function applyOperatorSettings() {
  const operatorName = getActiveOperator();
  const settings = loadSettings(operatorName);
  applySettingsToBody(settings);
  return settings;
}

// 4. Populate the read-only profile card
function renderProfileCard() {
  const operatorName = getActiveOperator();
  const profile = getOperatorProfile(operatorName);

  const nameEl = document.getElementById('settings-operator-name');
  const roleEl = document.getElementById('settings-operator-role');
  const idEl = document.getElementById('settings-employee-id');
  const avatarEl = document.getElementById('settings-operator-avatar');
  const shiftCountEl = document.getElementById('settings-shift-count');

  if (nameEl) nameEl.textContent = operatorName;
  if (roleEl) roleEl.textContent = profile.role;
  if (idEl) idEl.textContent = profile.employeeId;
  if (avatarEl) avatarEl.style.backgroundImage = `url('${profile.avatar}')`;

  // Shifts are placeholder data — settings.md says "maximum 2 shifts".
  if (shiftCountEl) {
    const shiftsToday = 1; // session-only placeholder
    shiftCountEl.textContent = `${shiftsToday} / 2 active`;
  }
}

// 5. Populate the form controls from a settings object
function renderFormFromSettings(settings) {
  // Theme is a single checkbox: checked = dark, unchecked = light
  const themeToggle = document.getElementById('setting-theme');
  if (themeToggle) themeToggle.checked = settings.theme !== 'light';

  setControlValue('setting-font-size',     settings.fontSize);
  setControlValue('setting-high-contrast',  settings.highContrast);
  setControlValue('setting-date-format',    settings.dateFormat);
  setControlValue('setting-notifications',  settings.notifications);
  setControlValue('setting-auto-hide',      settings.autoHideSeconds);
  setControlValue('setting-payment-alerts', settings.paymentAlerts);
  setControlValue('setting-default-payment', settings.defaultPayment);
  setControlValue('setting-show-card-info', settings.showCardInfo);
}

function setControlValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === 'checkbox') {
    el.checked = Boolean(value);
  } else {
    el.value = value;
  }
}

// 6. Read the form controls back into a settings object
function readSettingsFromForm() {
  const autoHide = clampInt(readNumber('setting-auto-hide'), 1, 30, 5);

  return {
    theme: document.getElementById('setting-theme') ? (isChecked('setting-theme') ? 'dark' : 'light') : currentSettings.theme,
    fontSize: document.getElementById('setting-font-size') ? readSelect('setting-font-size', 'medium') : currentSettings.fontSize,
    highContrast: document.getElementById('setting-high-contrast') ? isChecked('setting-high-contrast') : currentSettings.highContrast,
    dateFormat: document.getElementById('setting-date-format') ? readSelect('setting-date-format', 'DD/MM/YYYY') : currentSettings.dateFormat,
    notifications: isChecked('setting-notifications'),
    autoHideSeconds: autoHide,
    paymentAlerts: isChecked('setting-payment-alerts'),
    defaultPayment: readSelect('setting-default-payment', 'Cash'),
    showCardInfo: isChecked('setting-show-card-info')
  };
}

function isChecked(id) {
  const el = document.getElementById(id);
  return Boolean(el && el.checked);
}

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  return el && el.value ? el.value : fallback;
}

function readNumber(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const n = parseInt(el.value, 10);
  return Number.isFinite(n) ? n : 0;
}

function clampInt(n, min, max, fallback) {
  if (!Number.isFinite(n)) return fallback;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

// 7. Tab switching
function switchSettingsTab(tabName, buttonEl) {
  const buttons = document.querySelectorAll('.settings-tab-btn');
  buttons.forEach(btn => {
    const isMatch = btn === buttonEl || btn.dataset.tab === tabName;
    btn.classList.toggle('active', isMatch);
    btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
  });

  const panels = document.querySelectorAll('.settings-panel');
  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${tabName}`);
  });
}

// 8. Save / Cancel / Reset
function saveSettings() {
  const operatorName = getActiveOperator();
  const next = readSettingsFromForm();
  currentSettings = next;
  saveSettingsToStorage(operatorName, next);
  applySettingsToBody(next);
  showToast('Settings saved');
}

function cancelSettings() {
  // Re-render from the last-saved (or default) values, undoing any
  // unsaved edits the user made in the form.
  currentSettings = loadSettings(getActiveOperator());
  renderFormFromSettings(currentSettings);
  applySettingsToBody(currentSettings);
  showToast('Changes discarded');
}

function resetSettingsToDefaults() {
  clearSettingsForOperator(getActiveOperator());
  currentSettings = { ...DEFAULT_SETTINGS };
  renderFormFromSettings(currentSettings);
  applySettingsToBody(currentSettings);
  showToast('Reset to defaults');
}

// 9. Toast helper (auto-hides after settings.autoHideSeconds)
function showToast(message) {
  const toast = document.getElementById('settings-toast');
  const text = document.getElementById('settings-toast-text');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  const seconds = clampInt(currentSettings.autoHideSeconds, 1, 30, 5);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, seconds * 1000);
  // Hard cap so it can't linger forever if the user sets a high value
  setTimeout(() => toast.classList.remove('show'), SETTINGS_AUTO_HIDE_LIMIT_MS + seconds * 1000);
}

// 10. Wire live theme/font/contrast changes — display preferences
// apply immediately, but only persist when the user clicks Save.
function wireLivePreview() {
  const themeToggle = document.getElementById('setting-theme');
  const fontSelect = document.getElementById('setting-font-size');
  const contrastToggle = document.getElementById('setting-high-contrast');

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      applySettingsToBody({ ...currentSettings, theme: themeToggle.checked ? 'dark' : 'light' });
    });
  }
  if (fontSelect) {
    fontSelect.addEventListener('change', () => {
      applySettingsToBody({ ...currentSettings, fontSize: fontSelect.value });
    });
  }
  if (contrastToggle) {
    contrastToggle.addEventListener('change', () => {
      applySettingsToBody({ ...currentSettings, highContrast: contrastToggle.checked });
    });
  }
}

// 11. Init
document.addEventListener('DOMContentLoaded', () => {
  const operatorName = getActiveOperator();
  currentSettings = loadSettings(operatorName);

  renderProfileCard();
  renderFormFromSettings(currentSettings);
  applySettingsToBody(currentSettings);
  wireLivePreview();
});

// Expose for cross-page use (dashboard.js calls this on its own load).
window.applyOperatorSettings = applyOperatorSettings;

function logoutSession() {
  try {
    sessionStorage.removeItem('operatorName');
    sessionStorage.removeItem('operatorAvatar');
  } catch (e) {
    console.warn("sessionStorage is unavailable or blocked:", e);
  }
  window.location.href = 'index.html';
}

