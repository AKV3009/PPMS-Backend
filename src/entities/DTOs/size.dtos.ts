export interface CreateSizeDto {
  size: number;
}

export interface UpdateSizeDto {
  size?: number;
}

export interface SizeResponseDto {
  id: number;
  size: number;
  createdAt: Date;
}
