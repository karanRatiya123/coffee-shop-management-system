// ==========================================
// Coffee Shop POS Dashboard
// Java Servlet Version
// ==========================================

// ---------- State Management ----------
let selectedOperator = {
    username: sessionStorage.getItem('operatorName') || 'Operator',
    name: sessionStorage.getItem('operatorName') || 'Operator',
    role: sessionStorage.getItem('operatorRole') || '',
    avatar: sessionStorage.getItem('operatorAvatar') || ''
};

let products = [];
let cart = [];
let currentCategoryFilter = 'All';
let searchFilter = '';
let likedItems = new Set();
let dashClockInterval = null;
let pendingCheckoutOrder = null;
let selectedPaymentMethod = 'Cash';
let selectedUpiMode = 'ID';
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=300';

// Image fields come from MenuServlet. Do not pass a webpage URL to <img>:
// Chrome blocks an HTML response requested as an image (ERR_BLOCKED_BY_ORB).
function getProductImageUrl(imageUrl) {
    if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
        return DEFAULT_PRODUCT_IMAGE;
    }

    try {
        const url = new URL(imageUrl.trim(), window.location.href);
        const isHttpUrl = url.protocol === 'http:' || url.protocol === 'https:';
        const hasImageExtension = /\.(avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i.test(url.pathname);
        const isUnsplashImage = /(^|\.)images\.unsplash\.com$/i.test(url.hostname);

        return isHttpUrl && (hasImageExtension || isUnsplashImage)
            ? url.href
            : DEFAULT_PRODUCT_IMAGE;
    } catch (error) {
        return DEFAULT_PRODUCT_IMAGE;
    }
}

// ---------- Initialize ----------
document.addEventListener('DOMContentLoaded', async () => {
    updateDashboardOperator();
    await loadProducts();
    await loadCategories();
    renderProducts();
    renderCart();
    setPaymentMethod('Cash');
    startDashboardClock();
    updateDashboardStats();
});

// ==========================================
// Load Products From Java Servlet (Database)
// ==========================================
async function loadProducts() {
    try {
        const response = await fetch("MenuServlet");
        if (response.ok) {
            products = await response.json();
        } else {
            console.error("MenuServlet returned status:", response.status);
            products = [];
        }
    } catch (error) {
        console.error("LOAD PRODUCTS ERROR:", error);
        products = [];
    }
}

// ==========================================
// Load Categories From Java Servlet (Database)
// ==========================================
async function loadCategories() {
    try {
        const response = await fetch("CategoryServlet");
        if (response.ok) {
            const categories = await response.json();
            const tabsContainer = document.querySelector('.category-tabs-container');
            if (tabsContainer && Array.isArray(categories) && categories.length > 0) {
                let tabsHtml = `<button class="category-tab ${currentCategoryFilter === 'All' ? 'active' : ''}" onclick="filterCategory('All', this)">All</button>`;
                categories.forEach(cat => {
                    tabsHtml += `<button class="category-tab ${cat.categoryName === currentCategoryFilter ? 'active' : ''}" onclick="filterCategory('${cat.categoryName}', this)">${cat.categoryName}</button>`;
                });
                tabsContainer.innerHTML = tabsHtml;
            }
        }
    } catch (error) {
        console.error("LOAD CATEGORIES ERROR:", error);
    }
}

// ==========================================
// Dashboard Operator Profile Sync
// ==========================================
function updateDashboardOperator() {
    const dashNameEl = document.getElementById('dash-operator-name');
    const dashAvatarEl = document.getElementById('dash-operator-avatar');
    const displayName = selectedOperator.username || selectedOperator.name || 'Operator';
    if (dashNameEl) dashNameEl.textContent = displayName;
    if (dashAvatarEl && selectedOperator.avatar) {
        dashAvatarEl.style.backgroundImage = `url('${selectedOperator.avatar}')`;
    }
}

