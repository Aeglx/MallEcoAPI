import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MallEcoAPI 系统集成测试', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('核心业务模块集成测试', () => {
    it('产品管理模块 - 健康检查', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          expect(res.body.status).toBe('ok');
        });
    });

    it('分销系统模块 - API端点可访问性', () => {
      return request(app.getHttpServer())
        .get('/api/distribution/health')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('status');
        });
    });

    it('促销营销模块 - 基础功能验证', () => {
      return request(app.getHttpServer())
        .get('/api/promotion/coupons')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('钱包支付模块 - 系统状态检查', () => {
      return request(app.getHttpServer())
        .get('/api/wallet/status')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('balance');
          expect(res.body).toHaveProperty('transactions');
        });
    });
  });

  describe('多端分离模块集成测试', () => {
    it('买家端模块 - 商品浏览功能', () => {
      return request(app.getHttpServer())
        .get('/api/buyer/products')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('products');
          expect(Array.isArray(res.body.products)).toBe(true);
        });
    });

    it('卖家端模块 - 店铺管理功能', () => {
      return request(app.getHttpServer())
        .get('/api/seller/stores')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('stores');
          expect(Array.isArray(res.body.stores)).toBe(true);
        });
    });

    it('管理端模块 - 用户管理功能', () => {
      return request(app.getHttpServer())
        .get('/api/manager/users')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('users');
          expect(Array.isArray(res.body.users)).toBe(true);
        });
    });
  });

  describe('第三阶段架构优化模块集成测试', () => {
    it('性能监控系统 - 监控数据收集', () => {
      return request(app.getHttpServer())
        .get('/api/system/metrics')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('cpu');
          expect(res.body).toHaveProperty('memory');
          expect(res.body).toHaveProperty('responseTime');
        });
    });

    it('健康检查系统 - 组件状态检查', () => {
      return request(app.getHttpServer())
        .get('/api/health/check')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('components');
          expect(res.body.components).toHaveProperty('database');
          expect(res.body.components).toHaveProperty('redis');
          expect(res.body.components).toHaveProperty('elasticsearch');
        });
    });

    it('审计日志系统 - 日志记录功能', () => {
      return request(app.getHttpServer())
        .get('/api/system/audit-logs')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('logs');
          expect(Array.isArray(res.body.logs)).toBe(true);
        });
    });

    it('缓存系统 - 缓存策略验证', () => {
      return request(app.getHttpServer())
        .get('/api/cache/stats')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('hitRate');
          expect(res.body).toHaveProperty('memoryUsage');
          expect(res.body).toHaveProperty('keys');
        });
    });

    it('微服务架构 - 服务发现验证', () => {
      return request(app.getHttpServer())
        .get('/api/microservices/services')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('services');
          expect(Array.isArray(res.body.services)).toBe(true);
        });
    });
  });

  describe('跨模块数据一致性测试', () => {
    it('订单-支付-库存数据一致性', async () => {
      // 创建测试订单
      const orderResponse = await request(app.getHttpServer())
        .post('/api/buyer/orders')
        .send({
          productId: 1,
          quantity: 2,
          paymentMethod: 'wallet',
        })
        .expect(201);

      const orderId = orderResponse.body.orderId;

      // 验证支付状态
      await request(app.getHttpServer())
        .get(`/api/wallet/order/${orderId}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('paymentStatus');
        });

      // 验证库存扣减
      await request(app.getHttpServer())
        .get(`/api/products/1/stock`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('availableStock');
        });
    });

    it('分销-订单-佣金数据一致性', async () => {
      // 分销订单创建
      const distributionOrder = await request(app.getHttpServer())
        .post('/api/distribution/orders')
        .send({
          distributorId: 1,
          productId: 1,
          quantity: 1,
        })
        .expect(201);

      // 验证佣金计算
      await request(app.getHttpServer())
        .get(`/api/distribution/commission/${distributionOrder.body.orderId}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('commissionAmount');
        });
    });
  });

  describe('错误处理和异常场景测试', () => {
    it('无效API端点 - 404错误处理', () => {
      return request(app.getHttpServer())
        .get('/api/invalid-endpoint')
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('statusCode');
        });
    });

    it('参数验证错误 - 400错误处理', () => {
      return request(app.getHttpServer())
        .post('/api/buyer/orders')
        .send({}) // 空数据
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('error');
        });
    });

    it('认证失败 - 401错误处理', () => {
      return request(app.getHttpServer())
        .get('/api/manager/users')
        .set('Authorization', 'InvalidToken')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('statusCode');
        });
    });
  });

  describe('性能监控集成测试', () => {
    it('响应时间监控', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer()).get('/api/products').expect(200);

      const responseTime = Date.now() - startTime;

      // 验证响应时间在可接受范围内
      expect(responseTime).toBeLessThan(1000); // 1秒内
    });

    it('并发请求处理', async () => {
      const requests = Array(10)
        .fill(0)
        .map(() => request(app.getHttpServer()).get('/api/products').expect(200));

      await Promise.all(requests);

      // 所有请求都应该成功完成
      expect(requests.length).toBe(10);
    });
  });

  describe('数据库连接和事务测试', () => {
    it('数据库连接状态', () => {
      return request(app.getHttpServer())
        .get('/api/database/status')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('connected');
          expect(res.body.connected).toBe(true);
        });
    });

    it('事务回滚测试', async () => {
      // 创建会失败的事务操作
      await request(app.getHttpServer())
        .post('/api/test/transaction')
        .send({ shouldFail: true })
        .expect(500);

      // 验证数据没有插入
      await request(app.getHttpServer())
        .get('/api/test/data')
        .expect(200)
        .expect(res => {
          expect(res.body.data.length).toBe(0);
        });
    });
  });

  describe('缓存系统集成测试', () => {
    it('缓存命中率统计', () => {
      return request(app.getHttpServer())
        .get('/api/cache/metrics')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('hitRate');
          expect(res.body).toHaveProperty('missRate');
          expect(res.body.hitRate).toBeGreaterThanOrEqual(0);
        });
    });

    it('缓存失效策略', async () => {
      // 设置缓存
      await request(app.getHttpServer())
        .post('/api/cache/set')
        .send({ key: 'test', value: 'data', ttl: 1 }) // 1秒过期
        .expect(201);

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 验证缓存已失效
      await request(app.getHttpServer()).get('/api/cache/get/test').expect(404);
    });
  });

  describe('消息队列集成测试', () => {
    it('消息发送和接收', async () => {
      const message = { type: 'test', data: 'integration test' };

      // 发送消息
      await request(app.getHttpServer()).post('/api/message/send').send(message).expect(201);

      // 验证消息处理
      await new Promise(resolve => setTimeout(resolve, 1000));

      await request(app.getHttpServer())
        .get('/api/message/status/test')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('processed');
        });
    });
  });

  describe('搜索服务集成测试', () => {
    it('Elasticsearch连接状态', () => {
      return request(app.getHttpServer())
        .get('/api/search/health')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('green');
        });
    });

    it('商品搜索功能', () => {
      return request(app.getHttpServer())
        .get('/api/search/products?q=test')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('products');
          expect(res.body).toHaveProperty('total');
        });
    });
  });
});
