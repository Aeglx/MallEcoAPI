import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { PreventDuplicateSubmissionsInterceptor } from './prevent-duplicate-submissions.interceptor';

describe('PreventDuplicateSubmissionsInterceptor', () => {
  let interceptor: PreventDuplicateSubmissionsInterceptor;
  let cacheManager: any;
  let executionContext: ExecutionContext;
  let callHandler: CallHandler;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreventDuplicateSubmissionsInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    interceptor = module.get<PreventDuplicateSubmissionsInterceptor>(PreventDuplicateSubmissionsInterceptor);

    // Mock ExecutionContext
    executionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          path: '/test',
          body: { data: 'test' },
          user: { id: 'user1' },
        }),
      }),
      getHandler: jest.fn().mockReturnValue(() => {}),
    } as any;

    // Mock CallHandler
    callHandler = {
      handle: jest.fn().mockReturnValue(of({ success: true })),
    } as any;
  });

  it('应该允许没有装饰器的请求通过', async () => {
    // 模拟没有metadata的情况
    jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

    const result = await interceptor.intercept(executionContext, callHandler);

    expect(cacheManager.get).not.toHaveBeenCalled();
    expect(callHandler.handle).toHaveBeenCalled();
  });

  it('应该阻止重复提交', async () => {
    jest.spyOn(Reflect, 'getMetadata').mockReturnValue({ expire: 5, userIsolation: false });
    cacheManager.get.mockResolvedValue('1'); // 缓存中存在

    await expect(interceptor.intercept(executionContext, callHandler)).rejects.toThrow();

    expect(cacheManager.get).toHaveBeenCalled();
    expect(callHandler.handle).not.toHaveBeenCalled();
  });

  it('应该允许首次提交', async () => {
    jest.spyOn(Reflect, 'getMetadata').mockReturnValue({ expire: 5, userIsolation: false });
    cacheManager.get.mockResolvedValue(undefined); // 缓存中不存在

    await interceptor.intercept(executionContext, callHandler);

    expect(cacheManager.get).toHaveBeenCalled();
    expect(cacheManager.set).toHaveBeenCalled();
    expect(callHandler.handle).toHaveBeenCalled();
  });
});

