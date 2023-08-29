import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async uservotes(voteid: string, user: string): Promise<string> {
    try {
      if (!(await this.redis.hexists('vote_item', voteid))) {
        throw new BadRequestException('Vote item is not exist.');
      }
      const getVoteId = await this.redis.hget(`voted_users`, user);
      if (getVoteId) {
        await this.redis
          .multi()
          .srem(`item_voted_by:${getVoteId}`, user)
          .sadd(`item_voted_by:${voteid}`, user)
          .zincrby(`vote_counts`, -1, getVoteId)
          .zincrby(`vote_counts`, 1, voteid)
          .exec();
      } else {
        await this.redis
          .multi()
          .sadd(`item_voted_by:${voteid}`, user)
          .zincrby(`vote_counts`, 1, voteid)
          .exec();
      }
      await this.redis.hset(`voted_users`, user, voteid);
      return 'OK';
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getAllVoteItem(): Promise<{
    totalVote: number;
    voteitem: IVoteItem[];
  }> {
    try {
      const [voteItemHash, voteCountSortedSet, totalVote] = await Promise.all([
        this.redis.hgetall('vote_item'),
        this.redis.zrevrange('vote_counts', 0, -1, 'WITHSCORES'),
        this.redis.hlen('voted_users'),
      ]);

      const conbinedData = [];
      for (let i = 0; i < voteCountSortedSet.length; i += 2) {
        const voteItemId = voteCountSortedSet[i];
        const voteCount = voteCountSortedSet[i + 1];
        if (voteItemHash[voteItemId]) {
          const voteItemWithCount = {
            itemId: voteItemId,
            name: voteItemId.split('-')[0],
            description: voteItemHash[voteItemId],
            voteCount: Number(voteCount),
          } as IVoteItem;
          conbinedData.push(voteItemWithCount);
        }
      }
      return { totalVote, voteitem: conbinedData };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async addVoteItem(name: string, description: string): Promise<string> {
    try {
      const key = 'vote_item';
      const field = `${name}-${uuidv4()}`;
      await this.redis
        .multi()
        .hset(key, field, description)
        .zadd('vote_counts', 0, field)
        .exec();
      return field;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async editVoteItem(name: string, description: string): Promise<IVoteItem> {
    try {
      const key = 'vote_item';
      if (await this.redis.hexists(key, name)) {
        await this.redis.hset(key, name, description);
      }
      return {
        itemId: name,
        name: name.split('-')[0],
        description: description,
      } as IVoteItem;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async deleteVoteItem(name: string): Promise<string> {
    try {
      const key = 'vote_item';
      const score = await this.redis.zscore('vote_counts', name);
      if (!!score) {
        const res = await this.redis.hdel(key, name);
        if (res) {
          return 'OK';
        }
        throw new BadRequestException('Vote item is not exist.');
      } else {
        throw new BadRequestException('Allow to delete when vote score is 0.');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async clearVoteData() {
    try {
      const res = await this.redis
        .multi()
        .del('vote_item')
        .del('vote_counts')
        .del('voted_users')
        .exec();
      const deleteResults = res.every((result) => !!!result[0]);

      let cursor = '0';
      const keysToDelete = [];

      do {
        const [newCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          'item_voted_by:*',
        );
        keysToDelete.push(...keys);
        cursor = newCursor;
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await this.redis.del(...keysToDelete);
      }
      if (deleteResults) {
        return 'All data was deleted successfully.';
      } else {
        return 'Some data deletion failed. Check the results for details.';
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

export interface IVoteItem {
  itemId: string;
  name: string;
  description: string;
  voteCount?: number;
}
