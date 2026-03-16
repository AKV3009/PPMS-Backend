// src/swagger.ts
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'PMMS Backend API',
    description: 'Production Management and Monitoring System - Comprehensive API Documentation',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@pmms.local',
    },
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"',
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and token management endpoints',
    },
    {
      name: 'Employees',
      description: 'Employee management - CRUD operations for employee records',
    },
    {
      name: 'Departments',
      description: 'Department management - Organize employees into departments',
    },
    {
      name: 'Dealers',
      description: 'Dealer/Supplier management - Manage fabric dealers and suppliers',
    },
    {
      name: 'Sheets',
      description: 'Sheet/Lot management - Track fabric sheets and lots from dealers',
    },
    {
      name: 'Issues',
      description: 'Issue tracking - Identify and track defects in sheets',
    },
    {
      name: 'Sizes',
      description: 'Size management - Manage fabric size values',
    },
    {
      name: 'Issue Employees',
      description: 'Issue Assignment - Link employees to issues for resolution',
    },
  ],
  definitions: {
    // Employee DTOs
    CreateEmployeeDto: {
      type: 'object',
      required: ['firstName', 'lastName', 'email'],
      properties: {
        firstName: {
          type: 'string',
          example: 'John',
          description: 'Employee first name',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
          description: 'Employee last name',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
          description: 'Employee email address (unique)',
        },
        departmentId: {
          type: 'integer',
          example: 1,
          description: 'Department ID (optional)',
        },
      },
    },
    UpdateEmployeeDto: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
        departmentId: { type: 'integer', example: 1 },
      },
    },
    EmployeeResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        departmentId: { type: 'integer', example: 1 },
        isActive: { type: 'boolean', example: true },
        isDeleted: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },

    // Department DTOs
    CreateDepartmentDto: {
      type: 'object',
      required: ['departmentName'],
      properties: {
        departmentName: {
          type: 'string',
          example: 'Quality Control',
          description: 'Department name (unique)',
        },
      },
    },
    UpdateDepartmentDto: {
      type: 'object',
      properties: {
        departmentName: { type: 'string', example: 'Quality Control' },
        isActive: { type: 'boolean', example: true },
      },
    },
    DepartmentResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        departmentName: { type: 'string', example: 'Quality Control' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    // Dealer DTOs
    CreateDealerDto: {
      type: 'object',
      required: ['dealerName'],
      properties: {
        dealerName: {
          type: 'string',
          example: 'ABC Fabrics Ltd',
          description: 'Dealer/Supplier name (unique)',
        },
        email: { type: 'string', format: 'email', example: 'contact@abcfabrics.com' },
        phone: { type: 'string', example: '+92-300-1234567' },
        address: { type: 'string', example: '123 Industrial Area, City' },
      },
    },
    UpdateDealerDto: {
      type: 'object',
      properties: {
        dealerName: { type: 'string', example: 'ABC Fabrics Ltd' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        address: { type: 'string' },
        isActive: { type: 'boolean', example: true },
      },
    },
    DealerResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        dealerName: { type: 'string', example: 'ABC Fabrics Ltd' },
        email: { type: 'string', example: 'contact@abcfabrics.com' },
        phone: { type: 'string', example: '+92-300-1234567' },
        address: { type: 'string', example: '123 Industrial Area' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        createdBy: { type: 'integer', example: 1 },
        updatedAt: { type: 'string', format: 'date-time' },
        updatedBy: { type: 'integer', example: 1 },
      },
    },

    // Sheet DTOs
    CreateSheetDto: {
      type: 'object',
      required: ['dealerId'],
      properties: {
        dealerId: { type: 'integer', example: 1, description: 'Dealer ID' },
        fabricPartyName: { type: 'string', example: 'Party A' },
        challanNumber: { type: 'string', example: 'CH-001' },
        lotNumber: { type: 'string', example: 'LOT-2024-001' },
        cuttingDate: { type: 'string', format: 'date', example: '2024-01-15' },
        fabricReceivedDate: { type: 'string', format: 'date', example: '2024-01-20' },
      },
    },
    UpdateSheetDto: {
      type: 'object',
      properties: {
        dealerId: { type: 'integer', example: 1 },
        fabricPartyName: { type: 'string' },
        challanNumber: { type: 'string' },
        lotNumber: { type: 'string' },
        cuttingDate: { type: 'string', format: 'date' },
        fabricReceivedDate: { type: 'string', format: 'date' },
      },
    },
    SheetResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        dealerId: { type: 'integer', example: 1 },
        fabricPartyName: { type: 'string', example: 'Party A' },
        challanNumber: { type: 'string', example: 'CH-001' },
        lotNumber: { type: 'string', example: 'LOT-2024-001' },
        cuttingDate: { type: 'string', format: 'date' },
        fabricReceivedDate: { type: 'string', format: 'date' },
      },
    },

    // Issue DTOs
    CreateIssueDto: {
      type: 'object',
      required: ['sheetId', 'issueCode'],
      properties: {
        sheetId: { type: 'integer', example: 1, description: 'Sheet ID' },
        issueCode: { type: 'string', example: 'ISSUE-001', description: 'Issue code/reference' },
        meter: { type: 'number', example: 2.5, description: 'Meter value' },
      },
    },
    UpdateIssueDto: {
      type: 'object',
      properties: {
        issueCode: { type: 'string', example: 'ISSUE-001' },
        meter: { type: 'number', example: 2.5 },
      },
    },
    IssueResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        sheetId: { type: 'integer', example: 1 },
        issueCode: { type: 'string', example: 'ISSUE-001' },
        meter: { type: 'number', example: 2.5 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },

    // Size DTOs
    CreateSizeDto: {
      type: 'object',
      required: ['sizeValue'],
      properties: {
        sizeValue: { type: 'number', example: 32, description: 'Size value (must be positive)' },
      },
    },
    UpdateSizeDto: {
      type: 'object',
      properties: {
        sizeValue: { type: 'number', example: 32 },
      },
    },
    SizeResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        sizeValue: { type: 'number', example: 32 },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    // Issue Employee DTOs
    CreateIssueEmployeeDto: {
      type: 'object',
      required: ['issueId', 'employeeId'],
      properties: {
        issueId: { type: 'integer', example: 1, description: 'Issue ID' },
        employeeId: { type: 'integer', example: 1, description: 'Employee ID' },
      },
    },
    IssueEmployeeResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        issueId: { type: 'integer', example: 1 },
        employeeId: { type: 'integer', example: 1 },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    // Pagination Response
    PaginatedResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 25 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
      },
    },

    // Error Response
    ErrorResponse: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error description' },
        code: { type: 'string', example: 'ERROR_CODE' },
      },
    },
  },
};

const outputFile = './src/swagger_output.json';
const routes = ['./src/app/app.ts'];

swaggerAutogen()(outputFile, routes, doc);
