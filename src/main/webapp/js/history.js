// =====================================================
// COFFEE SHOP POS - ORDER HISTORY
// Java Servlet + MySQL Version
// =====================================================

let orderHistory = [];

let historySearch = '';
let historyStatusFilter = 'All';


// =====================================================
// INITIALIZE
// =====================================================

let historyLoadStarted = false;

async function initializeHistory() {
  if (historyLoadStarted) return;

  historyLoadStarted = true;
  console.log('Order History initialized; requesting database orders.');
  await loadHistory();
}

// Start the request as soon as this file is evaluated. This avoids relying on
// DOMContentLoaded or window.load, which may already have fired.
void initializeHistory();


// =====================================================
// LOAD ORDERS FROM JAVA SERVLET
// =====================================================

async function loadHistory() {

  try {

    console.log("Loading order history...");

    const historyUrl = new URL('OrderHistoryServlet', window.location.href);
    historyUrl.searchParams.set('_', Date.now().toString());

    const response = await fetch(historyUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });

    console.log("OrderHistoryServlet status:", response.status);

    if (!response.ok) {

      throw new Error(
          "OrderHistoryServlet returned HTTP " +
          response.status
      );
    }

    const data = await response.json();

    console.log("Orders received from database:", data);

    if (Array.isArray(data)) {

      orderHistory = data;

    } else {

      orderHistory = [];

    }

    renderHistory();

  } catch (error) {

    console.error(
        "ORDER HISTORY LOAD ERROR:",
        error
    );

    orderHistory = [];

    renderHistory();

  }
}


// =====================================================
// MONEY FORMAT
// =====================================================

function formatMoney(amount) {

  return `₹${Number(amount || 0).toFixed(2)}`;

}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDateTime(value) {

  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const dateStr = date.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
  );

  const timeStr = date.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
  );

  return `${dateStr} | ${timeStr}`;

}


// =====================================================
// FILTER HISTORY
// =====================================================

function getFilteredHistory() {

  return orderHistory.filter(function (order) {

    /*
     * Database uses Completed.
     * So Completed should be considered a successful/paid
     * POS order.
     */

    let matchesStatus = true;

    if (historyStatusFilter === 'Paid') {

      matchesStatus =
          order.status === 'Completed' ||
          order.status === 'Paid';

    } else if (historyStatusFilter === 'Held') {

      matchesStatus =
          order.status === 'Pending';

    } else if (historyStatusFilter !== 'All') {

      matchesStatus =
          order.status === historyStatusFilter;

    }


    const query =
        historySearch.trim().toLowerCase();


    if (!query) {

      return matchesStatus;

    }


    const haystack = [

      order.id,

      order.orderId,

      order.status,

      order.customerId,

      order.tableId,

      order.orderDate,

      order.createdAt

    ].join(' ').toLowerCase();


    return matchesStatus &&
        haystack.includes(query);

  });

}


// =====================================================
// RENDER HISTORY
// =====================================================

