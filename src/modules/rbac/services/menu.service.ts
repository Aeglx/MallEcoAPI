import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MenuSearchDto } from '../dto/menu-search.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  async findAll(searchDto: MenuSearchDto): Promise<Menu[]> {
    const { name, path, type, visible, page = 1, limit = 10, sortBy = 'sort', sortOrder = 'ASC' } = searchDto;
    
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.parent', 'parent');

    if (name) {
      queryBuilder.andWhere('menu.name LIKE :name', { name: `%${name}%` });
    }

    if (path) {
      queryBuilder.andWhere('menu.path LIKE :path', { path: `%${path}%` });
    }

    if (type) {
      queryBuilder.andWhere('menu.type = :type', { type });
    }

    if (visible !== undefined) {
      queryBuilder.andWhere('menu.visible = :visible', { visible });
    }

    return await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`menu.${sortBy}`, sortOrder)
      .getMany();
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!menu) {
      throw new NotFoundException(`菜单 ID ${id} 不存在`);
    }
    return menu;
  }

  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
  }

  async findByParentId(parentId: number): Promise<Menu[]> {
    return this.menuRepository.find({
      where: { parent: { id: parentId } },
      relations: ['children'],
      order: { sort: 'ASC' },
    });
  }

  async buildTree(): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
      relations: ['parent', 'children'],
      order: { sort: 'ASC' },
    });

    const rootMenus = menus.filter(menu => !menu.parent);
    
    const buildSubTree = (parent: Menu) => {
      parent.children = menus.filter(menu => menu.parent?.id === parent.id);
      parent.children.forEach(child => buildSubTree(child));
    };

    rootMenus.forEach(root => buildSubTree(root));
    return rootMenus;
  }
}