import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SystemVersion } from '../entities/system-version.entity';
import { CreateSystemVersionDto } from '../dto/create-system-version.dto';
import { UpdateSystemVersionDto } from '../dto/update-system-version.dto';
import { SystemVersionSearchDto } from '../dto/system-version-search.dto';

@Injectable()
export class SystemVersionService {
  constructor(
    @InjectRepository(SystemVersion)
    private readonly versionRepository: Repository<SystemVersion>,
  ) {}

  async create(createVersionDto: CreateSystemVersionDto): Promise<SystemVersion> {
    // 检查版本号是否已存在
    const existingVersion = await this.versionRepository.findOne({
      where: { version: createVersionDto.version },
    });

    if (existingVersion) {
      throw new ConflictException(`版本 ${createVersionDto.version} 已存在`);
    }

    // 如果设置为当前版本，将其他版本的isCurrent设为false
    if (createVersionDto.isCurrent) {
      await this.versionRepository.update({ isCurrent: true }, { isCurrent: false });
    }

    const version = this.versionRepository.create(createVersionDto);
    return await this.versionRepository.save(version);
  }

  async findAll(searchDto: SystemVersionSearchDto) {
    const {
      version,
      type,
      status,
      isLts,
      isCurrent,
      isDeprecated,
      releaseDateStart,
      releaseDateEnd,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    const where: any = {};

    if (version) {
      where.version = Like(`%${version}%`);
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (typeof isLts === 'boolean') {
      where.isLts = isLts;
    }

    if (typeof isCurrent === 'boolean') {
      where.isCurrent = isCurrent;
    }

    if (typeof isDeprecated === 'boolean') {
      where.isDeprecated = isDeprecated;
    }

    if (releaseDateStart && releaseDateEnd) {
      where.releaseDate = Between(new Date(releaseDateStart), new Date(releaseDateEnd));
    } else if (releaseDateStart) {
      where.releaseDate = MoreThanOrEqual(new Date(releaseDateStart));
    } else if (releaseDateEnd) {
      where.releaseDate = LessThanOrEqual(new Date(releaseDateEnd));
    }

    const [items, total] = await this.versionRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<SystemVersion> {
    const version = await this.versionRepository.findOne({ where: { id } });
    if (!version) {
      throw new NotFoundException(`版本ID ${id} 不存在`);
    }
    return version;
  }

  async findByVersion(version: string): Promise<SystemVersion> {
    const versionEntity = await this.versionRepository.findOne({
      where: { version },
    });
    if (!versionEntity) {
      throw new NotFoundException(`版本 ${version} 不存在`);
    }
    return versionEntity;
  }

  async getCurrentVersion(): Promise<SystemVersion> {
    const version = await this.versionRepository.findOne({
      where: { isCurrent: true },
    });
    if (!version) {
      throw new NotFoundException('当前没有设置活跃版本');
    }
    return version;
  }

  async update(id: number, updateVersionDto: UpdateSystemVersionDto): Promise<SystemVersion> {
    const version = await this.findOne(id);

    // 如果更新版本号，检查是否重复
    if (updateVersionDto.version && updateVersionDto.version !== version.version) {
      const existingVersion = await this.versionRepository.findOne({
        where: { version: updateVersionDto.version },
      });
      if (existingVersion) {
        throw new ConflictException(`版本 ${updateVersionDto.version} 已存在`);
      }
    }

    // 如果设置为当前版本，将其他版本的isCurrent设为false
    if (updateVersionDto.isCurrent) {
      await this.versionRepository.update({ isCurrent: true }, { isCurrent: false });
    }

    Object.assign(version, updateVersionDto);
    return await this.versionRepository.save(version);
  }

  async remove(id: number): Promise<void> {
    const version = await this.findOne(id);

    // 不能删除当前版本
    if (version.isCurrent) {
      throw new ConflictException('不能删除当前活跃版本');
    }

    await this.versionRepository.remove(version);
  }

  async setCurrentVersion(id: number): Promise<SystemVersion> {
    const version = await this.findOne(id);

    // 将所有版本的isCurrent设为false
    await this.versionRepository.update({ isCurrent: true }, { isCurrent: false });

    // 设置当前版本
    version.isCurrent = true;
    version.isDeprecated = false;
    return await this.versionRepository.save(version);
  }

  async deprecateVersion(id: number): Promise<SystemVersion> {
    const version = await this.findOne(id);

    // 不能废弃当前版本
    if (version.isCurrent) {
      throw new ConflictException('不能废弃当前活跃版本');
    }

    version.isDeprecated = true;
    version.endDate = new Date();
    return await this.versionRepository.save(version);
  }

  async incrementDownloadCount(id: number): Promise<SystemVersion> {
    const version = await this.findOne(id);
    version.downloadCount += 1;
    return await this.versionRepository.save(version);
  }

  async getVersionHistory(): Promise<SystemVersion[]> {
    return await this.versionRepository.find({
      order: { releaseDate: 'DESC' },
      select: [
        'id',
        'version',
        'type',
        'description',
        'releaseDate',
        'isLts',
        'isCurrent',
        'isDeprecated',
      ],
    });
  }

  async getLTSVersions(): Promise<SystemVersion[]> {
    return await this.versionRepository.find({
      where: { isLts: true, isDeprecated: false },
      order: { releaseDate: 'DESC' },
    });
  }

  async compareVersions(version1: string, version2: string): Promise<any> {
    const v1 = await this.findByVersion(version1);
    const v2 = await this.findByVersion(version2);

    return {
      version1: {
        version: v1.version,
        type: v1.type,
        features: v1.features,
        fixes: v1.fixes,
        improvements: v1.improvements,
        releaseDate: v1.releaseDate,
      },
      version2: {
        version: v2.version,
        type: v2.type,
        features: v2.features,
        fixes: v2.fixes,
        improvements: v2.improvements,
        releaseDate: v2.releaseDate,
      },
      differences: {
        features: this.compareArrays(v1.features, v2.features),
        fixes: this.compareArrays(v1.fixes, v2.fixes),
        improvements: this.compareArrays(v1.improvements, v2.improvements),
      },
    };
  }

  private compareArrays(arr1: any[], arr2: any[]) {
    const set1 = new Set(arr1.map(item => JSON.stringify(item)));
    const set2 = new Set(arr2.map(item => JSON.stringify(item)));

    return {
      added: arr2.filter(item => !set1.has(JSON.stringify(item))),
      removed: arr1.filter(item => !set2.has(JSON.stringify(item))),
      unchanged: arr1.filter(item => set2.has(JSON.stringify(item))),
    };
  }
}
