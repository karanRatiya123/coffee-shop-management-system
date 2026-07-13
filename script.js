// State Management
let enteredPin = '';
const correctPins = {
  'Sarah Jenkins': '1234',
  'Marcus Thorne': '5678',
  'Elena Rostova': '1111',
  'Devon Miller': '0000'
};

// Operator Details
let selectedOperator = {
  name: 'Sarah Jenkins',
  role: 'Senior Barista',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
};

// Initialize Widgets and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  
  // Close operator dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('operator-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
});

// 1. Digital Clock Widget
function startClock() {
  const clockElement = document.getElementById('time-display');
  
  function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    
    // Format to 2 digits
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

// 2. [Note: Manager Password Login tab switcher removed]

// 3. Custom Operator Dropdown Selectors
function toggleDropdown() {
  const dropdown = document.getElementById('operator-dropdown');
  dropdown.classList.toggle('open');
}

function selectOperator(name, role, avatarUrl) {
  selectedOperator = { name, role, avatar: avatarUrl };
  
  // Update Dropdown selected view
  const selectedProfile = document.querySelector('#operator-dropdown .dropdown-selected');
  selectedProfile.innerHTML = `
    <div class="operator-profile">
      <div class="operator-avatar" style="background-image: url('${avatarUrl}')"></div>
      <div class="operator-info">
        <span class="operator-name">${name}</span>
        <span class="operator-role">${role}</span>
      </div>
    </div>
    <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
  `;
  
  // Update dropdown items active state
  const items = document.querySelectorAll('.dropdown-item');
  items.forEach(item => {
    const itemName = item.querySelector('.operator-name').textContent;
    if (itemName === name) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Close dropdown and reset input state
  document.getElementById('operator-dropdown').classList.remove('open');
  clearPin();
}

// 4. Interactive PIN Entry System
function pressPin(digit) {
  if (enteredPin.length >= 4) return;
  
  enteredPin += digit;
  updatePinDots();
  
  // If complete, trigger evaluation
  if (enteredPin.length === 4) {
    setTimeout(evaluatePinCode, 250);
  }
}

function clearPin() {
  enteredPin = '';
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
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, index) => {
    if (index < enteredPin.length) {
      dot.classList.add('filled');
      dot.classList.remove('error');
    } else {
      dot.classList.remove('filled');
      dot.classList.remove('error');
    }
  });
}

function resetPinFeedback() {
  const msgEl = document.getElementById('pin-message');
  msgEl.textContent = 'Enter 4-digit Passcode';
  msgEl.classList.remove('error-text');
}

function evaluatePinCode() {
  const correctPin = correctPins[selectedOperator.name];
  
  if (enteredPin === correctPin) {
    triggerLoginSuccess(`Welcome back, ${selectedOperator.name}!`);
  } else {
    triggerPinError();
  }
}

function triggerPinError() {
  const dots = document.querySelectorAll('.pin-dot');
  const msgEl = document.getElementById('pin-message');
  const pinDisplayWrapper = document.querySelector('.pin-display-wrapper');
  
  dots.forEach(dot => {
    dot.classList.add('error');
  });
  
  msgEl.textContent = 'Invalid Passcode. Try Again.';
  msgEl.classList.add('error-text');
  
  // Shake display
  pinDisplayWrapper.classList.add('shake-element');
  
  // Vibrate hardware check (if tablet POS supports it)
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
  
  setTimeout(() => {
    pinDisplayWrapper.classList.remove('shake-element');
    clearPin();
  }, 1000);
}

// 5. [Note: Manager login handlers removed]

// 6. Login Success Transition Overlay & Simulator
function triggerLoginSuccess(successMsg) {
  const overlay = document.getElementById('loading-overlay');
  const statusText = document.getElementById('loader-status-text');
  
  overlay.classList.add('active');
  
  const steps = [
    { text: 'Validating Security Tokens...', delay: 600 },
    { text: 'Loading Operator Configurations...', delay: 1300 },
    { text: 'Syncing Terminal Cash Drawer...', delay: 2000 },
    { text: `${successMsg} Starting session...`, delay: 2800 }
  ];
  
  steps.forEach(step => {
    setTimeout(() => {
      statusText.textContent = step.text;
    }, step.delay);
  });
  
  // Simulator redirect
  setTimeout(() => {
    overlay.classList.remove('active');
    alert(`Success! Logging in to BrewOS System. \nOperator: ${selectedOperator.name}\nRole: ${selectedOperator.role}`);
    clearPin();
  }, 3500);
}
