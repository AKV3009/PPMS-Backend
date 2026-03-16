export interface CreateIssueEmployeeDto {
  issueId: number;
  employeeId: number;
}

export interface IssueEmployeeResponseDto {
  id: number;
  issueId: number;
  employeeId: number;
  createdAt: Date;
}
