export function buildSheetHtml(data: any): string {
  // Destructure with defaults to prevent "undefined" errors
  const { sheet = {}, sizeConfigs = [], issues = [] } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const getQtyForSize = (sizeVal: number) => {
    const config = sizeConfigs.find((s: any) => s.sizeValue === sizeVal);
    return config ? config.quantity : "";
  };

  // 1. Generate Rows Safely
  const tableRows = issues.map((issue: any, idx: number) => {
    // FIX: Added optional chaining (?.) and a default empty array ([]) before reduce
    const totalPcs = (issue.tps || []).reduce(
      (acc: number, tp: any) => acc + (Number(tp.tpValue || 0) * Number(tp.layerValue || 0)), 
      0
    );
    
    // Format TP details for the 'Fabric' column
    const tpDetails = (issue.tps || [])
      .map((t: any) => `T:${t.tpValue}/L:${t.layerValue}`)
      .join(', ');

    return `
      <tr style="height: 30px" >
        <td>${idx + 1}</td>
        <td>${issue.issueCode || ''}</td>
        <td>${issue.mtr || ''}</td>
        <td></td>
        <td>${totalPcs || ''}</td>
        <td>${getQtyForSize(28)}</td>
        <td>${getQtyForSize(30)}</td>
        <td>${getQtyForSize(32)}</td>
        <td>${getQtyForSize(34)}</td>
        <td>${getQtyForSize(36)}</td>
        <td>${getQtyForSize(38)}</td>
        <td>${getQtyForSize(40)}</td>
        <td style="font-size: 9px;">${tpDetails}</td>
      </tr>`;
  }).join('');

  // Fill empty rows to maintain the look of the printed sheet
  const remainingRowsCount = Math.max(0, 15 - issues.length);
  const emptyRows = Array.from({ length: remainingRowsCount })
    .map(() => `<tr style="height: 30px">${'<td>&nbsp;</td>'.repeat(13)}</tr>`)
    .join('');

  return `
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 15px; }
      .container { border: 2px solid #000; padding: 10px; }
      .top-meta { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; }
      .header-grid { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid #000; border-left: 1px solid #000; }
      .header-item { border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; }
      .label { font-weight: bold; display: inline-block; width: 90px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #000; text-align: center; height: 22px; }
      th { background: #eee; font-size: 10px; }
      .footer { display: grid; grid-template-columns: 1fr 1fr; margin-top: 10px; border-top: 1px solid #000; border-left: 1px solid #000; }
      .footer-item { border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; display: flex; justify-content: space-between; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="top-meta">
        <span>MILL: ________________</span>
        <span>CH: ${sheet.challanNumber || ''}</span>
        <span>DATE: ${formatDate(sheet.cuttingDate)}</span>
      </div>
      <div class="header-grid">
        <div class="header-item"><span class="label">LOT NO. :</span> ${sheet.lotNumber || ''}</div>
        <div class="header-item"><span class="label">TOTAL PSC. :</span> </div>
        <div class="header-item"><span class="label">PARTY :</span> ${sheet.fabricPartyName || ''}</div>
        <div class="header-item"><span class="label">LABLE :</span> </div>
        <div class="header-item"><span class="label">STYLE :</span> </div>
        <div class="header-item"><span class="label">POCKTING :</span> </div>
        <div class="header-item"><span class="label">LENGTH :</span> <span style="margin-left:40px">READY:</span></div>
        <div class="header-item"><span class="label">ZIPPER :</span> </div>
        <div class="header-item"><span class="label">FABRIC :</span> </div>
        <div class="header-item"><span class="label">CUT-PKT :</span> div>
        <div class="header-item"><span class="label">WIDTH :</span> </div>
        <div class="header-item"><span class="label">BONE :</span> </div>
        <div class="header-item"><span class="label">ROLL :</span> ${sheet.rollNumber || ''}</div>
        <div class="header-item"><span class="label">F-PKT :</span> </div>
        <div class="header-item"><span class="label">METRE :</span> </div>
        <div class="header-item"><span class="label">THREAD :</span> </div>
        <div class="header-item"><span class="label">COLOUR :</span> <span style="margin-left:40px">AVG:</span></div>
        <div class="header-item"><span class="label">STITCH :</span> </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>NO.</th><th>BALE</th><th>MTR</th><th>SHORT</th><th>PCS</th>
            <th>28</th><th>30</th><th>32</th><th>34</th><th>36</th><th>38</th><th>40</th>
            <th>FEBRIC</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          ${emptyRows}
          <tr style="background:#f2f2f2; font-weight:bold;">
            <td colspan="4">GRAND TOTAL</td>
            <td></td>
            <td colspan="8"></td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <div class="footer-item"><span>TOTAL PSC CUTTING IN LAYER</span><span></span></div>
        <div class="footer-item"><span>WIAS- EX</span><span></span></div>
        <div class="footer-item"><span>TOTAL PSC HAND CUTTING</span><span></span></div>
        <div class="footer-item"><span>BELT</span><span></span></div>
        <div class="footer-item"><span>GRAND TOTAL</span><span></span></div>
        <div class="footer-item"><span>FISING</span><span></span></div>
        <div class="footer-item"><span>BALANCE FABRIC</span><span></span></div>
        <div class="footer-item"><span>B-PKT</span><span></span></div>
      </div>
    </div>
  </body>
  </html>
  `;
}