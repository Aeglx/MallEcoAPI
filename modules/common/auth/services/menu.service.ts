import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, Like, In } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { Permission } from '../entities/permission.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: TreeRepository<Menu>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async getMenus(type?: string, appType?: number) {
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (appType !== undefined) {
      where.appType = appType;
    }

    const menus = await this.menuRepository.find({
      where,
      order: { sortOrder: 'ASC', createTime: 'DESC' }
    });

    return {
      items: menus.map(menu => ({
        id: menu.id,
        title: menu.title,
        name: menu.name,
        path: menu.path,
        level: menu.level,
        frontRoute: menu.frontRoute,
        parentId: menu.parentId,
        sortOrder: menu.sortOrder,
        permission: menu.permission,
        icon: menu.icon,
        description: menu.description,
        type: menu.type,
        appType: menu.appType,
        status: menu.status,
        hidden: menu.hidden,
        redirect: menu.redirect,
        createTime: menu.createTime
      }))
    };
  }

  async getMenuTree(appType?: number) {
    let menus: Menu[];
    
    if (appType !== undefined) {
      // 按终端类型过滤
      menus = await this.menuRepository.find({
        where: { appType },
        order: { sortOrder: 'ASC' }
      });
      
      // 手动构建树形结构
      const tree = this.buildTreeFromList(menus);
      return {
        tree: tree.map(menu => this.buildMenuTreeItem(menu))
      };
    } else {
      // 获取所有菜单树
      menus = await this.menuRepository.findTrees();
      return {
        tree: menus.map(menu => this.buildMenuTreeItem(menu))
      };
    }
  }

  private buildTreeFromList(menus: Menu[]): Menu[] {
    const menuMap = new Map<string, Menu>();
    const rootMenus: Menu[] = [];

    // 创建菜单映射
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 构建树形结构
    menus.forEach(menu => {
      const menuItem = menuMap.get(menu.id);
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuItem);
          // 按sortOrder排序
          parent.children.sort((a: Menu, b: Menu) => a.sortOrder - b.sortOrder);
        }
      } else {
        rootMenus.push(menuItem);
      }
    });

    // 按sortOrder排序根菜单
    rootMenus.sort((a: Menu, b: Menu) => a.sortOrder - b.sortOrder);
    
    return rootMenus;
  }

  private buildMenuTreeItem(menu: Menu): any {
    return {
      id: menu.id,
      title: menu.title,
      name: menu.name,
      path: menu.path,
      level: menu.level,
      frontRoute: menu.frontRoute,
      icon: menu.icon,
      sortOrder: menu.sortOrder,
      type: menu.type,
      appType: menu.appType,
      status: menu.status,
      permission: menu.permission,
      hidden: menu.hidden,
      redirect: menu.redirect,
      children: menu.children ? menu.children.map(child => this.buildMenuTreeItem(child)) : []
    };
  }

  async getMenu(id: string) {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });
    
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    return {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      component: menu.component,
      parentId: menu.parentId,
      sort: menu.sort,
      type: menu.type,
      status: menu.status,
      permissionCode: menu.permissionCode,
      parent: menu.parent ? {
        id: menu.parent.id,
        name: menu.parent.name
      } : null,
      children: menu.children ? menu.children.map(child => ({
        id: child.id,
        name: child.name,
        path: child.path
      })) : [],
      createTime: menu.createTime
    };
  }

  async createMenu(createMenuDto: CreateMenuDto) {
    // 检查菜单标题是否存在
    const existingMenu = await this.menuRepository.findOne({
      where: { title: createMenuDto.title }
    });
    
    if (existingMenu) {
      throw new ConflictException('菜单标题已存在');
    }

    const menu = this.menuRepository.create(createMenuDto);

    // 如果有父级菜单，设置父级
    if (createMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: createMenuDto.parentId }
      });
      
      if (!parent) {
        throw new NotFoundException('父级菜单不存在');
      }
      
      menu.parent = parent;
    }

    await this.menuRepository.save(menu);

    return {
      message: '菜单创建成功',
      menuId: menu.id
    };
  }

  async updateMenu(id: string, updateMenuDto: UpdateMenuDto) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    
    if (updateMenuDto.title && updateMenuDto.title !== menu.title) {
      const existingMenu = await this.menuRepository.findOne({
        where: { title: updateMenuDto.title }
      });
      
      if (existingMenu) {
        throw new ConflictException('菜单标题已存在');
      }
    }

    // 如果更新父级菜单
    if (updateMenuDto.parentId && updateMenuDto.parentId !== menu.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: updateMenuDto.parentId }
      });
      
      if (!parent) {
        throw new NotFoundException('父级菜单不存在');
      }
      
      menu.parent = parent;
    }

    Object.assign(menu, updateMenuDto);
    await this.menuRepository.save(menu);

    return {
      message: '菜单更新成功',
      menuId: id
    };
  }

  async deleteMenu(id: string) {
    const menu = await this.menuRepository.findOne({ 
      where: { id },
      relations: ['children']
    });
    
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 检查是否有子菜单
    if (menu.children && menu.children.length > 0) {
      throw new ConflictException('该菜单下还有子菜单，不能删除');
    }

    await this.menuRepository.softDelete(id);

    return {
      message: '菜单删除成功',
      menuId: id
    };
  }

  async getMenuPermissions(id: string) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    let permissions = [];
    if (menu.permissionCode) {
      permissions = await this.permissionRepository.find({
        where: { code: Like(`%${menu.permissionCode}%`) }
      });
    }

    return {
      menuId: id,
      menuName: menu.name,
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        resource: p.resource,
        action: p.action
      }))
    };
  }

  async assignMenuPermissions(id: string, permissionIds: string[]) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 获取权限列表
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) }
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('部分权限不存在');
    }

    // 更新菜单的权限代码（简化处理，实际可能需要更复杂的关联）
    const permissionCodes = permissions.map(p => p.code).join(',');
    menu.permissionCode = permissionCodes;
    await this.menuRepository.save(menu);

    return {
      message: '菜单权限分配成功',
      menuId: id
    };
  }
}