export function buildSheetHtml(data: any): string {
  // 1️⃣ Safe value helper (preserves 0, avoids "undefined" appearing in PDF)
  const v = (value: any) => (value !== null && value !== undefined ? value : '');

  // 2️⃣ Ensure exactly 15 rows for a consistent layout (fill empty if data is short)
  const rowsToRender = data.rows && data.rows.length > 0 ? data.rows : [];
  const rowsHtml = Array.from({ length: Math.max(15, rowsToRender.length) }).map((_, idx) => {
    const row = rowsToRender[idx] || {};
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${v(row.bale)}</td>
        <td>${v(row.mtr)}</td>
        <td>${v(row.short)}</td>
        <td>${v(row.pcs)}</td>
        <td>${v(row.s28)}</td>
        <td>${v(row.s30)}</td>
        <td>${v(row.s32)}</td>
        <td>${v(row.s34)}</td>
        <td>${v(row.s36)}</td>
        <td>${v(row.s38)}</td>
        <td>${v(row.s40)}</td>
        <td>${v(row.fabric)}</td>
      </tr>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 11px;
        color: #000;
        margin: 0;
        padding: 0;
      }

      .sheet-container {
        width: 100%;
        border: 2px solid #000;
        padding: 10px;
        box-sizing: border-box;
      }

      .top-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-weight: bold;
        font-size: 12px;
      }

      .header-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
      }

      .header-table td {
        border: 1px solid #000;
        padding: 4px 8px;
        text-align: left;
        width: 50%;
      }

      .main-table {
        width: 100%;
        border-collapse: collapse;
      }

      .main-table th {
        background: #e0e0e0 !important; /* Grey header */
        -webkit-print-color-adjust: exact;
        border: 1px solid #000;
        padding: 5px;
        font-size: 10px;
      }

      .main-table td {
        border: 1px solid #000;
        padding: 3px;
        text-align: center;
        height: 22px;
      }

      .footer-section {
        display: flex;
        width: 100%;
        border-top: 2px solid #000;
        margin-top: 10px;
      }

      .footer-col {
        flex: 1;
        border: 1px solid #000;
      }

      .footer-row {
        display: flex;
        border-bottom: 1px solid #000;
      }

      .footer-row:last-child {
        border-bottom: none;
      }

      .footer-label {
        flex: 2;
        padding: 4px;
        font-weight: bold;
        border-right: 1px solid #000;
        background: #f5f5f5 !important;
        -webkit-print-color-adjust: exact;
      }

      .footer-value {
        flex: 1;
        padding: 4px;
        text-align: center;
      }
      
      .grand-total-row {
        font-weight: bold;
        background: #eee !important;
        -webkit-print-color-adjust: exact;
      }
    </style>
  </head>
  <body>
    <div class="sheet-container">

      <div class="top-meta">
        <span>MILL: ${v(data.millName)}</span>
        <span>CH: ${v(data.challanNumber)}</span>
        <span>DATE: ${v(data.cuttingDate)}</span>
      </div>

      <table class="header-table">
        <tr>
          <td><strong>LOT NO. :</strong> ${v(data.lotNo)}</td>
          <td><strong>TOTAL PSC. :</strong> ${v(data.totalPsc)}</td>
        </tr>
        <tr>
          <td><strong>PARTY :</strong> ${v(data.fabricPartyName)}</td>
          <td><strong>LABLE :</strong> ${v(data.label)}</td>
        </tr>
        <tr>
          <td><strong>STYLE :</strong> ${v(data.style)}</td>
          <td><strong>POCKTING :</strong> ${v(data.pocketing)}</td>
        </tr>
        <tr>
          <td><strong>LENGTH :</strong> ${v(data.length)} &nbsp;&nbsp; <strong>READY :</strong> ${v(data.ready)}</td>
          <td><strong>ZIPPER :</strong> ${v(data.zipper)}</td>
        </tr>
        <tr>
          <td><strong>FABRIC :</strong> ${v(data.fabricType)}</td>
          <td><strong>CUT-PKT :</strong> ${v(data.cutPkt)}</td>
        </tr>
        <tr>
          <td><strong>WIDTH :</strong> ${v(data.width)}</td>
          <td><strong>BONE :</strong> ${v(data.bone)}</td>
        </tr>
        <tr>
          <td><strong>ROLL :</strong> ${v(data.rollNumber)}</td>
          <td><strong>F-PKT :</strong> ${v(data.fPkt)}</td>
        </tr>
        <tr>
          <td><strong>METRE :</strong> ${v(data.totalMetre)}</td>
          <td><strong>THREAD :</strong> ${v(data.thread)}</td>
        </tr>
        <tr>
          <td><strong>COLOUR :</strong> ${v(data.color)} &nbsp;&nbsp; <strong>AVG :</strong> ${v(data.avg)}</td>
          <td><strong>STITCH :</strong> ${v(data.stitch)}</td>
        </tr>
      </table>

      <table class="main-table">
        <thead>
          <tr>
            <th>NO.</th><th>BALE</th><th>MTR</th><th>SHORT</th><th>PCS</th>
            <th>28</th><th>30</th><th>32</th><th>34</th><th>36</th><th>38</th><th>40</th>
            <th>FABRIC</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="grand-total-row">
            <td colspan="4">GRAND TOTAL</td>
            <td>${v(data.totalQty)}</td>
            <td colspan="8"></td>
          </tr>
        </tbody>
      </table>

      <div class="footer-section">
        <div class="footer-col">
          <div class="footer-row"><div class="footer-label">TOTAL PSC CUTTING IN LAYER</div><div class="footer-value">${v(data.totalLayerCutting)}</div></div>
          <div class="footer-row"><div class="footer-label">TOTAL PSC HAND CUTTING</div><div class="footer-value">${v(data.totalHandCutting)}</div></div>
          <div class="footer-row"><div class="footer-label">GRAND TOTAL</div><div class="footer-value">${v(data.grandTotal)}</div></div>
          <div class="footer-row"><div class="footer-label">BALANCE FABRIC</div><div class="footer-value">${v(data.balanceFabric)}</div></div>
        </div>
        <div class="footer-col">
          <div class="footer-row"><div class="footer-label">WIAS- EX</div><div class="footer-value">${v(data.wiasEx)}</div></div>
          <div class="footer-row"><div class="footer-label">BELT</div><div class="footer-value">${v(data.belt)}</div></div>
          <div class="footer-row"><div class="footer-label">FISING</div><div class="footer-value">${v(data.fising)}</div></div>
          <div class="footer-row"><div class="footer-label">B-PKT</div><div class="footer-value">${v(data.bPkt)}</div></div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}