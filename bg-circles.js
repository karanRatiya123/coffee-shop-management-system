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
});
