import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../common/store/entities/store.entity';
import { StoreLog } from '../../common/store/entities/store-log.entity';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './dto/store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreLog) private readonly storeLogRepository: Repository<StoreLog>,
  ) {}

  /**
   * 获取店铺详情
   */
  async getStoreDetail(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException('店铺不存在');
    }
    return store;
  }

  /**
   * 更新店铺信息
   */
  async updateStore(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.getStoreDetail(id);
    
    const updatedStore = await this.storeRepository.save({
      ...store,
      ...updateStoreDto,
      updateTime: new Date(),
    });

    // 记录店铺操作日志
    await this.storeLogRepository.save({
      storeId: id,
      actionType: 'UPDATE',
      actionContent: JSON.stringify(updateStoreDto),
      createTime: new Date(),
    });

    return updatedStore;
  }

  /**
   * 上传店铺营业执照
   */
  async uploadBusinessLicense(id: string, licenseUrl: string): Promise<Store> {
    const store = await this.getStoreDetail(id);
    
    store.businessLicense = licenseUrl;
    await this.storeRepository.save(store);

    // 记录店铺操作日志
    await this.storeLogRepository.save({
      storeId: id,
      actionType: 'UPLOAD_LICENSE',
      actionContent: `上传营业执照: ${licenseUrl}`,
      createTime: new Date(),
    });

    return store;
  }

  /**
   * 申请店铺审核
   */
  async applyAudit(id: string): Promise<Store> {
    const store = await this.getStoreDetail(id);
    
    store.storeStatus = 1; // 审核中
    await this.storeRepository.save(store);

    // 记录店铺操作日志
    await this.storeLogRepository.save({
      storeId: id,
      actionType: 'APPLY_AUDIT',
      actionContent: '申请店铺审核',
      createTime: new Date(),
    });

    return store;
  }
}
