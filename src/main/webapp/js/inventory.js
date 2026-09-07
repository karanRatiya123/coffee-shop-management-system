// --- Coffee Shop POS Inventory Management ---

document.addEventListener('DOMContentLoaded', async () => {
  await loadInventory();
});

async function loadInventory() {
  try {
    const response = await fetch("InventoryServlet");
    if (response.ok) {
      const items = await response.json();
      renderInventoryItems(Array.isArray(items) ? items : []);
    } else {
      console.error("InventoryServlet returned status:", response.status);
      renderInventoryError();
    }
  } catch (error) {
    console.error("Error fetching inventory from database:", error);
    renderInventoryError();
  }
}

function renderInventoryItems(items) {
  const lowStockList = document.querySelector('.inventory-grid article:nth-child(1) .inventory-list');
  const priorityList = document.querySelector('.inventory-grid article:nth-child(2) .inventory-list');

  const lowStockItems = items.filter(item => 
    item.quantity <= 10 || 
    (item.status || '').toLowerCase() === 'urgent' || 
    (item.status || '').toLowerCase() === 'low'
  );

  const regularItems = items.filter(item => !lowStockItems.includes(item));

  if (lowStockList) {
    if (lowStockItems.length === 0) {
      lowStockList.innerHTML = `
        <div class="inventory-item">
          <div>
            <strong>All Stock Levels Healthy</strong>
            <span>No urgent restock required.</span>
          </div>
          <span class="inventory-status success">OK</span>
        </div>
      `;
    } else {
      lowStockList.innerHTML = lowStockItems.map(item => {
        const statusLower = (item.status || '').toLowerCase();
        const badgeClass = statusLower === 'urgent' ? 'danger' : 'warning';
        return `
          <div class="inventory-item">
            <div>
              <strong>${escapeHtml(item.itemName)}</strong>
              <span>${item.quantity} units remaining</span>
            </div>
            <span class="inventory-status ${badgeClass}">${escapeHtml(item.status || 'Low')}</span>
          </div>
        `;
      }).join('');
    }
  }

  if (priorityList) {
    const listToRender = regularItems.length > 0 ? regularItems : items;
    if (listToRender.length === 0) {
      priorityList.innerHTML = `
        <div class="inventory-item">
          <div>
            <strong>No Inventory Records</strong>
            <span>Add inventory items to database.</span>
          </div>
          <span class="inventory-status neutral">None</span>
        </div>
      `;
    } else {
      priorityList.innerHTML = listToRender.slice(0, 5).map(item => `
        <div class="inventory-item">
          <div>
            <strong>${escapeHtml(item.itemName)}</strong>
            <span>${item.quantity} units in stock (${escapeHtml(item.category || 'General')})</span>
          </div>
          <span class="inventory-status neutral">${escapeHtml(item.status || 'Monitor')}</span>
        </div>
      `).join('');
    }
  }
}

function renderInventoryError() {
  const lowStockList = document.querySelector('.inventory-grid article:nth-child(1) .inventory-list');
  if (lowStockList) {
    lowStockList.innerHTML = `
      <div class="inventory-item">
        <div>
          <strong style="color: #ff6b6b;">Database Error</strong>
          <span>Unable to fetch inventory from MySQL server.</span>
        </div>
        <span class="inventory-status danger">Error</span>
      </div>
    `;
  }
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
