import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatMaterialImage } from '../entities/wechat-material-image.entity';
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
    @InjectRepository(WechatMaterialImage)
    private readonly materialRepository: Repository<WechatMaterialImage>,
  ) {}

  // 获取素材列表
  async getMaterials(queryDto: QueryMaterialDto) {
    const { page = 1, pageSize = 10, title, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.materialRepository.createQueryBuilder('material');

    if (title) {
      queryBuilder.andWhere('material.name LIKE :name', { name: `%${title}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('material.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('material.createTime', 'DESC')
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
    // 由于我们目前只支持图片类型，这里只返回图片素材
    if (materialType !== MaterialType.IMAGE) {
      return {
        list: [],
        total: 0,
        page: queryDto.page || 1,
        pageSize: queryDto.pageSize || 10,
      };
    }
    return this.getMaterials(queryDto);
  }

  async getMaterialById(id: string) {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException(`素材不存在: ${id}`);
    }
    return material;
  }

  // 创建素材
  async createMaterial(createDto: CreateMaterialDto) {
    const material = this.materialRepository.create({
      mediaId: `media_${Date.now()}`,
      name: createDto.title,
      url: createDto.url,
      size: createDto.size || 0,
      description: createDto.description,
      status: createDto.status === MaterialStatus.PUBLISHED ? 1 : 0,
    });
    return await this.materialRepository.save(material);
  }

  // 更新素材
  async updateMaterial(id: string, updateDto: UpdateMaterialDto) {
    const material = await this.getMaterialById(id);
    Object.assign(material, updateDto);
    return await this.materialRepository.save(material);
  }

  // 删除素材
  async deleteMaterial(id: string) {
    const material = await this.getMaterialById(id);
    material.status = MaterialStatus.DELETED;
    return await this.materialRepository.save(material);
  }

  // 永久删除素材
  async permanentDeleteMaterial(id: string) {
    const material = await this.getMaterialById(id);
    await this.materialRepository.remove(material);
    return { success: true, message: '素材永久删除成功' };
  }

  // 发布素材
  async publishMaterial(id: string) {
    const material = await this.getMaterialById(id);
    material.status = 1;
    return await this.materialRepository.save(material);
  }

  // 取消发布素材
  async unpublishMaterial(id: string) {
    const material = await this.getMaterialById(id);
    material.status = MaterialStatus.DRAFT;
    return await this.materialRepository.save(material);
  }

  // 获取素材统计
  async getMaterialStats() {
    const total = await this.materialRepository.count({ where: { status: 1 } });

    return {
      total,
      byType: [{ type: MaterialType.IMAGE, count: total, publishedCount: total }],
    };
  }
}
