import { AppDataSource } from "../config/client";
import { Sheet } from "../entities/sheet.entity";
import { Dealer } from "../entities/dealers.entity";
import logger from "../utils/logger";
import { SizeConfig } from "../entities/sizeConfigs.entity";
import { Issue } from "../entities/issue.entity";
import { Tp } from "../entities/tp.entity";
import { CalculationDto } from "../entities/DTOs/Createproject.dto";
import { Size } from "../entities/sizes.entity";
import { SheetCalculation } from "../entities/sheetCalculation.entity";
import { buildSheetHtml } from "../utils/buildPdf";
import puppeteer from "puppeteer";

export class SheetService {
  private sheetRepo = AppDataSource.getRepository(Sheet);

  private dealerRepo = AppDataSource.getRepository(Dealer);

  async getAll(page: number, limit: number) {
    try {
      logger.info(
        `[SheetService] Fetching all sheets - Page: ${page}, Limit: ${limit}`,
      );

      const [data, total] = await this.sheetRepo.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { id: "DESC" },
        relations: { dealer: true, issues: true },
      });

      logger.info(`[SheetService] Successfully fetched ${data.length} sheets`);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err: any) {
      logger.error(`[SheetService] Error fetching sheets: ${err.message}`);
      throw err;
    }
  }

  async getById(id: number) {
    const sheet = await AppDataSource.getRepository(Sheet).findOne({
      where: { id },
      relations: [
        "dealer",
        "sizeConfigs",
        "sizeConfigs.size",
        "issues",
        "issues.tps",
        "issues.frontEmployee",
        "issues.backEmployee",
        "calculations",
      ],
      order: {
        issues: { displayOrder: "ASC" },
        sizeConfigs: { id: "ASC" },
      },
    });

    if (!sheet) {
      throw new Error("SHEET_NOT_FOUND");
    }

    return sheet;
  }

  async saveCompleteProject(id: number, data: any, userId: number) {
    return await AppDataSource.transaction(async (manager) => {
      const {
        project,
        sizeConfigs,
        issues,
        savedCalculations,
        hasManualEdits,
      } = data;
      const isNew = id === 0;

      // 1. Save or Find Sheet
      let sheet = isNew ? new Sheet() : await manager.findOneBy(Sheet, { id });
      if (!sheet) throw new Error("SHEET_NOT_FOUND");

      // Assign main project fields
      Object.assign(sheet, {
        ...project,
        hasManualEdits,
        // Note: Add updatedBy/createdBy to your Entity if you want to track users
      });
      const savedSheet = await manager.save(sheet);

      // 2. Sync Size Configs
      // We delete and re-insert to keep the state clean
      if (!isNew) await manager.delete(SizeConfig, { sheetId: savedSheet.id });
      const configEntities = sizeConfigs.map((sc: any) =>
        manager.create(SizeConfig, {
          sheetId: savedSheet.id,
          sizeId: sc.sizeId,
          sizeValue: sc.sizeValue,
          quantity: sc.quantity,
        }),
      );
      await manager.save(configEntities);

      // 3. Sync Issues and TPs (The Salary Data)
      if (!isNew) {
        // Because Issue -> TP has cascade: true and onDelete: 'CASCADE',
        // deleting the issue automatically cleans up the TPs.
        await manager.delete(Issue, { sheetId: savedSheet.id });
      }

      for (const issueData of issues) {
        const issue = manager.create(Issue, {
          sheetId: savedSheet.id,
          issueCode: issueData.issueCode,
          mtr: issueData.mtr,
          displayOrder: issueData.displayOrder,
          frontEmployeeId: issueData.frontEmployeeId,
          backEmployeeId: issueData.backEmployeeId,
        });
        const savedIssue = await manager.save(issue);

        // Save TPs linked to this issue
        if (issueData.tps && issueData.tps.length > 0) {
          const tpEntities = issueData.tps.map((tp: any) =>
            manager.create(Tp, {
              issueId: savedIssue.id,
              tpValue: tp.tpValue,
              layerValue: tp.layerValue,
            }),
          );
          await manager.save(tpEntities);
        }
      }

      // 4. Sync Sheet Calculations (JSONB Storage)
      if (!isNew)
        await manager.delete(SheetCalculation, { sheetId: savedSheet.id });

      if (savedCalculations && savedCalculations.length > 0) {
        const calcEntities = savedCalculations.map((calc: any) =>
          manager.create(SheetCalculation, {
            sheetId: savedSheet.id,
            tpValue: calc.tpValue,
            rowTotal: calc.rowTotal,
            // Since column is jsonb, pass the object directly (TypeORM handles stringify)
            sizeValues: calc.sizeValues,
          }),
        );
        await manager.save(calcEntities);
      }

      return savedSheet;
    });
  }

  async delete(id: number) {
    const sheet = await this.sheetRepo.findOneBy({ id });
    if (!sheet) throw new Error("SHEET_NOT_FOUND");

    // Deleting the sheet will trigger CASCADE deletes for issues/configs if set in Entity
    return await this.sheetRepo.remove(sheet);
  }

  async generatePdfBuffer(id: number): Promise<Buffer> {
   const sheet = await this.getById(id);

// 1. Create a map of TP -> Meters from the 'issues' array
// Change 'string' to 'number' for the key
const tpMeterMap: Record<any,any> = {};

sheet.issues?.forEach(issue => {
  issue.tps?.forEach(tp => {
    // tp.tpValue (number) now matches Record<number, string>
    tpMeterMap[tp.tpValue] = issue.mtr; 
  });
});

const htmlData = {
  millName: sheet.dealer?.dealerName,
  challanNumber: sheet.challanNumber,
  lotNo: sheet.lotNumber,
  cuttingDate: sheet.cuttingDate,
  fabricPartyName: sheet.fabricPartyName,
  rollNumber: sheet.rollNumber,
  totalPsc: sheet.sizeConfigs?.reduce((sum, s) => sum + (s.quantity || 0), 0),
  totalMetre: sheet.issues?.reduce((sum, i) => sum + Number(i.mtr || 0), 0),
  totalQty: sheet.calculations?.reduce((sum, c) => sum + (c.rowTotal || 0), 0),

  // 2. Map Calculations and inject the Meter from our Map
  rows: sheet.calculations?.map((calc: any) => ({
    bale: calc.tpValue,              // TP Number
    mtr: tpMeterMap[calc.tpValue] || '0.00', // Linked Meter
    short: '',                       // Placeholder for manual entries
    pcs: calc.rowTotal,
    s28: calc.sizeValues?.["28"],
    s30: calc.sizeValues?.["30"],
    s32: calc.sizeValues?.["32"],
    s34: calc.sizeValues?.["34"],
    s36: calc.sizeValues?.["36"],
    s38: calc.sizeValues?.["38"],
    s40: calc.sizeValues?.["40"],
    s42: calc.sizeValues?.["42"],
    s44: calc.sizeValues?.["44"],
    fabric: '' // Or other relevant field
  })).sort((a, b) => a.bale - b.bale) // Optional: sort by TP number
};
    const html = buildSheetHtml(htmlData);
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      // Using networkidle0 ensures images/styles are loaded
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", bottom: "20px" }, // Often needed for professional look
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
