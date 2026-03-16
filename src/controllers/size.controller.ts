import { Request, Response } from "express";
import { SizeService } from "../services/size.service";
import logger from "../utils/logger";

const service = new SizeService();

export class SizeController {
  async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      logger.info(
        `[SizeController] GET /sizes - Page: ${page}, Limit: ${limit}`
      );

      if (page <= 0 || limit <= 0) {
        logger.warn(`[SizeController] Invalid pagination parameters`);
        return res
          .status(400)
          .json({ message: "Page and limit must be positive numbers" });
      }

      const data = await service.getAll(page, limit);
      logger.info(`[SizeController] Successfully retrieved sizes`);
      res.status(200).json(data);
    } catch (err: any) {
      logger.error(`[SizeController] Error in getAll: ${err.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      logger.info(`[SizeController] GET /sizes/${id}`);

      if (!id || isNaN(id)) {
        logger.warn(`[SizeController] Invalid ID provided: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID" });
      }

      const size = await service.getById(id);
      logger.info(`[SizeController] Successfully retrieved size ${id}`);
      res.status(200).json(size);
    } catch (err: any) {
      if (err.message === "INVALID_ID") {
        logger.warn(`[SizeController] Invalid ID`);
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (err.message === "SIZE_NOT_FOUND") {
        logger.warn(`[SizeController] Size not found`);
        return res.status(404).json({ message: "Size not found" });
      }
      logger.error(`[SizeController] Error in getById: ${err.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

}