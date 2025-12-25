import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImMessageService } from './im-message.service';
import { ImMessageEntity } from '../entities/im-message.entity';

describe('ImMessageService', () => {
  let service: ImMessageService;
  let repository: Repository<ImMessageEntity>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImMessageService,
        {
          provide: getRepositoryToken(ImMessageEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ImMessageService>(ImMessageService);
    repository = module.get<Repository<ImMessageEntity>>(
      getRepositoryToken(ImMessageEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should create and save a message', async () => {
      const messageData = {
        fromUser: 'user1',
        toUser: 'user2',
        talkId: 'talk1',
        text: 'Hello',
        messageType: 'MESSAGE',
        isRead: false,
      };

      const savedMessage = { id: 1, ...messageData, createTime: new Date() };
      mockRepository.create.mockReturnValue(savedMessage);
      mockRepository.save.mockResolvedValue(savedMessage);

      const result = await service.sendMessage(messageData);

      expect(mockRepository.create).toHaveBeenCalledWith(messageData);
      expect(mockRepository.save).toHaveBeenCalledWith(savedMessage);
      expect(result).toEqual(savedMessage);
    });
  });

  describe('read', () => {
    it('should mark messages as read', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.read('talk1', 'user1');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { talkId: 'talk1', toUser: 'user1', isRead: false },
        { isRead: true },
      );
    });
  });

  describe('unReadMessages', () => {
    it('should return unread messages', async () => {
      const unreadMessages = [
        { id: 1, fromUser: 'user2', toUser: 'user1', text: 'Hi', isRead: false },
      ];
      mockRepository.find.mockResolvedValue(unreadMessages);

      const result = await service.unReadMessages('user1');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { toUser: 'user1', isRead: false, deleteFlag: false },
        order: { createTime: 'DESC' },
      });
      expect(result).toEqual(unreadMessages);
    });
  });

  describe('unreadMessageCount', () => {
    it('should return count of unread messages', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.unreadMessageCount('user1');

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { toUser: 'user1', isRead: false, deleteFlag: false },
      });
      expect(result).toBe(5);
    });
  });
});

