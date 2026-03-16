import { AppDataSource } from "../config/client";
import { Size } from "../entities/sizes.entity";
import {
  CreateSizeDto,
  UpdateSizeDto,
} from "../entities/DTOs/size.dtos";
import logger from "../utils/logger";

export class SizeService {
  private repo = AppDataSource.getRepository(Size);

  async getAll(page: number, limit: number) {
    try {
      logger.info(
        `[SizeService] Fetching all sizes - Page: ${page}, Limit: ${limit}`
      );

      const [data, total] = await this.repo.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { id: "ASC" },
      });

      logger.info(`[SizeService] Successfully fetched ${data.length} sizes`);

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
      logger.error(`[SizeService] Error fetching sizes: ${err.message}`);
      throw err;
    }
  }

  async getById(id: number) {
    try {
      logger.info(`[SizeService] Fetching size with ID: ${id}`);

      if (!id || id <= 0) {
        logger.warn(`[SizeService] Invalid ID provided: ${id}`);
        throw new Error("INVALID_ID");
      }

      const size = await this.repo.findOne({ where: { id } });

      if (!size) {
        logger.warn(`[SizeService] Size not found with ID: ${id}`);
        throw new Error("SIZE_NOT_FOUND");
      }

      logger.info(
        `[SizeService] Successfully fetched size: ${size.size}`
      );
      return size;
    } catch (err: any) {
      logger.error(`[SizeService] Error fetching size: ${err.message}`);
      throw err;
    }
  }

  async create(dto: CreateSizeDto) {
    try {
      logger.info(`[SizeService] Creating size: ${dto.size}`);

      // Validation
      if (dto.size === undefined || dto.size === null) {
        logger.warn(
          `[SizeService] Validation failed: size is required`
        );
        throw new Error("INVALID_SIZE_VALUE");
      }

      if (dto.size <= 0) {
        logger.warn(
          `[SizeService] Validation failed: size must be positive`
        );
        throw new Error("INVALID_SIZE_VALUE");
      }

      const exists = await this.repo.findOne({
        where: { size: dto.size },
      });

      if (exists) {
        logger.warn(
          `[SizeService] Size already exists: ${dto.size}`
        );
        throw new Error("SIZE_EXISTS");
      }

      const size = this.repo.create(dto);
      const saved = await this.repo.save(size);

      logger.info(`[SizeService] Size created successfully with ID: ${saved.id}`);
      return saved;
    } catch (err: any) {
      logger.error(`[SizeService] Error creating size: ${err.message}`);
      throw err;
    }
  }

  async update(id: number, dto: UpdateSizeDto) {
    try {
      logger.info(`[SizeService] Updating size with ID: ${id}`);

      const size = await this.getById(id);

      if (dto.size !== undefined) {
        if (dto.size <= 0) {
          logger.warn(
            `[SizeService] Validation failed: size must be positive`
          );
          throw new Error("INVALID_SIZE_VALUE");
        }

        const exists = await this.repo.findOne({
          where: { size: dto.size },
        });

        if (exists && exists.id !== id) {
          logger.warn(
            `[SizeService] Size value already exists: ${dto.size}`
          );
          throw new Error("SIZE_VALUE_EXISTS");
        }
      }

      Object.assign(size, dto);
      const updated = await this.repo.save(size);

      logger.info(`[SizeService] Size updated successfully - ID: ${id}`);
      return updated;
    } catch (err: any) {
      logger.error(`[SizeService] Error updating size: ${err.message}`);
      throw err;
    }
  }

  async delete(id: number) {
    try {
      logger.info(`[SizeService] Deleting size with ID: ${id}`);

      const size = await this.getById(id);
      await this.repo.remove(size);

      logger.info(`[SizeService] Size deleted successfully - ID: ${id}`);
      return true;
    } catch (err: any) {
      logger.error(`[SizeService] Error deleting size: ${err.message}`);
      throw err;
    }
  }
}
