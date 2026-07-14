// --- Coffee Shop POS Dashboard Operations (dashboard.js) ---

// Operator State (loaded from sessionStorage safely)
let selectedOperator = {
  name: 'Sarah Jenkins',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
};

try {
  const storedName = sessionStorage.getItem('operatorName');
  const storedAvatar = sessionStorage.getItem('operatorAvatar');
  if (storedName) selectedOperator.name = storedName;
  if (storedAvatar) selectedOperator.avatar = storedAvatar;
} catch (e) {
  console.warn("sessionStorage is unavailable or blocked:", e);
}

// Products Catalog Data
const products = [
  { id: 'cappuccino', name: 'Cappuccino', category: 'Coffee', subtitle: 'Hot Coffee', price: 120, image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=300' },
  { id: 'latte', name: 'Latte', category: 'Coffee', subtitle: 'Hot Coffee', price: 130, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=300' },
  { id: 'americano', name: 'Americano', category: 'Coffee', subtitle: 'Hot Coffee', price: 110, image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80&w=300' },
  { id: 'mocha', name: 'Mocha', category: 'Coffee', subtitle: 'Hot Coffee', price: 140, image: 'https://images.unsplash.com/photo-1596078841242-12e73dc697c4?auto=format&fit=crop&q=80&w=300' },
  { id: 'iced-coffee', name: 'Iced Coffee', category: 'Cold Drinks', subtitle: 'Cold Drink', price: 150, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=300' },
  { id: 'cold-chocolate', name: 'Cold Chocolate', category: 'Cold Drinks', subtitle: 'Cold Drink', price: 160, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=300' },
  { id: 'lemon-iced-tea', name: 'Lemon Iced Tea', category: 'Cold Drinks', subtitle: 'Cold Drink', price: 120, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=300' },
  { id: 'green-tea', name: 'Green Tea', category: 'Tea', subtitle: 'Hot Tea', price: 100, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=300' },
  { id: 'chocolate-cake', name: 'Chocolate Cake', category: 'Desserts', subtitle: 'Dessert', price: 180, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=300' },
  { id: 'blueberry-muffin', name: 'Blueberry Muffin', category: 'Desserts', subtitle: 'Dessert', price: 120, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=300' },
  { id: 'veg-sandwich', name: 'Veg Sandwich', category: 'Snacks', subtitle: 'Snacks', price: 150, image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&q=80&w=300' },
  { id: 'cheese-burger', name: 'Cheese Burger', category: 'Snacks', subtitle: 'Snacks', price: 160, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300' }
];

// POS State Variables
let cart = [];
let currentCategoryFilter = 'All';
let searchFilter = '';
let likedItems = new Set();
let dashClockInterval = null;
let pendingCheckoutOrder = null;

const ORDER_HISTORY_STORAGE_KEY = 'brewos_order_history';

// Initial state matching the WhatsApp image
const defaultCartInitialState = [
  { id: 'cappuccino', quantity: 1 },
  { id: 'iced-coffee', quantity: 1 },
  { id: 'chocolate-cake', quantity: 1 },
  { id: 'veg-sandwich', quantity: 1 }
];

function formatOrderDateTime(date = new Date()) {
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} | ${timeStr}`;
}

function generateOrderReference(prefix = 'ORD') {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${stamp}-${suffix}`;
}

function getOrderHistory() {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('localStorage is unavailable or blocked:', e);
    return [];
  }
}

function saveOrderHistoryEntry(order) {
  if (!order) return null;

  try {
    const history = getOrderHistory();
    history.unshift(order);
    localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(history));
    return order;
  } catch (e) {
    console.warn('Unable to save order history:', e);
    return order;
  }
}

function buildOrderSnapshot(status) {
  if (cart.length === 0) return null;

  let subtotal = 0;
  const items = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: itemTotal,
      image: item.image
    };
  });

  const discount = subtotal >= 300 ? subtotal * 0.05 : 0;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.05;
  const total = taxableAmount + tax;
  const createdAt = new Date();
  const referencePrefix = status === 'Held' ? 'HLD' : 'ORD';

  return {
    id: generateOrderReference(referencePrefix),
    status,
    operator: selectedOperator.name,
    terminal: 'TERMINAL-01',
    createdAt: createdAt.toISOString(),
    displayDateTime: formatOrderDateTime(createdAt),
    items,
    subtotal,
    discount,
    tax,
    total
  };
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Apply operator's saved display preferences (theme / font / contrast)
  // so the dashboard reflects settings made on the settings page.
  if (typeof window.applyOperatorSettings === 'function') {
    window.applyOperatorSettings();
  }

  // Sync cashier profile header details
  updateDashboardOperator();

  // Populate default order cart
  defaultCartInitialState.forEach(defaultItem => {
    const product = products.find(p => p.id === defaultItem.id);
    if (product) {
      cart.push({ ...product, quantity: defaultItem.quantity });
    }
  });

  // Render lists
  renderProducts();
  renderCart();

  // Start top bar datetime updates
  startDashboardClock();
});

// 1. Dashboard Operator Profile Sync
function updateDashboardOperator() {
  const dashNameEl = document.getElementById('dash-operator-name');
  const dashAvatarEl = document.getElementById('dash-operator-avatar');
  
  if (dashNameEl) dashNameEl.textContent = selectedOperator.name;
  if (dashAvatarEl) dashAvatarEl.style.backgroundImage = `url('${selectedOperator.avatar}')`;
}

// 2. Real-Time clock for dashboard
function startDashboardClock() {
  const timeEl = document.getElementById('dash-time-display');
  if (!timeEl) return;
  
  if (dashClockInterval) clearInterval(dashClockInterval);
  
  function updateTime() {
    const now = new Date();
    const realMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = realMonths[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    timeEl.textContent = `${month} ${date}, ${year} | ${hours}:${minutes} ${ampm}`;
  }
  
  updateTime();
  dashClockInterval = setInterval(updateTime, 1000);
}

// 3. Render Product Cards Grid
function renderProducts() {
  const gridContainer = document.getElementById('products-grid-container');
  if (!gridContainer) return;
  
  gridContainer.innerHTML = '';
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = currentCategoryFilter === 'All' || product.category === currentCategoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          product.subtitle.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  if (filteredProducts.length === 0) {
    gridContainer.innerHTML = `
      <div class="no-products-msg" style="grid-column: 1/-1; text-align: center; color: var(--color-cream-dark); padding: 40px;">
        <p>No products found matching your filters.</p>
      </div>
    `;
    return;
  }
  
  filteredProducts.forEach(product => {
    const isLiked = likedItems.has(product.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <button class="favorite-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${product.id}', this)" title="Add to Favorites">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <div class="product-image-container">
        <img class="product-img" src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info-block">
        <h3 class="product-name">${product.name}</h3>
        <span class="product-sub">${product.subtitle}</span>
      </div>
      <div class="product-footer-row">
        <span class="product-price">₹${product.price.toFixed(2)}</span>
        <button class="add-item-btn" onclick="addToCart('${product.id}')" title="Add to Order">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    `;
    gridContainer.appendChild(card);
  });
}

// 4. Toggle Product Like Status
function toggleLike(productId, button) {
  if (likedItems.has(productId)) {
    likedItems.delete(productId);
    button.classList.remove('liked');
  } else {
    likedItems.add(productId);
    button.classList.add('liked');
  }
}

// 5. Category Filtering
function filterCategory(category, button) {
  currentCategoryFilter = category;
  
  // Update category tab UI
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  button.classList.add('active');
  
  renderProducts();
}

// 6. Search Filtering
function filterProductsBySearch() {
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    searchFilter = searchInput.value;
    renderProducts();
  }
}

// 7. Add Product to Cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }
  
  renderCart();
  
  // Subtle animation on the cart panel
  const cartContainer = document.getElementById('cart-items-container');
  if (cartContainer) {
    cartContainer.classList.add('shake-element');
    setTimeout(() => cartContainer.classList.remove('shake-element'), 300);
  }
}

// 8. Remove/Decrease Product quantity in Cart
function changeQuantity(productId, delta) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    renderCart();
  }
}

// 9. Remove Product from Cart completely
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  renderCart();
}

// 10. Clear Cart
function clearCart() {
  cart = [];
  renderCart();
}

// 11. Render Cart Items & Update Totals
function renderCart() {
  const cartContainer = document.getElementById('cart-items-container');
  if (!cartContainer) return;
  
  cartContainer.innerHTML = '';
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart-view" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--color-cream-dark); padding: 40px 0;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p style="font-size: 13px;">Current order is empty.</p>
      </div>
    `;
    updateTotals(0, 0, 0, 0);
    return;
  }
  
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    const cartItemRow = document.createElement('div');
    cartItemRow.className = 'cart-item';
    cartItemRow.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <span class="cart-item-name">${item.name}</span>
        <div class="cart-item-qty-selector">
          <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">₹${itemTotal.toFixed(2)}</span>
        <button class="remove-item-btn" onclick="removeFromCart('${item.id}')" title="Remove Item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    cartContainer.appendChild(cartItemRow);
  });
  
  // Calculate Discount (5% if subtotal >= 300 to match the exact ₹30.00 discount on ₹600.00 order)
  const discount = subtotal >= 300 ? subtotal * 0.05 : 0;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.05; // 5% tax
  const total = taxableAmount + tax;
  
  updateTotals(subtotal, discount, tax, total);
}

// 12. Update Pricing Display UI
function updateTotals(subtotal, discount, tax, total) {
  const subtotalEl = document.getElementById('summary-subtotal');
  const discountEl = document.getElementById('summary-discount');
  const taxEl = document.getElementById('summary-tax');
  const totalEl = document.getElementById('summary-total');
  
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = discount > 0 ? `- ₹${discount.toFixed(2)}` : `₹0.00`;
  if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}

// 13. Proceed to Payment Receipt Modal
function proceedToPayment() {
  if (cart.length === 0) {
    alert('Please add some items to your order first!');
    return;
  }

  pendingCheckoutOrder = buildOrderSnapshot('Paid');
  if (!pendingCheckoutOrder) return;
  
  // Update Modal Values
  const receiptOperator = document.getElementById('receipt-operator');
  const receiptDateTime = document.getElementById('receipt-datetime');
  const receiptSubtotal = document.getElementById('receipt-subtotal');
  const receiptDiscount = document.getElementById('receipt-discount');
  const receiptTax = document.getElementById('receipt-tax');
  const receiptTotal = document.getElementById('receipt-total');
  const itemsListEl = document.getElementById('receipt-items-list');
  
  if (receiptOperator) receiptOperator.textContent = selectedOperator.name;

  if (receiptDateTime) receiptDateTime.textContent = pendingCheckoutOrder.displayDateTime;
  if (receiptSubtotal) receiptSubtotal.textContent = `₹${pendingCheckoutOrder.subtotal.toFixed(2)}`;
  if (receiptDiscount) receiptDiscount.textContent = pendingCheckoutOrder.discount > 0 ? `- ₹${pendingCheckoutOrder.discount.toFixed(2)}` : `₹0.00`;
  if (receiptTax) receiptTax.textContent = `₹${pendingCheckoutOrder.tax.toFixed(2)}`;
  if (receiptTotal) receiptTotal.textContent = `₹${pendingCheckoutOrder.total.toFixed(2)}`;

  // Populate Items list in Receipt
  if (itemsListEl) {
    itemsListEl.innerHTML = '';
    pendingCheckoutOrder.items.forEach(item => {
      const itemRow = document.createElement('div');
      itemRow.className = 'receipt-item-row';
      itemRow.innerHTML = `
        <span><span class="r-qty">${item.quantity}x</span> ${item.name}</span>
        <span>₹${item.total.toFixed(2)}</span>
      `;
      itemsListEl.appendChild(itemRow);
    });
  }
  
  // Show Modal
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.classList.add('active');
}

// 14. Close Receipt Modal and Reset Cart
function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.classList.remove('active');

  if (pendingCheckoutOrder) {
    saveOrderHistoryEntry(pendingCheckoutOrder);
    pendingCheckoutOrder = null;
  }

  // Clear cart after checkout
  clearCart();
}

// 15. Hold Order Action
function holdOrder() {
  if (cart.length === 0) {
    alert('No active order to place on hold.');
    return;
  }

  const heldOrder = buildOrderSnapshot('Held');
  if (!heldOrder) return;

  saveOrderHistoryEntry(heldOrder);
  alert(`Order placed on hold. \nOrder reference: ${heldOrder.id}`);
  clearCart();
}

// 16. Logout Session
function logoutSession() {
  if (dashClockInterval) clearInterval(dashClockInterval);
  
  // Clear sessionStorage operator details
  try {
    sessionStorage.removeItem('operatorName');
    sessionStorage.removeItem('operatorAvatar');
  } catch (e) {
    console.warn("sessionStorage is unavailable or blocked:", e);
  }
  
  // Redirect back to login screen
  window.location.href = 'index.html';
}