// ==========================================
// Real-time Clock for Dashboard
// ==========================================
function startDashboardClock() {
    const timeEl = document.getElementById('dash-time-display');
    if (!timeEl) return;
    if (dashClockInterval) clearInterval(dashClockInterval);
    function updateTime() {
        const now = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        timeEl.textContent = now.toLocaleDateString('en-US', options);
    }
    updateTime();
    dashClockInterval = setInterval(updateTime, 1000);
}

// ==========================================
// Render Product Cards Grid
// ==========================================
function renderProducts() {
    const gridContainer = document.getElementById('products-grid-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    
    const filteredProducts = (products || []).filter(product => {
        const prodCat = (product.category || '').toLowerCase();
        const filterCat = currentCategoryFilter.toLowerCase();
        
        const matchesCategory = currentCategoryFilter === 'All' ||
                              prodCat === filterCat ||
                              prodCat.includes(filterCat) ||
                              filterCat.includes(prodCat) ||
                              String(product.categoryId) === String(currentCategoryFilter);

        const search = searchFilter.toLowerCase();
        const matchesSearch = (product.itemName || '').toLowerCase().includes(search) ||
                              (product.description || '').toLowerCase().includes(search);
                              
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
        const isLiked = likedItems.has(product.menuId);
        const productId = product.menuId;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <button class="favorite-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${productId}, this)" title="Add to Favorites">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
            <div class="product-image-container">
                <img class="product-img" src="${getProductImageUrl(product.image)}" alt="${product.itemName || 'Product'}" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
            </div>
            <div class="product-info-block">
                <h3 class="product-name">${product.itemName || ''}</h3>
                <span class="product-sub">${product.description || ''}</span>
            </div>
            <div class="product-footer-row">
                <span class="product-price">₹${Number(product.price || 0).toFixed(2)}</span>
                <button class="add-item-btn" onclick="addToCart(${productId})" title="Add to Order">
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

// ==========================================
// Toggle Product Like Status
// ==========================================
function toggleLike(productId, button) {
    if (likedItems.has(productId)) {
        likedItems.delete(productId);
        button.classList.remove('liked');
    } else {
        likedItems.add(productId);
        button.classList.add('liked');
    }
}

// ==========================================
// Category Filtering
// ==========================================
function filterCategory(category, button) {
    currentCategoryFilter = category;
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    if (button) button.classList.add('active');
    renderProducts();
}

// ==========================================
// Search Filtering
// ==========================================
function filterProductsBySearch() {
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
        searchFilter = searchInput.value;
        renderProducts();
    }
}

// ==========================================
// Add Product to Cart
// ==========================================
function addToCart(productId) {
    const product = products.find(p => p.menuId === productId);
    if (!product) return;
    const existingItem = cart.find(item => item.menuId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            id: product.menuId,
            quantity: 1
        });
    }
    renderCart();
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        cartContainer.classList.add('shake-element');
        setTimeout(() => cartContainer.classList.remove('shake-element'), 300);
    }
}

// ==========================================
// Change Quantity in Cart
// ==========================================
function changeQuantity(productId, delta) {
    const item = cart.find(item => item.menuId === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        renderCart();
    }
}

// ==========================================
// Remove Product from Cart Completely
// ==========================================
function removeFromCart(productId) {
    cart = cart.filter(item => item.menuId !== productId);
    renderCart();
}

// ==========================================
// Clear Cart
// ==========================================
function clearCart() {
    cart = [];
    selectedPaymentMethod = 'Cash';
    selectedUpiMode = 'ID';
    renderCart();
}