function renderHistory() {

  const filteredOrders =
      getFilteredHistory();


  // -------------------------------------------------
  // COUNTS
  // -------------------------------------------------

  const totalOrders =
      orderHistory.length;


  const paidOrders =
      orderHistory.filter(function (order) {

        return order.status === 'Completed' ||
            order.status === 'Paid';

      }).length;


  const heldOrders =
      orderHistory.filter(function (order) {

        return order.status === 'Pending';

      }).length;


  const revenue =
      orderHistory
          .filter(function (order) {

            return order.status === 'Completed' ||
                order.status === 'Paid';

          })
          .reduce(function (sum, order) {

            return sum +
                Number(
                    order.totalAmount ??
                    order.total ??
                    0
                );

          }, 0);


  // -------------------------------------------------
  // UPDATE DASHBOARD NUMBERS
  // -------------------------------------------------

  const totalOrdersEl =
      document.getElementById(
          'history-total-orders'
      );

  const paidOrdersEl =
      document.getElementById(
          'history-paid-orders'
      );

  const heldOrdersEl =
      document.getElementById(
          'history-held-orders'
      );

  const revenueEl =
      document.getElementById(
          'history-revenue'
      );

  const summaryNoteEl =
      document.getElementById(
          'history-summary-note'
      );


  if (totalOrdersEl) {

    totalOrdersEl.textContent =
        String(totalOrders);

  }


  if (paidOrdersEl) {

    paidOrdersEl.textContent =
        String(paidOrders);

  }


  if (heldOrdersEl) {

    heldOrdersEl.textContent =
        String(heldOrders);

  }


  if (revenueEl) {

    revenueEl.textContent =
        formatMoney(revenue);

  }


  if (summaryNoteEl) {

    summaryNoteEl.textContent =
        `${filteredOrders.length} of ${totalOrders} orders shown`;

  }


  // -------------------------------------------------
  // ORDER LIST
  // -------------------------------------------------

  const listEl =
      document.getElementById(
          'order-history-list'
      );


  if (!listEl) {

    console.error(
        "order-history-list element not found"
    );

    return;

  }


  listEl.innerHTML = '';


  // -------------------------------------------------
  // NO ORDERS
  // -------------------------------------------------

  if (filteredOrders.length === 0) {

    listEl.innerHTML = `

            <div class="history-empty-state">

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >

                    <path d="M3 3h18v18H3z"></path>

                    <path d="M8 7h8"></path>

                    <path d="M8 12h8"></path>

                    <path d="M8 17h5"></path>

                </svg>

                <h3>No orders found</h3>

                <p>
                    No completed orders were found in the database.
                </p>

            </div>

        `;

    return;

  }


  // -------------------------------------------------
  // DISPLAY ORDERS
  // -------------------------------------------------

  filteredOrders.forEach(function (order) {

    const card =
        document.createElement('article');

    card.className =
        'history-order-card';


    const orderId =
        order.orderId ??
        order.id ??
        '';


    const total =
        order.totalAmount ??
        order.total ??
        0;


    const orderDate =
        order.orderDate ??
        order.createdAt ??
        '';


    /*
     * Completed = successfully completed POS order.
     */
    const displayStatus =
        order.status === 'Completed'
            ? 'Paid'
            : order.status;


    const statusClass =
        displayStatus === 'Paid'
            ? 'paid'
            : 'held';


    card.innerHTML = `

            <div class="history-order-top">

                <div>

                    <div class="history-order-ref">

                        Order #${orderId}

                    </div>

                    <div class="history-order-meta">

                        ${formatDateTime(orderDate)}

                    </div>

                </div>


                <span
                    class="history-status-badge ${statusClass}"
                >

                    ${displayStatus}

                </span>

            </div>


            <div class="history-order-meta-row">

                <span>Customer</span>

                <strong>

                    ${
        order.customerId
            ? '#' + order.customerId
            : 'Walk-in'

    }

                </strong>

            </div>


            <div class="history-order-meta-row">

                <span>Table</span>

                <strong>

                    ${
        order.tableId
            ? '#' + order.tableId
            : 'N/A'

    }

                </strong>

            </div>


            <div class="history-totals-grid">

                <div>

                    <span>Subtotal</span>

                    <strong>
                        ${formatMoney(order.subtotal)}
                    </strong>

                </div>


                <div>

                    <span>Discount</span>

                    <strong>
                        ${formatMoney(order.discount)}
                    </strong>

                </div>


                <div>

                    <span>Total</span>

                    <strong>
                        ${formatMoney(total)}
                    </strong>

                </div>

            </div>

        `;


    listEl.appendChild(card);

  });

}


// =====================================================
// SEARCH
// =====================================================

function filterHistoryBySearch() {

  const searchInput =
      document.getElementById(
          'history-search-input'
      );


  historySearch =
      searchInput
          ? searchInput.value
          : '';


  renderHistory();

}


// =====================================================
// STATUS FILTER
// =====================================================

function filterHistoryByStatus(
    status,
    button
) {

  historyStatusFilter =
      status;


  const buttons =
      document.querySelectorAll(
          '.history-tab'
      );


  buttons.forEach(function (btn) {

    btn.classList.remove('active');

  });


  if (button) {

    button.classList.add('active');

  }


  renderHistory();

}


// =====================================================
// CLEAR FILTERS
// =====================================================

function clearHistoryFilters() {

  historySearch = '';

  historyStatusFilter = 'All';


  const searchInput =
      document.getElementById(
          'history-search-input'
      );


  if (searchInput) {

    searchInput.value = '';

  }


  const buttons =
      document.querySelectorAll(
          '.history-tab'
      );


  buttons.forEach(function (btn) {

    btn.classList.remove('active');

  });


  if (buttons.length > 0) {

    buttons[0].classList.add('active');

  }


  renderHistory();

}
