export interface CreateDepartmentDto {
  departmentName: string;
}

export interface UpdateDepartmentDto {
  departmentName?: string;
  isActive?: boolean;
}

export interface DepartmentResponseDto {
  id: number;
  departmentName: string;
  isActive: boolean;
  createdAt: Date;
}
