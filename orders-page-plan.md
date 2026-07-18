# Orders Page Plan

Create a new admin panel page named `orders.html`.

This page should manage current orders. Do not make it the same as `history.html`, because `history.html` already shows saved paid and held orders.

## Files To Add

- `orders.html`
- `orders.js`

## Add Sidebar Link

Add this link in the sidebar of all admin pages:

```html
<a href="orders.html" class="menu-item">
  <span>Orders</span>
</a>
```

On `orders.html`, make it active:

```html
<a href="orders.html" class="menu-item active">
  <span>Orders</span>
</a>
```

## Orders Page Sections

Add these sections in the Orders page:

1. Page header
2. Search bar
3. Status filter tabs
4. Summary cards
5. Orders list
6. Order action buttons

## Page Header

Use:

```text
Orders
Manage active, held, preparing, and ready orders.
```

## Summary Cards

Add these cards:

- Total Orders
- Pending Orders
- Preparing Orders
- Ready Orders
- Today Revenue

Suggested IDs:

```html
<span id="orders-total-count">0</span>
<span id="orders-pending-count">0</span>
<span id="orders-preparing-count">0</span>
<span id="orders-ready-count">0</span>
<span id="orders-today-revenue">₹0.00</span>
```

## Status Tabs

Add these filters:

```html
<button onclick="filterOrdersByStatus('All', this)">All</button>
<button onclick="filterOrdersByStatus('Pending', this)">Pending</button>
<button onclick="filterOrdersByStatus('Preparing', this)">Preparing</button>
<button onclick="filterOrdersByStatus('Ready', this)">Ready</button>
<button onclick="filterOrdersByStatus('Served', this)">Served</button>
<button onclick="filterOrdersByStatus('Held', this)">Held</button>
<button onclick="filterOrdersByStatus('Cancelled', this)">Cancelled</button>
```

## Search

Search should work by:

- Order ID
- Item name
- Operator name
- Payment method
- Order status

Suggested input:

```html
<input
  type="text"
  id="orders-search-input"
  placeholder="Search orders, items, operators..."
  oninput="filterOrdersBySearch()"
>
```

## Order Card Details

Each order card should show:

- Order ID
- Date and time
- Status
- Operator
- Payment method
- Items
- Quantity
- Subtotal
- Discount
- Tax
- Total

## Order Actions

Each order card should have buttons:

- Mark Preparing
- Mark Ready
- Mark Served
- Cancel Order
- Reprint Bill

Example:

```html
<button onclick="updateOrderStatus('ORDER_ID', 'Preparing')">Preparing</button>
<button onclick="updateOrderStatus('ORDER_ID', 'Ready')">Ready</button>
<button onclick="updateOrderStatus('ORDER_ID', 'Served')">Served</button>
<button onclick="updateOrderStatus('ORDER_ID', 'Cancelled')">Cancel</button>
```

## Storage Key

Use the existing storage key:

```js
const ORDER_HISTORY_STORAGE_KEY = 'brewos_order_history';
```

This keeps the Orders page connected with:

- `dashboard.js`
- `history.js`
- `bills.js`

## Existing Order Fields

The current project already saves orders with:

```js
{
  id,
  status,
  operator,
  terminal,
  createdAt,
  displayDateTime,
  items,
  subtotal,
  discount,
  tax,
  total,
  payment
}
```

## New Fields To Add

Add these fields for better order management:

```js
{
  customerName: '',
  tableNumber: '',
  orderType: 'Dine In',
  priority: 'Normal',
  notes: '',
  statusTimeline: []
}
```

## Order Status Flow

Use this main flow:

```text
Pending -> Preparing -> Ready -> Served
```

Other statuses:

```text
Held
Paid
Cancelled
```

## orders.js Functions

Create these functions:

```js
loadOrders()
saveOrders()
renderOrders()
getFilteredOrders()
filterOrdersBySearch()
filterOrdersByStatus(status, button)
clearOrdersFilters()
updateOrderStatus(orderId, status)
formatMoney(amount)
formatDateTime(isoValue)
isToday(isoValue)
logoutSession()
```

## Layout Classes

Reuse existing classes from `history.html`:

```html
dashboard-container active history-page-shell
topbar history-topbar
dashboard-content history-dashboard-content
main-area history-main-area
stats-row history-stats-row
history-filter-row
history-list-shell
order-history-list
```

## Final Admin Menu

Admin panel should have:

1. Dashboard
2. Orders
3. Order History
4. Bills
5. View Menu
6. Feedback
7. Settings

## Difference Between Pages

- `orders.html`: manage current/live orders
- `history.html`: view saved order history
- `bills.html`: view paid bills and reprint bills
