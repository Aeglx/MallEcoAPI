import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MallFile } from '../entities/file.entity';
import { FileDirectory as MallFileDirectory } from '../entities/file-directory.entity';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(MallFile) private readonly fileRepository: Repository<MallFile>,
    @InjectRepository(MallFileDirectory)
    private readonly directoryRepository: Repository<MallFileDirectory>,
  ) {}

  async uploadFile(file: any, dto: Partial<CreateFileDto>): Promise<MallFile> {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const fileUrl = `/${uploadPath}/${fileName}`;

    const newFile = this.fileRepository.create({
      fileName: file.originalname,
      fileUrl,
      filePath,
      fileSize: file.size,
      fileType: file.mimetype,
      fileExt: fileExt.substring(1),
      storageType: 'local',
      ...dto,
    });

    return await this.fileRepository.save(newFile);
  }

  async getFileById(id: string): Promise<MallFile> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }
    return file;
  }

  async getFileList(query: any): Promise<{ files: MallFile[]; total: number }> {
    const { page = 1, limit = 10, directoryId, fileName, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.fileRepository.createQueryBuilder('file');

    if (directoryId) {
      queryBuilder.andWhere('file.directoryId = :directoryId', { directoryId });
    }

    if (fileName) {
      queryBuilder.andWhere('file.fileName LIKE :fileName', { fileName: `%${fileName}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('file.status = :status', { status });
    }

    queryBuilder.orderBy('file.createTime', 'DESC');

    const [files, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return { files, total };
  }

  async updateFile(id: string, dto: UpdateFileDto): Promise<MallFile> {
    const file = await this.getFileById(id);
    Object.assign(file, dto);
    return await this.fileRepository.save(file);
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.getFileById(id);

    if (file.storageType === 'local' && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await this.fileRepository.remove(file);
  }

  async createDirectory(name: string, parentId?: string): Promise<MallFileDirectory> {
    let path = `/${name}`;
    let level = 1;

    if (parentId) {
      const parentDir = await this.directoryRepository.findOne({ where: { id: parentId } });
      if (!parentDir) {
        throw new NotFoundException('父目录不存在');
      }
      path = `${parentDir.path}${name}/`;
      level = parentDir.level + 1;
    }

    const newDir = this.directoryRepository.create({
      name,
      parentId,
      path,
      level,
      status: 1,
    });

    return await this.directoryRepository.save(newDir);
  }

  async getDirectoryList(parentId?: string): Promise<MallFileDirectory[]> {
    const query = this.directoryRepository
      .createQueryBuilder('directory')
      .where('directory.status = 1');

    if (parentId) {
      query.andWhere('directory.parentId = :parentId', { parentId });
    } else {
      query.andWhere('directory.parentId IS NULL');
    }

    return await query.orderBy('directory.createTime', 'ASC').getMany();
  }
}
