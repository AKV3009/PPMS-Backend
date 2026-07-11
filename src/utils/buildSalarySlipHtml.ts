export function buildSalarySlipHtml(data: any): string {
  // Safe value helper (preserves 0, avoids "undefined" appearing in PDF)
  const v = (value: any) => (value !== null && value !== undefined ? value : '');
  const money = (n: any) =>
    Number(n || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const rows = Array.isArray(data.workDetails) ? data.workDetails : [];
  const rowsHtml = rows
    .map((row: any, idx: number) => {
      const dateStr = row.date
        ? new Date(row.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '';
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${dateStr}</td>
          <td>${v(row.lotNo)}</td>
          <td>${v(row.bales)}</td>
          <td class="center">${v(row.side)}</td>
          <td class="right">${money(row.rate)}</td>
          <td class="center">${v(row.pcs)}</td>
          <td class="right">&#8377; ${money(row.amount)}</td>
        </tr>
      `;
    })
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      @page { size: A4; margin: 12mm; }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 12px;
        color: #000;
        margin: 0;
        padding: 0;
      }
      .slip-container {
        width: 100%;
        border: 2px solid #000;
        padding: 16px;
        box-sizing: border-box;
      }
      .slip-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }
      .slip-subtitle {
        text-align: center;
        font-size: 12px;
        color: #444;
        margin-bottom: 14px;
      }
      .meta-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 14px;
      }
      .meta-table td {
        border: 1px solid #000;
        padding: 6px 10px;
        width: 50%;
      }
      .main-table {
        width: 100%;
        border-collapse: collapse;
      }
      .main-table th {
        background: #e0e0e0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        border: 1px solid #000;
        padding: 6px;
        font-size: 11px;
      }
      .main-table td {
        border: 1px solid #000;
        padding: 5px 6px;
        height: 20px;
      }
      .main-table td.center { text-align: center; }
      .main-table td.right { text-align: right; }
      .total-row {
        font-weight: bold;
        background: #eee !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .total-row td { padding: 8px 6px; }
      .sign-section {
        display: flex;
        justify-content: space-between;
        margin-top: 40px;
        font-size: 12px;
      }
      .sign-box { text-align: center; }
      .sign-line {
        border-top: 1px solid #000;
        padding-top: 4px;
        min-width: 160px;
      }
    </style>
  </head>
  <body>
    <div class="slip-container">
      <div class="slip-title">Salary Slip</div>
      <div class="slip-subtitle">${v(data.periodLabel)}</div>

      <table class="meta-table">
        <tr>
          <td><strong>Employee :</strong> ${v(data.employeeName)}</td>
          <td><strong>Employee ID :</strong> ${v(data.employeeId)}</td>
        </tr>
        <tr>
          <td><strong>Total Pieces :</strong> ${v(data.totalPcs)}</td>
          <td><strong>Total Earnings :</strong> &#8377; ${money(data.totalSalary)}</td>
        </tr>
      </table>

      <table class="main-table">
        <thead>
          <tr>
            <th>NO.</th>
            <th>DATE</th>
            <th>LOT NO.</th>
            <th>BALE (TP) NOS</th>
            <th>SIDE</th>
            <th>RATE</th>
            <th>PCS</th>
            <th>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="total-row">
            <td colspan="6" class="right">GRAND TOTAL</td>
            <td class="center">${v(data.totalPcs)}</td>
            <td class="right">&#8377; ${money(data.totalSalary)}</td>
          </tr>
        </tbody>
      </table>

      <div class="sign-section">
        <div class="sign-box"><div class="sign-line">Employee Signature</div></div>
        <div class="sign-box"><div class="sign-line">Authorised Signatory</div></div>
      </div>
    </div>
  </body>
  </html>
  `;
}
