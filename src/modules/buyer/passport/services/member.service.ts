import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
  private members: any[] = [
    {
      id: '1',
      username: 'test',
      mobile: '13800138000',
      nickName: '测试用户',
      email: 'test@example.com',
      gender: 0,
      point: 100,
      balance: 0,
      couponNum: 5,
      birthday: null,
      regTime: '2023-01-01 10:00:00',
      lastLoginTime: '2023-12-16 22:00:00',
      avatar: 'https://via.placeholder.com/100x100?text=Avatar',
      status: 1,
    },
  ];

  createPcSession() {
    // 模拟创建PC登录会话
    return {
      token: 'mock-pc-session-token-' + Date.now(),
      qrCode:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };
  }

  loginWithSession(token: string) {
    // 模拟会话登录
    return {
      status: 3, // 登录成功状态
      token: 'mock-jwt-token-' + Date.now(),
      member: this.members[0],
    };
  }

  appScanner(token: string) {
    // 模拟APP扫码
    return {
      status: 2, // 扫码中状态
      message: '扫码成功，请在APP中确认登录',
    };
  }

  appSConfirm(token: string, code: number) {
    // 模拟APP确认登录
    return code === 1;
  }

  usernameLogin(username: string, password: string) {
    // 模拟用户名登录
    if (username === 'test' && password === '123456') {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        member: this.members[0],
      };
    }
    return null;
  }

  logout(userType: string) {
    // 模拟登出
    return true;
  }

  mobilePhoneLogin(mobile: string) {
    // 模拟手机号登录
    const member = this.members.find(m => m.mobile === mobile);
    if (member) {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        member: member,
      };
    }
    return null;
  }

  changeMobile(memberId: string, mobile: string) {
    // 模拟修改手机号
    const member = this.members.find(m => m.id === memberId);
    if (member) {
      member.mobile = mobile;
      return member;
    }
    return null;
  }

  register(username: string, password: string, mobilePhone: string) {
    // 模拟注册
    const newMember = {
      id: (this.members.length + 1).toString(),
      username: username,
      mobile: mobilePhone,
      nickName: username,
      email: null,
      gender: 0,
      point: 0,
      balance: 0,
      couponNum: 0,
      birthday: null,
      regTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastLoginTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      avatar: 'https://via.placeholder.com/100x100?text=Avatar',
      status: 1,
    };
    this.members.push(newMember);
    return {
      token: 'mock-jwt-token-' + Date.now(),
      member: newMember,
    };
  }

  getUserInfo() {
    // 模拟获取当前登录用户信息
    return this.members[0];
  }

  findByMobile(uuid: string, mobile: string) {
    // 模拟通过手机号查找会员
    return this.members.find(m => m.mobile === mobile);
  }

  findByUsername(username: string) {
    // 模拟通过用户名查找会员
    return this.members.find(m => m.username === username);
  }

  resetByMobile(uuid: string, password: string) {
    // 模拟通过手机号重置密码
    return this.members[0];
  }

  editOwn(memberEditDTO: any) {
    // 模拟修改用户资料
    const member = this.members[0];
    member.nickName = memberEditDTO.nickName || member.nickName;
    member.gender = memberEditDTO.gender || member.gender;
    member.birthday = memberEditDTO.birthday || member.birthday;
    member.email = memberEditDTO.email || member.email;
    return member;
  }

  modifyPass(password: string, newPassword: string) {
    // 模拟修改密码
    return this.members[0];
  }

  canInitPass() {
    // 模拟检查是否可以初始设置密码
    return true;
  }

  initPass(password: string) {
    // 模拟初始设置密码
    return true;
  }

  cancellation() {
    // 模拟注销账号
    return true;
  }

  refreshToken(refreshToken: string) {
    // 模拟刷新token
    return {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  }

  getById(id: string) {
    // 模拟通过ID获取会员
    return this.members.find(m => m.id === id);
  }
}
