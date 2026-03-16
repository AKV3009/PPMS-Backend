export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: number;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
}
