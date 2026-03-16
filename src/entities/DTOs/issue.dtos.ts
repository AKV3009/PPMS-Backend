export interface CreateIssueDto {
  sheetId: number;
  issueCode: string;
  meter?: number;
}

export interface UpdateIssueDto {
  issueCode?: string;
  meter?: number;
}

export interface IssueResponseDto {
  id: number;
  sheetId: number;
  issueCode: string;
  meter: number;
  createdAt: Date;
  updatedAt: Date;
}
