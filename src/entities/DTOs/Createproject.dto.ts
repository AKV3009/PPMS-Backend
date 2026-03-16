// dto/create-project.dto.ts

export class TpDto {
  id?: number;
  tpValue!: number;
  layerValue!: number;
  displayOrder!: number;
}

export class IssueDto {
  id?: number;
  issueCode!: string;
  mtr!: number;
  displayOrder!: number;
  frontEmployeeId?: number;
  backEmployeeId?: number;
  tps!: TpDto[];
}

export class SizeConfigDto {
  id?: number;
  sizeId!: number;
  sizeValue!: number;
  quantity!: number;
}

export class ProjectHeaderDto {
  rollNumber!: string;
  fabricPartyName!: string;
  challanNumber!: string;
  lotNumber!: string;
  dealerId!: number;
  cuttingDate!: Date;
  fabricReceivedDate!: Date;
  pageMetaPages?: string;
  pageMetaPValue?: number;
  pageMetaPValueRounded?: number;
}

export class CalculationDto {
  tpValue!: number;
  sizeValues?: Record<string, number>;
  rowTotal!: number;
}

export class CreateProjectDto {
  project!: ProjectHeaderDto;
  sizeConfigs!: SizeConfigDto[];
  issues!: IssueDto[];
  savedCalculations?: CalculationDto[];
  hasManualEdits?: boolean;
}

export class UpdateProjectDto extends CreateProjectDto {}
