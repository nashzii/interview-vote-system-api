import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RedisModule } from '@songkeys/nestjs-redis';

describe('Auth', () => {
  let controller: AuthController;
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        RedisModule.forRoot({
          config: {
            host: 'localhost',
            port: 6379,
          },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, UserService, JwtService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const signInDto = { username: 'testuser', password: 'testpassword' };
      const mockResponse = {
        access_token: 'testToken',
        user: { firstName: 'testFirstName', lastName: 'testLastName' },
      };
      jest
        .spyOn(service, 'signIn')
        .mockImplementation(() => Promise.resolve(mockResponse));
      const res = await controller.signIn(signInDto);
      expect(res).toBe(mockResponse);
      expect(service.signIn).toHaveBeenCalledWith(
        signInDto.username,
        signInDto.password,
      );
    });

    it('should sign in a user', async () => {
      const signInDto = { username: 'testuser', password: 'testPassword' };
      const mockUser = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        password: 'testPassword',
      };
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('testToken');
      const res = await service.signIn(signInDto.username, signInDto.password);
      const expectedResponse = {
        access_token: 'testToken',
        user: { firstName: 'testFirstName', lastName: 'testLastName' },
      };
      expect(res).toEqual(expectedResponse);
    });

    it('should handle error if user is null', async () => {
      const signInDto = { username: 'testuser', password: 'testPassword' };
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      await expect(
        service.signIn(signInDto.username, signInDto.password),
      ).rejects.toThrowError();
    });

    it('should handle error if password wrong', async () => {
      const signInDto = { username: 'testuser', password: 'testPassword' };
      const mockUser = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        password: 'missPassword',
      };
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      await expect(
        service.signIn(signInDto.username, signInDto.password),
      ).rejects.toThrowError();
    });
  });
});