// ==========================================
// Render Cart Items & Update Totals
// ==========================================
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
            <img src="${getProductImageUrl(item.image)}" alt="${item.itemName}" class="cart-item-img" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
            <div class="cart-item-details">
                <span class="cart-item-name">${item.itemName}</span>
                <div class="cart-item-qty-selector">
                    <button class="qty-btn" onclick="changeQuantity(${item.menuId}, -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${item.menuId}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-right">
                <span class="cart-item-price">₹${itemTotal.toFixed(2)}</span>
                <button class="remove-item-btn" onclick="removeFromCart(${item.menuId})" title="Remove Item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        cartContainer.appendChild(cartItemRow);
    });
    const discount = subtotal >= 300 ? subtotal * 0.05 : 0;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.05; // 5% tax
    const total = taxableAmount + tax;
    updateTotals(subtotal, discount, tax, total);
}

// ==========================================
// Update Pricing Display UI
// ==========================================
function updateTotals(subtotal, discount, tax, total) {
    const subtotalEl = document.getElementById('summary-subtotal');
    const discountEl = document.getElementById('summary-discount');
    const taxEl = document.getElementById('summary-tax');
    const totalEl = document.getElementById('summary-total');
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = discount > 0 ? `- ₹${discount.toFixed(2)}` : `₹0.00`;
    if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
    updatePaymentPreview(total);
}

// ==========================================
// Helper: Get Current Order Total
// ==========================================
function getCurrentOrderTotal() {
    if (cart.length === 0) return 0;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal >= 300 ? subtotal * 0.05 : 0;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.05;
    return taxableAmount + tax;
}

// ==========================================
// Set Payment Method
// ==========================================
function setPaymentMethod(method) {
    selectedPaymentMethod = method;
    const buttons = document.querySelectorAll('#payment-modal .payment-method-btn');
    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.method === method);
    });
    const cashPanel = document.getElementById('cash-payment-panel');
    const cardPanel = document.getElementById('card-payment-panel');
    const upiPanel = document.getElementById('upi-payment-panel');
    if (cashPanel) cashPanel.classList.toggle('active', method === 'Cash');
    if (cardPanel) cardPanel.classList.toggle('active', method === 'Card');
    if (upiPanel) upiPanel.classList.toggle('active', method === 'UPI');
    if (method === 'UPI') setUpiMode(selectedUpiMode);
    updatePaymentPreview(getCurrentOrderTotal());
}

// ==========================================
// Set UPI Mode (ID / QR)
// ==========================================
function setUpiMode(mode) {
    selectedUpiMode = mode;
    const buttons = document.querySelectorAll('.upi-mode-btn');
    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.mode === mode);
    });
    const upiIdPanel = document.getElementById('upi-id-panel');
    const upiQrPanel = document.getElementById('upi-qr-panel');
    if (upiIdPanel) upiIdPanel.classList.toggle('active', mode === 'ID');
    if (upiQrPanel) upiQrPanel.classList.toggle('active', mode === 'QR');
}

// ==========================================
// Reset Payment Modal Fields
// ==========================================
function resetPaymentModalFields() {
    selectedUpiMode = 'ID';
    const cardHolder = document.getElementById('card-holder-input');
    const cardLast4 = document.getElementById('card-last4-input');
    const cardAuth = document.getElementById('card-auth-input');
    const upiId = document.getElementById('upi-id-input');
    const upiRef = document.getElementById('upi-ref-input');
    const upiQrRef = document.getElementById('upi-qr-ref-input');
    if (cardHolder) cardHolder.value = '';
    if (cardLast4) cardLast4.value = '';
    if (cardAuth) cardAuth.value = '';
    if (upiId) upiId.value = '';
    if (upiRef) upiRef.value = '';
    if (upiQrRef) upiQrRef.value = '';
}

// ==========================================
// Update Payment Preview
// ==========================================
function updatePaymentPreview(total) {
    const previewMethodEl = document.getElementById('payment-modal-order-ref');
    const previewAmountEl = document.getElementById('payment-modal-total');
    if (previewMethodEl) {
        previewMethodEl.textContent = selectedPaymentMethod === 'Cash' ? 'Cash payment' : `${selectedPaymentMethod} details`;
    }
    if (previewAmountEl) previewAmountEl.textContent = `₹${Number(total || 0).toFixed(2)}`;
}

