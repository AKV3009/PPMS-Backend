import { AppDataSource } from "../config/client";
import { Dealer } from "../entities/dealers.entity";
import {
  CreateDealerDto,
  UpdateDealerDto,
} from "../entities/DTOs/dealer.dtos";
import logger from "../utils/logger";

export class DealerService {
  private DealerRepo = AppDataSource.getRepository(Dealer);

  async getAllDealers(page: number, limit: number) {
    try {
      logger.info(
        `[DealerService] Fetching all dealers - Page: ${page}, Limit: ${limit}`
      );

      const [data, total] = await this.DealerRepo.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { id: "DESC" },
        where: { isDeleted: false },
      });

      logger.info(`[DealerService] Successfully fetched ${data.length} dealers`);
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
      logger.error(`[DealerService] Error fetching dealers: ${err.message}`);
      throw err;
    }
  }
  

  async getById(id: number) {
    try {
      logger.info(`[DealerService] Fetching dealer with ID: ${id}`);

      if (!id || id <= 0) {
        logger.warn(`[DealerService] Invalid ID provided: ${id}`);
        throw new Error("INVALID_ID");
      }

      const dealer = await this.DealerRepo.findOne({
        where: { id, isDeleted: false },
      });

      if (!dealer) {
        logger.warn(`[DealerService] Dealer not found with ID: ${id}`);
        throw new Error("DEALER_NOT_FOUND");
      }

      logger.info(
        `[DealerService] Successfully fetched dealer: ${dealer.dealerName}`
      );
      return dealer;
    } catch (err: any) {
      logger.error(`[DealerService] Error fetching dealer: ${err.message}`);
      throw err;
    }
  }

  async create(dto: CreateDealerDto, createdBy: number) {
    try {
      logger.info(`[DealerService] Creating dealer: ${dto.dealerName}`);

      // Validation
      if (!dto.dealerName || dto.dealerName.trim() === "") {
        logger.warn(
          `[DealerService] Validation failed: dealerName is required`
        );
        throw new Error("INVALID_DEALER_NAME");
      }

      const exists = await this.DealerRepo.findOne({
        where: { dealerName: dto.dealerName, isDeleted: false },
      });

      if (exists) {
        logger.warn(
          `[DealerService] Dealer already exists: ${dto.dealerName}`
        );
        throw new Error("DEALER_EXISTS");
      }

      if (dto.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
          logger.warn(`[DealerService] Validation failed: Invalid email format`);
          throw new Error("INVALID_EMAIL");
        }
      }

      const dealer = this.DealerRepo.create({
        ...dto,
        createdBy,
        isDeleted: false,
      });
      const saved = await this.DealerRepo.save(dealer);

      logger.info(
        `[DealerService] Dealer created successfully with ID: ${saved.id}`
      );
      return saved;
    } catch (err: any) {
      logger.error(`[DealerService] Error creating dealer: ${err.message}`);
      throw err;
    }
  }

  async update(id: number, dto: UpdateDealerDto, updatedBy: number) {
    try {
      logger.info(`[DealerService] Updating dealer with ID: ${id}`);

      const dealer = await this.getById(id);

      if (dto.dealerName !== undefined) {
        if (dto.dealerName.trim() === "") {
          logger.warn(
            `[DealerService] Validation failed: dealerName cannot be empty`
          );
          throw new Error("INVALID_DEALER_NAME");
        }

        const exists = await this.DealerRepo.findOne({
          where: { dealerName: dto.dealerName, isDeleted: false },
        });

        if (exists && exists.id !== id) {
          logger.warn(
            `[DealerService] Dealer name already exists: ${dto.dealerName}`
          );
          throw new Error("DEALER_NAME_EXISTS");
        }
      }

      if (dto.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
          logger.warn(`[DealerService] Validation failed: Invalid email format`);
          throw new Error("INVALID_EMAIL");
        }
      }

      Object.assign(dealer, dto, { updatedBy });
      const updated = await this.DealerRepo.save(dealer);

      logger.info(
        `[DealerService] Dealer updated successfully - ID: ${id}`
      );
      return updated;
    } catch (err: any) {
      logger.error(`[DealerService] Error updating dealer: ${err.message}`);
      throw err;
    }
  }

  async deleteDepartment(id: number, deletedBy: number) {
    try {
      logger.info(`[DealerService] Soft deleting dealer with ID: ${id}`);

      const dealer = await this.getById(id);
      dealer.isDeleted = true;
      dealer.isActive = false;
      dealer.updatedBy = deletedBy;
      const updated = await this.DealerRepo.save(dealer);

      logger.info(
        `[DealerService] Dealer soft deleted successfully - ID: ${id}`
      );
      return updated;
    } catch (err: any) {
      logger.error(`[DealerService] Error soft deleting dealer: ${err.message}`);
      throw err;
    }
  }

  async hardDelete(id: number) {
    try {
      logger.info(`[DealerService] Hard deleting dealer with ID: ${id}`);

      const dealer = await this.getById(id);
      await this.DealerRepo.remove(dealer);

      logger.info(
        `[DealerService] Dealer hard deleted successfully - ID: ${id}`
      );
      return true;
    } catch (err: any) {
      logger.error(`[DealerService] Error hard deleting dealer: ${err.message}`);
      throw err;
    }
  }
}
