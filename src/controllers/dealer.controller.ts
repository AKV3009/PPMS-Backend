import { Request, Response } from "express";
import { DealerService } from "../services/dealer.service";
import logger from "../utils/logger";

const service = new DealerService();

export class DealerController {
  async getAllDealers(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      logger.info(
        `[DealerController] GET /dealers - Page: ${page}, Limit: ${limit}`
      );

      if (page <= 0 || limit <= 0) {
        logger.warn(`[DealerController] Invalid pagination parameters`);
        return res
          .status(400)
          .json({ message: "Page and limit must be positive numbers" });
      }

      const data = await service.getAllDealers(page, limit);
      logger.info(`[DealerController] Successfully retrieved dealers`);
      res.status(200).json(data);
    } catch (err: any) {
      logger.error(`[DealerController] Error in getAll: ${err.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getDealerById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      logger.info(`[DealerController] GET /dealers/${id}`);

      if (!id || isNaN(id)) {
        logger.warn(`[DealerController] Invalid ID provided: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID" });
      }

      const dealer = await service.getById(id);
      logger.info(`[DealerController] Successfully retrieved dealer ${id}`);
      res.status(200).json(dealer);
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        logger.warn(`[DealerController] Invalid ID`);
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "DEALER_NOT_FOUND") {
        logger.warn(`[DealerController] Dealer not found`);
        return res.status(404).json({ message: "Dealer not found" });
      }
      logger.error(`[DealerController] Error in getById: ${err.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async saveDealer(req: Request, res: Response) {
    try {
      const id = Number(req.params.id) || 0; // Default to 0 if not provided
      const { dealerName, email, phone, address, isActive } = req.body;
      const userId = (req as any).userId;

      // 1. Logging the Intent
      const action = id === 0 ? "Creating" : `Updating (ID: ${id})`;
      logger.info(`[DealerController] Save request - ${action}: ${dealerName}`);

      // 2. Validation Guard Clauses
      if (id !== 0 && isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      // Validate dealerName (Required for Create, Optional for Update)
      if (id === 0 && (!dealerName || typeof dealerName !== "string")) {
        return res.status(400).json({ message: "dealerName is required for new dealers" });
      }

      let result;
      if (id === 0) {
        // Logic for Create
        result = await service.create({ dealerName, email, phone, address }, userId);
        logger.info(`[DealerController] Successfully created dealer: ${result.id}`);
        return res.status(201).json(result);
      } else {
        // Logic for Update
        result = await service.update(id, { dealerName, email, phone, address, isActive }, userId);
        logger.info(`[DealerController] Successfully updated dealer: ${id}`);
        return res.status(200).json(result);
      }

    } catch (err: any) {
      return this.handleDealerError(res, err);
    }
  }

  async deleteDealer(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const userId = (req as any).userId;

      logger.info(`[DealerController] PATCH /dealers/${id}/soft-delete`);

      if (!id || isNaN(id)) {
        logger.warn(`[DealerController] Invalid ID provided`);
        return res.status(400).json({ message: "Invalid ID" });
      }

      await service.deleteDepartment(id, userId);
      logger.info(
        `[DealerController] Dealer soft deleted successfully - ID: ${id}`
      );
      res.status(200).json({ message: "Dealer soft deleted successfully" });
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        logger.warn(`[DealerController] Invalid ID`);
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "DEALER_NOT_FOUND") {
        logger.warn(`[DealerController] Dealer not found`);
        return res.status(404).json({ message: "Dealer not found" });
      }
      logger.error(`[DealerController] Error in softDelete: ${err.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  private handleDealerError(res: Response, err: any) {
    const errorMap: Record<string, number> = {
      "INVALID_ID": 400,
      "INVALID_DEALER_NAME": 400,
      "INVALID_EMAIL": 400,
      "DEALER_NOT_FOUND": 404,
      "DEALER_EXISTS": 409,
      "DEALER_NAME_EXISTS": 409,
    };

    const status = errorMap[err.message] || 500;

    if (status >= 500) {
      logger.error(`[DealerController] Unexpected Error: ${err.message}`);
    } else {
      logger.warn(`[DealerController] Handled Error: ${err.message}`);
    }

    return res.status(status).json({
      message: status === 500 ? "Internal server error" : err.message.replace(/_/g, ' ')
    });
  }

}
