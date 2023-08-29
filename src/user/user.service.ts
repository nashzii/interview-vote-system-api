import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { faker } from '@faker-js/faker';
@Injectable()
export class UserService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async generateUser(item: number): Promise<string[] | null> {
    try {
      const userPromises = Array.from({ length: item }, async () => {
        const firstName = faker.person.firstName();
        const mockUser: IUser = {
          firstName,
          lastName: faker.person.lastName(),
          password: faker.string.nanoid(),
        };
        const key = `users:${firstName.toLowerCase()}`;
        const value = JSON.stringify(mockUser);
        await this.redis.set(key, value);
        return `${firstName.toLowerCase()},${mockUser.password}`;
      });

      const generatedUsers = await Promise.all(userPromises);
      return generatedUsers;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async findOne(username: string): Promise<IUser> {
    const user = await this.redis.get(`users:${username}`);
    return user ? (JSON.parse(user) as IUser) : null;
  }
}

export interface IUser {
  firstName: string;
  lastName: string;
  password: string;
}
