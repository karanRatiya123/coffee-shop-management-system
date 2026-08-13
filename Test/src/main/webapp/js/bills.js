// --- Coffee Shop POS Bills Archive ---

const ORDER_HISTORY_STORAGE_KEY = 'brewos_order_history';

let allBills = [];
let billsSearch = '';
let dashClockInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadBills();
  renderBills();
});

function mapServletOrderToBill(order, index = 0) {
  const createdAt = order.orderDate || order.createdAt || new Date().toISOString();
  const status = String(order.status || 'Paid').toLowerCase();
  const normalizedStatus = status === 'completed' || status === 'paid' ? 'Paid' : 'Held';
  const total = Number(order.totalAmount ?? order.total ?? 0);

  return {
    id: order.orderId || order.id || `ORD-${index + 1}`,
    status: normalizedStatus,
    operator: order.operator || sessionStorage.getItem('operatorName') || 'Unknown',
    createdAt,
    displayDateTime: formatDateTime(createdAt),
    items: [],
    subtotal: total,
    discount: 0,
    tax: 0,
    total,
    payment: {
      method: 'N/A',
      summary: 'Servlet order'
    }
  };
}

async function loadBills() {
  let localBills = [];
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    localBills = list.filter(order => (order.status || '').toLowerCase() === 'paid' || (order.status || '').toLowerCase() === 'completed');
  } catch (localE) {
    console.warn('Unable to load bills from localStorage', localE);
    localBills = [];
  }

  let servletBills = [];
  try {
    const response = await fetch('OrderHistoryServlet');
    if (response.ok) {
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : [];
      servletBills = list
        .map((order, index) => mapServletOrderToBill(order, index))
        .filter(order => (order.status || '').toLowerCase() === 'paid');
    }
  } catch (e) {
    console.warn('Failed to load bills from servlet', e);
  }

  const billMap = new Map();
  localBills.forEach(bill => {
    const idKey = String(bill.id || bill.orderId || '');
    if (idKey) billMap.set(idKey, bill);
  });

  servletBills.forEach(bill => {
    const idKey = String(bill.id || bill.orderId || '');
    if (idKey && !billMap.has(idKey)) {
      billMap.set(idKey, bill);
    }
  });

  allBills = Array.from(billMap.values());
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

function isToday(isoValue) {
  const date = new Date(isoValue);
  const now = new Date();
  return date.getDate() === now.getDate()
    && date.getMonth() === now.getMonth()
    && date.getFullYear() === now.getFullYear();
}

function getFilteredBills() {
  const query = billsSearch.trim().toLowerCase();
  if (!query) return allBills;

  return allBills.filter(order => {
    const itemText = (order.items || []).map(item => item.name).join(' ').toLowerCase();
    const haystack = [
      order.id,
      order.operator,
      order.displayDateTime || formatDateTime(order.createdAt),
      order.payment?.method,
      order.payment?.summary,
      order.payment?.reference,
      order.payment?.upiId,
      itemText
    ].join(' ').toLowerCase();

    return haystack.includes(query);
  });
}

function renderBills() {

  const filteredBills = getFilteredBills();
  const totalBills = allBills.length;
  const todayBills = allBills.filter(order => isToday(order.createdAt)).length;
  const revenue = allBills.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const average = totalBills > 0 ? revenue / totalBills : 0;

  const totalBillsEl = document.getElementById('bills-total-count');
  const todayBillsEl = document.getElementById('bills-today-count');
  const revenueEl = document.getElementById('bills-revenue');
  const averageEl = document.getElementById('bills-average');
  const summaryNoteEl = document.getElementById('bills-summary-note');
  const listEl = document.getElementById('bills-list');

  if (totalBillsEl) totalBillsEl.textContent = String(totalBills);
  if (todayBillsEl) todayBillsEl.textContent = String(todayBills);
  if (revenueEl) revenueEl.textContent = formatMoney(revenue);
  if (averageEl) averageEl.textContent = formatMoney(average);
  if (summaryNoteEl) {
    summaryNoteEl.textContent = filteredBills.length === totalBills
      ? `${totalBills} bills saved`
      : `${filteredBills.length} of ${totalBills} bills shown`;
  }

  if (!listEl) return;

  listEl.innerHTML = '';

  if (filteredBills.length === 0) {
    listEl.innerHTML = `
      <div class="history-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2h9l3 3v17H6z"></path>
          <path d="M9 13h6"></path>
          <path d="M9 17h6"></path>
        </svg>
        <h3>No bills found</h3>
        <p>Try a different search or wait for a paid order to be saved.</p>
      </div>
    `;
    return;
  }

  filteredBills.forEach(order => {
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

    card.innerHTML = `
      <div class="history-order-top">
        <div>
          <div class="history-order-ref">${order.id}</div>
          <div class="history-order-meta">${formatDateTime(order.createdAt)}</div>
        </div>
        <div class="bill-card-actions">
          <span class="history-status-badge paid">Paid</span>
          <button class="bill-print-btn" type="button" onclick="printBillById('${order.id}')">Reprint Bill</button>
        </div>
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

function filterBillsBySearch() {
  const searchInput = document.getElementById('bills-search-input');
  billsSearch = searchInput ? searchInput.value : '';
  renderBills();
}

function clearBillsFilters() {
  billsSearch = '';
  const searchInput = document.getElementById('bills-search-input');
  if (searchInput) searchInput.value = '';
  renderBills();
}

function printBillById(orderId) {
  const bill = allBills.find(order => order.id === orderId);
  if (!bill) {
    alert('Bill not found.');
    return;
  }

  if (typeof window.printBill === 'function') {
    window.printBill(bill);
  }
}

function logoutSession() {
  if (dashClockInterval) clearInterval(dashClockInterval);

  try {
    sessionStorage.clear();
  } catch (e) {
    console.warn('sessionStorage is unavailable or blocked:', e);
  }

  window.location.href = 'index.html';
}

