import { Request, Response } from "express";
import logger from "../utils/logger";
import { SheetService } from "../services/sheet.service";

export class SheetController {
  private sheetService = new SheetService();

  async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const sheets = await this.sheetService.getAll(page, limit);
      res.json(sheets);
    } catch (err: any) {
      res.status(500).json({ message: "Error fetching sheets" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const sheet = await this.sheetService.getById(id);
      if (!sheet) return res.status(404).json({ message: "Sheet not found" });
      res.json(sheet);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async SaveProject(req: Request, res: Response) {
    try {
      const id = Number(req.params.id) || 0;
      const data = req.body;
      const userId = (req as any).userId;

      logger.info(`[SheetController] Save request - ID: ${id || "NEW"}`);

      const result = await this.sheetService.saveCompleteProject(
        id,
        data,
        userId,
      );
      res.status(id === 0 ? 201 : 200).json(result);
    } catch (err: any) {
      logger.error(`[SheetController] Save failed: ${err.message}`);
      res.status(400).json({ message: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.sheetService.delete(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ message: "Error deleting sheet" });
    }
  }
  public async downloadPdf(req: Request, res: Response): Promise<void> {
    try {
      // 1. Get ID from params (e.g., /api/sheets/download/123)
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid sheet ID" });
        return;
      }

      const pdfBuffer: Buffer = await this.sheetService.generatePdfBuffer(id);

      // 2. Set Headers
      res.set({
        "Content-Type": "application/pdf",
        // Use 'inline' if you want it to open in a new tab instead of downloading
        "Content-Disposition": `attachment; filename="sheet-${id}.pdf"`,
        "Content-Length": pdfBuffer.length,
        // Prevents caching of sensitive data
        "Cache-Control": "no-cache, no-store, must-revalidate",
      });

      // 3. Send the Buffer
      res.end(pdfBuffer);
    } catch (error: any) {
      console.error(`[PDF_GEN_ERROR]:`, error);

      if (error.message === "SHEET_NOT_FOUND") {
        res.status(404).json({ message: "Sheet not found" });
        return;
      }

      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