// ==========================================
// Build Payment Details Object
// ==========================================
function buildPaymentDetails(total) {
    if (selectedPaymentMethod === 'Cash') {
        return {
            method: 'Cash',
            amountDue: total,
            summary: 'Cash payment'
        };
    }
    if (selectedPaymentMethod === 'Card') {
        const cardHolder = (document.getElementById('card-holder-input')?.value || '').trim();
        const cardLast4 = (document.getElementById('card-last4-input')?.value || '').replace(/\D/g, '').slice(-4);
        const cardAuth = (document.getElementById('card-auth-input')?.value || '').trim();
        if (!cardHolder || cardLast4.length !== 4) {
            alert('Enter the card holder name and the last 4 digits of the card.');
            return null;
        }
        return {
            method: 'Card',
            amountDue: total,
            cardHolder,
            cardLast4,
            authCode: cardAuth || generateOrderReference('CRD'),
            summary: `Card ****${cardLast4} ${cardHolder}`
        };
    }
    if (selectedUpiMode === 'ID') {
        const upiId = (document.getElementById('upi-id-input')?.value || '').trim();
        const upiRef = (document.getElementById('upi-ref-input')?.value || '').trim();
        if (!upiId) {
            alert('Enter the UPI ID to continue.');
            return null;
        }
        return {
            method: 'UPI',
            amountDue: total,
            upiMode: 'ID',
            upiId,
            reference: upiRef || generateOrderReference('UPI'),
            summary: `UPI ID ${upiId}`
        };
    }
    return {
        method: 'UPI',
        amountDue: total,
        upiMode: 'QR',
        reference: (document.getElementById('upi-qr-ref-input')?.value || '').trim() || generateOrderReference('UPI'),
        summary: 'UPI QR payment'
    };
}

// ==========================================
// Open/Close Payment Modal
// ==========================================
function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (!modal) return;
    selectedPaymentMethod = 'Cash';
    selectedUpiMode = 'ID';
    resetPaymentModalFields();
    setPaymentMethod('Cash');
    updatePaymentPreview(getCurrentOrderTotal());
    modal.classList.add('active');
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.remove('active');
}

// ==========================================
// Proceed to Payment
// ==========================================
function proceedToPayment() {
    if (cart.length === 0) {
        alert('Please add some items to your order first!');
        return;
    }
    openPaymentModal();
}

// ==========================================
// Confirm Payment & Show Receipt Modal
// ==========================================
// ==========================================
// Confirm Payment & Show Receipt Modal
// ==========================================
async function confirmPayment() {
    if (cart.length === 0) {
        alert('Please add some items to your order first!');
        return;
    }
    const total = getCurrentOrderTotal();
    const paymentDetails = buildPaymentDetails(total);
    if (!paymentDetails) return;
    // Order lifecycle status (DB ENUM) — not payment status
    pendingCheckoutOrder = buildOrderSnapshot('Completed', paymentDetails);
    if (!pendingCheckoutOrder) return;

    // Send complete order to OrderServlet (MySQL transaction)
    const dbSuccess = await saveOrderToDatabase(pendingCheckoutOrder);
    if (!dbSuccess) {
        alert('Order could not be saved to database. Transaction failed.');
        return;
    }

    closePaymentModal();
    // Update receipt modal UI
    const receiptOperator = document.getElementById('receipt-operator');
    const receiptDateTime = document.getElementById('receipt-datetime');
    const receiptSubtotal = document.getElementById('receipt-subtotal');
    const receiptDiscount = document.getElementById('receipt-discount');
    const receiptTax = document.getElementById('receipt-tax');
    const receiptTotal = document.getElementById('receipt-total');
    const itemsListEl = document.getElementById('receipt-items-list');
    if (receiptOperator) receiptOperator.textContent = selectedOperator.username || selectedOperator.name || 'Operator';
    if (receiptDateTime) receiptDateTime.textContent = pendingCheckoutOrder.displayDateTime;
    if (receiptSubtotal) receiptSubtotal.textContent = `₹${pendingCheckoutOrder.subtotal.toFixed(2)}`;
    if (receiptDiscount) receiptDiscount.textContent = pendingCheckoutOrder.discount > 0 ? `- ₹${pendingCheckoutOrder.discount.toFixed(2)}` : `₹0.00`;
    if (receiptTax) receiptTax.textContent = `₹${pendingCheckoutOrder.tax.toFixed(2)}`;
    if (receiptTotal) receiptTotal.textContent = `₹${pendingCheckoutOrder.total.toFixed(2)}`;
    const receiptPaymentMode = document.getElementById('receipt-payment-mode');
    const receiptPaymentRef = document.getElementById('receipt-payment-ref');
    if (receiptPaymentMode) receiptPaymentMode.textContent = pendingCheckoutOrder.payment?.method || 'Unknown';
    if (receiptPaymentRef) receiptPaymentRef.textContent = pendingCheckoutOrder.payment?.summary || pendingCheckoutOrder.payment?.reference || 'N/A';
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
    const receiptModal = document.getElementById('receipt-modal');
    if (receiptModal) receiptModal.classList.add('active');
}

