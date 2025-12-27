import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
  code: number;
  details?: any;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '内部服务器错误';
    let error = 'Internal Server Error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.message;
        details = responseObj.details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;

      // 数据库错误处理
      if (exception.message.includes('ER_DUP_ENTRY')) {
        status = HttpStatus.CONFLICT;
        message = '数据已存在';
        error = 'Duplicate Entry';
      } else if (exception.message.includes('ER_NO_REFERENCED_ROW')) {
        status = HttpStatus.BAD_REQUEST;
        message = '关联数据不存在';
        error = 'Foreign Key Constraint';
      }
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      code: status,
    };

    if (details) {
      errorResponse.details = details;
    }

    // 开发环境下包含堆栈信息
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.details = {
        stack: exception.stack,
      };
    }

    response.status(status).json(errorResponse);
  }
}
