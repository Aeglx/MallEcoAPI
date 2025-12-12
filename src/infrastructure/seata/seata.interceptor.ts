import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SeataService } from './infrastructure/seata.service';

@Injectable()
export class SeataInterceptor implements NestInterceptor {
  constructor(private readonly seataService: SeataService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const methodName = `${context.getClass().name}.${context.getHandler().name}`;
    
    let xid: string | null = null;

    // 检查是否已经存在全局事务
    if (!this.seataService.isInGlobalTransaction()) {
      try {
        // 开启新的全局事务
        xid = await this.seataService.beginTransaction(methodName, 60000);
        console.log(`Started new global transaction: ${xid}`);
      } catch (error) {
        console.error('Failed to start global transaction:', error);
        // 如果开启事务失败，继续执行但不使用事务
      }
    }

    return next.handle().pipe(
      tap(() => {
        // 请求成功，提交事�?
        if (xid) {
          this.seataService.commitTransaction(xid).catch(error => {
            console.error('Failed to commit transaction:', error);
          });
        }
      }),
      catchError((error) => {
        // 请求失败，回滚事�?
        if (xid) {
          this.seataService.rollbackTransaction(xid).catch(rollbackError => {
            console.error('Failed to rollback transaction:', rollbackError);
          });
        }
        throw error;
      })
    );
  }
}

// 事务装饰�?
export function GlobalTransaction(timeout: number = 60000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const seataService: SeataService = (this as any).seataService;
      
      if (!seataService) {
        return originalMethod.apply(this, args);
      }

      let xid: string | null = null;
      
      // 检查是否已经存在全局事务
      if (!seataService.isInGlobalTransaction()) {
        try {
          xid = await seataService.beginTransaction(propertyKey, timeout);
        } catch (error) {
          console.error('Failed to start global transaction:', error);
          // 如果开启事务失败，继续执行但不使用事务
        }
      }

      try {
        const result = await originalMethod.apply(this, args);
        
        // 提交事务
        if (xid) {
          await seataService.commitTransaction(xid);
        }
        
        return result;
      } catch (error) {
        // 回滚事务
        if (xid) {
          await seataService.rollbackTransaction(xid);
        }
        throw error;
      }
    };
    
    return descriptor;
  };
}

// 分支事务装饰�?
export function BranchTransaction(resourceId: string, branchType: string = 'AT') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const seataService: SeataService = (this as any).seataService;
      
      if (!seataService || !seataService.isInGlobalTransaction()) {
        return originalMethod.apply(this, args);
      }

      const xid = seataService.getCurrentXid();
      if (!xid) {
        return originalMethod.apply(this, args);
      }

      let branchId: number | null = null;
      
      try {
        // 注册分支事务
        branchId = await seataService.registerBranchTransaction(
          xid,
          resourceId,
          branchType,
          { method: propertyKey }
        );
        
        const result = await originalMethod.apply(this, args);
        
        // 报告分支事务成功
        if (branchId !== null) {
          await seataService.reportBranchStatus(xid, branchId, 1, { status: 'committed' });
        }
        
        return result;
      } catch (error) {
        // 报告分支事务失败
        if (branchId !== null) {
          await seataService.reportBranchStatus(xid, branchId, 2, { status: 'rollbacked' });
        }
        throw error;
      }
    };
    
    return descriptor;
  };
}
