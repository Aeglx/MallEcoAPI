import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatMenu } from '../entities/wechat-menu.entity';
import { WechatMenuKeyword } from '../entities/wechat-menu-keyword.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { CreateMenuKeywordDto } from '../dto/create-menu-keyword.dto';
import { UpdateMenuKeywordDto } from '../dto/update-menu-keyword.dto';
import { QueryMenuDto } from '../dto/query-menu.dto';
import { QueryMenuKeywordDto } from '../dto/query-menu-keyword.dto';

export enum MenuType {
  CLICK = 'click', // 点击事件
  VIEW = 'view', // 跳转URL
  MINIPROGRAM = 'miniprogram', // 小程序
  MEDIA_ID = 'media_id', // 素材ID
  VIEW_LIMITED = 'view_limited', // 图文消息
}

export enum MenuStatus {
  DRAFT = 0, // 草稿
  PUBLISHED = 1, // 已发布
  DISABLED = 2, // 已禁用
}

@Injectable()
export class WechatMenuService {
  constructor(
    @InjectRepository(WechatMenu)
    private readonly menuRepository: Repository<WechatMenu>,
    @InjectRepository(WechatMenuKeyword)
    private readonly menuKeywordRepository: Repository<WechatMenuKeyword>,
  ) {}

  // 菜单管理
  async getMenus(queryDto: QueryMenuDto) {
    const { page = 1, pageSize = 10, name, menuType, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.menuRepository.createQueryBuilder('menu');

    if (name) {
      queryBuilder.andWhere('menu.name LIKE :name', { name: `%${name}%` });
    }

    if (menuType) {
      queryBuilder.andWhere('menu.type = :type', { type: menuType });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('menu.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('menu.sortOrder', 'ASC')
      .addOrderBy('menu.createTime', 'DESC')
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

  async getMenuById(id: string) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`菜单不存在: ${id}`);
    }
    return menu;
  }

  async createMenu(createDto: CreateMenuDto) {
    const menu = this.menuRepository.create(createDto);
    return await this.menuRepository.save(menu);
  }

  async updateMenu(id: string, updateDto: UpdateMenuDto) {
    const menu = await this.getMenuById(id);
    Object.assign(menu, updateDto);
    return await this.menuRepository.save(menu);
  }

  async deleteMenu(id: string) {
    const menu = await this.getMenuById(id);
    await this.menuRepository.remove(menu);
    return { success: true, message: '菜单删除成功' };
  }

  // 获取菜单配置树
  async getMenuTree() {
    const menus = await this.menuRepository.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC' },
    });

    // 构建树形结构
    const rootMenus = menus.filter(menu => !menu.parentId);
    const tree = rootMenus.map(root => this.buildMenuTree(root, menus));

    return tree;
  }

  private buildMenuTree(menu: WechatMenu, allMenus: WechatMenu[]) {
    const children = allMenus.filter(m => m.parentId === menu.id);
    return {
      ...menu,
      children: children.map(child => this.buildMenuTree(child, allMenus)),
    };
  }

  // 发布菜单
  async publishMenu(id: string) {
    const menu = await this.getMenuById(id);
    menu.status = 1;
    return await this.menuRepository.save(menu);
  }

  // 取消发布菜单
  async unpublishMenu(id: string) {
    const menu = await this.getMenuById(id);
    menu.status = MenuStatus.DRAFT;
    return await this.menuRepository.save(menu);
  }

  // 菜单关键词管理
  async getMenuKeywords(queryDto: QueryMenuKeywordDto) {
    const { page = 1, pageSize = 10, keyword, menuId, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.menuKeywordRepository
      .createQueryBuilder('keyword')
      .leftJoinAndSelect('keyword.menu', 'menu');

    if (keyword) {
      queryBuilder.andWhere('keyword.keyword LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (menuId) {
      queryBuilder.andWhere('keyword.menuId = :menuId', { menuId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('keyword.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('keyword.createTime', 'DESC')
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

  async getMenuKeywordById(id: string) {
    const keyword = await this.menuKeywordRepository.findOne({ 
      where: { id },
      relations: ['menu'] 
    });
    if (!keyword) {
      throw new NotFoundException(`菜单关键词不存在: ${id}`);
    }
    return keyword;
  }

  async createMenuKeyword(createDto: CreateMenuKeywordDto) {
    const keyword = this.menuKeywordRepository.create(createDto);
    return await this.menuKeywordRepository.save(keyword);
  }

  async updateMenuKeyword(id: string, updateDto: UpdateMenuKeywordDto) {
    const keyword = await this.getMenuKeywordById(id);
    Object.assign(keyword, updateDto);
    return await this.menuKeywordRepository.save(keyword);
  }

  async deleteMenuKeyword(id: string) {
    const keyword = await this.getMenuKeywordById(id);
    await this.menuKeywordRepository.remove(keyword);
    return { success: true, message: '菜单关键词删除成功' };
  }

  // 同步菜单到微信
  async syncMenuToWechat() {
    const menuTree = await this.getMenuTree();
    
    // 这里应该调用微信API同步菜单
    // 暂时返回模拟数据
    return {
      success: true,
      message: '菜单同步成功',
      data: menuTree,
    };
  }
}