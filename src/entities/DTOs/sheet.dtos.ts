export interface CreateSheetDto {
  dealerId: number;
  fabricPartyName?: string;
  challanNumber?: string;
  lotNumber?: string;
  cuttingDate?: Date;
  fabricReceivedDate?: Date;
}

export interface UpdateSheetDto {
  dealerId?: number;
  fabricPartyName?: string;
  challanNumber?: string;
  lotNumber?: string;
  cuttingDate?: Date;
  fabricReceivedDate?: Date;
}

export interface SheetResponseDto {
  id: number;
  dealerId: number;
  fabricPartyName?: string;
  challanNumber?: string;
  lotNumber?: string;
  cuttingDate?: Date;
  fabricReceivedDate?: Date;
}
