import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: username,
      name: `${user.firstName} ${user.lastName}`,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
