import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distributor } from './entities/distributor.entity';
import { CommissionRecord } from './entities/commission-record.entity';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';

@Injectable()
export class DistributionService {
  constructor(
    @InjectRepository(Distributor) private distributorRepository: Repository<Distributor>,
    @InjectRepository(CommissionRecord)
    private commissionRecordRepository: Repository<CommissionRecord>,
  ) {}

  /**
   * 创建分销商
   */
  async createDistributor(createDistributorDto: CreateDistributorDto): Promise<Distributor> {
    const distributor = this.distributorRepository.create(createDistributorDto);
    return this.distributorRepository.save(distributor);
  }

  /**
   * 获取分销商列表
   */
  async getDistributors(
    page: number = 1,
    pageSize: number = 10,
    status?: number,
  ): Promise<{ items: Distributor[]; total: number }> {
    const query = this.distributorRepository.createQueryBuilder('distributor');

    if (status !== undefined) {
      query.where('distributor.status = :status', { status });
    }

    query.orderBy('distributor.createTime', 'DESC');
    const [items, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 根据ID获取分销商
   */
  async getDistributorById(id: string): Promise<Distributor> {
    const distributor = await this.distributorRepository.findOne({ where: { id } });
    if (!distributor) {
      throw new NotFoundException('分销商不存在');
    }
    return distributor;
  }

  /**
   * 根据用户ID获取分销商
   */
  async getDistributorByUserId(userId: string): Promise<Distributor> {
    const distributor = await this.distributorRepository.findOne({ where: { userId } });
    if (!distributor) {
      throw new NotFoundException('分销商不存在');
    }
    return distributor;
  }

  /**
   * 更新分销商
   */
  async updateDistributor(
    id: string,
    updateDistributorDto: UpdateDistributorDto,
  ): Promise<Distributor> {
    const distributor = await this.getDistributorById(id);
    Object.assign(distributor, updateDistributorDto);

    // 如果是审核操作，设置审核时间
    if (updateDistributorDto.status !== undefined) {
      distributor.auditTime = new Date();
    }

    return this.distributorRepository.save(distributor);
  }

  /**
   * 删除分销商
   */
  async deleteDistributor(id: string): Promise<void> {
    const result = await this.distributorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('分销商不存在');
    }
  }

  /**
   * 获取佣金记录列表
   */
  async getCommissionRecords(
    distributorId?: string,
    status?: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ items: CommissionRecord[]; total: number }> {
    const query = this.commissionRecordRepository.createQueryBuilder('record');

    if (distributorId) {
      query.where('record.distributorId = :distributorId', { distributorId });
    }

    if (status !== undefined) {
      query.andWhere('record.status = :status', { status });
    }

    query.orderBy('record.createTime', 'DESC');
    const [items, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 根据ID获取佣金记录
   */
  async getCommissionRecordById(id: string): Promise<CommissionRecord> {
    const record = await this.commissionRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('佣金记录不存在');
    }
    return record;
  }
}
