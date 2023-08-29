import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRedisToken } from '@songkeys/nestjs-redis';

describe('UserService', () => {
  let userService: UserService;
  let module: TestingModule;
  let get: jest.Mock;
  let set: jest.Mock;

  beforeEach(async () => {
    get = jest.fn();
    set = jest.fn();

    module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRedisToken('default'),
          useValue: {
            get,
            set,
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('generateUser', () => {
    it('should generate users', async () => {
      const mockRedisSet = set.mockResolvedValue('OK');

      const numberOfUsersToGenerate = 5;
      const generatedUsers = await userService.generateUser(
        numberOfUsersToGenerate,
      );

      expect(generatedUsers).toHaveLength(numberOfUsersToGenerate);
      expect(mockRedisSet).toHaveBeenCalledTimes(numberOfUsersToGenerate);

      for (const userString of generatedUsers) {
        const [username, password] = userString.split(',');
        expect(username).toBeTruthy();
        expect(password).toBeTruthy();
      }
    });

    it('should handle errors', async () => {
      set.mockRejectedValue('Redis error');

      const numberOfUsersToGenerate = 5;
      const generatedUsers = await userService.generateUser(
        numberOfUsersToGenerate,
      );

      expect(generatedUsers).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should find a user', async () => {
      const mockUser = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        password: 'testPassword',
      };
      get.mockResolvedValue(JSON.stringify(mockUser));
      const res = await userService.findOne('testFirstName');
      expect(res).toEqual(mockUser);
    });

    it('should handle errors and return null', async () => {
      get.mockResolvedValue(undefined);
      const res = await userService.findOne('testFirstName');
      expect(res).toBeNull();
    });
  });
});
