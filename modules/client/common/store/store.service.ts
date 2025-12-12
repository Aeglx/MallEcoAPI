import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store, StoreStatus, StoreType, StoreLevel } from './entities/store.entity';
import { StoreLog, StoreOperateType } from './entities/store-log.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    @InjectRepository(StoreLog) private storeLogRepository: Repository<StoreLog>,
    private productService: ProductService,
  ) {}

  /**
   * 创建店铺
   * @param createStoreDto 创建店铺DTO
   * @param operatorInfo 操作人信息
   * @returns 创建的店铺
   */
  async create(createStoreDto: CreateStoreDto, operatorInfo: { id: string; name: string }): Promise<Store> {
    // 检查店铺名称是否已存在
    const existingStore = await this.storeRepository.findOne({
      where: { storeName: createStoreDto.storeName },
    });
    if (existingStore) {
      throw new BadRequestException(`Store with name ${createStoreDto.storeName} already exists`);
    }

    // 创建店铺
    const store = this.storeRepository.create({
      ...createStoreDto,
      storeStatus: createStoreDto.storeStatus || StoreStatus.DRAFT,
      storeLevel: createStoreDto.storeLevel || StoreLevel.LEVEL_1,
      creditScore: createStoreDto.creditScore || 5.0,
    });

    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.CREATE,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: null,
      newStatus: savedStore.storeStatus,
      remark: '创建店铺',
    });

    return savedStore;
  }

  /**
   * 查询店铺列表
   * @returns 店铺列表
   */
  async findAll(): Promise<Store[]> {
    return await this.storeRepository.find({
      relations: ['storeLogs'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据ID查询店铺
   * @param id 店铺ID
   * @returns 店铺
   */
  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['storeLogs', 'products'],
    });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  /**
   * 根据名称查询店铺
   * @param storeName 店铺名称
   * @returns 店铺
   */
  async findByName(storeName: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { storeName },
      relations: ['storeLogs', 'products'],
    });
    if (!store) {
      throw new NotFoundException(`Store with name ${storeName} not found`);
    }
    return store;
  }

  /**
   * 更新店铺信息
   * @param id 店铺ID
   * @param updateStoreDto 更新店铺DTO
   * @param operatorInfo 操作人信息
   * @returns 更新后的店铺
   */
  async update(id: string, updateStoreDto: UpdateStoreDto, operatorInfo: { id: string; name: string }): Promise<Store> {
    const store = await this.findOne(id);

    // 检查店铺名称是否已存在（排除当前店铺）
    if (updateStoreDto.storeName && updateStoreDto.storeName !== store.storeName) {
      const existingStore = await this.storeRepository.findOne({
        where: { storeName: updateStoreDto.storeName },
      });
      if (existingStore) {
        throw new BadRequestException(`Store with name ${updateStoreDto.storeName} already exists`);
      }
    }

    const oldStatus = store.storeStatus;
    const oldName = store.storeName;

    // 更新店铺信息
    Object.assign(store, updateStoreDto);

    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    const logData = {
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.UPDATE_INFO,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: oldStatus,
      newStatus: savedStore.storeStatus,
      remark: '更新店铺信息',
    };

    if (oldName !== savedStore.storeName) {
      logData.remark = `更新店铺名称：${oldName} -> ${savedStore.storeName}`;
    } else if (oldStatus !== savedStore.storeStatus) {
      logData.operateType = StoreOperateType.UPDATE_STATUS;
      logData.remark = `更新店铺状态：${oldStatus} -> ${savedStore.storeStatus}`;
    }

    await this.createStoreLog(logData);

    return savedStore;
  }

  /**
   * 删除店铺
   * @param id 店铺ID
   * @returns 删除结果
   */
  async remove(id: string, operatorInfo: { id: string; name: string }): Promise<void> {
    const store = await this.findOne(id);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: store.id,
      storeName: store.storeName,
      operateType: StoreOperateType.OTHER,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: store.storeStatus,
      newStatus: null,
      remark: '删除店铺',
    });

    await this.storeRepository.remove(store);
  }

  /**
   * 提交店铺审核
   * @param id 店铺ID
   * @param operatorInfo 操作人信息
   * @returns 提交审核后的店铺
   */
  async submitAudit(id: string, operatorInfo: { id: string; name: string }): Promise<Store> {
    const store = await this.findOne(id);

    // 检查店铺状态是否可以提交审核
    if (store.storeStatus !== StoreStatus.DRAFT) {
      throw new BadRequestException('Only draft stores can be submitted for audit');
    }

    // 更新店铺状态为审核中
    store.storeStatus = StoreStatus.AUDITING;
    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.SUBMIT_AUDIT,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: StoreStatus.DRAFT,
      newStatus: savedStore.storeStatus,
      remark: '提交店铺审核',
    });

    return savedStore;
  }

  /**
   * 审核店铺通过
   * @param id 店铺ID
   * @param operatorInfo 操作人信息
   * @param remark 审核备注
   * @returns 审核通过后的店铺
   */
  async auditPass(id: string, operatorInfo: { id: string; name: string }, remark: string): Promise<Store> {
    const store = await this.findOne(id);

    // 检查店铺状态是否可以审核通过
    if (store.storeStatus !== StoreStatus.AUDITING) {
      throw new BadRequestException('Only auditing stores can be approved');
    }

    // 更新店铺状态为审核通过
    store.storeStatus = StoreStatus.AUDIT_PASSED;
    store.auditRemark = remark;
    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.AUDIT_PASS,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: StoreStatus.AUDITING,
      newStatus: savedStore.storeStatus,
      remark: `店铺审核通过：${remark}`,
    });

    return savedStore;
  }

  /**
   * 审核店铺失败
   * @param id 店铺ID
   * @param operatorInfo 操作人信息
   * @param remark 审核备注
   * @returns 审核失败后的店铺
   */
  async auditFail(id: string, operatorInfo: { id: string; name: string }, remark: string): Promise<Store> {
    const store = await this.findOne(id);

    // 检查店铺状态是否可以审核失败
    if (store.storeStatus !== StoreStatus.AUDITING) {
      throw new BadRequestException('Only auditing stores can be rejected');
    }

    // 更新店铺状态为审核失败
    store.storeStatus = StoreStatus.AUDIT_FAILED;
    store.auditRemark = remark;
    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.AUDIT_REJECT,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: StoreStatus.AUDITING,
      newStatus: savedStore.storeStatus,
      remark: `店铺审核失败：${remark}`,
    });

    return savedStore;
  }

  /**
   * 店铺开店
   * @param id 店铺ID
   * @param operatorInfo 操作人信息
   * @returns 开店后的店铺
   */
  async openStore(id: string, operatorInfo: { id: string; name: string }): Promise<Store> {
    const store = await this.findOne(id);

    // 检查店铺状态是否可以开店
    if (store.storeStatus !== StoreStatus.AUDIT_PASSED && store.storeStatus !== StoreStatus.OFF_SALE) {
      throw new BadRequestException('Only approved or closed stores can be opened');
    }

    // 更新店铺状态为营业中
    store.storeStatus = StoreStatus.ON_SALE;
    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.OPEN_STORE,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: store.storeStatus,
      newStatus: savedStore.storeStatus,
      remark: '店铺开店',
    });

    return savedStore;
  }

  /**
   * 店铺关店
   * @param id 店铺ID
   * @param operatorInfo 操作人信息
   * @returns 关店后的店铺
   */
  async closeStore(id: string, operatorInfo: { id: string; name: string }): Promise<Store> {
    const store = await this.findOne(id);

    // 检查店铺状态是否可以关店
    if (store.storeStatus !== StoreStatus.ON_SALE) {
      throw new BadRequestException('Only open stores can be closed');
    }

    // 更新店铺状态为已关店
    store.storeStatus = StoreStatus.OFF_SALE;
    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.CLOSE_STORE,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: store.storeStatus,
      newStatus: savedStore.storeStatus,
      remark: '店铺关店',
    });

    return savedStore;
  }

  /**
   * 冻结店铺
   * @param id 店铺ID
   * @param operatorInfo 操作人信息
   * @param remark 冻结原因
   * @returns 冻结后的店铺
   */
  async freezeStore(id: string, operatorInfo: { id: string; name: string }, remark: string): Promise<Store> {
    const store = await this.findOne(id);

    // 检查店铺状态是否可以冻结
    if (store.storeStatus !== StoreStatus.ON_SALE) {
      throw new BadRequestException('Only open stores can be frozen');
    }

    // 更新店铺状态为已冻结
    store.storeStatus = StoreStatus.FROZEN;
    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.FREEZE_STORE,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: store.storeStatus,
      newStatus: savedStore.storeStatus,
      remark: `冻结店铺：${remark}`,
    });

    return savedStore;
  }

  /**
   * 解冻店铺
   * @param id 店铺ID
   * @param operatorInfo 操作人信息
   * @param remark 解冻原因
   * @returns 解冻后的店铺
   */
  async unfreezeStore(id: string, operatorInfo: { id: string; name: string }, remark: string): Promise<Store> {
    const store = await this.findOne(id);

    // 检查店铺状态是否可以解冻
    if (store.storeStatus !== StoreStatus.FROZEN) {
      throw new BadRequestException('Only frozen stores can be unfrozen');
    }

    // 更新店铺状态为营业中
    store.storeStatus = StoreStatus.ON_SALE;
    const savedStore = await this.storeRepository.save(store);

    // 创建店铺日志
    await this.createStoreLog({
      storeId: savedStore.id,
      storeName: savedStore.storeName,
      operateType: StoreOperateType.UNFREEZE_STORE,
      operateId: operatorInfo.id,
      operateName: operatorInfo.name,
      oldStatus: store.storeStatus,
      newStatus: savedStore.storeStatus,
      remark: `解冻店铺：${remark}`,
    });

    return savedStore;
  }

  /**
   * 更新店铺商品数量
   * @param storeId 店铺ID
   * @returns 更新后的店铺
   */
  async updateProductCount(storeId: string): Promise<Store> {
    const store = await this.findOne(storeId);

    // 查询店铺商品数量
    const productCount = await this.productService.countByStoreId(storeId);
    store.productCount = productCount;

    return await this.storeRepository.save(store);
  }

  /**
   * 创建店铺日志
   * @param logData 日志数据
   * @returns 创建的店铺日志
   */
  private async createStoreLog(logData: {
    storeId: string;
    storeName: string;
    operateType: StoreOperateType;
    operateId: string;
    operateName: string;
    oldStatus: StoreStatus | null;
    newStatus: StoreStatus | null;
    remark: string;
  }): Promise<StoreLog> {
    const log = this.storeLogRepository.create({
      ...logData,
      operateTime: new Date(),
    });

    return await this.storeLogRepository.save(log);
  }

  /**
   * 根据状态查询店铺
   * @param storeStatus 店铺状态
   * @returns 店铺列表
   */
  async findByStatus(storeStatus: StoreStatus): Promise<Store[]> {
    return await this.storeRepository.find({
      where: { storeStatus },
      relations: ['storeLogs'],
    });
  }

  /**
   * 根据类型查询店铺
   * @param storeType 店铺类型
   * @returns 店铺列表
   */
  async findByType(storeType: StoreType): Promise<Store[]> {
    return await this.storeRepository.find({
      where: { storeType },
      relations: ['storeLogs'],
    });
  }
}
