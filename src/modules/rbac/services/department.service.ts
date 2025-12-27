import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentSearchDto } from '../dto/department-search.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(searchDto: DepartmentSearchDto): Promise<Department[]> {
    const {
      name,
      code,
      status,
      page = 1,
      limit = 10,
      sortBy = 'sortWeight',
      sortOrder = 'ASC',
    } = searchDto;

    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.parent', 'parent');

    if (name) {
      queryBuilder.andWhere('department.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('department.code LIKE :code', { code: `%${code}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('department.status = :status', { status });
    }

    return await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`department.${sortBy}`, sortOrder)
      .getMany();
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!department) {
      throw new NotFoundException(`部门 ID ${id} 不存在`);
    }
    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);
    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: number): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }

  async findByParentId(parentId: number): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { parent: { id: parentId } },
      relations: ['children'],
      order: { sortWeight: 'ASC' },
    });
  }

  async buildTree(): Promise<Department[]> {
    const departments = await this.departmentRepository.find({
      relations: ['parent', 'children'],
      order: { sortWeight: 'ASC' },
    });

    const rootDepartments = departments.filter(dept => !dept.parent);

    const buildSubTree = (parent: Department) => {
      parent.children = departments.filter(dept => dept.parent?.id === parent.id);
      parent.children.forEach(child => buildSubTree(child));
    };

    rootDepartments.forEach(root => buildSubTree(root));
    return rootDepartments;
  }

  async getDepartmentTree(): Promise<Department[]> {
    return this.buildTree();
  }

  async moveDepartment(departmentId: number, parentId: number): Promise<Department> {
    const department = await this.findOne(departmentId);
    department.parentId = parentId;
    return this.departmentRepository.save(department);
  }

  async getDepartmentUsers(departmentId: number): Promise<any[]> {
    // 这里需要根据实际情况实现，可能需要关联用户表
    return [];
  }
}
