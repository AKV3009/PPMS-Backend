// services/project.service.ts
import { Repository } from 'typeorm';
import { Issue } from '../entities/issue.entity';
import { Tp } from '../entities/tp.entity';
import { AppDataSource } from '../config/client';
import { Dealer } from '../entities/dealers.entity';
import { Sheet } from '../entities/sheet.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Sheet>,
    @InjectRepository(SizeConfig)
    private sizeConfigRepository: Repository<SizeConfig>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
  ) {}
  
    private calculationRepository = AppDataSource.getRepository(ProjectCalculation);
    private tpRepository =  AppDataSource.getRepository(Tp);

  async saveCompleteProject(data: any) {
    const queryRunner = this.projectRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the project
      const project = this.projectRepository.create({
        rollNumber: data.project.rollNumber,
        fabricPartyName: data.project.fabricPartyName,
        challanNumber: data.project.challanNumber,
        lotNumber: data.project.lotNumber,
        dealerId: data.project.dealerId,
        cuttingDate: data.project.cuttingDate,
        fabricReceivedDate: data.project.fabricReceivedDate,
        pageMetaPages: data.project.pageMetaPages,
        pageMetaPValue: data.project.pageMetaPValue,
        pageMetaPValueRounded: data.project.pageMetaPValueRounded,
        hasManualEdits: data.hasManualEdits || false,
      });

      const savedProject = await queryRunner.manager.save(project);

      // 2. Save size configurations
      if (data.sizeConfigs && data.sizeConfigs.length > 0) {
        const sizeConfigs = data.sizeConfigs.map((config: any) =>
          this.sizeConfigRepository.create({
            projectId: savedProject.id,
            sizeId: config.sizeId,
            sizeValue: config.sizeValue,
            quantity: config.quantity,
          }),
        );
        await queryRunner.manager.save(sizeConfigs);
      }

      // 3. Save issues with TPs
      if (data.issues && data.issues.length > 0) {
        for (const issueData of data.issues) {
          const issue = this.issueRepository.create({
            projectId: savedProject.id,
            issueCode: issueData.issueCode,
            mtr: issueData.mtr,
            displayOrder: issueData.displayOrder,
            frontEmployeeId: issueData.frontEmployeeId,
            backEmployeeId: issueData.backEmployeeId,
          });

          const savedIssue = await queryRunner.manager.save(issue);

          // Save TPs for this issue
          if (issueData.tps && issueData.tps.length > 0) {
            const tps = issueData.tps.map((tp: any) =>
              this.tpRepository.create({
                issueId: savedIssue.id,
                tpValue: tp.tpValue,
                layerValue: tp.layerValue,
                displayOrder: tp.displayOrder,
              }),
            );
            await queryRunner.manager.save(tps);
          }
        }
      }

      // 4. Save calculations (NEW)
      if (data.savedCalculations && data.savedCalculations.length > 0) {
        const calculations = data.savedCalculations.map((calc: any, index: number) =>
          this.calculationRepository.create({
            projectId: savedProject.id,
            tpValue: calc.tpValue,
            sizeValues: calc.sizeValues,
            rowTotal: calc.rowTotal,
            displayOrder: index,
          }),
        );
        await queryRunner.manager.save(calculations);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Project saved successfully',
        data: { id: savedProject.id },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCompleteProject(projectId: number, data: any) {
    const queryRunner = this.projectRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Update project
      await queryRunner.manager.update(Project, projectId, {
        rollNumber: data.project.rollNumber,
        fabricPartyName: data.project.fabricPartyName,
        challanNumber: data.project.challanNumber,
        lotNumber: data.project.lotNumber,
        dealerId: data.project.dealerId,
        cuttingDate: data.project.cuttingDate,
        fabricReceivedDate: data.project.fabricReceivedDate,
        pageMetaPages: data.project.pageMetaPages,
        pageMetaPValue: data.project.pageMetaPValue,
        pageMetaPValueRounded: data.project.pageMetaPValueRounded,
        hasManualEdits: data.hasManualEdits || false,
      });

      // 2. Delete and recreate size configs
      await queryRunner.manager.delete(SizeConfig, { projectId });
      if (data.sizeConfigs && data.sizeConfigs.length > 0) {
        const sizeConfigs = data.sizeConfigs.map((config: any) =>
          this.sizeConfigRepository.create({
            projectId,
            sizeId: config.sizeId,
            sizeValue: config.sizeValue,
            quantity: config.quantity,
          }),
        );
        await queryRunner.manager.save(sizeConfigs);
      }

      // 3. Delete and recreate issues (cascade will delete TPs)
      await queryRunner.manager.delete(Issue, { projectId });
      if (data.issues && data.issues.length > 0) {
        for (const issueData of data.issues) {
          const issue = this.issueRepository.create({
            projectId,
            issueCode: issueData.issueCode,
            mtr: issueData.mtr,
            displayOrder: issueData.displayOrder,
            frontEmployeeId: issueData.frontEmployeeId,
            backEmployeeId: issueData.backEmployeeId,
          });

          const savedIssue = await queryRunner.manager.save(issue);

          if (issueData.tps && issueData.tps.length > 0) {
            const tps = issueData.tps.map((tp: any) =>
              this.tpRepository.create({
                issueId: savedIssue.id,
                tpValue: tp.tpValue,
                layerValue: tp.layerValue,
                displayOrder: tp.displayOrder,
              }),
            );
            await queryRunner.manager.save(tps);
          }
        }
      }

      // 4. Delete and recreate calculations (NEW)
      await queryRunner.manager.delete(ProjectCalculation, { projectId });
      if (data.savedCalculations && data.savedCalculations.length > 0) {
        const calculations = data.savedCalculations.map((calc: any, index: number) =>
          this.calculationRepository.create({
            projectId,
            tpValue: calc.tpValue,
            sizeValues: calc.sizeValues,
            rowTotal: calc.rowTotal,
            displayOrder: index,
          }),
        );
        await queryRunner.manager.save(calculations);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Project updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProjectById(id: number) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['sizeConfigs', 'issues', 'issues.tps', 'calculations', 'dealer'],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Transform calculations from array to the format expected by frontend
    const savedCalculations = project.calculations
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((calc) => ({
        tpValue: calc.tpValue,
        sizeValues: calc.sizeValues,
        rowTotal: calc.rowTotal,
      }));

    return {
      ...project,
      savedCalculations,
      issues: project.issues
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((issue) => ({
          ...issue,
          tps: issue.tps.sort((a, b) => a.displayOrder - b.displayOrder),
        })),
    };
  }

  async getAllProjects(page = 1, limit = 10) {
    const [projects, total] = await this.projectRepository.findAndCount({
      relations: ['dealer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteProject(id: number) {
    // Cascade delete will handle all related records
    const result = await this.projectRepository.delete(id);

    if (result.affected === 0) {
      throw new Error('Project not found');
    }

    return {
      success: true,
      message: 'Project deleted successfully',
    };
  }
}