import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, Like } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentQueryDto } from '../dto/department-query.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: TreeRepository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto, currentUser?: string): Promise<Department> {
    // 检查部门名称是否存在
    const existingDepartment = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name }
    });
    
    if (existingDepartment) {
      throw new ConflictException('部门名称已存在');
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      createBy: currentUser,
      updateBy: currentUser,
    });

    // 如果有父级部门，设置父级
    if (createDepartmentDto.parentId) {
      const parent = await this.departmentRepository.findOne({
        where: { id: createDepartmentDto.parentId }
      });
      
      if (!parent) {
        throw new NotFoundException('父级部门不存在');
      }
      
      department.parent = parent;
    }

    return await this.departmentRepository.save(department);
  }

  async findAll(queryDto: DepartmentQueryDto): Promise<[Department[], number]> {
    const { page = 1, limit = 10, name, status } = queryDto;
    
    const where: any = {};
    
    if (name) {
      where.name = Like(`%${name}%`);
    }
    
    if (status !== undefined) {
      where.status = status;
    }

    return await this.departmentRepository.findAndCount({
      where,
      relations: ['users'],
      skip: (page - 1) * limit,
      take: limit,
      order: { sort: 'ASC', createTime: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'users']
    });
    
    if (!department) {
      throw new NotFoundException('部门不存在');
    }
    
    return department;
  }

  async findTree(): Promise<Department[]> {
    return await this.departmentRepository.findTrees();
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto, currentUser?: string): Promise<Department> {
    const department = await this.findOne(id);
    
    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name }
      });
      
      if (existingDepartment) {
        throw new ConflictException('部门名称已存在');
      }
    }

    // 如果更新父级部门
    if (updateDepartmentDto.parentId && updateDepartmentDto.parentId !== department.parentId) {
      const parent = await this.departmentRepository.findOne({
        where: { id: updateDepartmentDto.parentId }
      });
      
      if (!parent) {
        throw new NotFoundException('父级部门不存在');
      }
      
      department.parent = parent;
    }

    Object.assign(department, {
      ...updateDepartmentDto,
      updateBy: currentUser,
      updateTime: new Date()
    });

    return await this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);
    
    // 检查是否有子部门
    const children = await this.departmentRepository.find({
      where: { parentId: id }
    });
    
    if (children.length > 0) {
      throw new ConflictException('该部门下还有子部门，不能删除');
    }
    
    // 检查是否有用户关联此部门
    if (department.users && department.users.length > 0) {
      throw new ConflictException('该部门下还有用户，不能删除');
    }
    
    await this.departmentRepository.softDelete(id);
  }

  async updateStatus(id: string, status: number, currentUser?: string): Promise<void> {
    const department = await this.findOne(id);
    
    await this.departmentRepository.update(id, {
      status,
      updateBy: currentUser,
      updateTime: new Date()
    });
  }

  async getDepartmentUsers(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['users', 'users.role']
    });
    
    if (!department) {
      throw new NotFoundException('部门不存在');
    }
    
    return department;
  }

  async getDepartmentTreeWithUsers(): Promise<Department[]> {
    const departments = await this.departmentRepository.findTrees({
      relations: ['users']
    });
    
    return departments;
  }

  async getDepartmentStatistics(): Promise<any> {
    const total = await this.departmentRepository.count();
    const active = await this.departmentRepository.count({ where: { status: 1 } });
    
    // 统计每个部门的用户数量
    const departments = await this.departmentRepository
      .createQueryBuilder('department')
      .leftJoin('department.users', 'user')
      .select(['department.id', 'department.name', 'COUNT(user.id) as userCount'])
      .groupBy('department.id')
      .getRawMany();
    
    return {
      total,
      active,
      departments,
      activeRate: total > 0 ? (active / total) * 100 : 0
    };
  }

  async getDepartmentHierarchy(id: string): Promise<Department[]> {
    const department = await this.findOne(id);
    
    // 获取所有祖先部门
    const ancestors = await this.departmentRepository.findAncestors(department);
    
    // 获取所有后代部门
    const descendants = await this.departmentRepository.findDescendants(department);
    
    return [...ancestors, ...descendants];
  }
}