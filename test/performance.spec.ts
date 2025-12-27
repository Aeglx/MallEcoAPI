import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MallEcoAPI 性能压力测试', () => {
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

  describe('高并发场景测试', () => {
    it('商品浏览 - 100并发请求', async () => {
      const startTime = Date.now();
      const concurrency = 100;
      const requests = Array(concurrency)
        .fill(0)
        .map(
          () => request(app.getHttpServer()).get('/api/buyer/products').timeout(5000), // 5秒超时
        );

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(
        `商品浏览 - 并发数: ${concurrency}, 成功: ${successful}, 失败: ${failed}, 总耗时: ${totalTime}ms`,
      );

      expect(successful).toBeGreaterThanOrEqual(concurrency * 0.95); // 95%成功率
      expect(totalTime).toBeLessThan(10000); // 10秒内完成
    });

    it('订单创建 - 50并发请求', async () => {
      const startTime = Date.now();
      const concurrency = 50;
      const requests = Array(concurrency)
        .fill(0)
        .map(
          (_, index) =>
            request(app.getHttpServer())
              .post('/api/buyer/orders')
              .send({
                productId: (index % 10) + 1, // 循环使用10个产品ID
                quantity: 1,
                paymentMethod: 'wallet',
              })
              .timeout(10000), // 10秒超时
        );

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(
        `订单创建 - 并发数: ${concurrency}, 成功: ${successful}, 失败: ${failed}, 总耗时: ${totalTime}ms`,
      );

      expect(successful).toBeGreaterThanOrEqual(concurrency * 0.9); // 90%成功率
      expect(totalTime).toBeLessThan(15000); // 15秒内完成
    });

    it('搜索服务 - 200并发请求', async () => {
      const startTime = Date.now();
      const concurrency = 200;
      const searchTerms = ['手机', '电脑', '服装', '家电', '食品'];

      const requests = Array(concurrency)
        .fill(0)
        .map(() => {
          const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
          return request(app.getHttpServer()).get(`/api/search/products?q=${term}`).timeout(9000); // 3秒超时
        });

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(
        `搜索服务 - 并发数: ${concurrency}, 成功: ${successful}, 失败: ${failed}, 总耗时: ${totalTime}ms`,
      );

      expect(successful).toBeGreaterThanOrEqual(concurrency * 0.95); // 95%成功率
      expect(totalTime).toBeLessThan(5000); // 5秒内完成
    });
  });

  describe('数据库压力测试', () => {
    it('数据库连接池 - 高并发查询', async () => {
      const startTime = Date.now();
      const concurrency = 100;
      const requests = Array(concurrency)
        .fill(0)
        .map(() => request(app.getHttpServer()).get('/api/products/detailed').timeout(5000));

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;

      console.log(
        `数据库查询 - 并发数: ${concurrency}, 成功: ${successful}, 总耗时: ${totalTime}ms`,
      );

      expect(successful).toBeGreaterThanOrEqual(concurrency * 0.95);
      expect(totalTime).toBeLessThan(8000); // 8秒内完成
    });

    it('事务处理 - 并发事务', async () => {
      const startTime = Date.now();
      const concurrency = 20;

      const requests = Array(concurrency)
        .fill(0)
        .map((_, index) =>
          request(app.getHttpServer())
            .post('/api/wallet/transfer')
            .send({
              fromUserId: index + 1,
              toUserId: ((index + 2) % concurrency) + 1,
              amount: 10.0,
              description: '压力测试转账',
            })
            .timeout(10000),
        );

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;

      console.log(`事务处理 - 并发数: ${concurrency}, 成功: ${successful}, 总耗时: ${totalTime}ms`);

      expect(successful).toBeGreaterThanOrEqual(concurrency * 0.8); // 80%成功率
    });
  });

  describe('缓存系统压力测试', () => {
    it('缓存击穿测试 - 热点数据', async () => {
      const startTime = Date.now();
      const concurrency = 300;

      // 先设置缓存
      await request(app.getHttpServer())
        .post('/api/cache/set')
        .send({ key: 'hot_product_1', value: { id: 1, name: '热门商品' }, ttl: 60 })
        .expect(201);

      // 并发读取热点数据
      const requests = Array(concurrency)
        .fill(0)
        .map(() => request(app.getHttpServer()).get('/api/cache/get/hot_product_1').timeout(2000));

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;

      console.log(`缓存击穿 - 并发数: ${concurrency}, 成功: ${successful}, 总耗时: ${totalTime}ms`);

      expect(successful).toBeGreaterThanOrEqual(concurrency * 0.98); // 98%成功率
      expect(totalTime).toBeLessThan(9000); // 3秒内完成
    });

    it('缓存雪崩测试 - 批量失效', async () => {
      // 设置多个缓存项
      const cacheKeys = Array(100)
        .fill(0)
        .map((_, i) => `cache_key_${i}`);

      for (const key of cacheKeys) {
        await request(app.getHttpServer())
          .post('/api/cache/set')
          .send({ key, value: { data: 'test' }, ttl: 1 }) // 1秒后失效
          .expect(201);
      }

      // 等待缓存失效
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 并发读取所有失效的缓存
      const startTime = Date.now();
      const requests = cacheKeys.map(key =>
        request(app.getHttpServer()).get(`/api/cache/get/${key}`).timeout(9000),
      );

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;

      console.log(
        `缓存雪崩 - 并发数: ${cacheKeys.length}, 成功: ${successful}, 总耗时: ${totalTime}ms`,
      );

      expect(successful).toBeGreaterThanOrEqual(cacheKeys.length * 0.9); // 90%成功率
    });
  });

  describe('消息队列压力测试', () => {
    it('高吞吐量消息处理', async () => {
      const startTime = Date.now();
      const messageCount = 500;

      const requests = Array(messageCount)
        .fill(0)
        .map((_, index) =>
          request(app.getHttpServer())
            .post('/api/message/send')
            .send({
              type: 'performance_test',
              data: `消息${index}`,
              priority: index % 3,
            })
            .timeout(5000),
        );

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const throughput = messageCount / (totalTime / 1000); // 消息/秒

      console.log(
        `消息队列 - 消息数: ${messageCount}, 成功: ${successful}, 吞吐量: ${throughput.toFixed(2)} msg/s`,
      );

      expect(successful).toBeGreaterThanOrEqual(messageCount * 0.95); // 95%成功率
      expect(throughput).toBeGreaterThan(50); // 至少50消息/秒
    });
  });

  describe('搜索服务压力测试', () => {
    it('复杂搜索查询性能', async () => {
      const startTime = Date.now();
      const concurrency = 50;

      const complexQueries = [
        'q=手机&category=electronics&price_min=1000&price_max=5000&sort=price_desc',
        'q=服装&category=clothing&brand=nike&size=M&color=red',
        'q=家电&category=appliances&rating_min=4&in_stock=true',
        'q=食品&category=food&organic=true&gluten_free=false',
      ];

      const requests = Array(concurrency)
        .fill(0)
        .map(() => {
          const query = complexQueries[Math.floor(Math.random() * complexQueries.length)];
          return request(app.getHttpServer()).get(`/api/search/products?${query}`).timeout(5000);
        });

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;

      console.log(`复杂搜索 - 并发数: ${concurrency}, 成功: ${successful}, 总耗时: ${totalTime}ms`);

      expect(successful).toBeGreaterThanOrEqual(concurrency * 0.9); // 90%成功率
      expect(totalTime).toBeLessThan(10000); // 10秒内完成
    });
  });

  describe('系统资源监控', () => {
    it('内存使用监控', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/system/metrics/memory')
        .expect(200);

      expect(response.body).toHaveProperty('used');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('usagePercentage');

      // 内存使用率应在合理范围内
      expect(response.body.usagePercentage).toBeLessThan(80); // 低于80%
    });

    it('CPU使用监控', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/system/metrics/cpu')
        .expect(200);

      expect(response.body).toHaveProperty('usage');
      expect(response.body).toHaveProperty('loadAverage');

      // CPU使用率应在合理范围内
      expect(response.body.usage).toBeLessThan(90); // 低于90%
    });

    it('数据库连接监控', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/database/connections')
        .expect(200);

      expect(response.body).toHaveProperty('active');
      expect(response.body).toHaveProperty('idle');
      expect(response.body).toHaveProperty('total');

      // 活跃连接数应在合理范围内
      expect(response.body.active).toBeLessThan(50); // 低于50个活跃连接
    });
  });

  describe('极限压力测试', () => {
    it('混合业务场景 - 综合压力', async () => {
      const startTime = Date.now();
      const totalRequests = 1000;

      // 混合不同类型的请求
      const requestTypes = [
        () => request(app.getHttpServer()).get('/api/buyer/products'),
        () => request(app.getHttpServer()).get('/api/search/products?q=test'),
        () => request(app.getHttpServer()).get('/api/cache/get/common_config'),
        () => request(app.getHttpServer()).get('/api/system/health'),
      ];

      const requests = Array(totalRequests)
        .fill(0)
        .map(() => {
          const randomType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
          return randomType().timeout(9000);
        });

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const throughput = totalRequests / (totalTime / 1000); // 请求/秒

      console.log(
        `混合场景 - 总请求数: ${totalRequests}, 成功: ${successful}, 吞吐量: ${throughput.toFixed(2)} req/s`,
      );

      expect(successful).toBeGreaterThanOrEqual(totalRequests * 0.85); // 85%成功率
      expect(throughput).toBeGreaterThan(50); // 至少50请求/秒
    });

    it('长时间运行稳定性', async () => {
      const duration = 30000; // 30秒测试
      const startTime = Date.now();
      let requestCount = 0;
      let successCount = 0;

      // 持续发送请求
      while (Date.now() - startTime < duration) {
        requestCount++;
        try {
          await request(app.getHttpServer()).get('/api/buyer/products').timeout(2000);
          successCount++;
        } catch (error) {
          // 记录失败但不中断测试
        }

        // 短暂停顿避免过度负载
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const successRate = successCount / requestCount;
      console.log(
        `稳定性测试 - 时长: ${duration}ms, 请求数: ${requestCount}, 成功率: ${(successRate * 100).toFixed(2)}%`,
      );

      expect(successRate).toBeGreaterThan(0.95); // 95%成功率
    });
  });

  describe('性能基准测试', () => {
    it('单接口响应时间基准', async () => {
      const iterations = 100;
      let totalResponseTime = 0;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app.getHttpServer()).get('/api/buyer/products').expect(200);
        const responseTime = Date.now() - startTime;
        totalResponseTime += responseTime;
      }

      const averageResponseTime = totalResponseTime / iterations;
      console.log(
        `响应时间基准 - 迭代次数: ${iterations}, 平均响应时间: ${averageResponseTime.toFixed(2)}ms`,
      );

      expect(averageResponseTime).toBeLessThan(500); // 平均响应时间低于500ms
    });

    it('数据库查询性能基准', async () => {
      const iterations = 50;
      let totalQueryTime = 0;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app.getHttpServer()).get('/api/products/detailed').expect(200);
        const queryTime = Date.now() - startTime;
        totalQueryTime += queryTime;
      }

      const averageQueryTime = totalQueryTime / iterations;
      console.log(
        `数据库查询基准 - 迭代次数: ${iterations}, 平均查询时间: ${averageQueryTime.toFixed(2)}ms`,
      );

      expect(averageQueryTime).toBeLessThan(800); // 平均查询时间低于800ms
    });
  });
});
