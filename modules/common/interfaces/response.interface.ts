export interface ResponseModel<T> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  traceId: string;
}

export interface PaginationResponse<T> extends ResponseModel<T> {
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}