import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SpecialPage } from '../entities/special-page.entity';
import { SpecialPageSection } from '../entities/special-page-section.entity';
import { CreateSpecialPageDto } from '../dto/create-special-page.dto';
import { UpdateSpecialPageDto } from '../dto/update-special-page.dto';
import { CreateSpecialPageSectionDto } from '../dto/create-special-page-section.dto';
import { UpdateSpecialPageSectionDto } from '../dto/update-special-page-section.dto';
import { PaginationDto } from '../../dto/pagination.dto';

@Injectable()
export class SpecialPageService {
  constructor(
    @InjectRepository(SpecialPage)
    private readonly specialPageRepository: Repository<SpecialPage>,
    @InjectRepository(SpecialPageSection)
    private readonly sectionRepository: Repository<SpecialPageSection>,
  ) {}

  async create(createSpecialPageDto: CreateSpecialPageDto): Promise<SpecialPage> {
    const specialPage = this.specialPageRepository.create(createSpecialPageDto);
    return await this.specialPageRepository.save(specialPage);
  }

  async findAll(paginationDto: PaginationDto, filters?: any): Promise<[SpecialPage[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.specialPageRepository.createQueryBuilder('specialPage')
      .leftJoinAndSelect('specialPage.sections', 'sections')
      .where('specialPage.status = :status', { status: 'published' });

    if (filters?.keyword) {
      queryBuilder.andWhere('specialPage.title LIKE :keyword', {
        keyword: `%${filters.keyword}%`,
      });
    }

    if (filters?.templateType) {
      queryBuilder.andWhere('specialPage.templateType = :templateType', {
        templateType: filters.templateType,
      });
    }

    if (filters?.isTop !== undefined) {
      queryBuilder.andWhere('specialPage.isTop = :isTop', { isTop: filters.isTop });
    }

    queryBuilder.orderBy('specialPage.isTop', 'DESC')
      .addOrderBy('specialPage.publishedAt', 'DESC')
      .addOrderBy('specialPage.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  async findOne(id: number): Promise<SpecialPage> {
    const specialPage = await this.specialPageRepository.findOne({
      where: { id },
      relations: ['sections'],
    });

    if (!specialPage) {
      throw new NotFoundException(`专题页面 #${id} 不存在`);
    }

    return specialPage;
  }

  async update(id: number, updateSpecialPageDto: UpdateSpecialPageDto): Promise<SpecialPage> {
    const specialPage = await this.findOne(id);
    
    if (updateSpecialPageDto.status === 'published' && !specialPage.publishedAt) {
      updateSpecialPageDto.publishedAt = new Date();
    }

    Object.assign(specialPage, updateSpecialPageDto);
    return await this.specialPageRepository.save(specialPage);
  }

  async remove(id: number): Promise<void> {
    const specialPage = await this.findOne(id);
    
    // 删除关联的区�?
    await this.sectionRepository.delete({ specialPageId: id });
    
    await this.specialPageRepository.remove(specialPage);
  }

  async publish(id: number): Promise<SpecialPage> {
    const specialPage = await this.findOne(id);
    specialPage.status = 'published';
    specialPage.publishedAt = new Date();
    return await this.specialPageRepository.save(specialPage);
  }

  async unpublish(id: number): Promise<SpecialPage> {
    const specialPage = await this.findOne(id);
    specialPage.status = 'draft';
    return await this.specialPageRepository.save(specialPage);
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.specialPageRepository.increment({ id }, 'viewCount', 1);
  }

  async addSection(specialPageId: number, createSectionDto: CreateSpecialPageSectionDto): Promise<SpecialPageSection> {
    const specialPage = await this.findOne(specialPageId);
    
    const section = this.sectionRepository.create({
      ...createSectionDto,
      specialPageId,
    });

    return await this.sectionRepository.save(section);
  }

  async updateSection(sectionId: number, updateSectionDto: UpdateSpecialPageSectionDto): Promise<SpecialPageSection> {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException(`区块 #${sectionId} 不存在`);
    }

    Object.assign(section, updateSectionDto);
    return await this.sectionRepository.save(section);
  }

  async removeSection(sectionId: number): Promise<void> {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException(`区块 #${sectionId} 不存在`);
    }

    await this.sectionRepository.remove(section);
  }

  async updateSectionsOrder(sections: { id: number; sortOrder: number }[]): Promise<void> {
    const updatePromises = sections.map(section => 
      this.sectionRepository.update(section.id, { sortOrder: section.sortOrder })
    );
    
    await Promise.all(updatePromises);
  }

  async getTopSpecialPages(limit: number = 5): Promise<SpecialPage[]> {
    return await this.specialPageRepository.find({
      where: { isTop: true, status: 'published' },
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  async getRecommendSpecialPages(limit: number = 10): Promise<SpecialPage[]> {
    return await this.specialPageRepository.find({
      where: { isRecommend: true, status: 'published' },
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  async getSpecialPageStatistics(): Promise<any> {
    const total = await this.specialPageRepository.count();
    const published = await this.specialPageRepository.count({ where: { status: 'published' } });
    const draft = await this.specialPageRepository.count({ where: { status: 'draft' } });
    const archived = await this.specialPageRepository.count({ where: { status: 'archived' } });

    const totalViews = await this.specialPageRepository.createQueryBuilder('specialPage')
      .select('SUM(specialPage.viewCount)', 'totalViews')
      .getRawOne();

    return {
      total,
      published,
      draft,
      archived,
      totalViews: parseInt(totalViews.totalViews) || 0,
    };
  }
}
