import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatMaterial } from '../entities/wechat-material.entity';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { QueryMaterialDto } from '../dto/query-material.dto';

export enum MaterialType {
  IMAGE = 'image', // 图片
  VIDEO = 'video', // 视频
  VOICE = 'voice', // 语音
  ARTICLE = 'article', // 图文
}

export enum MaterialStatus {
  DRAFT = 0, // 草稿
  PUBLISHED = 1, // 已发布
  DELETED = 2, // 已删除
}

@Injectable()
export class WechatMaterialService {
  constructor(
    @InjectRepository(WechatMaterial)
    private readonly materialRepository: Repository<WechatMaterial>,
  ) {}

  // 获取素材列表
  async getMaterials(queryDto: QueryMaterialDto) {
    const { page = 1, pageSize = 10, title, materialType, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.materialRepository.createQueryBuilder('material');

    if (title) {
      queryBuilder.andWhere('material.title LIKE :title', { title: `%${title}%` });
    }

    if (materialType) {
      queryBuilder.andWhere('material.materialType = :materialType', { materialType });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('material.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('material.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  // 按类型获取素材
  async getMaterialsByType(materialType: MaterialType, queryDto: QueryMaterialDto) {
    const queryDtoWithType = { ...queryDto, materialType };
    return this.getMaterials(queryDtoWithType);
  }

  async getMaterialById(id: number) {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException(`素材不存在: ${id}`);
    }
    return material;
  }

  // 创建素材
  async createMaterial(createDto: CreateMaterialDto) {
    const material = this.materialRepository.create(createDto);
    return await this.materialRepository.save(material);
  }

  // 更新素材
  async updateMaterial(id: number, updateDto: UpdateMaterialDto) {
    const material = await this.getMaterialById(id);
    Object.assign(material, updateDto);
    return await this.materialRepository.save(material);
  }

  // 删除素材
  async deleteMaterial(id: number) {
    const material = await this.getMaterialById(id);
    material.status = MaterialStatus.DELETED;
    return await this.materialRepository.save(material);
  }

  // 永久删除素材
  async permanentDeleteMaterial(id: number) {
    const material = await this.getMaterialById(id);
    await this.materialRepository.remove(material);
    return { success: true, message: '素材永久删除成功' };
  }

  // 发布素材
  async publishMaterial(id: number) {
    const material = await this.getMaterialById(id);
    material.status = MaterialStatus.PUBLISHED;
    material.publishedAt = new Date();
    return await this.materialRepository.save(material);
  }

  // 取消发布素材
  async unpublishMaterial(id: number) {
    const material = await this.getMaterialById(id);
    material.status = MaterialStatus.DRAFT;
    return await this.materialRepository.save(material);
  }

  // 获取素材统计
  async getMaterialStats() {
    const stats = await this.materialRepository
      .createQueryBuilder('material')
      .select('material.materialType', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN material.status = 1 THEN 1 ELSE 0 END)', 'publishedCount')
      .where('material.status != :deleted', { deleted: MaterialStatus.DELETED })
      .groupBy('material.materialType')
      .getRawMany();

    return {
      total: await this.materialRepository.count({ where: { status: MaterialStatus.PUBLISHED } }),
      byType: stats,
    };
  }
}