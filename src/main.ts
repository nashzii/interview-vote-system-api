import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import * as fs from 'fs';
import * as path from 'path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // generate user for test
  generateUser(app);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateUser(app: INestApplication<any>) {
  const userService = app.get(UserService);
  const user = await userService.generateUser(50);
  if (user) {
    const filePath = path.join(__dirname, '../user.txt');
    fs.appendFileSync(filePath, '\n' + user.join('\n'), 'utf8');
    console.log('Generated User:', user);
  } else {
    console.log('Failed to generate user.');
  }
}
bootstrap();
