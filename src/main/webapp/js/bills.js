// --- Coffee Shop POS Bills Archive ---

let allBills = [];
let billsSearch = '';
let dashClockInterval = null;

let billsLoaded = false;

async function initializeBills() {
  if (billsLoaded) return;

  billsLoaded = true;
  console.log('Bills initialized; requesting saved bills from the database.');
  await loadBills();
   renderBills();
}

// Works whether this script runs before or after DOMContentLoaded.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBills, { once: true });
} else {
  initializeBills();
}

async function loadBills() {
  try {
    const response = await fetch(new URL('BillingServlet', window.location.href), {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (response.ok) {
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : [];
      allBills = list.map((bill, index) => {
        const createdAt = bill.billDate || bill.orderDate || new Date().toISOString();
        const status = String(bill.paymentStatus || bill.status || 'Paid').toLowerCase();
        const normalizedStatus = status === 'completed' || status === 'paid' ? 'Paid' : 'Held';
        const total = Number(bill.grandTotal ?? bill.totalAmount ?? bill.total ?? 0);
        const subtotal = Number(bill.subtotal ?? 0);
        const discount = Number(bill.discount ?? 0);
        const tax = Number(bill.tax ?? 0);

        const items = (bill.items || []).map(item => ({
          id: item.menuId,
          name: item.itemName || 'Item',
          quantity: Number(item.quantity || 1),
          price: Number(item.unitPrice || 0),
          total: Number(item.subtotal || (item.unitPrice * item.quantity) || 0)
        }));

        return {
          id: bill.orderId ? `ORD-${bill.orderId}` : (bill.billId ? `BILL-${bill.billId}` : `ORD-${index + 1}`),
          orderId: bill.orderId,
          billId: bill.billId,
          status: normalizedStatus,
          operator: sessionStorage.getItem('operatorName') || 'Operator',
          createdAt,
          displayDateTime: formatDateTime(createdAt),
          items,
          subtotal,
          discount,
          tax,
          total,
          payment: {
            method: bill.paymentMethod || 'Cash',
            summary: `${bill.paymentMethod || 'Cash'} payment`
          }
        };
      });
    } else {
      console.error('BillingServlet returned status:', response.status);
      allBills = [];
    }
  } catch (e) {
    console.error('Failed to load bills from BillingServlet:', e);
    allBills = [];
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
