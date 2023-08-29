import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseMessage } from './app.entity';
import { getRedisToken } from '@songkeys/nestjs-redis';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as uuid from 'uuid';
jest.mock('uuid');

describe('App', () => {
  let module: TestingModule;
  let appController: AppController;
  let appService: AppService;
  let mockRedis;
  beforeEach(async () => {
    mockRedis = {
      hexists: jest.fn(),
      hget: jest.fn(),
      multi: jest.fn(() => ({
        sadd: jest.fn().mockReturnThis(),
        srem: jest.fn().mockReturnThis(),
        zincrby: jest.fn().mockReturnThis(),
        exec: jest.fn().mockReturnThis(),
        hset: jest.fn().mockReturnThis(),
        zadd: jest.fn().mockReturnThis(),
        del: jest.fn().mockReturnThis(),
      })),
      hset: jest.fn(),
      hgetall: jest.fn(),
      zrevrange: jest.fn(),
      hlen: jest.fn(),
      sadd: jest.fn(),
      zincrby: jest.fn(),
      exec: jest.fn(),
      zscore: jest.fn(),
      hdel: jest.fn(),
      del: jest.fn(),
    };
    module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getRedisToken('default'),
          useValue: mockRedis,
        },
        JwtService,
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    for (const prop in mockRedis) {
      if (
        mockRedis.hasOwnProperty(prop) &&
        typeof mockRedis[prop].mockClear === 'function'
      ) {
        mockRedis[prop].mockClear();
      }
    }
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });

  describe('controler', () => {
    describe('uservotes', () => {
      it('should call appController.uservotes success', async () => {
        const voteId = 'mockVoteId';
        const userId = 'someUserId';
        const req = { user: { sub: userId } };

        jest.spyOn(appService, 'uservotes').mockResolvedValue('OK');

        const result = await appController.uservotes(req as any, voteId);

        expect(result).toEqual(new ResponseMessage('OK'));
        expect(appService.uservotes).toHaveBeenCalledWith(voteId, userId);
      });
    });
    describe('getAllVoteItem', () => {
      it('should call appController.getAllVoteItem success', async () => {
        const mockResult = {
          totalVote: 1,
          voteitem: [
            {
              itemId: 'mockItemId',
              name: 'mockName',
              description: 'mockDescription',
              voteCount: 1,
            },
          ],
        };
        jest.spyOn(appService, 'getAllVoteItem').mockResolvedValue(mockResult);

        const result = await appController.getAllVoteItem();

        expect(result).toEqual(mockResult);
      });

      it('should call appController.getAllVoteItem success', async () => {
        const mockResult = {
          totalVote: 1,
          voteitem: [
            {
              itemId: 'mockItemId',
              name: 'mockName',
              description: 'mockDescription',
              voteCount: 1,
            },
          ],
        };
        jest.spyOn(appService, 'getAllVoteItem').mockResolvedValue(mockResult);
        const result = await appController.getAllVoteItem();
        expect(result).toEqual(mockResult);
      });

      it('should call appController.getAllVoteItem failed', async () => {
        jest
          .spyOn(appService, 'getAllVoteItem')
          .mockRejectedValue('Redis error');
        await expect(appController.getAllVoteItem()).rejects.toThrow(
          'An error occurred while fetching vote items.',
        );
      });
    });

    describe('addVoteItem', () => {
      it('should call appController.addVoteItem success', async () => {
        const mockRequest = {
          name: 'mockName',
          description: 'mockDescription',
        };
        jest.spyOn(appService, 'addVoteItem').mockResolvedValue('field');
        const result = await appController.addVoteItem(mockRequest);
        expect(result).toEqual(new ResponseMessage('field'));
        expect(appService.addVoteItem).toHaveBeenCalledWith(
          mockRequest.name,
          mockRequest.description,
        );
      });
    });

    describe('editVoteItem', () => {
      it('should call appController.editVoteItem success', async () => {
        const mockRequest = {
          itemId: 'mockItemId',
          name: 'mockName',
          description: 'mockDescription',
          voteCount: 1,
        };
        jest.spyOn(appService, 'editVoteItem').mockResolvedValue(mockRequest);
        const result = await appController.editVoteItem(mockRequest);
        expect(result).toEqual(mockRequest);
        expect(appService.editVoteItem).toHaveBeenCalledWith(
          mockRequest.name,
          mockRequest.description,
        );
      });

      it('should call appController.editVoteItem failed', async () => {
        const mockRequest = {
          itemId: 'mockItemId',
          name: 'mockName',
          description: 'mockDescription',
          voteCount: 1,
        };
        jest.spyOn(appService, 'editVoteItem').mockRejectedValue('Redis error');
        await expect(appController.editVoteItem(mockRequest)).rejects.toThrow(
          'An error occurred while edit vote items.',
        );
      });
    });

    describe('deleteVoteItem', () => {
      it('should call appController.deleteVoteItem success', async () => {
        const mockRequest = {
          itemId: 'mockItemId',
          name: 'mockName',
          description: 'mockDescription',
          voteCount: 1,
        };
        jest.spyOn(appService, 'deleteVoteItem').mockResolvedValue('OK');
        const result = await appController.deleteVoteItem(mockRequest.itemId);
        expect(result).toEqual(new ResponseMessage('OK'));
        expect(appService.deleteVoteItem).toHaveBeenCalledWith(
          mockRequest.itemId,
        );
      });

      it('should call appController.deleteVoteItem failed', async () => {
        const mockRequest = {
          itemId: 'mockItemId',
          name: 'mockName',
          description: 'mockDescription',
          voteCount: 1,
        };
        jest
          .spyOn(appService, 'deleteVoteItem')
          .mockRejectedValue('Redis error');
        await expect(
          appController.deleteVoteItem(mockRequest.itemId),
        ).rejects.toThrow('An error occurred while delete vote items.');
      });
    });

    describe('clearVoteData', () => {
      it('should call appController.clearVoteData success', async () => {
        jest
          .spyOn(appService, 'clearVoteData')
          .mockResolvedValue('All data was deleted successfully.');
        const result = await appController.clearVoteData();
        expect(result).toEqual(
          new ResponseMessage('All data was deleted successfully.'),
        );
      });

      it('should call appController.clearVoteData failed', async () => {
        jest
          .spyOn(appService, 'clearVoteData')
          .mockRejectedValue('Redis error');
        await expect(appController.clearVoteData()).rejects.toThrow(
          'An error occurred while clear vote data.',
        );
      });
    });
  });

  describe('service', () => {
    describe('uservotes', () => {
      it('should uservotes appService.uservotes vote_item not exist', async () => {
        const voteId = 'mockVoteId';
        const userId = 'someUserId';

        mockRedis.hexists.mockResolvedValue(0);
        await expect(appService.uservotes(voteId, userId)).rejects.toThrowError(
          BadRequestException,
        );
        expect(mockRedis.multi().exec).not.toHaveBeenCalled();
      });

      it('should call appService.uservotes get voted_users is not exist', async () => {
        mockRedis.hexists.mockResolvedValue(1);
        mockRedis.hget.mockResolvedValue(null);
        const result = await appService.uservotes('voteid123', 'user123');
        expect(result).toBe('OK');
        expect(
          mockRedis.multi().sadd('item_voted_by:voteid123', 'user123'),
        ).toBeInstanceOf(Object);
        expect(
          mockRedis.multi().zincrby('vote_counts', 1, 'voteid123'),
        ).toBeInstanceOf(Object);
        expect(mockRedis.multi().exec()).toBeInstanceOf(Object);
        expect(mockRedis.hset).toHaveBeenCalledWith(
          'voted_users',
          'user123',
          'voteid123',
        );
      });

      it('should call appService.uservotes get voted_users is exist', async () => {
        mockRedis.hexists.mockResolvedValue(1);
        mockRedis.hget.mockResolvedValue('voteid123');
        const result = await appService.uservotes('getvoteid123', 'user123');
        expect(result).toBe('OK');
        expect(
          mockRedis.multi().srem('item_voted_by:getvoteid123', 'user123'),
        ).toBeInstanceOf(Object);
        expect(
          mockRedis.multi().sadd('item_voted_by:voteid123', 'user123'),
        ).toBeInstanceOf(Object);
        expect(
          mockRedis.multi().zincrby('vote_counts', -1, 'voteid123'),
        ).toBeInstanceOf(Object);
        expect(
          mockRedis.multi().zincrby('vote_counts', 1, 'voteid123'),
        ).toBeInstanceOf(Object);
        expect(mockRedis.multi().exec()).toBeInstanceOf(Object);
        expect(mockRedis.hset).toHaveBeenCalledWith(
          'voted_users',
          'user123',
          'getvoteid123',
        );
      });
    });

    describe('getAllVoteItem', () => {
      it('should call appService.getAllVoteItem get voted_users is exist', async () => {
        mockRedis.hexists.mockResolvedValue(1);
        mockRedis.hget.mockResolvedValue('voteid123');
        const result = await appService.uservotes('getvoteid123', 'user123');
        expect(result).toBe('OK');
        expect(
          mockRedis.multi().srem('item_voted_by:getvoteid123', 'user123'),
        ).toBeInstanceOf(Object);
        expect(
          mockRedis.multi().sadd('item_voted_by:voteid123', 'user123'),
        ).toBeInstanceOf(Object);
        expect(
          mockRedis.multi().zincrby('vote_counts', -1, 'getvoteid123'),
        ).toBeInstanceOf(Object);
        expect(
          mockRedis.multi().zincrby('vote_counts', 1, 'voteid123'),
        ).toBeInstanceOf(Object);
        expect(mockRedis.multi().exec()).toBeInstanceOf(Object);
        expect(mockRedis.hset).toHaveBeenCalledWith(
          'voted_users',
          'user123',
          'getvoteid123',
        );
      });

      it('should call appService.getAllVoteItem success', async () => {
        const mockVoteItemHash = {
          'Trinidad and Tobago-90b11fe6-a8f6-4610-bf98-679aaf919c36': 'test 1',
          'Thailand-ed9098c8-7f52-48b3-8717-4726b7090bb9': 'test 2',
        };
        const mockVoteCountSortedSet = [
          'Trinidad and Tobago-90b11fe6-a8f6-4610-bf98-679aaf919c36',
          '3',
          'Thailand-ed9098c8-7f52-48b3-8717-4726b7090bb9',
          '1',
        ];
        const mockTotalVote = 4;
        mockRedis.hgetall.mockResolvedValue(mockVoteItemHash);
        mockRedis.zrevrange.mockResolvedValue(mockVoteCountSortedSet);
        mockRedis.hlen.mockResolvedValue(mockTotalVote);

        const result = await appService.getAllVoteItem();

        expect(result).toEqual({
          totalVote: mockTotalVote,
          voteitem: [
            {
              itemId:
                'Trinidad and Tobago-90b11fe6-a8f6-4610-bf98-679aaf919c36',
              name: 'Trinidad and Tobago',
              description: 'test 1',
              voteCount: 3,
            },
            {
              itemId: 'Thailand-ed9098c8-7f52-48b3-8717-4726b7090bb9',
              name: 'Thailand',
              description: 'test 2',
              voteCount: 1,
            },
          ],
        });

        expect(mockRedis.hgetall).toHaveBeenCalledWith('vote_item');
        expect(mockRedis.zrevrange).toHaveBeenCalledWith(
          'vote_counts',
          0,
          -1,
          'WITHSCORES',
        );
        expect(mockRedis.hlen).toHaveBeenCalledWith('voted_users');
      });

      it('should handle with call appService.getAllVoteItem error', async () => {
        mockRedis.hgetall.mockRejectedValue(new Error('Redis error'));

        await expect(appService.getAllVoteItem()).rejects.toThrowError(
          'Redis error',
        );
      });
    });

    describe('addVoteItem', () => {
      it('should call appService.addVoteItem success', async () => {
        const mockField = 'Bangladesh-MockUUID';
        const mockName = 'Bangladesh';
        const mockDescription = 'Description for Item 1';
        const expectedField = `${mockField}`;
        jest.spyOn(uuid, 'v4').mockReturnValue('MockUUID');

        const mockMulti = {
          hset: jest.fn().mockReturnThis(),
          zadd: jest.fn().mockReturnThis(),
          exec: jest.fn().mockReturnThis(),
        };

        const result = await appService.addVoteItem(mockName, mockDescription);

        expect(result).toEqual(expectedField);
        expect(
          mockMulti.hset('vote_item', expectedField, mockDescription),
        ).toBeInstanceOf(Object);
        expect(mockMulti.zadd('vote_counts', 0, expectedField)).toBeInstanceOf(
          Object,
        );
        expect(mockMulti.exec()).toBeInstanceOf(Object);
      });

      it('should handle with call appService.addVoteItem error', async () => {
        const mockName = 'Bangladesh';
        const mockDescription = 'Description for Item 1';
        const mockMulti = {
          hset: jest.fn().mockReturnThis(),
          zadd: jest.fn().mockReturnThis(),
          exec: jest.fn().mockRejectedValue(new Error('Redis error')),
        };

        mockRedis.multi.mockReturnValue(mockMulti);
        await expect(
          appService.addVoteItem(mockName, mockDescription),
        ).rejects.toThrowError('Redis error');
      });
    });

    describe('editVoteItem', () => {
      it('should call appService.editVoteItem success', async () => {
        const mockName = 'existingBangladesh-MockUUID';
        const mockDescription = 'Updated description';
        mockRedis.hexists.mockResolvedValue(1);
        const result = await appService.editVoteItem(mockName, mockDescription);
        expect(result).toEqual({
          itemId: mockName,
          name: 'existingBangladesh',
          description: mockDescription,
        });
      });

      it('should call appService.editVoteItem failed', async () => {
        const mockName = 'existingBangladesh-MockUUID';
        const mockDescription = 'Updated description';
        mockRedis.hexists.mockRejectedValue(new Error('Redis error'));
        await expect(
          appService.editVoteItem(mockName, mockDescription),
        ).rejects.toThrowError('Redis error');
      });
    });

    describe('deleteVoteItem', () => {
      it('should call appService.deleteVoteItem when score is 0', async () => {
        mockRedis.zscore.mockResolvedValue(1);
        mockRedis.hdel.mockResolvedValue(1);
        const result = await appService.deleteVoteItem('Item1');
        expect(result).toBe('OK');
        expect(mockRedis.zscore).toHaveBeenCalledWith('vote_counts', 'Item1');
        expect(mockRedis.hdel).toHaveBeenCalledWith('vote_item', 'Item1');
      });

      it('should call appService.deleteVoteItem throw BadRequestException when score is not 0', async () => {
        mockRedis.zscore.mockResolvedValue(null);

        await expect(appService.deleteVoteItem('Item2')).rejects.toThrowError(
          BadRequestException,
        );
        expect(mockRedis.zscore).toHaveBeenCalledWith('vote_counts', 'Item2');
      });

      it('should call appService.deleteVoteItem throw BadRequestException when hdel fails', async () => {
        mockRedis.zscore.mockResolvedValue(1);
        mockRedis.hdel.mockResolvedValue(0);

        await expect(appService.deleteVoteItem('Item3')).rejects.toThrowError(
          BadRequestException,
        );
        expect(mockRedis.zscore).toHaveBeenCalledWith('vote_counts', 'Item3');
        expect(mockRedis.hdel).toHaveBeenCalledWith('vote_item', 'Item3');
      });

      it('should call appService.deleteVoteItem throw an error when Redis operations fail', async () => {
        mockRedis.zscore.mockRejectedValue(new Error('Redis error'));

        await expect(appService.deleteVoteItem('Item4')).rejects.toThrowError(
          Error,
        );
        expect(mockRedis.zscore).toHaveBeenCalledWith('vote_counts', 'Item4');
      });
    });
    describe('clearVoteData', () => {
      it('should clear all vote data successfully', async () => {
        const mockMulti = {
          del: jest.fn().mockReturnThis(),
          exec: jest.fn().mockReturnValue([
            [null, 1],
            [null, 1],
            [null, 1],
          ]),
        };
        mockRedis.scan = jest.fn().mockResolvedValue(['0', ['mockKey']]);
        mockRedis.multi.mockReturnValue(mockMulti);

        const result = await appService.clearVoteData();

        expect(result).toBe('All data was deleted successfully.');
        expect(mockMulti.del('vote_item')).toBeInstanceOf(Object);
        expect(mockMulti.del('vote_counts')).toBeInstanceOf(Object);
        expect(mockMulti.del('voted_users')).toBeInstanceOf(Object);
        expect(mockMulti.exec()).toBeInstanceOf(Object);

        expect(mockRedis.scan).toHaveBeenCalledWith(
          '0',
          'MATCH',
          'item_voted_by:*',
        );
        expect(mockRedis.del).toHaveBeenCalledWith('mockKey');
      });
      it('should handle failure in clearing some data', async () => {
        const mockMulti = {
          del: jest.fn().mockReturnThis(),
          exec: jest.fn().mockReturnValue([
            [null, 1],
            [new Error('Redis error'), 0],
            [null, 1],
          ]),
        };
        mockRedis.scan = jest.fn().mockResolvedValue(['0', []]);
        mockRedis.multi.mockReturnValue(mockMulti);

        const result = await appService.clearVoteData();

        expect(result).toBe(
          'Some data deletion failed. Check the results for details.',
        );
        expect(mockMulti.del('vote_item')).toBeInstanceOf(Object);
        expect(mockMulti.del('vote_counts')).toBeInstanceOf(Object);
        expect(mockMulti.del('voted_users')).toBeInstanceOf(Object);
        expect(mockMulti.exec()).toBeInstanceOf(Object);

        expect(mockRedis.scan).toHaveBeenCalledWith(
          '0',
          'MATCH',
          'item_voted_by:*',
        );
      });
      it('should handle failure in clearing some data', async () => {
        const mockMulti = {
          del: jest.fn().mockReturnThis(),
          exec: jest.fn().mockRejectedValue(new Error('Redis error')),
        };
        mockRedis.multi.mockReturnValue(mockMulti);

        await expect(appController.clearVoteData()).rejects.toThrowError();
      });
    });
  });
});
