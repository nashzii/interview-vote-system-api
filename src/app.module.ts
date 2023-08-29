import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from '@songkeys/nestjs-redis';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST,
        port: 6379,
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
