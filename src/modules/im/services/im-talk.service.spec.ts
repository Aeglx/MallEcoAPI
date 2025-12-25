import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImTalkService } from './im-talk.service';
import { ImTalkEntity } from '../entities/im-talk.entity';
import { MemberService } from '../../member/member.service';
import { StoreService } from '../../store/store.service';

describe('ImTalkService', () => {
  let service: ImTalkService;
  let talkRepository: Repository<ImTalkEntity>;
  let memberService: MemberService;
  let storeService: StoreService;

  const mockTalkRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockMemberService = {
    findById: jest.fn(),
  };

  const mockStoreService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImTalkService,
        {
          provide: getRepositoryToken(ImTalkEntity),
          useValue: mockTalkRepository,
        },
        {
          provide: MemberService,
          useValue: mockMemberService,
        },
        {
          provide: StoreService,
          useValue: mockStoreService,
        },
      ],
    }).compile();

    service = module.get<ImTalkService>(ImTalkService);
    talkRepository = module.get<Repository<ImTalkEntity>>(getRepositoryToken(ImTalkEntity));
    memberService = module.get<MemberService>(MemberService);
    storeService = module.get<StoreService>(StoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTalkByUser', () => {
    it('应该返回存在的聊天会话', async () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const mockTalk = {
        id: 1,
        userId1,
        userId2,
        top1: false,
        top2: false,
        disable1: false,
        disable2: false,
        storeFlag1: false,
        storeFlag2: false,
        lastTalkTime: new Date(),
        lastTalkMessage: null,
        lastMessageType: null,
        createTime: new Date(),
        updateTime: new Date(),
      } as ImTalkEntity;

      mockTalkRepository.findOne.mockResolvedValue(mockTalk);

      const result = await service.getTalkByUser(userId1, userId2);

      expect(result).toEqual(mockTalk);
      expect(mockTalkRepository.findOne).toHaveBeenCalledWith({
        where: [
          { userId1, userId2 },
          { userId1: userId2, userId2: userId1 },
        ],
      });
    });

    it('应该返回null如果会话不存在', async () => {
      mockTalkRepository.findOne.mockResolvedValue(null);

      const result = await service.getTalkByUser('user1', 'user2');

      expect(result).toBeNull();
    });
  });

  describe('top', () => {
    it('应该置顶聊天会话', async () => {
      const talkId = '1';
      const userId = 'user1';

      mockTalkRepository.update.mockResolvedValue({ affected: 1 });

      await service.top(talkId, userId, true);

      expect(mockTalkRepository.update).toHaveBeenCalledWith(
        { id: parseInt(talkId), userId1: userId },
        { isTop: true },
      );
    });
  });

  describe('disable', () => {
    it('应该禁用聊天会话', async () => {
      const talkId = '1';
      const userId = 'user1';
      const mockTalk = {
        id: 1,
        userId1: userId,
        userId2: 'user2',
      } as ImTalkEntity;

      mockTalkRepository.findOne.mockResolvedValue(mockTalk);
      mockTalkRepository.update.mockResolvedValue({ affected: 1 });

      await service.disable(talkId, userId);

      expect(mockTalkRepository.findOne).toHaveBeenCalledWith({
        where: { id: parseInt(talkId) },
      });
      expect(mockTalkRepository.update).toHaveBeenCalled();
    });
  });

  describe('getUserTalkList', () => {
    it('应该返回用户的聊天列表', async () => {
      const userId = 'user1';
      const mockTalks = [
        { id: 1, userId1: userId, userId2: 'user2' },
        { id: 2, userId1: userId, userId2: 'user3' },
      ] as ImTalkEntity[];

      mockTalkRepository.find.mockResolvedValue(mockTalks);

      const result = await service.getUserTalkList(userId);

      expect(result).toEqual(mockTalks);
      expect(mockTalkRepository.find).toHaveBeenCalledWith({
        where: [{ userId1: userId }, { userId2: userId }],
        order: { lastTalkTime: 'DESC' },
      });
    });
  });
});

