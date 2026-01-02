import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Not, IsNull } from 'typeorm';
import { Member } from '../../../framework/entities/member.entity';
import { MemberGrade } from '../../../framework/entities/grade.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(MemberGrade)
    private readonly gradeRepository: Repository<MemberGrade>,
  ) {}

  /**
   * 获取会员列表（分页）
   */
  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 10,
      username,
      mobile,
      nickname,
      status,
      gradeId,
      startTime,
      endTime,
    } = query;

    const skip = (Number(page) - 1) * Number(pageSize);
    const where: any = { deleted: false };

    // 构建查询条件
    if (username) {
      where.username = Like(`%${username}%`);
    }
    if (mobile) {
      where.mobile = Like(`%${mobile}%`);
    }
    if (nickname) {
      where.nickname = Like(`%${nickname}%`);
    }
    if (status !== undefined && status !== '') {
      where.status = status === 'true' || status === true || status === 1;
    }
    if (gradeId) {
      where.gradeId = gradeId;
    }
    // 日期范围查询需要特殊处理，使用QueryBuilder
    let queryBuilder = this.memberRepository.createQueryBuilder('member');
    
    // 应用所有查询条件
    if (username) {
      queryBuilder.andWhere('member.username LIKE :username', { username: `%${username}%` });
    }
    if (mobile) {
      queryBuilder.andWhere('member.mobile LIKE :mobile', { mobile: `%${mobile}%` });
    }
    if (nickname) {
      queryBuilder.andWhere('member.nickname LIKE :nickname', { nickname: `%${nickname}%` });
    }
    if (status !== undefined && status !== '') {
      queryBuilder.andWhere('member.status = :status', { status: status === 'true' || status === true || status === 1 });
    }
    if (gradeId) {
      queryBuilder.andWhere('member.gradeId = :gradeId', { gradeId });
    }
    if (startTime && endTime) {
      queryBuilder.andWhere('member.createTime >= :startTime', { startTime: new Date(startTime) });
      queryBuilder.andWhere('member.createTime <= :endTime', { endTime: new Date(endTime) });
    }
    queryBuilder.andWhere('member.deleted = :deleted', { deleted: false });

    try {
      const [result, total] = await queryBuilder
        .skip(skip)
        .take(Number(pageSize))
        .orderBy('member.createTime', 'DESC')
        .getManyAndCount();

      // 获取会员等级信息
      const gradeIds = [...new Set(result.map(m => m.gradeId).filter(Boolean))];
      const grades = gradeIds.length > 0 
        ? await this.gradeRepository.find({ where: { id: In(gradeIds) } })
        : [];
      const gradeMap = new Map(grades.map(g => [g.id, g]));

      // 关联等级信息
      const data = result.map(member => ({
        ...member,
        gradeName: member.gradeId ? gradeMap.get(member.gradeId)?.gradeName : null,
      }));

      return {
        success: true,
        result: data,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        message: '获取会员列表成功',
      };
    } catch (error) {
      console.error('获取会员列表失败:', error);
      return {
        success: false,
        result: [],
        total: 0,
        message: '获取会员列表失败: ' + error.message,
      };
    }
  }

  /**
   * 获取会员详情
   */
  async findOne(id: string) {
    try {
      const member = await this.memberRepository.findOne({
        where: { id, deleted: false },
      });

      if (!member) {
        return {
          success: false,
          message: '会员不存在',
        };
      }

      // 获取等级信息
      let gradeName = null;
      if (member.gradeId) {
        const grade = await this.gradeRepository.findOne({
          where: { id: member.gradeId },
        });
        gradeName = grade?.gradeName || null;
      }

      return {
        success: true,
        result: {
          ...member,
          gradeName,
        },
        message: '获取会员详情成功',
      };
    } catch (error) {
      console.error('获取会员详情失败:', error);
      return {
        success: false,
        message: '获取会员详情失败: ' + error.message,
      };
    }
  }

  /**
   * 创建会员
   */
  async create(memberData: any) {
    try {
      // 验证必填字段
      if (!memberData.username) {
        throw new BadRequestException('用户名不能为空');
      }
      if (!memberData.password) {
        throw new BadRequestException('密码不能为空');
      }

      // 检查用户名是否已存在
      const existingMember = await this.memberRepository.findOne({
        where: { username: memberData.username, deleted: false },
      });

      if (existingMember) {
        throw new ConflictException('用户名已存在');
      }

      // 检查手机号是否已存在（如果提供）
      if (memberData.mobile) {
        const existingMobile = await this.memberRepository.findOne({
          where: { mobile: memberData.mobile, deleted: false },
        });
        if (existingMobile) {
          throw new ConflictException('手机号已被注册');
        }
      }

      // 检查邮箱是否已存在（如果提供）
      if (memberData.email) {
        const existingEmail = await this.memberRepository.findOne({
          where: { email: memberData.email, deleted: false },
        });
        if (existingEmail) {
          throw new ConflictException('邮箱已被注册');
        }
      }

      // 密码加密
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(memberData.password, saltRounds);

      // 创建会员
      const newMember = this.memberRepository.create({
        ...memberData,
        password: hashedPassword,
        status: memberData.status !== undefined ? memberData.status : true,
        points: memberData.points || 0,
        balance: memberData.balance || 0,
      });

      const savedMember = await this.memberRepository.save(newMember);

      // 移除密码字段
      const { password, ...result } = savedMember;

      return {
        success: true,
        result,
        message: '创建会员成功',
      };
    } catch (error) {
      console.error('创建会员失败:', error);
      return {
        success: false,
        message: error.message || '创建会员失败',
      };
    }
  }

  /**
   * 更新会员信息
   */
  async update(id: string, memberData: any) {
    try {
      const member = await this.memberRepository.findOne({
        where: { id, deleted: false },
      });

      if (!member) {
        return {
          success: false,
          message: '会员不存在',
        };
      }

      // 如果更新用户名，检查是否重复
      if (memberData.username && memberData.username !== member.username) {
        const existingMember = await this.memberRepository.findOne({
          where: { username: memberData.username, deleted: false, id: Not(id) },
        });
        if (existingMember) {
          return {
            success: false,
            message: '用户名已存在',
          };
        }
      }

      // 如果更新手机号，检查是否重复
      if (memberData.mobile && memberData.mobile !== member.mobile) {
        const existingMobile = await this.memberRepository.findOne({
          where: { mobile: memberData.mobile, deleted: false, id: Not(id) },
        });
        if (existingMobile) {
          return {
            success: false,
            message: '手机号已被注册',
          };
        }
      }

      // 如果更新邮箱，检查是否重复
      if (memberData.email && memberData.email !== member.email) {
        const existingEmail = await this.memberRepository.findOne({
          where: { email: memberData.email, deleted: false, id: Not(id) },
        });
        if (existingEmail) {
          return {
            success: false,
            message: '邮箱已被注册',
          };
        }
      }

      // 如果更新密码，进行加密
      if (memberData.password) {
        const saltRounds = 10;
        memberData.password = await bcrypt.hash(memberData.password, saltRounds);
      }

      // 更新会员信息
      Object.assign(member, memberData);
      const updatedMember = await this.memberRepository.save(member);

      // 移除密码字段
      const { password, ...result } = updatedMember;

      return {
        success: true,
        result,
        message: '更新会员信息成功',
      };
    } catch (error) {
      console.error('更新会员信息失败:', error);
      return {
        success: false,
        message: '更新会员信息失败: ' + error.message,
      };
    }
  }

  /**
   * 更新会员状态
   */
  async updateStatus(id: string, statusData: any) {
    try {
      const member = await this.memberRepository.findOne({
        where: { id, deleted: false },
      });

      if (!member) {
        return {
          success: false,
          message: '会员不存在',
        };
      }

      member.status = statusData.disabled !== undefined ? !statusData.disabled : statusData.status;
      await this.memberRepository.save(member);

      return {
        success: true,
        result: member,
        message: '更新会员状态成功',
      };
    } catch (error) {
      console.error('更新会员状态失败:', error);
      return {
        success: false,
        message: '更新会员状态失败: ' + error.message,
      };
    }
  }

  /**
   * 删除会员（软删除）
   */
  async remove(id: string) {
    try {
      const member = await this.memberRepository.findOne({
        where: { id, deleted: false },
      });

      if (!member) {
        return {
          success: false,
          message: '会员不存在',
        };
      }

      member.deleted = true;
      await this.memberRepository.save(member);

      return {
        success: true,
        message: '删除会员成功',
      };
    } catch (error) {
      console.error('删除会员失败:', error);
      return {
        success: false,
        message: '删除会员失败: ' + error.message,
      };
    }
  }

  /**
   * 批量删除会员（软删除）
   */
  async batchRemove(ids: string[]) {
    try {
      if (!ids || ids.length === 0) {
        return {
          success: false,
          message: '请选择要删除的会员',
        };
      }

      const members = await this.memberRepository.find({
        where: { id: In(ids), deleted: false },
      });

      if (members.length === 0) {
        return {
          success: false,
          message: '未找到要删除的会员',
        };
      }

      members.forEach(member => {
        member.deleted = true;
      });

      await this.memberRepository.save(members);

      return {
        success: true,
        message: `成功删除 ${members.length} 个会员`,
      };
    } catch (error) {
      console.error('批量删除会员失败:', error);
      return {
        success: false,
        message: '批量删除会员失败: ' + error.message,
      };
    }
  }

  /**
   * 获取回收站会员列表
   */
  async getRecycleList(query: any) {
    const { page = 1, pageSize = 10 } = query;
    const skip = (Number(page) - 1) * Number(pageSize);

    try {
      const [result, total] = await this.memberRepository.findAndCount({
        where: { deleted: true },
        skip,
        take: Number(pageSize),
        order: { updateTime: 'DESC' },
      });

      return {
        success: true,
        result,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        message: '获取回收站会员列表成功',
      };
    } catch (error) {
      console.error('获取回收站会员列表失败:', error);
      return {
        success: false,
        result: [],
        total: 0,
        message: '获取回收站会员列表失败: ' + error.message,
      };
    }
  }

  /**
   * 恢复会员
   */
  async restoreMember(id: string) {
    try {
      const member = await this.memberRepository.findOne({
        where: { id, deleted: true },
      });

      if (!member) {
        return {
          success: false,
          message: '会员不存在或不在回收站中',
        };
      }

      member.deleted = false;
      await this.memberRepository.save(member);

      return {
        success: true,
        message: '恢复会员成功',
      };
    } catch (error) {
      console.error('恢复会员失败:', error);
      return {
        success: false,
        message: '恢复会员失败: ' + error.message,
      };
    }
  }

  /**
   * 永久删除会员
   */
  async permanentDelete(id: string) {
    try {
      const member = await this.memberRepository.findOne({
        where: { id, deleted: true },
      });

      if (!member) {
        return {
          success: false,
          message: '会员不存在或不在回收站中',
        };
      }

      await this.memberRepository.remove(member);

      return {
        success: true,
        message: '永久删除会员成功',
      };
    } catch (error) {
      console.error('永久删除会员失败:', error);
      return {
        success: false,
        message: '永久删除会员失败: ' + error.message,
      };
    }
  }
}
