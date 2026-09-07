// --- Shared Bill Printing Helpers ---

(function () {
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function getPaymentSummary(order) {
    const payment = order?.payment || {};

    if (payment.method === 'Cash') {
      return 'Cash payment';
    }

    if (payment.method === 'Card') {
      const last4 = payment.cardLast4 ? ` ****${payment.cardLast4}` : '';
      const holder = payment.cardHolder ? ` ${payment.cardHolder}` : '';
      return `Card${last4}${holder}`;
    }

    if (payment.method === 'UPI') {
      if (payment.upiMode === 'QR') {
        return payment.reference ? `UPI QR · ${payment.reference}` : 'UPI QR payment';
      }

      return payment.upiId ? `UPI ID ${payment.upiId}` : 'UPI payment';
    }

    return payment.summary || payment.reference || 'N/A';
  }

  function buildBillHtml(order) {
    const items = Array.isArray(order?.items) ? order.items : [];
    const itemRows = items.map(item => `
      <tr>
        <td>${escapeHtml(item.quantity)}x ${escapeHtml(item.name)}</td>
        <td>${formatMoney(item.total)}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bill ${escapeHtml(order?.id || '')}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: Arial, Helvetica, sans-serif;
      background: #f4efe7;
      color: #241812;
    }
    .bill {
      max-width: 720px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #e7d8c7;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 12px 40px rgba(36, 24, 18, 0.08);
    }
    .bill-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .bill-brand {
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #9c6a3c;
      font-weight: 700;
    }
    .bill-title {
      font-size: 26px;
      margin: 6px 0 4px;
    }
    .bill-meta {
      font-size: 13px;
      color: #6f5a4c;
      line-height: 1.5;
    }
    .bill-badge {
      display: inline-block;
      padding: 7px 12px;
      border-radius: 999px;
      background: #ecf7ef;
      color: #24743f;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .bill-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 18px 0;
    }
    .bill-panel {
      border: 1px solid #eaded0;
      border-radius: 14px;
      background: #fcfaf7;
      padding: 14px 16px;
    }
    .bill-panel span {
      display: block;
      font-size: 11px;
      color: #8d7b6f;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 5px;
    }
    .bill-panel strong {
      font-size: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    th, td {
      text-align: left;
      padding: 12px 0;
      border-bottom: 1px solid #efe4d8;
      font-size: 14px;
    }
    th:last-child, td:last-child { text-align: right; }
    .totals {
      margin-top: 18px;
      display: grid;
      gap: 8px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #efe4d8;
      font-size: 14px;
    }
    .total-row strong {
      font-size: 16px;
    }
    .grand {
      font-size: 18px;
      font-weight: 700;
      border-bottom: none;
    }
    .footer-note {
      margin-top: 20px;
      font-size: 12px;
      color: #7a675a;
      text-align: center;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .bill { border: none; box-shadow: none; border-radius: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="bill">
    <div class="bill-header">
      <div>
        <div class="bill-brand">BrewOS Coffee Shop</div>
        <div class="bill-title">Bill ${escapeHtml(order?.id || '')}</div>
        <div class="bill-meta">
          Date & Time: ${escapeHtml(formatDateTime(order?.createdAt))}<br />
          Operator: ${escapeHtml(order?.operator || 'Unknown')}<br />
          Terminal: ${escapeHtml(order?.terminal || 'TERMINAL-01')}
        </div>
      </div>
      <div class="bill-badge">${escapeHtml(order?.status || 'Paid')}</div>
    </div>

    <div class="bill-grid">
      <div class="bill-panel">
        <span>Payment Method</span>
        <strong>${escapeHtml(order?.payment?.method || 'N/A')}</strong>
      </div>
      <div class="bill-panel">
        <span>Payment Details</span>
        <strong>${escapeHtml(getPaymentSummary(order))}</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row"><span>Subtotal</span><strong>${formatMoney(order?.subtotal)}</strong></div>
      <div class="total-row"><span>Discount</span><strong>${formatMoney(order?.discount)}</strong></div>
      <div class="total-row"><span>Tax</span><strong>${formatMoney(order?.tax)}</strong></div>
      <div class="total-row grand"><span>Total</span><strong>${formatMoney(order?.total)}</strong></div>
    </div>

    <div class="footer-note">Thank you for visiting BrewOS Coffee Shop.</div>
  </div>
</body>
</html>`;
  }

  window.printBill = function printBill(order) {
    if (!order) return;

    const popup = window.open('', '_blank', 'width=900,height=900');
    if (!popup) {
      alert('Allow popups to print the bill.');
      return;
    }

    popup.document.open();
    popup.document.write(buildBillHtml(order));
    popup.document.close();
    popup.focus();

    const triggerPrint = () => {
      try {
        popup.print();
      } catch (e) {
        console.warn('Unable to print bill:', e);
      }
    };

    popup.onload = triggerPrint;
    setTimeout(triggerPrint, 300);
  };
})();
