import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionService } from '../services/distribution.service';
import { Distribution } from '../entities/distribution.entity';
import { DistributionStatusEnum } from '../enums/distribution-status.enum';
import { DistributionApplyDTO } from '../dto/distribution-apply.dto';

describe('DistributionService', () => {
  let service: DistributionService;
  let repository: Repository<Distribution>;

  const mockDistributionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionService,
        {
          provide: getRepositoryToken(Distribution),
          useValue: mockDistributionRepository,
        },
      ],
    }).compile();

    service = module.get<DistributionService>(DistributionService);
    repository = module.get<Repository<Distribution>>(getRepositoryToken(Distribution));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('applyDistribution', () => {
    it('should successfully apply for distribution', async () => {
      // 准备测试数据
      const memberId = 'test-member-id';
      const memberName = 'test-member';
      const applyDto: DistributionApplyDTO = {
        name: '测试用户',
        idNumber: '123456789012345678',
        settlementBankAccountName: '测试银行',
        settlementBankAccountNum: '1234567890123456',
        settlementBankBranchName: '测试支行',
      };

      const expectedDistribution = {
        id: 'test-id',
        memberId,
        memberName,
        ...applyDto,
        distributionStatus: DistributionStatusEnum.APPLY,
        rebateTotal: 0,
        canRebate: 0,
        commissionFrozen: 0,
        distributionOrderCount: 0,
        distributionOrderPrice: 0,
      };

      // 模拟repository行为
      mockDistributionRepository.findOne.mockResolvedValue(null);
      mockDistributionRepository.save.mockResolvedValue(expectedDistribution);

      // 执行测试
      const result = await service.applyDistribution(memberId, memberName, applyDto);

      // 验证结果
      expect(result).toEqual(expectedDistribution);
      expect(mockDistributionRepository.findOne).toHaveBeenCalledWith({
        where: { memberId, deleteFlag: false }
      });
      expect(mockDistributionRepository.save).toHaveBeenCalled();
    });

    it('should throw error if user already applied', async () => {
      const memberId = 'test-member-id';
      const memberName = 'test-member';
      const applyDto: DistributionApplyDTO = {
        name: '测试用户',
        idNumber: '123456789012345678',
        settlementBankAccountName: '测试银行',
        settlementBankAccountNum: '1234567890123456',
        settlementBankBranchName: '测试支行',
      };

      // 模拟用户已申请过分销员
      mockDistributionRepository.findOne.mockResolvedValue({
        id: 'existing-id',
        memberId,
      } as Distribution);

      // 执行测试并验证错误
      await expect(service.applyDistribution(memberId, memberName, applyDto))
        .rejects.toThrow('用户已经申请过分销员');
    });
  });

  describe('getDistributionByMemberId', () => {
    it('should return distribution if found', async () => {
      const memberId = 'test-member-id';
      const expectedDistribution = {
        id: 'test-id',
        memberId,
        memberName: 'test-member',
        distributionStatus: DistributionStatusEnum.PASS,
      } as Distribution;

      mockDistributionRepository.findOne.mockResolvedValue(expectedDistribution);

      const result = await service.getDistributionByMemberId(memberId);

      expect(result).toEqual(expectedDistribution);
      expect(mockDistributionRepository.findOne).toHaveBeenCalledWith({
        where: { memberId, deleteFlag: false }
      });
    });

    it('should throw error if distribution not found', async () => {
      const memberId = 'test-member-id';

      mockDistributionRepository.findOne.mockResolvedValue(null);

      await expect(service.getDistributionByMemberId(memberId))
        .rejects.toThrow('用户还不是分销员');
    });
  });

  describe('auditDistribution', () => {
    it('should successfully audit distribution application', async () => {
      const distributionId = 'test-id';
      const status = DistributionStatusEnum.PASS;
      const auditRemark = '审核通过';

      const existingDistribution = {
        id: distributionId,
        distributionStatus: DistributionStatusEnum.APPLY,
      } as Distribution;

      const updatedDistribution = {
        ...existingDistribution,
        distributionStatus: status,
        updateBy: auditRemark,
      };

      mockDistributionRepository.findOne.mockResolvedValue(existingDistribution);
      mockDistributionRepository.save.mockResolvedValue(updatedDistribution);

      const result = await service.auditDistribution(distributionId, status, auditRemark);

      expect(result.distributionStatus).toBe(status);
      expect(mockDistributionRepository.findOne).toHaveBeenCalledWith({
        where: { id: distributionId, deleteFlag: false }
      });
      expect(mockDistributionRepository.save).toHaveBeenCalled();
    });

    it('should throw error if distribution not found', async () => {
      const distributionId = 'non-existent-id';
      const status = DistributionStatusEnum.PASS;

      mockDistributionRepository.findOne.mockResolvedValue(null);

      await expect(service.auditDistribution(distributionId, status))
        .rejects.toThrow('分销员不存在');
    });

    it('should throw error if distribution status is not APPLY', async () => {
      const distributionId = 'test-id';
      const status = DistributionStatusEnum.PASS;

      const existingDistribution = {
        id: distributionId,
        distributionStatus: DistributionStatusEnum.PASS, // 不是APPLY状态
      } as Distribution;

      mockDistributionRepository.findOne.mockResolvedValue(existingDistribution);

      await expect(service.auditDistribution(distributionId, status))
        .rejects.toThrow('只能审核待审核状态的申请');
    });
  });

  describe('updateDistributionCommission', () => {
    it('should successfully update distribution commission', async () => {
      const distributionId = 'test-id';
      const rebateAmount = 100.5;
      const isFrozen = true;

      const existingDistribution = {
        id: distributionId,
        rebateTotal: 200,
        canRebate: 150,
        commissionFrozen: 50,
        distributionOrderCount: 5,
      } as Distribution;

      const updatedDistribution = {
        ...existingDistribution,
        rebateTotal: 300.5, // 200 + 100.5
        commissionFrozen: 150.5, // 50 + 100.5 (因为是冻结的)
        distributionOrderCount: 6, // 5 + 1
      };

      mockDistributionRepository.findOne.mockResolvedValue(existingDistribution);
      mockDistributionRepository.save.mockResolvedValue(updatedDistribution);

      await service.updateDistributionCommission(distributionId, rebateAmount, isFrozen);

      expect(mockDistributionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          rebateTotal: 300.5,
          commissionFrozen: 150.5,
          distributionOrderCount: 6,
        })
      );
    });

    it('should update canRebate if not frozen', async () => {
      const distributionId = 'test-id';
      const rebateAmount = 100.5;
      const isFrozen = false;

      const existingDistribution = {
        id: distributionId,
        rebateTotal: 200,
        canRebate: 150,
        commissionFrozen: 50,
        distributionOrderCount: 5,
      } as Distribution;

      mockDistributionRepository.findOne.mockResolvedValue(existingDistribution);
      mockDistributionRepository.save.mockResolvedValue({});

      await service.updateDistributionCommission(distributionId, rebateAmount, isFrozen);

      expect(mockDistributionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          rebateTotal: 300.5, // 200 + 100.5
          canRebate: 250.5, // 150 + 100.5 (不是冻结的)
          commissionFrozen: 50, // 保持不变
          distributionOrderCount: 6, // 5 + 1
        })
      );
    });
  });

  describe('getDistributionStatistics', () => {
    it('should return correct statistics', async () => {
      // 模拟各种状态的分销员数量
      mockDistributionRepository.count
        .mockResolvedValueOnce(100) // 总数
        .mockResolvedValueOnce(10)  // 待审核
        .mockResolvedValueOnce(80)  // 已通过
        .mockResolvedValueOnce(10); // 已禁用

      const result = await service.getDistributionStatistics();

      expect(result).toEqual({
        totalCount: 100,
        pendingCount: 10,
        activeCount: 80,
        disabledCount: 10,
      });
    });
  });
});