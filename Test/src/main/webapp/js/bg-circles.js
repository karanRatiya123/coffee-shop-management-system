// --- Background Circles Coffee Theme Variant Switcher (bg-circles.js) ---

const CIRCLE_VARIANTS = [
  { id: 'matcha-latte', label: 'Matcha Latte' },
  { id: 'lavender-brew', label: 'Lavender Brew' },
  { id: 'classic-caramel', label: 'Classic Caramel' },
  { id: 'berry-mocha', label: 'Berry Mocha' },
  { id: 'espresso-gold', label: 'Espresso Gold' },
  { id: 'iced-coffee', label: 'Iced Coffee' },
  { id: 'sweet-cream', label: 'Sweet Cream' },
  { id: 'brewos-classic', label: 'BrewOS Classic' }
];

let currentVariantIndex = 7; // starts with 'brewos-classic'

function getNextVariant() {
  currentVariantIndex = (currentVariantIndex + 1) % CIRCLE_VARIANTS.length;
  return CIRCLE_VARIANTS[currentVariantIndex];
}

function updateCirclesVariant(variantId) {
  const container = document.getElementById('bg-circles-container');
  if (!container) return;

  // Remove existing variant- classes
  CIRCLE_VARIANTS.forEach(v => {
    container.classList.remove(`variant-${v.id}`);
  });

  // Find variant configuration
  const variant = CIRCLE_VARIANTS.find(v => v.id === variantId) || CIRCLE_VARIANTS[7];

  // Add new variant class
  container.classList.add(`variant-${variant.id}`);

  // Update button text if it exists
  const btnText = document.querySelector('.bg-circles-variant-btn span');
  if (btnText) {
    btnText.textContent = `Theme: ${variant.label}`;
  }

  // Save selection in localStorage to keep it consistent across pages!
  try {
    localStorage.setItem('circles_variant_id', variant.id);
  } catch (e) {
    console.warn("localStorage unavailable:", e);
  }
}

function cycleCirclesVariant() {
  const next = getNextVariant();
  updateCirclesVariant(next.id);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  try {
    const savedId = localStorage.getItem('circles_variant_id');
    const matched = CIRCLE_VARIANTS.find(v => v.id === savedId);
    if (matched) {
      currentVariantIndex = CIRCLE_VARIANTS.indexOf(matched);
      updateCirclesVariant(matched.id);
    } else {
      updateCirclesVariant('brewos-classic');
    }
  } catch (e) {
    updateCirclesVariant('brewos-classic');
  }

  // Initialize sidebar toggle functionalities
  try {
    initSidebarToggle();
  } catch (e) {
    console.error("Failed to initialize sidebar toggle:", e);
  }
});

/**
 * Initializes responsive sidebar toggling and persistent collapse preferences.
 */
function initSidebarToggle() {
  const sidebar = document.querySelector('.sidebar') || document.querySelector('.feedback-sidebar');
  const topbar = document.querySelector('.topbar') || document.querySelector('.feedback-topbar');
  if (!sidebar) return;

  // 1. Restore desktop collapse preference
  const container = document.querySelector('.dashboard-container') || document.querySelector('.feedback-shell');
  if (container) {
    try {
      const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
      if (isCollapsed && window.innerWidth > 768) {
        container.classList.add('collapsed');
      }
    } catch (e) {
      console.warn("localStorage is blocked:", e);
    }
  }

  // 2. Inject mobile menu toggle button into topbar if it doesn't exist
  if (topbar && !topbar.querySelector('.mobile-menu-toggle-btn')) {
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-toggle-btn';
    mobileBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
    mobileBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
    // Add mobile toggle click handler
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      const backdrop = document.querySelector('.sidebar-overlay-backdrop');
      if (backdrop) backdrop.classList.toggle('active');
    });
    // Prepend to topbar
    topbar.insertBefore(mobileBtn, topbar.firstChild);
  }

  // 3. Create backdrop overlay if it doesn't exist
  let backdrop = document.querySelector('.sidebar-overlay-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-overlay-backdrop';
    document.body.appendChild(backdrop);
    // Backdrop click handler to close sidebar drawer
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }

  // 4. Attach event listeners to all sidebar-toggle-btn elements
  const sidebarToggleBtns = sidebar.querySelectorAll('.sidebar-toggle-btn');
  sidebarToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isDrawerMode = window.innerWidth <= 768 || (sidebar.classList.contains('feedback-sidebar') && window.innerWidth <= 1100);
      if (isDrawerMode) {
        // On mobile/tablet, it acts as a close button
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      } else {
        // On desktop (>768px), toggle collapse state
        if (container) {
          container.classList.toggle('collapsed');
          try {
            localStorage.setItem('sidebar_collapsed', container.classList.contains('collapsed'));
          } catch (e) {
            console.warn("localStorage is blocked:", e);
          }
        }
      }
    });
  });

  // 5. Auto-close mobile drawer when any menu link is clicked
  const menuLinks = sidebar.querySelectorAll('.sidebar-menu a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      const isDrawerMode = window.innerWidth <= 768 || (sidebar.classList.contains('feedback-sidebar') && window.innerWidth <= 1100);
      if (isDrawerMode) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      }
    });
  });
}