// ==========================================
// Close Receipt Modal & Reset Cart
// ==========================================
async function closeReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.remove('active');
    if (pendingCheckoutOrder) {
        if (typeof window.printBill === 'function') {
            window.printBill(pendingCheckoutOrder);
        }
        pendingCheckoutOrder = null;
    }
    clearCart();
    resetPaymentModalFields();
    selectedPaymentMethod = 'Cash';
    setPaymentMethod('Cash');
    await updateDashboardStats();
}

// ==========================================
// Hold Order Action
// ==========================================
async function holdOrder() {
    if (cart.length === 0) {
        alert('No active order to place on hold.');
        return;
    }
    const heldOrder = buildOrderSnapshot('Held');
    if (!heldOrder) return;
    await saveOrderHistoryEntry(heldOrder);
    alert(`Order placed on hold. \nOrder reference: ${heldOrder.id}`);
    clearCart();
    updateDashboardStats();
}

// ==========================================
// Update Dynamic Dashboard Statistics
// ==========================================
async function updateDashboardStats() {
    let sales = 0;
    let ordersCount = 0;
    let itemsSoldCount = 0;
    let lowStockCount = 0;

    try {
        const response = await fetch("DashboardServlet");
        if (response.ok) {
            const data = await response.json();
            sales = Number(data.todaySales || 0);
            ordersCount = Number(data.orders || 0);
            itemsSoldCount = Number(data.itemsSold || 0);
            lowStockCount = Number(data.lowStock || 0);
        }
    } catch (e) {
        console.warn("Unable to fetch DashboardServlet stats, reading local history:", e);
    }

    const history = getOrderHistory();
    const now = new Date();
    const todayOrders = history.filter(order => {
        if (!order.createdAt) return false;
        const d = new Date(order.createdAt);
        return d.getDate() === now.getDate() &&
               d.getMonth() === now.getMonth() &&
               d.getFullYear() === now.getFullYear();
    });

    const targetList = todayOrders;

    const localSales = targetList
        .filter(order => order.status === 'Paid' || order.status === 'Completed')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const localOrdersCount = targetList.length;

    const localItemsSold = targetList
        .filter(order => order.status === 'Paid' || order.status === 'Completed')
        .reduce((sum, order) => {
            const qtySum = (order.items || []).reduce((iq, item) => iq + Number(item.quantity || 1), 0);
            return sum + qtySum;
        }, 0);

    const finalSales = Math.max(sales, localSales);
    const finalOrders = Math.max(ordersCount, localOrdersCount);
    const finalItemsSold = Math.max(itemsSoldCount, localItemsSold);

    const salesEl = document.getElementById('dash-today-sales');
    const ordersEl = document.getElementById('dash-orders-count');
    const itemsSoldEl = document.getElementById('dash-items-sold');
    const lowStockEl = document.getElementById('dash-low-stock');

    if (salesEl) salesEl.textContent = `₹${finalSales.toFixed(2)}`;
    if (ordersEl) ordersEl.textContent = String(finalOrders);
    if (itemsSoldEl) itemsSoldEl.textContent = String(finalItemsSold);
    if (lowStockEl) lowStockEl.textContent = `${lowStockCount} Items`;
}

