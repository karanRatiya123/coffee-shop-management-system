// --- Coffee Shop POS Order History ---

const ORDER_HISTORY_STORAGE_KEY = 'brewos_order_history';

let orderHistory = [];
let historySearch = '';
let historyStatusFilter = 'All';
let dashClockInterval = null;

try {
  const storedName = sessionStorage.getItem('operatorName');
  const storedAvatar = sessionStorage.getItem('operatorAvatar');
  if (storedName || storedAvatar) {
    // Session data is not displayed on this page, but the read keeps behavior aligned.
  }
} catch (e) {
  console.warn('sessionStorage is unavailable or blocked:', e);
}

document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  renderHistory();
});

function loadHistory() {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    orderHistory = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Unable to load order history:', e);
    orderHistory = [];
  }
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

function formatDateTime(isoValue) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} | ${timeStr}`;
}

function getFilteredHistory() {
  return orderHistory.filter(order => {
    const matchesStatus = historyStatusFilter === 'All' || order.status === historyStatusFilter;
    const query = historySearch.trim().toLowerCase();
    if (!query) return matchesStatus;

    const itemText = (order.items || []).map(item => item.name).join(' ').toLowerCase();
    const haystack = [
      order.id,
      order.status,
      order.operator,
      order.displayDateTime,
      order.payment?.method,
      order.payment?.reference,
      order.payment?.summary,
      itemText
    ].join(' ').toLowerCase();

    return matchesStatus && haystack.includes(query);
  });
}

function renderHistory() {
  loadHistory();

  const filteredOrders = getFilteredHistory();
  const totalOrders = orderHistory.length;
  const paidOrders = orderHistory.filter(order => order.status === 'Paid').length;
  const heldOrders = orderHistory.filter(order => order.status === 'Held').length;
  const revenue = orderHistory
    .filter(order => order.status === 'Paid')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const totalOrdersEl = document.getElementById('history-total-orders');
  const paidOrdersEl = document.getElementById('history-paid-orders');
  const heldOrdersEl = document.getElementById('history-held-orders');
  const revenueEl = document.getElementById('history-revenue');
  const summaryNoteEl = document.getElementById('history-summary-note');
  const listEl = document.getElementById('order-history-list');

  if (totalOrdersEl) totalOrdersEl.textContent = String(totalOrders);
  if (paidOrdersEl) paidOrdersEl.textContent = String(paidOrders);
  if (heldOrdersEl) heldOrdersEl.textContent = String(heldOrders);
  if (revenueEl) revenueEl.textContent = formatMoney(revenue);
  if (summaryNoteEl) {
    if (filteredOrders.length === totalOrders) {
      summaryNoteEl.textContent = totalOrders === 1 ? '1 order recorded' : `${totalOrders} orders recorded`;
    } else {
      summaryNoteEl.textContent = `${filteredOrders.length} of ${totalOrders} orders shown`;
    }
  }

  if (!listEl) return;

  listEl.innerHTML = '';

  if (filteredOrders.length === 0) {
    listEl.innerHTML = `
      <div class="history-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h18v18H3z"></path>
          <path d="M8 7h8"></path>
          <path d="M8 12h8"></path>
          <path d="M8 17h5"></path>
        </svg>
        <h3>No orders found</h3>
        <p>Try a different search or switch the status filter.</p>
      </div>
    `;
    return;
  }

  filteredOrders.forEach(order => {
    const card = document.createElement('article');
    card.className = 'history-order-card';

    const itemLines = (order.items || [])
      .slice(0, 3)
      .map(item => `
        <div class="history-item-line">
          <span>${item.quantity}x ${item.name}</span>
          <span>${formatMoney(item.total)}</span>
        </div>
      `)
      .join('');

    const remainingCount = Math.max((order.items || []).length - 3, 0);
    const statusClass = order.status === 'Paid' ? 'paid' : 'held';

    card.innerHTML = `
      <div class="history-order-top">
        <div>
          <div class="history-order-ref">${order.id}</div>
          <div class="history-order-meta">${formatDateTime(order.createdAt)}</div>
        </div>
        <span class="history-status-badge ${statusClass}">${order.status}</span>
      </div>

      <div class="history-order-meta-row">
        <span>Operator</span>
        <strong>${order.operator || 'Unknown'}</strong>
      </div>

      <div class="history-order-meta-row">
        <span>Payment</span>
        <strong>${order.payment?.method || 'N/A'}${order.payment?.summary ? ` · ${order.payment.summary}` : order.payment?.reference ? ` · ${order.payment.reference}` : ''}</strong>
      </div>

      <div class="history-item-list">
        ${itemLines}
        ${remainingCount > 0 ? `<div class="history-item-line muted"><span>+ ${remainingCount} more item${remainingCount > 1 ? 's' : ''}</span><span></span></div>` : ''}
      </div>

      <div class="history-totals-grid">
        <div><span>Subtotal</span><strong>${formatMoney(order.subtotal)}</strong></div>
        <div><span>Discount</span><strong>${formatMoney(order.discount)}</strong></div>
        <div><span>Tax</span><strong>${formatMoney(order.tax)}</strong></div>
        <div><span>Total</span><strong>${formatMoney(order.total)}</strong></div>
      </div>
    `;

    listEl.appendChild(card);
  });
}

function filterHistoryBySearch() {
  const searchInput = document.getElementById('history-search-input');
  historySearch = searchInput ? searchInput.value : '';
  renderHistory();
}

function filterHistoryByStatus(status, button) {
  historyStatusFilter = status;

  const buttons = document.querySelectorAll('.history-tab');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (button) button.classList.add('active');

  renderHistory();
}

function clearHistoryFilters() {
  historySearch = '';
  historyStatusFilter = 'All';

  const searchInput = document.getElementById('history-search-input');
  if (searchInput) searchInput.value = '';

  const buttons = document.querySelectorAll('.history-tab');
  buttons.forEach(btn => btn.classList.remove('active'));
  const allButton = buttons[0];
  if (allButton) allButton.classList.add('active');

  renderHistory();
}

function logoutSession() {
  if (dashClockInterval) clearInterval(dashClockInterval);

  try {
    sessionStorage.removeItem('operatorName');
    sessionStorage.removeItem('operatorAvatar');
  } catch (e) {
    console.warn('sessionStorage is unavailable or blocked:', e);
  }

  window.location.href = 'index.html';
}
