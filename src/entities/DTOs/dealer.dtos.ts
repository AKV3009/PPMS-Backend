export interface CreateDealerDto {
  dealerName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateDealerDto {
  dealerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface DealerResponseDto {
  id: number;
  dealerName: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
}