// ==========================================
// Helper: Format Date/Time for Display
// ==========================================
function formatOrderDateTime(date = new Date()) {
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleString('en-US', options);
}

// ==========================================
// Helper: Generate Unique Order Reference
// ==========================================
function generateOrderReference(prefix = 'ORD') {
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${stamp}-${suffix}`;
}

// ==========================================
// Build Order Snapshot Object
// ==========================================
function buildOrderSnapshot(status, paymentDetails = {}) {
    if (cart.length === 0) return null;
    let subtotal = 0;
    const items = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return {
            id: item.menuId,
            name: item.itemName,
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
        operator: selectedOperator.username || selectedOperator.name || 'Operator',
        terminal: 'TERMINAL-01',
        createdAt: createdAt.toISOString(),
        displayDateTime: formatOrderDateTime(createdAt),
        items,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod: paymentDetails.method,
        payment: paymentDetails
    };
}

// ==========================================
// Order History Helpers (localStorage)
// ==========================================
function getOrderHistory() {
    try {
        const raw = localStorage.getItem('brewos_order_history');
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.warn('localStorage is unavailable or blocked:', e);
        return [];
    }
}

async function saveOrderToDatabase(order) {
    if (!order) return false;

    try {
        const orderPayload = {
            // Never use order.status here — it may be "Paid" from UI snapshot.
            // orders.status ENUM: Pending | Preparing | Completed | Cancelled
            status: "Completed",

            subtotal: Number(order.subtotal || 0),
            discount: Number(order.discount || 0),
            tax: Number(order.tax || 0),
            totalAmount: Number(order.total || order.totalAmount || 0),

            // Payment information is separate from order status
            paymentMethod:
                order.paymentMethod ||
                order.payment?.method ||
                "Cash",

            paymentStatus: "Paid",

            customerId: null,

            employeeId: null,

            tableId: null,

            items: (order.items || []).map(item => ({
                menuId: item.menuId || item.id,
                quantity: Number(item.quantity || 1),
                unitPrice: Number(item.unitPrice || item.price || 0),
                subtotal: Number(
                    item.subtotal ||
                    item.total ||
                    ((item.price || item.unitPrice || 0) *
                     (item.quantity || 1))
                )
            }))
        };

        console.log("========== ORDER PAYLOAD ==========");
        console.log(JSON.stringify(orderPayload, null, 2));

        const response = await fetch("OrderServlet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        console.log("========== ORDER RESPONSE ==========");
        console.log(data);

        if (!response.ok) {
            console.error(
                "OrderServlet returned status:",
                response.status,
                data
            );
            return false;
        }

        if (data && data.success) {

            if (data.orderId > 0) {
                order.orderId = data.orderId;
                order.id = `ORD-${data.orderId}`;
            }

            console.log(
                "ORDER SAVED SUCCESSFULLY. ID =",
                data.orderId
            );

            return true;
        }

        console.error("Order was not saved:", data);
        return false;

    } catch (e) {

        console.error(
            "ERROR SAVING ORDER TO DATABASE:",
            e
        );

        return false;
    }
}

async function saveOrderHistoryEntry(order) {
    return await saveOrderToDatabase(order);
}

// ==========================================
// Logout Session
// ==========================================
function logoutSession() {
    if (dashClockInterval) clearInterval(dashClockInterval);
    try {
        sessionStorage.clear();
    } catch (e) {
        console.warn('sessionStorage is unavailable or blocked:', e);
    }
    window.location.href = 'index.html';
}
