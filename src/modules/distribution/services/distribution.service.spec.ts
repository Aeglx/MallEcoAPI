import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionService } from './distribution.service';
import { Distribution } from '../entities/distribution.entity';
import { DistributionApplyDTO } from '../dto/distribution-apply.dto';
import { DistributionStatusEnum } from '../enums/distribution-status.enum';
import { BusinessException } from '../../../shared/exceptions/business.exception';

describe('DistributionService', () => {
  let service: DistributionService;
  let repository: Repository<Distribution>;

  const mockDistribution = {
    id: '1',
    memberId: '123',
    memberName: '测试用户',
    name: '张三',
    idNumber: '123456789012345678',
    settlementBankAccountName: '张三',
    settlementBankAccountNum: '6222021234567890123',
    settlementBankBranchName: '中国工商银行北京分行',
    distributionOrderCount: 0,
    rebateTotal: 0,
    canRebate: 0,
    commissionFrozen: 0,
    distributionOrderPrice: 0,
    distributionStatus: DistributionStatusEnum.APPLY,
    deleteFlag: false,
    createTime: new Date(),
    updateTime: new Date(),
  };

  const mockApplyDto: DistributionApplyDTO = {
    name: '张三',
    idNumber: '123456789012345678',
    settlementBankAccountName: '张三',
    settlementBankAccountNum: '6222021234567890123',
    settlementBankBranchName: '中国工商银行北京分行',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionService,
        {
          provide: getRepositoryToken(Distribution),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<DistributionService>(DistributionService);
    repository = module.get<Repository<Distribution>>(getRepositoryToken(Distribution));
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('applyDistribution', () => {
    it('应该成功申请成为分销员', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'save').mockResolvedValue(mockDistribution);

      const result = await service.applyDistribution('123', '测试用户', mockApplyDto);
      
      expect(result).toEqual(mockDistribution);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { memberId: '123', deleteFlag: false }
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('用户已经申请过分销员时应该抛出异常', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDistribution);

      await expect(
        service.applyDistribution('123', '测试用户', mockApplyDto)
      ).rejects.toThrow('用户已经申请过分销员');
    });

    it('应该设置正确的初始状态', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'save').mockImplementation((entity) => Promise.resolve(entity as Distribution));

      const result = await service.applyDistribution('123', '测试用户', mockApplyDto);
      
      expect(result.distributionStatus).toBe(DistributionStatusEnum.APPLY);
      expect(result.distributionOrderCount).toBe(0);
      expect(result.rebateTotal).toBe(0);
    });
  });

  describe('getDistributionList', () => {
    it('应该返回分销员列表', async () => {
      const mockSearchParams = {
        page: 1,
        pageSize: 10,
      };

      const mockResult = {
        items: [mockDistribution],
        total: 1,
      };

      const queryBuilder = repository.createQueryBuilder();
      jest.spyOn(queryBuilder, 'getManyAndCount').mockResolvedValue([mockResult.items, mockResult.total]);

      const result = await service.getDistributionList(mockSearchParams);
      
      expect(result).toEqual(mockResult);
    });

    it('应该支持条件查询', async () => {
      const mockSearchParams = {
        memberId: '123',
        memberName: '测试',
        distributionStatus: DistributionStatusEnum.APPLY,
        page: 1,
        pageSize: 10,
      };

      const queryBuilder = repository.createQueryBuilder();
      jest.spyOn(queryBuilder, 'getManyAndCount').mockResolvedValue([[], 0]);

      await service.getDistributionList(mockSearchParams);
      
      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('getDistributionDetail', () => {
    it('应该返回分销员详情', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDistribution);

      const result = await service.getDistributionDetail('1');
      
      expect(result).toEqual(mockDistribution);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleteFlag: false }
      });
    });

    it('分销员不存在时应该抛出异常', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getDistributionDetail('999')).rejects.toThrow('分销员不存在');
    });
  });

  describe('auditDistribution', () => {
    it('应该成功审核分销员', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDistribution);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockDistribution,
        distributionStatus: DistributionStatusEnum.PASS,
      });

      const result = await service.auditDistribution('1', DistributionStatusEnum.PASS, '审核通过');
      
      expect(result.distributionStatus).toBe(DistributionStatusEnum.PASS);
    });

    it('分销员不存在时应该抛出异常', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.auditDistribution('999', DistributionStatusEnum.PASS, '审核通过')
      ).rejects.toThrow('分销员不存在');
    });
  });
});