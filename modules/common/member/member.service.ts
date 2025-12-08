import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MemberStatus, MemberLevel, MemberGender } from './entities/member.entity';
import { MemberPoints, PointsChangeType, PointsChangeReason } from './entities/member-points.entity';
import { MemberAddress } from './entities/member-address.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(MemberPoints) private memberPointsRepository: Repository<MemberPoints>,
    @InjectRepository(MemberAddress) private memberAddressRepository: Repository<MemberAddress>,
  ) {}

  /**
   * 创建会员
   * @param createMemberDto 创建会员DTO
   * @returns 创建的会员
   */
  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    // 检查会员账号是否已存在
    const existingMember = await this.memberRepository.findOne({
      where: [{ account: createMemberDto.account }, { phone: createMemberDto.phone }, { email: createMemberDto.email }],
    });
    if (existingMember) {
      if (existingMember.account === createMemberDto.account) {
        throw new BadRequestException('Member account already exists');
      }
      if (existingMember.phone === createMemberDto.phone) {
        throw new BadRequestException('Member phone already exists');
      }
      if (existingMember.email === createMemberDto.email) {
        throw new BadRequestException('Member email already exists');
      }
    }

    // 加密密码
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createMemberDto.password, salt);

    // 创建会员
    const member = this.memberRepository.create({
      ...createMemberDto,
      password: hashedPassword,
      points: 0,
      balance: 0,
      growthValue: 0,
      status: createMemberDto.status || MemberStatus.ACTIVE,
      level: createMemberDto.level || MemberLevel.LEVEL_1,
    });

    const savedMember = await this.memberRepository.save(member);

    // 为新会员添加注册积分
    if (member.status === MemberStatus.ACTIVE) {
      await this.addPoints(
        savedMember.id,
        PointsChangeType.INCREASE,
        PointsChangeReason.REGISTER,
        100, // 注册赠送100积分
        null,
        '注册赠送积分',
      );
    }

    // 清除密码返回
    delete savedMember.password;
    return savedMember;
  }

  /**
   * 查询会员列表
   * @returns 会员列表
   */
  async findAll(): Promise<Member[]> {
    return await this.memberRepository.find({
      relations: ['addresses', 'pointsRecords'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        account: true,
        nickname: true,
        avatar: true,
        phone: true,
        email: true,
        gender: true,
        birthday: true,
        introduction: true,
        status: true,
        level: true,
        points: true,
        balance: true,
        growthValue: true,
        lastLoginTime: true,
        lastLoginIp: true,
        loginCount: true,
        wechatOpenid: true,
        qqOpenid: true,
        weiboOpenid: true,
        source: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  /**
   * 根据ID查询会员
   * @param id 会员ID
   * @returns 会员
   */
  async findOne(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['addresses', 'pointsRecords'],
      select: {
        id: true,
        account: true,
        nickname: true,
        avatar: true,
        phone: true,
        email: true,
        gender: true,
        birthday: true,
        introduction: true,
        status: true,
        level: true,
        points: true,
        balance: true,
        growthValue: true,
        lastLoginTime: true,
        lastLoginIp: true,
        loginCount: true,
        wechatOpenid: true,
        qqOpenid: true,
        weiboOpenid: true,
        source: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  /**
   * 根据账号查询会员
   * @param account 会员账号
   * @returns 会员
   */
  async findByAccount(account: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { account },
    });
    if (!member) {
      throw new NotFoundException(`Member with account ${account} not found`);
    }
    return member;
  }

  /**
   * 根据手机号码查询会员
   * @param phone 手机号码
   * @returns 会员
   */
  async findByPhone(phone: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { phone },
    });
    if (!member) {
      throw new NotFoundException(`Member with phone ${phone} not found`);
    }
    return member;
  }

  /**
   * 根据邮箱查询会员
   * @param email 邮箱
   * @returns 会员
   */
  async findByEmail(email: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { email },
    });
    if (!member) {
      throw new NotFoundException(`Member with email ${email} not found`);
    }
    return member;
  }

  /**
   * 更新会员信息
   * @param id 会员ID
   * @param updateMemberDto 更新会员DTO
   * @returns 更新后的会员
   */
  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);

    // 检查会员账号是否已存在（排除当前会员）
    if (updateMemberDto.account && updateMemberDto.account !== member.account) {
      const existingMember = await this.memberRepository.findOne({
        where: { account: updateMemberDto.account },
      });
      if (existingMember) {
        throw new BadRequestException('Member account already exists');
      }
    }

    // 检查手机号码是否已存在（排除当前会员）
    if (updateMemberDto.phone && updateMemberDto.phone !== member.phone) {
      const existingMember = await this.memberRepository.findOne({
        where: { phone: updateMemberDto.phone },
      });
      if (existingMember) {
        throw new BadRequestException('Member phone already exists');
      }
    }

    // 检查邮箱是否已存在（排除当前会员）
    if (updateMemberDto.email && updateMemberDto.email !== member.email) {
      const existingMember = await this.memberRepository.findOne({
        where: { email: updateMemberDto.email },
      });
      if (existingMember) {
        throw new BadRequestException('Member email already exists');
      }
    }

    // 加密密码（如果更新了密码）
    if (updateMemberDto.password) {
      const salt = await bcrypt.genSalt();
      updateMemberDto.password = await bcrypt.hash(updateMemberDto.password, salt);
    } else {
      // 如果没有更新密码，保留原密码
      delete updateMemberDto.password;
    }

    // 更新会员信息
    Object.assign(member, updateMemberDto);

    const savedMember = await this.memberRepository.save(member);

    // 清除密码返回
    delete savedMember.password;
    return savedMember;
  }

  /**
   * 删除会员
   * @param id 会员ID
   * @returns 删除结果
   */
  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.memberRepository.remove(member);
  }

  /**
   * 更新会员登录信息
   * @param id 会员ID
   * @param ip 登录IP
   * @returns 更新后的会员
   */
  async updateLoginInfo(id: string, ip: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    member.lastLoginTime = new Date();
    member.lastLoginIp = ip;
    member.loginCount = (member.loginCount || 0) + 1;

    const savedMember = await this.memberRepository.save(member);

    // 清除密码返回
    delete savedMember.password;
    return savedMember;
  }

  /**
   * 会员登录
   * @param account 会员账号
   * @param password 会员密码
   * @param ip 登录IP
   * @returns 登录成功的会员
   */
  async login(account: string, password: string, ip: string): Promise<Member> {
    // 根据账号、手机或邮箱查询会员
    const member = await this.memberRepository.findOne({
      where: [{ account }, { phone: account }, { email: account }],
    });
    if (!member) {
      throw new UnauthorizedException('Invalid account or password');
    }

    // 检查会员状态
    if (member.status !== MemberStatus.ACTIVE) {
      throw new UnauthorizedException('Member account is not active');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid account or password');
    }

    // 更新登录信息
    const updatedMember = await this.updateLoginInfo(member.id, ip);

    // 清除密码返回
    delete updatedMember.password;
    return updatedMember;
  }

  /**
   * 更新会员积分
   * @param memberId 会员ID
   * @param changeType 积分变动类型
   * @param changeReason 积分变动原因
   * @param changePoints 变动积分
   * @param orderId 相关订单ID
   * @param remark 备注
   * @returns 更新后的会员
   */
  async addPoints(
    memberId: string,
    changeType: PointsChangeType,
    changeReason: PointsChangeReason,
    changePoints: number,
    orderId: string | null,
    remark: string,
  ): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    const beforePoints = member.points;
    let afterPoints = beforePoints;

    if (changeType === PointsChangeType.INCREASE) {
      afterPoints = beforePoints + changePoints;
    } else if (changeType === PointsChangeType.DECREASE) {
      if (beforePoints < changePoints) {
        throw new BadRequestException('Insufficient points');
      }
      afterPoints = beforePoints - changePoints;
    }

    // 更新会员积分
    member.points = afterPoints;
    const savedMember = await this.memberRepository.save(member);

    // 创建积分变动记录
    await this.memberPointsRepository.save({
      memberId,
      changeType,
      changeReason,
      changePoints,
      beforePoints,
      afterPoints,
      orderId,
      remark,
    });

    // 更新会员等级
    await this.updateMemberLevel(memberId);

    // 清除密码返回
    delete savedMember.password;
    return savedMember;
  }

  /**
   * 更新会员等级
   * @param memberId 会员ID
   * @returns 更新后的会员
   */
  async updateMemberLevel(memberId: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // 根据成长值更新会员等级
    let level = MemberLevel.LEVEL_1;
    if (member.growthValue >= 5000) {
      level = MemberLevel.LEVEL_5; // 钻石会员
    } else if (member.growthValue >= 2000) {
      level = MemberLevel.LEVEL_4; // 铂金会员
    } else if (member.growthValue >= 1000) {
      level = MemberLevel.LEVEL_3; // 金卡会员
    } else if (member.growthValue >= 500) {
      level = MemberLevel.LEVEL_2; // 银卡会员
    }

    member.level = level;
    const savedMember = await this.memberRepository.save(member);

    // 清除密码返回
    delete savedMember.password;
    return savedMember;
  }

  /**
   * 重置会员密码
   * @param account 会员账号
   * @param newPassword 新密码
   * @returns 重置密码后的会员
   */
  async resetPassword(account: string, newPassword: string): Promise<Member> {
    // 根据账号、手机或邮箱查询会员
    const member = await this.memberRepository.findOne({
      where: [{ account }, { phone: account }, { email: account }],
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // 加密新密码
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    member.password = hashedPassword;
    const savedMember = await this.memberRepository.save(member);

    // 清除密码返回
    delete savedMember.password;
    return savedMember;
  }

  /**
   * 冻结会员
   * @param id 会员ID
   * @returns 冻结后的会员
   */
  async freeze(id: string): Promise<Member> {
    const member = await this.findOne(id);
    member.status = MemberStatus.SUSPENDED;
    const savedMember = await this.memberRepository.save(member);

    // 清除密码返回
    delete savedMember.password;
    return savedMember;
  }

  /**
   * 解冻会员
   * @param id 会员ID
   * @returns 解冻后的会员
   */
  async unfreeze(id: string): Promise<Member> {
    const member = await this.findOne(id);
    member.status = MemberStatus.ACTIVE;
    const savedMember = await this.memberRepository.save(member);

    // 清除密码返回
    delete savedMember.password;
    return savedMember;
  }
}
